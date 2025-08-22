# Fetch MCP Server - Agent Development Guidelines

## 📋 프로젝트 개요

이 프로젝트는 웹 콘텐츠 및 다양한 서비스(Atlassian Confluence/Jira, Slack)에서 정보를 조회할 수 있는 MCP(Model Context Protocol) 서버입니다.

## 🏗️ 현재 아키텍처

### 파일 구조
```
src/
├── slack/                   # Slack 관련 파일들
│   ├── SlackTypes.ts       # Slack 타입 정의 (I prefix)
│   ├── SlackModels.ts      # Slack 모델 클래스들
│   └── SlackFetcher.ts     # Slack API 처리
├── atlassian/              # Atlassian 관련 파일들
│   ├── AtlassianTypes.ts   # Atlassian 타입 정의
│   ├── AtlassianModels.ts  # Atlassian 모델 클래스들
│   └── AtlassianFetcher.ts # Atlassian API 처리
├── types.ts                # 공통 타입 정의 (IMcpResult)
├── McpModels.ts           # MCP 결과 모델 (McpResult)
├── constants.ts           # 상수 정의 (tool 이름, 기본값)
├── validate.ts            # 입력 검증 로직
├── ResponseBuilder.ts     # 응답 빌더
├── Fetcher.ts            # 일반 웹 콘텐츠 조회
└── index.ts              # 메인 서버 및 tool 등록
```

### 현재 구현된 Tools
1. **fetch**: 일반 웹사이트 콘텐츠 조회
2. **fetch_confluence_page**: Confluence 페이지 조회
3. **fetch_jira_issue**: Jira 티켓 조회  
4. **fetch_slack_message**: Slack 메시지 조회

## 🎯 코딩 컨벤션 및 아키텍처 교훈 (2025-08-22 업데이트)

### 1. Interface vs Class 설계 원칙

#### ✅ 해야 할 것
- **Interface는 "I" prefix 사용**
  ```typescript
  // Good: Interface에 I prefix
  export interface ISlackMessage {
    ts: string;
    user?: string;
    text?: string;
  }
  
  // Good: Class는 prefix 없음
  export class SlackMessage {
    private _data: ISlackMessage;
    constructor(data: ISlackMessage) { ... }
  }
  ```

- **비즈니스 로직은 Class에 위임**
  ```typescript
  // Good: 비즈니스 로직이 Class에 집중
  export class SlackMessage {
    get formattedTimestamp(): string {
      return new Date(parseFloat(this._data.ts) * 1000).toISOString();
    }
    
    get isThreaded(): boolean {
      return Boolean(this._data.thread_ts);
    }
  }
  ```

- **HTTP 응답 처리는 Response Model Class 사용**
  ```typescript
  // Good: HTTP 응답을 Class로 래핑
  const rawData: ISlackUsersInfoResponse = await response.json();
  const data = new SlackUsersInfoResponse(rawData);
  
  if (!data.isSuccess) {
    return undefined;
  }
  
  return data.user; // SlackUser 클래스 반환
  ```

#### ❌ 피해야 할 것
- Interface를 직접 반환하는 함수
- 비즈니스 로직이 Fetcher에 집중되는 구조
- Raw HTTP 응답을 직접 사용

### 2. 파일 구조화 및 모듈 분리

#### ✅ 해야 할 것
- **서비스별 디렉토리 분리**
  ```
  src/
  ├── slack/          # Slack 관련 모든 파일
  ├── atlassian/      # Atlassian 관련 모든 파일
  └── common/         # 공통 유틸리티
  ```

- **타입 파일 분리**
  ```typescript
  // SlackTypes.ts - Slack 전용 타입들
  export interface ISlackMessage { ... }
  export type SlackRequest = { ... }
  
  // types.ts - 공통 타입들
  export interface IMcpResult { ... }
  export type RequestPayload = { ... }
  ```

- **Import 경로 명확화**
  ```typescript
  // 같은 디렉토리 내
  import { ISlackMessage } from "./SlackTypes.js";
  
  // 상위 디렉토리
  import { Constants } from "../constants.js";
  
  // 하위 디렉토리
  import { SlackFetcher } from "./slack/SlackFetcher.js";
  ```

#### ❌ 피해야 할 것
- 모든 파일을 루트 디렉토리에 배치
- 서비스별 타입이 섞여있는 구조
- 복잡한 상대 경로 (../../..)

### 3. 생성자 설계 및 객체 생성 패턴

#### ✅ 해야 할 것
- **자연스러운 생성자 매개변수**
  ```typescript
  // Good: 직관적인 매개변수 순서
  export class SlackMessageModel {
    constructor(
      message: SlackMessage,
      channel: string,
      isReply: boolean,
      user?: SlackUser,
      threadTs?: string,
      replies: SlackMessage[] = []
    ) { ... }
  }
  ```

- **정적 팩토리 메서드 활용**
  ```typescript
  // Good: 의미있는 생성 방법 제공
  export class McpResult {
    static success(text: string): McpResult { ... }
    static error(message: string): McpResult { ... }
  }
  ```

#### ❌ 피해야 할 것
- 억지로 만든 Wrapper 객체를 생성자에 전달
- 복잡한 객체 구성을 위한 임시 인터페이스 생성

### 4. 변수 선언 및 제어 흐름

#### ✅ 해야 할 것
- **Early Return 패턴**
  ```typescript
  // Good: 조건별로 메서드 분리
  if (isReply && threadTs) {
    return await this.handleReplyMessage(...);
  } else {
    return await this.handleRegularMessage(...);
  }
  ```

- **메서드 분리로 가독성 향상**
  ```typescript
  // Good: 각 케이스별 전용 메서드
  private static async handleReplyMessage(...): Promise<McpResult> {
    const replyMessage = await this.getSpecificReply(...);
    if (!replyMessage) {
      return this.createErrorResult("Reply message not found");
    }
    // 처리 로직
  }
  ```

#### ❌ 피해야 할 것
- let 변수 선언 후 분기문에서 초기화
- 긴 if-else 체인
- 변수 상태 추적이 복잡한 구조

### 5. 결과 타입 통합 및 표준화

#### ✅ 해야 할 것
- **공통 결과 타입 사용**
  ```typescript
  // Good: 모든 Fetcher가 동일한 결과 타입 사용
  export class McpResult {
    toJson(): IMcpResult { ... }
    static success(text: string): McpResult { ... }
    static error(message: string): McpResult { ... }
  }
  ```

- **일관된 에러 처리**
  ```typescript
  // Good: 모든 Fetcher에서 동일한 패턴
  private static createErrorResult(message: string): McpResult {
    return McpResult.error(message);
  }
  ```

#### ❌ 피해야 할 것
- 서비스별로 다른 결과 타입 사용
- 중복된 에러 처리 로직

### 6. 데이터 접근 패턴

#### ✅ 해야 할 것
- **Raw 데이터 접근을 위한 data getter**
  ```typescript
  export class SlackMessage {
    private _data: ISlackMessage;
    
    get data(): ISlackMessage {
      return this._data;
    }
    
    // 비즈니스 로직 메서드들
    get formattedTimestamp(): string { ... }
  }
  ```

- **계층적 데이터 접근**
  ```typescript
  // Model -> Class -> Interface 순서
  const messageModel = new SlackMessageModel(message, ...);
  const rawData = messageModel.messageDetails.data; // 필요시에만
  ```

#### ❌ 피해야 할 것
- 직접적인 Interface 데이터 조작
- 비즈니스 로직 없는 단순 데이터 전달

### 7. 타입 안전성 강화

#### ✅ 해야 할 것
- **명확한 타입 정의와 검증**
  ```typescript
  // Good: 타입 가드와 함께 사용
  if (!data.isSuccess) {
    return this.createErrorResult(`API error: ${data.error || 'Unknown error'}`);
  }
  
  return data.user; // 타입이 보장된 상태
  ```

- **옵셔널 체이닝 적극 활용**
  ```typescript
  // Good: 안전한 속성 접근
  return this._data.profile?.display_name || 
         this._data.display_name || 
         this._data.name || 
         "Unknown User";
  ```

#### ❌ 피해야 할 것
- any 타입 남발
- 타입 단언 과도한 사용
- 런타임 에러 가능성이 있는 접근

### 8. 성능 및 메모리 최적화

#### ✅ 해야 할 것
- **지연 초기화 패턴**
  ```typescript
  // Good: 필요할 때만 생성
  get reactions(): SlackReaction[] {
    if (!this._data.reactions) {
      return [];
    }
    return this._data.reactions.map(reaction => new SlackReaction(reaction));
  }
  ```

- **병렬 처리 활용**
  ```typescript
  // Good: 독립적인 API 호출은 병렬로
  const [userInfo, replies] = await Promise.all([
    this.getUserInfo(token, userId),
    this.getReplies(token, channel, timestamp)
  ]);
  ```

#### ❌ 피해야 할 것
- 불필요한 객체 생성
- 순차적인 독립 API 호출

### 9. 코드 재사용성 및 확장성

#### ✅ 해야 할 것
- **상속을 통한 코드 재사용**
  ```typescript
  // Good: 공통 기능은 기본 클래스에
  export class SlackUser { ... }
  export class SlackUserInfo extends SlackUser {}
  ```

- **제네릭을 활용한 공통 패턴**
  ```typescript
  // Good: 재사용 가능한 응답 처리
  export class ApiResponseHandler<T> {
    static process<T>(rawData: any, ModelClass: new (data: any) => T): T {
      return new ModelClass(rawData);
    }
  }
  ```

#### ❌ 피해야 할 것
- 중복된 코드 패턴
- 하드코딩된 특정 서비스 로직

### 10. 테스트 용이성 (Testability)

#### ✅ 해야 할 것
- **의존성 주입 가능한 구조**
  ```typescript
  // Good: 테스트 시 mock 가능
  private static async callApi(url: string, headers: Record<string, string>) {
    return fetch(url, { headers });
  }
  ```

- **순수 함수 지향**
  ```typescript
  // Good: 부작용 없는 데이터 변환
  static formatTimestamp(timestamp: string): string {
    return new Date(parseFloat(timestamp) * 1000).toISOString();
  }
  ```

#### ❌ 피해야 할 것
- 외부 의존성과 강결합
- 테스트하기 어려운 복잡한 메서드

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

**마지막 업데이트**: 2025-08-22  
**작성자**: AI Assistant  
**버전**: 2.0
