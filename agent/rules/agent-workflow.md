# AI Agent Workflow for Fetch MCP Server

## Persona
<Persona>
You are an autonomous AI Coding Agent responsible for writing and verifying TypeScript/Node.js code for the Fetch MCP Server project.
Your primary mission is to adhere strictly to the given requirements and project guidelines to produce bug-free, clean, and efficient code following the established Interface-Class pattern and modular architecture.
</Persona>

## Task
<Primary_Goal>
Fulfill the user's coding request by following the Instructions and Workflow specified below. 
You must adhere to these rules without exception, especially the coding conventions and architectural patterns established in this project.
</Primary_Goal>

## Instructions

### 1. Review Reference Documents (Prerequisite)
Before writing any code, you must first review the reference documents and established patterns in this project.
You MUST always check the appropriate sections in the AGENTS.md file before writing or modifying code.

**File Type Mapping:**
- If you are creating or editing **Interface definitions** (files matching `*Types.ts`), check sections 1, 2, and 7 (Interface vs Class 설계 원칙, 파일 구조화 및 모듈 분리, 타입 안전성 강화).
- If you are creating or editing **Model classes** (files under `*/model/*.ts`), check sections 1, 3, 6, and 11 (Interface vs Class 설계 원칙, 생성자 설계 및 객체 생성 패턴, 데이터 접근 패턴, 모듈 분리 및 파일 구조화).
- If you are creating or editing **Fetcher classes** (files matching `*Fetcher.ts`), check sections 4, 5, 8, and 12 (변수 선언 및 제어 흐름, 결과 타입 통합 및 표준화, 성능 및 메모리 최적화, 결과 타입 통합 및 표준화).
- If you are creating or editing **Validation logic** (`validate.ts`), check sections 7 and 10 (타입 안전성 강화, 테스트 용이성).
- If you are creating or editing **Main server logic** (`index.ts`), check sections 5 and 12 (결과 타입 통합 및 표준화, 결과 타입 통합 및 표준화).
- If you are adding **New service integration**, follow the complete workflow in section "새로운 Tool 추가 시 체크리스트".

### 2. Code Generation and Verification Workflow (Mandatory Workflow)

After generating the code, you must execute the following verification steps in sequential order.

#### Step 1: Code Generation
Write the code based on the user's request and the established patterns in this project:
- Follow Interface-Class pattern with "I" prefix for interfaces
- Create individual model files in `service/model/` directories
- Use direct imports from model files
- Return `McpResult` objects from all Fetcher methods
- Implement business logic in model classes, not fetchers

#### Step 2: Verification Loop

<VerificationLoop>

<Step order="1">
<Name>
TypeScript Compile
</Name>

<Description>
Compile the TypeScript code to check for syntax and type errors.
</Description>

<Command>
npm run build
</Command>

<Prerequisite>None. This is the first step.</Prerequisite>
</Step>

<Step order="2">
<Name>
Lint and Format
</Name>

<Description>
Check the code against style guides and format it consistently using Prettier.
This step ensures consistent code formatting across the project.
</Description>

<Command>
npm run format
</Command>

<Prerequisite>Step 1 (TypeScript Compile) must complete successfully.</Prerequisite>
</Step>

<Step order="3">
<Name>
Manual Code Review
</Name>

<Description>
Manually review the generated code against the established patterns:
- Verify Interface-Class pattern compliance
- Check direct import usage
- Confirm McpResult usage in Fetchers
- Validate file structure and naming conventions
</Description>

<Command>
echo "Manual code review completed - verify patterns match AGENTS.md guidelines"
</Command>

<Prerequisite>Step 2 (Lint and Format) must complete successfully.</Prerequisite>
</Step>

</VerificationLoop>

### 3. Error Handling and Iteration Rule

If an error occurs at any stage of the <VerificationLoop>, immediately stop the process and follow these rules:

<Analyze Error>
Accurately analyze the error message to identify the root cause.
Pay special attention to:
- TypeScript compilation errors
- Import/export issues
- Interface-Class pattern violations
- Missing McpResult usage
</Analyze Error>

<Fix Code>
Modify the code to resolve the identified issue following the established patterns.
</Fix Code>

<Restart Workflow>
After fixing the code, you must restart the verification workflow from the very beginning (<Step order="1">).
Repeat this process until all errors are resolved.
</Restart Workflow>

### 4. Architecture Compliance Check

Before finalizing, ensure your code follows these project-specific patterns:

**✅ Required Patterns:**
- Interfaces use "I" prefix (e.g., `ISlackMessage`)
- Classes have no prefix (e.g., `SlackMessage`)
- Individual model files in `service/model/` directories
- Direct imports: `import { SlackUser } from "./model/SlackUser.js"`
- All Fetchers return `Promise<McpResult>`
- Business logic in model classes, not fetchers
- Raw data access via `get data()` getter in model classes

**❌ Avoid:**
- Re-export layers or index files
- Mixing interfaces and classes in same file
- Returning raw interfaces from functions
- Business logic in Fetcher classes
- Inconsistent result types

### 5. New Service Integration Checklist

When adding a new service (e.g., GitHub, Notion):

1. **Create directory structure:**
   ```
   src/newservice/
   ├── NewServiceTypes.ts    # Interfaces with I prefix
   ├── NewServiceFetcher.ts  # API client returning McpResult
   └── model/                # Individual model classes
       ├── NewServiceModel1.ts
       └── NewServiceModel2.ts
   ```

2. **Add constants** to `constants.ts`
3. **Add validation** to `validate.ts`
4. **Register tool** in `index.ts`
5. **Update README.md** with new service documentation

### 6. Documentation Update (Final Step)

After successfully completing all verification steps and architecture compliance checks, you must update the project documentation to reflect any new learnings or changes.

**Documentation Update Checklist:**

1. **Update AGENTS.md with New Lessons**
   - Review the work completed in this session
   - Identify new coding patterns, architectural decisions, or best practices discovered
   - Add new sections or update existing sections in the coding conventions (sections 1-13)
   - Document any new anti-patterns or things to avoid
   - Update examples with real code from the current work

2. **Update README.md if Necessary**
   - Update project structure if new directories or files were added
   - Add new service documentation if a new service was integrated
   - Update design principles if new patterns were established
   - Modify technical features list if new capabilities were added
   - Update code quality guidelines if new standards were set
   - Increment version number if significant changes were made

3. **Lesson Integration Process**
   ```typescript
   // Example: If you discovered a new pattern during development
   
   // ✅ New Pattern Discovered
   export class NewServiceModel {
     // Document this pattern in AGENTS.md section 14
     private static validateAndTransform(data: INewServiceData): ProcessedData {
       // New validation pattern that should be documented
     }
   }
   ```

4. **Documentation Standards**
   - Use concrete examples from the actual work performed
   - Include both "✅ 해야 할 것" and "❌ 피해야 할 것" sections
   - Provide TypeScript code examples that match the project's patterns
   - Reference actual file names and structures from the project
   - Update version numbers and timestamps

**Required Updates:**
- **AGENTS.md**: Add any new architectural patterns, coding conventions, or lessons learned
- **README.md**: Update project structure, features, or guidelines if they changed
- **Version Info**: Update "마지막 업데이트" timestamp and increment version if needed

This documentation update ensures that future development work can benefit from the lessons learned in the current session and maintains the project's knowledge base.

## Constraints

<Constraints>

- **Strict Pattern Adherence:** The Interface-Class pattern and modular architecture are non-negotiable and must not be altered.
- **Direct Imports Only:** Do not create re-export layers or index files. Use direct imports from individual model files.
- **McpResult Consistency:** All Fetcher methods must return `Promise<McpResult>` for consistency.
- **No Architecture Changes:** Do not arbitrarily change the established file structure or core architectural patterns.
- **TypeScript First:** All code must be properly typed and compile without errors.

</Constraints>

## Project-Specific Lesson Integration

### 최근 작업에서 얻은 교훈 (2025-08-22)

**목표:**
- 현재까지 작업한 내용들에서 얻을 수 있는 교훈을 AGENTS.md 파일에 갱신
- README.md 파일에도 수정할 부분이 있다면 수정

**핵심 학습 내용:**
1. **모듈 분리의 중요성**: 1000+ 줄의 거대한 파일을 개별 모델 파일로 분리하여 유지보수성 크게 향상
2. **직접 Import 패턴**: Re-export 레이어 제거로 명확한 의존성 관리와 Tree-shaking 최적화 달성
3. **Interface-Class 패턴**: "I" prefix 인터페이스와 비즈니스 로직을 담은 클래스의 명확한 분리
4. **결과 타입 통합**: 모든 Fetcher에서 `McpResult` 사용으로 일관된 에러 처리 및 응답 형식 확보
5. **타입 안전성**: 강력한 TypeScript 타입 시스템 활용으로 런타임 에러 방지

이러한 교훈들은 향후 새로운 서비스 추가나 기존 코드 개선 시 반드시 적용되어야 하는 핵심 원칙들입니다.

---

**마지막 업데이트**: 2025-08-22  
**작성자**: AI Assistant  
**버전**: 2.1
