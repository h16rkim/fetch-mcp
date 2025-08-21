# Fetch MCP Server - Agent Development Guidelines

## 📋 프로젝트 개요

이 프로젝트는 웹 콘텐츠 및 다양한 서비스(Atlassian Confluence/Jira, Slack)에서 정보를 조회할 수 있는 MCP(Model Context Protocol) 서버입니다.

## 🏗️ 현재 아키텍처

### 파일 구조
```
src/
├── index.ts              # 메인 서버 및 tool 등록
├── constants.ts          # 상수 정의 (tool 이름, 기본값)
├── types.ts             # 타입 정의 (요청/응답 타입)
├── validate.ts          # 입력 검증 로직
├── Fetcher.ts           # 일반 웹 콘텐츠 조회
├── AtlassianFetcher.ts  # Confluence/Jira API 처리
└── SlackFetcher.ts      # Slack API 처리
```

### 현재 구현된 Tools
1. **fetch**: 일반 웹사이트 콘텐츠 조회
2. **fetch_confluence_page**: Confluence 페이지 조회
3. **fetch_jira_issue**: Jira 티켓 조회  
4. **fetch_slack_message**: Slack 메시지 조회

## 🎯 코드 작업 시 중점 고려사항

### 1. 타입 안전성 (Type Safety)

#### ✅ 해야 할 것
- **모든 외부 API 응답에 대해 명확한 타입 정의**
  ```typescript
  // Good: 명확한 타입 정의
  interface SlackMessage {
    ts: string;
    user?: string;
    text?: string;
    // ...
  }
  
  // Bad: any 타입 사용
  const message: any = await response.json();
  ```

- **타입 가드 함수 활용**
  ```typescript
  if (!data.ok || !data.user) {
    return "Unknown User";
  }
  ```

#### ❌ 피해야 할 것
- `any` 타입 남발
- 타입 단언(`as`) 과도한 사용
- 옵셔널 체이닝 없이 중첩 객체 접근

### 2. 상수 관리 (Constants Management)

#### ✅ 해야 할 것
- **모든 하드코딩된 문자열을 constants.ts로 분리**
  ```typescript
  // constants.ts
  export class Constants {
    static readonly FETCH_NEW_TOOL = "fetch_new_tool";
    static readonly DEFAULT_TIMEOUT = 30000;
  }
  
  // 사용
  if (request.params.name === Constants.FETCH_NEW_TOOL) { ... }
  ```

- **환경변수명도 상수로 관리**
  ```typescript
  static readonly ENV_SLACK_APP_USER_OAUTH_TOKEN = "SLACK_APP_USER_OAUTH_TOKEN";
  static readonly ENV_ATLASSIAN_USER = "ATLASSIAN_USER";
  static readonly ENV_ATLASSIAN_API_TOKEN = "ATLASSIAN_API_TOKEN";
  
  // 사용
  const token = process.env[Constants.ENV_SLACK_APP_USER_OAUTH_TOKEN];
  ```

#### ❌ 피해야 할 것
- 코드 내 하드코딩된 문자열
- 매직 넘버 사용

### 3. 검증 로직 (Validation Logic)

#### ✅ 해야 할 것
- **Curry 패턴을 활용한 재사용 가능한 검증 함수**
  ```typescript
  // 새로운 optional validator 생성
  const validateOptionalEmail = createOptionalValidator(validateEmail);
  ```

- **명확한 에러 메시지**
  ```typescript
  throw new Error(`Invalid ${fieldName}: must be a valid email address`);
  ```

#### ❌ 피해야 할 것
- 중복된 검증 로직
- 모호한 에러 메시지

### 4. API 클라이언트 패턴 (API Client Pattern)

#### ✅ 해야 할 것
- **각 서비스별로 별도 Fetcher 클래스 생성**
  ```typescript
  // 새로운 서비스 추가 시
  export class GitHubFetcher {
    private static readonly DEFAULT_MAX_LENGTH = Constants.DEFAULT_MAX_LENGTH;
    
    static async fetchRepository(request: GitHubRequest): Promise<GitHubResult> {
      // 구현
    }
  }
  ```

- **토큰 관리 (필요시)**
  ```typescript
  // 단순한 토큰 기반 인증 (Slack 예시)
  private static getAccessToken(): string {
    const token = process.env[Constants.ENV_SERVICE_TOKEN];
    if (!token) {
      throw new Error(`${Constants.ENV_SERVICE_TOKEN} environment variable is not set`);
    }
    return token;
  }
  
  // 복잡한 토큰 캐싱이 필요한 경우 (OAuth refresh 등)
  private static cachedTokens: TokenCache | null = null;
  
  private static isTokenValid(): boolean {
    // 만료 시간 체크 로직
  }
  ```

- **일관된 에러 처리**
  ```typescript
  private static createErrorResult(message: string): ServiceResult {
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
  ```

#### ❌ 피해야 할 것
- 하나의 클래스에 모든 서비스 로직 집중
- 토큰 만료 시 재시도 로직 없음

### 5. 새로운 Tool 추가 시 체크리스트

#### 필수 단계
1. **constants.ts에 tool 이름 추가**
   ```typescript
   static readonly FETCH_NEW_SERVICE = "fetch_new_service";
   ```

2. **types.ts에 요청/응답 타입 정의**
   ```typescript
   export type NewServiceRequest = {
     url: string;
     maxLength?: number;
   };
   
   export interface NewServiceApiResponse {
     // API 응답 구조 정의
   }
   ```

3. **validate.ts에 검증 함수 추가**
   ```typescript
   export function validateNewServiceRequest(args: any): NewServiceRequest {
     // 검증 로직
   }
   ```

4. **새로운 Fetcher 클래스 생성**
   ```typescript
   export class NewServiceFetcher {
     // 구현
   }
   ```

5. **index.ts에 tool 등록**
   ```typescript
   // ListToolsRequestSchema에 추가
   // CallToolRequestSchema에 핸들러 추가
   ```

6. **README.md 업데이트**

### 6. 에러 처리 (Error Handling)

#### ✅ 해야 할 것
- **계층별 에러 처리**
  ```typescript
  // HTTP 에러
  if (!response.ok) {
    if (response.status === 401) {
      return this.createErrorResult("Authentication failed");
    }
    return this.createErrorResult(`HTTP error: ${response.status}`);
  }
  
  // API 에러
  if (!data.ok) {
    return this.createErrorResult(`API error: ${data.error || 'Unknown error'}`);
  }
  ```

- **Graceful degradation**
  ```typescript
  // 사용자 정보 조회 실패 시 기본값 사용
  const userName = await this.getUserInfo(token, userId) || "Unknown User";
  ```

#### ❌ 피해야 할 것
- 에러 무시 또는 빈 catch 블록
- 사용자에게 기술적 에러 메시지 노출

### 7. 성능 최적화 (Performance Optimization)

#### ✅ 해야 할 것
- **토큰 캐싱**
  ```typescript
  private static cachedTokens: TokenCache | null = null;
  ```

- **응답 길이 제한**
  ```typescript
  private static applyLengthLimits(text: string, maxLength: number): string {
    return text.length <= maxLength ? text : text.substring(0, maxLength);
  }
  ```

- **병렬 API 호출 (필요시)**
  ```typescript
  const [userInfo, replies] = await Promise.all([
    this.getUserInfo(token, userId),
    this.getReplies(token, channel, timestamp)
  ]);
  ```

#### ❌ 피해야 할 것
- 불필요한 API 호출 반복
- 무제한 응답 크기

### 8. 보안 고려사항 (Security Considerations)

#### ✅ 해야 할 것
- **환경변수로 민감 정보 관리**
  ```typescript
  // 상수를 사용한 환경변수 접근
  const token = process.env[Constants.ENV_SERVICE_TOKEN];
  if (!token) {
    throw new Error(`${Constants.ENV_SERVICE_TOKEN} environment variable is not set`);
  }
  
  // 단순한 토큰 기반 인증
  private static getAccessToken(): string {
    const token = process.env[Constants.ENV_SLACK_APP_USER_OAUTH_TOKEN];
    
    if (!token) {
      throw new Error(`${Constants.ENV_SLACK_APP_USER_OAUTH_TOKEN} environment variable is not set`);
    }
    
    return token;
  }
  ```

- **URL 검증**
  ```typescript
  // Private IP 차단 (Fetcher.ts 참고)
  if (is_ip_private(url)) {
    throw new Error("Private IP access blocked");
  }
  ```

- **입력 검증 강화**
  ```typescript
  // URL 형식 검증
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL format");
  }
  ```

#### ❌ 피해야 할 것
- 코드에 하드코딩된 토큰/비밀번호
- 사용자 입력 검증 생략
- SSRF 취약점 (Private IP 접근 허용)

### 9. 코드 품질 (Code Quality)

#### ✅ 해야 할 것
- **명확한 함수/변수명**
  ```typescript
  // Good
  private static async refreshAccessToken(): Promise<string>
  private static parseSlackUrl(url: string): { channel: string; timestamp: string }
  
  // Bad
  private static refresh(): Promise<string>
  private static parse(url: string): any
  ```

- **단일 책임 원칙**
  ```typescript
  // 각 메서드는 하나의 책임만
  private static formatReactions(reactions?: SlackReaction[]): string
  private static formatAttachments(attachments?: SlackAttachment[]): string
  ```

- **적절한 주석**
  ```typescript
  /**
   * Parse Slack message URL to extract channel and timestamp
   * URL format: https://workspace.slack.com/archives/CHANNEL_ID/pTIMESTAMP
   */
  ```

#### ❌ 피해야 할 것
- 긴 함수 (100줄 이상)
- 깊은 중첩 (3단계 이상)
- 의미 없는 변수명 (a, b, temp 등)

### 10. 테스트 고려사항 (Testing Considerations)

#### ✅ 해야 할 것
- **Mock 데이터로 테스트 가능한 구조**
  ```typescript
  // API 호출 부분을 별도 메서드로 분리
  private static async callSlackApi(url: string, token: string) {
    // 테스트 시 mock 가능
  }
  ```

- **에러 케이스 테스트**
  ```typescript
  // 401, 404, 500 등 다양한 HTTP 상태 코드
  // API 에러 응답
  // 네트워크 오류
  ```

#### ❌ 피해야 할 것
- 테스트하기 어려운 복잡한 메서드
- 외부 의존성과 강결합된 코드

## 🚀 향후 확장 방향

### 1. 새로운 서비스 통합
- GitHub (Repository, Issue, PR 조회)
- Notion (페이지 조회)
- Google Drive (문서 조회)
- Trello (카드 조회)

### 2. 기능 개선
- 캐싱 레이어 추가
- Rate limiting 구현
- 배치 요청 지원
- 웹훅 지원

### 3. 모니터링 및 로깅
- 구조화된 로깅
- 메트릭 수집
- 에러 추적

## 📚 참고 자료

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Slack Web API](https://api.slack.com/web)
- [Atlassian REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)

---

**마지막 업데이트**: 2025-08-21  
**작성자**: AI Assistant  
**버전**: 1.0
