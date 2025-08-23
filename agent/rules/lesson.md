## 🎯 Coding Conventions and Architecture Lessons (2025-08-23 Update)

### 1. Interface vs Class Design Principles

#### ✅ What to Do
- **Use "I" prefix for Interfaces**
  ```typescript
  // Good: Interface with I prefix
  export interface ISlackMessage {
    ts: string;
    user?: string;
    text?: string;
  }
  
  // Good: Class without prefix
  export class SlackMessage {
    private _data: ISlackMessage;
    constructor(data: ISlackMessage) { ... }
  }
  ```

- **Delegate business logic to Classes**
  ```typescript
  // Good: Business logic concentrated in Class
  export class SlackMessage {
    get formattedTimestamp(): string {
      return new Date(parseFloat(this._data.ts) * 1000).toISOString();
    }
    
    get isThreaded(): boolean {
      return Boolean(this._data.thread_ts);
    }
  }
  ```

- **Use Response Model Classes for HTTP response processing**
  ```typescript
  // Good: Wrap HTTP response with Class
  const rawData: ISlackUsersInfoResponse = await response.json();
  const data = new SlackUsersInfoResponse(rawData);
  
  if (!data.isSuccess) {
    return undefined;
  }
  
  return data.user; // Return SlackUser class
  ```

#### ❌ What to Avoid
- Functions that directly return Interfaces
- Structure where business logic is concentrated in Fetcher
- Direct use of raw HTTP responses

### 2. File Structure and Module Separation

#### ✅ What to Do
- **Separate directories by service**
  ```
  src/
  ├── slack/          # All Slack-related files
  ├── atlassian/      # All Atlassian-related files
  └── common/         # Common utilities
  ```

- **Separate type files**
  ```typescript
  // SlackTypes.ts - Slack-specific types
  export interface ISlackMessage { ... }
  export type SlackRequest = { ... }
  
  // types.ts - Common types
  export interface IMcpResult { ... }
  export type RequestPayload = { ... }
  ```

- **Clear import paths**
  ```typescript
  // Within same directory
  import { ISlackMessage } from "./SlackTypes.js";
  
  // Parent directory
  import { Constants } from "../constants.js";
  
  // Subdirectory
  import { SlackFetcher } from "./slack/SlackFetcher.js";
  ```

#### ❌ What to Avoid
- Placing all files in root directory
- Mixed service-specific types in same structure
- Complex relative paths (../../..)

### 3. Constructor Design and Object Creation Patterns

#### ✅ What to Do
- **Natural constructor parameters**
  ```typescript
  // Good: Intuitive parameter order
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

- **Use static factory methods**
  ```typescript
  // Good: Provide meaningful creation methods
  export class McpResult {
    static success(text: string): McpResult { ... }
    static error(message: string): McpResult { ... }
  }
  ```

#### ❌ What to Avoid
- Passing artificially created wrapper objects to constructors
- Creating temporary interfaces for complex object composition

### 4. Variable Declaration and Control Flow

#### ✅ What to Do
- **Early Return pattern**
  ```typescript
  // Good: Separate methods by condition
  if (isReply && threadTs) {
    return await this.handleReplyMessage(...);
  } else {
    return await this.handleRegularMessage(...);
  }
  ```

- **Improve readability through method separation**
  ```typescript
  // Good: Dedicated method for each case
  private static async handleReplyMessage(...): Promise<McpResult> {
    const replyMessage = await this.getSpecificReply(...);
    if (!replyMessage) {
      return this.createErrorResult("Reply message not found");
    }
    // Processing logic
  }
  ```

#### ❌ What to Avoid
- Declaring let variables and initializing in branches
- Long if-else chains
- Complex variable state tracking structures

### 5. Result Type Unification and Standardization

#### ✅ What to Do
- **Use common result types**
  ```typescript
  // Good: All Fetchers use the same result type
  export class McpResult {
    toJson(): IMcpResult { ... }
    static success(text: string): McpResult { ... }
    static error(message: string): McpResult { ... }
  }
  ```

- **Consistent error handling**
  ```typescript
  // Good: Same pattern across all Fetchers
  private static createErrorResult(message: string): McpResult {
    return McpResult.error(message);
  }
  ```

#### ❌ What to Avoid
- Using different result types per service
- Duplicated error handling logic

### 6. Data Access Patterns

#### ✅ What to Do
- **Raw data access via data getter**
  ```typescript
  export class SlackMessage {
    private _data: ISlackMessage;
    
    get data(): ISlackMessage {
      return this._data;
    }
    
    // Business logic methods
    get formattedTimestamp(): string { ... }
  }
  ```

- **Hierarchical data access**
  ```typescript
  // Model -> Class -> Interface order
  const messageModel = new SlackMessageModel(message, ...);
  const rawData = messageModel.messageDetails.data; // Only when needed
  ```

#### ❌ What to Avoid
- Direct Interface data manipulation
- Simple data passing without business logic

### 7. Type Safety Enhancement

#### ✅ What to Do
- **Clear type definitions and validation**
  ```typescript
  // Good: Use with type guards
  if (!data.isSuccess) {
    return this.createErrorResult(`API error: ${data.error || 'Unknown error'}`);
  }
  
  return data.user; // Type guaranteed state
  ```

- **Actively use optional chaining**
  ```typescript
  // Good: Safe property access
  return this._data.profile?.display_name || 
         this._data.display_name || 
         this._data.name || 
         "Unknown User";
  ```

#### ❌ What to Avoid
- Overuse of any type
- Excessive use of type assertions
- Access patterns that may cause runtime errors

### 8. Performance and Memory Optimization

#### ✅ What to Do
- **Lazy initialization pattern**
  ```typescript
  // Good: Create only when needed
  get reactions(): SlackReaction[] {
    if (!this._data.reactions) {
      return [];
    }
    return this._data.reactions.map(reaction => new SlackReaction(reaction));
  }
  ```

- **Utilize parallel processing**
  ```typescript
  // Good: Independent API calls in parallel
  const [userInfo, replies] = await Promise.all([
    this.getUserInfo(token, userId),
    this.getReplies(token, channel, timestamp)
  ]);
  ```

#### ❌ What to Avoid
- Unnecessary object creation
- Sequential independent API calls

### 9. Code Reusability and Extensibility

#### ✅ What to Do
- **Code reuse through inheritance**
  ```typescript
  // Good: Common functionality in base class
  export class SlackUser { ... }
  export class SlackUserInfo extends SlackUser {}
  ```

- **Common patterns using generics**
  ```typescript
  // Good: Reusable response processing
  export class ApiResponseHandler<T> {
    static process<T>(rawData: any, ModelClass: new (data: any) => T): T {
      return new ModelClass(rawData);
    }
  }
  ```

#### ❌ What to Avoid
- Duplicated code patterns
- Hard-coded service-specific logic

### 10. Testability

#### ✅ What to Do
- **Dependency injection capable structure**
  ```typescript
  // Good: Mockable during testing
  private static async callApi(url: string, headers: Record<string, string>) {
    return fetch(url, { headers });
  }
  ```

- **Pure function oriented**
  ```typescript
  // Good: Side-effect free data transformation
  static formatTimestamp(timestamp: string): string {
    return new Date(parseFloat(timestamp) * 1000).toISOString();
  }
  ```

#### ❌ What to Avoid
- Tight coupling with external dependencies
- Complex methods that are difficult to test

### 11. Module Separation & File Organization

#### ✅ What to Do
- **Separate individual model files**
  ```typescript
  // Good: Separate each model into individual files
  src/slack/model/
  ├── SlackUser.ts        # Single responsibility: User model
  ├── SlackMessage.ts     # Single responsibility: Message model
  └── SlackReaction.ts    # Single responsibility: Reaction model
  
  // Bad: All models in one file
  src/slack/SlackModels.ts  # 1000+ line monolithic file
  ```

- **Direct Import pattern**
  ```typescript
  // Good: Import only needed models directly
  import { SlackUser } from "./model/SlackUser.js";
  import { SlackMessage } from "./model/SlackMessage.js";
  
  // Bad: Re-export through intermediate layer
  import { SlackUser, SlackMessage } from "./SlackModels.js";
  ```

- **Clear dependency management**
  ```typescript
  // Good: Import only necessary dependencies in each model file
  // SlackMessage.ts
  import { ISlackMessage } from "../SlackTypes.js";
  import { SlackReaction } from "./SlackReaction.js";
  import { SlackAttachment } from "./SlackAttachment.js";
  ```

#### ❌ What to Avoid
- Monolithic model files (1000+ lines)
- Unnecessary re-export layers
- Creating circular dependencies
- Importing all models at once

### 12. Result Type Unification and Standardization

#### ✅ What to Do
- **Use common result types**
  ```typescript
  // Good: All Fetchers use the same result type
  export class McpResult {
    toJson(): IMcpResult { ... }
    static success(text: string): McpResult { ... }
    static error(message: string): McpResult { ... }
  }
  
  // Used in all Fetchers
  SlackFetcher.fetchSlackMessage(): Promise<McpResult>
  AtlassianFetcher.fetchConfluencePage(): Promise<McpResult>
  Fetcher.doFetch(): Promise<McpResult>
  ```

- **Consistent error handling**
  ```typescript
  // Good: Same pattern across all Fetchers
  private static createErrorResult(message: string): McpResult {
    return McpResult.error(message);
  }
  ```

- **Unified response processing**
  ```typescript
  // Good: Consistent processing in index.ts
  const result = await SomeFetcher.someMethod();
  const json = result.toJson(); // IMcpResult
  return { content: json.content, isError: json.isError };
  ```

#### ❌ What to Avoid
- Using different result types per service
- Duplicated error handling logic
- Inconsistent response formats

### 13. Code Deduplication & Refactoring

#### ✅ What to Do
- **Remove unused code**
  ```typescript
  // Good: Remove methods that are not actually used
  // Remove getMessageReplies() method from SlackFetcher
  
  // Bad: Keep unused code as is
  private static getMessageReplies() { /* Not used */ }
  ```

- **Consolidate duplicate types**
  ```typescript
  // Good: Unify types with identical structure
  interface IMcpResult {
    content: Array<{ type: "text"; text: string }>;
    isError: boolean;
  }
  
  // Bad: Duplicate type definitions per service
  interface SlackResult { content: ..., isError: ... }
  interface AtlassianResult { content: ..., isError: ... }
  ```

#### ❌ What to Avoid
- Leaving dead code unattended
- Duplicate implementation of identical logic
- Inconsistent naming conventions

### 14. Model Class Property Structure & Data Encapsulation (2025-08-23 Update)

#### ✅ What to Do
- **Use explicit private properties instead of _data objects**
  ```typescript
  // Good: Explicit private properties
  export class GitHubUser {
    private _id: number;
    private _login: string;
    private _name?: string;
    private _avatarUrl: string;
    private _htmlUrl: string;
    private _type: string;
    private _email?: string;
    // ... more explicit fields
    
    constructor(data: IGitHubUser) {
      this._id = data.id;
      this._login = data.login;
      this._name = data.name;
      this._avatarUrl = data.avatar_url;
      // ... assign each field explicitly
    }
  }
  
  // Bad: Generic _data object
  export class GitHubUser {
    private _data: IGitHubUser;
    
    constructor(data: IGitHubUser) {
      this._data = data;
    }
  }
  ```

- **Reconstruct interface in get data() method**
  ```typescript
  // Good: Reconstruct interface from private properties
  get data(): IGitHubUser {
    return {
      id: this._id,
      login: this._login,
      name: this._name,
      avatar_url: this._avatarUrl,
      html_url: this._htmlUrl,
      type: this._type,
      email: this._email
      // ... map all fields back to interface structure
    };
  }
  ```

- **Direct property access in getter methods**
  ```typescript
  // Good: Access private properties directly
  get login(): string {
    return this._login;
  }
  
  get bestDisplayName(): string {
    return this._name || this._login || "Unknown User";
  }
  
  // Bad: Access through _data object
  get login(): string {
    return this._data.login;
  }
  ```

- **Handle complex nested objects in constructor**
  ```typescript
  // Good: Transform nested objects immediately in constructor
  export class SlackMessage {
    private _reactions: SlackReaction[];
    private _attachments: SlackAttachment[];
    private _files: SlackFile[];
    
    constructor(data: ISlackMessage) {
      this._reactions = (data.reactions || []).map(reaction => new SlackReaction(reaction));
      this._attachments = (data.attachments || []).map(attachment => new SlackAttachment(attachment));
      this._files = (data.files || []).map(file => new SlackFile(file));
    }
  }
  ```

- **Use proper TypeScript types for constrained values**
  ```typescript
  // Good: Use union types for constrained values
  private _state: "open" | "closed";
  private _status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
  
  // Bad: Use generic string type
  private _state: string;
  private _status: string;
  ```

#### ✅ Benefits of Explicit Property Structure
- **Improved Code Readability**: Class property declarations serve as documentation
- **Better IDE Support**: IntelliSense can provide better autocomplete and type checking
- **Easier Debugging**: Clear visibility of what data each class manages
- **Enhanced Maintainability**: Changes to data structure are immediately visible
- **Type Safety**: Compile-time validation of property access
- **Self-Documenting Code**: No need to check interface definitions to understand class structure

#### ❌ What to Avoid
- **Generic _data object pattern for complex models**
  ```typescript
  // Bad: Hidden data structure
  export class ComplexModel {
    private _data: IComplexInterface;
    
    get someProperty(): string {
      return this._data.some_property; // Structure not visible in class
    }
  }
  ```

- **Lazy initialization of nested objects**
  ```typescript
  // Bad: Lazy initialization creates inconsistent state
  private _user?: GitHubUser;
  
  get user(): GitHubUser {
    if (!this._user) {
      this._user = new GitHubUser(this._data.user);
    }
    return this._user;
  }
  
  // Good: Initialize in constructor
  private _user: GitHubUser;
  
  constructor(data: IGitHubIssue) {
    this._user = new GitHubUser(data.user);
  }
  ```

- **Inconsistent property naming between interface and class**
  ```typescript
  // Bad: Inconsistent naming
  interface IExample {
    created_at: string;
  }
  
  class Example {
    private _creationTime: string; // Different naming
  }
  
  // Good: Consistent mapping
  class Example {
    private _createdAt: string; // Maps clearly to created_at
  }
  ```

### 15. Large-Scale Refactoring Patterns (2025-08-23 Update)

#### ✅ What to Do
- **Apply consistent patterns across all similar classes**
  ```typescript
  // Good: Apply same refactoring pattern to all model classes
  // GitHub models: GitHubUser, GitHubComment, GitHubFile, GitHubCommit, etc.
  // Slack models: SlackUser, SlackMessage, SlackAttachment, SlackFile, etc.
  // All follow the same explicit property pattern
  ```

- **Maintain backward compatibility through get data() method**
  ```typescript
  // Good: Existing code continues to work
  const user = new GitHubUser(userData);
  const originalData = user.data; // Still returns IGitHubUser interface
  ```

- **Verify changes with TypeScript compilation**
  ```typescript
  // Good: Use TypeScript compiler to catch breaking changes
  npm run build // Must pass without errors after refactoring
  ```

- **Update related files when changing core patterns**
  ```typescript
  // Good: Fix related issues discovered during compilation
  // Example: Fix reviewerNames -> requestedReviewerNames in GitHubPullRequestModel
  if (this._pullRequest.requestedReviewerNames.length > 0) {
    sections.push(`**Requested Reviewers**: ${this._pullRequest.requestedReviewerNames.join(", ")}`);
  }
  ```

#### ✅ Refactoring Workflow
1. **Identify Pattern**: Recognize the need for consistent structure across similar classes
2. **Plan Changes**: List all files that need the same refactoring pattern
3. **Apply Systematically**: Refactor each file following the same pattern
4. **Compile Frequently**: Run TypeScript compilation after each file or small batch
5. **Fix Issues Immediately**: Address compilation errors as they arise
6. **Verify Functionality**: Ensure all existing functionality remains intact

#### ❌ What to Avoid
- **Partial refactoring**: Leaving some classes with old patterns while others use new patterns
- **Breaking existing APIs**: Changing public interfaces without maintaining compatibility
- **Ignoring compilation errors**: Proceeding with refactoring when TypeScript shows errors
- **Inconsistent application**: Using different patterns for similar classes

### 16. Domain Class Separation & Nested Object Refactoring (2025-08-23 Update)

#### ✅ What to Do
- **Extract nested object literals into separate Domain Classes**
  ```typescript
  // Good: Separate domain classes for nested structures
  export class ConfluenceSpace {
    private _key: string;
    private _name: string;
    
    constructor(data: { key?: string; name?: string }) {
      this._key = data.key || "Unknown space";
      this._name = data.name || "Unknown space name";
    }
    
    get displayInfo(): string {
      return `${this._name} (${this._key})`;
    }
  }
  
  export class ConfluencePage {
    private _space?: ConfluenceSpace;
    
    constructor(data: IConfluenceApiResponse) {
      this._space = data.space ? new ConfluenceSpace(data.space) : undefined;
    }
  }
  
  // Bad: Object literal types in main class
  export class ConfluencePage {
    private _space?: {
      key?: string;
      name?: string;
    };
  }
  ```

- **Create hierarchical domain class relationships**
  ```typescript
  // Good: Compose domain classes hierarchically
  export class ConfluenceVersion {
    private _by?: ConfluenceAuthor;
    
    constructor(data: { by?: { publicName?: string } }) {
      this._by = data.by ? new ConfluenceAuthor(data.by) : undefined;
    }
    
    get authorName(): string {
      return this._by?.publicName || "Unknown author";
    }
  }
  
  export class ConfluenceBody {
    private _exportView?: ConfluenceExportView;
    
    get htmlContent(): string {
      return this._exportView?.htmlContent || "No content";
    }
  }
  ```

- **Add business logic to domain classes**
  ```typescript
  // Good: Each domain class contains relevant business logic
  export class ConfluenceExportView {
    private _value: string;
    
    get hasContent(): boolean {
      return this._value !== "No content" && this._value.trim().length > 0;
    }
    
    get contentLength(): number {
      return this._value.length;
    }
    
    get shortContent(): string {
      const maxLength = 200;
      if (this._value.length <= maxLength) {
        return this._value;
      }
      return this._value.substring(0, maxLength) + "...";
    }
  }
  ```

- **Delegate operations to appropriate domain classes**
  ```typescript
  // Good: Main class delegates to domain classes
  export class ConfluencePage {
    private _body?: ConfluenceBody;
    
    get hasContent(): boolean {
      return this._body?.hasContent || false;
    }
    
    get contentLength(): number {
      return this._body?.contentLength || 0;
    }
    
    get pageInfo(): PageInfo {
      return {
        title: this._title,
        space: this._space?.displayInfo || "Unknown space",
        author: this._version?.authorName || "Unknown author",
        hasContent: this.hasContent,
        contentLength: this.contentLength,
      };
    }
  }
  ```

#### ✅ Benefits of Domain Class Separation
- **Clear Responsibility Separation**: Each domain class manages its own data and business logic
- **Enhanced Reusability**: Individual domain classes can be reused in other contexts
- **Improved Type Safety**: Each class has explicit types with compile-time validation
- **Better Extensibility**: Easy to add new business logic to specific domain classes
- **Simplified Testing**: Each domain class can be tested independently
- **Reduced Complexity**: Main class becomes simpler by delegating to domain classes
- **Better IDE Support**: IntelliSense works better with explicit class structures

#### ❌ What to Avoid
- **Keeping complex nested object literals**
  ```typescript
  // Bad: Complex nested object literal types
  export class ComplexModel {
    private _nested?: {
      level1?: {
        level2?: {
          level3?: {
            value?: string;
            metadata?: {
              created?: string;
              author?: {
                name?: string;
                email?: string;
              };
            };
          };
        };
      };
    };
  }
  ```

- **Mixing data access patterns**
  ```typescript
  // Bad: Inconsistent access patterns
  export class MixedModel {
    private _simpleField: string;
    private _complexData?: {
      nested?: {
        value?: string;
      };
    };
    
    // Inconsistent - some fields have domain classes, others don't
  }
  ```

- **Creating domain classes without business logic**
  ```typescript
  // Bad: Domain class that only holds data without logic
  export class EmptyDomain {
    private _value: string;
    
    constructor(data: { value?: string }) {
      this._value = data.value || "";
    }
    
    get value(): string {
      return this._value;
    }
    
    // No business logic - this should just be a simple property
  }
  ```

### 17. Consistent Architecture Application (2025-08-23 Update)

#### ✅ What to Do
- **Apply patterns consistently across all services**
  ```typescript
  // Good: All services follow the same architectural patterns
  // GitHub models: Explicit properties + Domain classes for complex nested objects
  // Slack models: Explicit properties + Domain classes for complex nested objects  
  // Atlassian models: Explicit properties + Domain classes for complex nested objects
  ```

- **Handle inline type definitions appropriately**
  ```typescript
  // Good: Work with existing type definitions when they're inline
  export class JiraTicket {
    private _key: string;
    private _fields?: {
      summary?: string;
      assignee?: {
        displayName?: string;
      };
      // Use inline types when they're already defined this way
    };
  }
  
  // But extract to domain classes when complexity warrants it
  export class ConfluencePage {
    private _space?: ConfluenceSpace; // Extracted to domain class
    private _version?: ConfluenceVersion; // Extracted to domain class
  }
  ```

- **Maintain backward compatibility during refactoring**
  ```typescript
  // Good: Ensure get data() method still returns expected interface
  get data(): IConfluenceApiResponse {
    return {
      title: this._title,
      space: this._space?.data, // Domain class provides data() method
      version: this._version?.data,
      body: this._body?.data
    };
  }
  ```

#### ✅ Decision Criteria for Domain Class Extraction
1. **Complexity**: If nested object has 3+ properties or 2+ levels of nesting
2. **Business Logic**: If nested object needs its own business methods
3. **Reusability**: If nested object structure is used in multiple places
4. **Clarity**: If extraction would make the main class significantly clearer

#### ❌ What to Avoid
- **Over-engineering simple structures**: Don't create domain classes for simple 1-2 property objects
- **Inconsistent extraction**: Don't extract some nested objects but leave others as literals
- **Breaking existing interfaces**: Ensure refactored classes still implement expected interfaces

### 18. Validation Logic Refactoring & Service-Specific Organization (2025-08-23 Update)

#### ✅ What to Do
- **Create service-specific Validator classes**
  ```typescript
  // Good: Service-specific validators in their own directories
  src/github/GitHubValidator.ts
  src/slack/SlackValidator.ts
  src/atlassian/AtlassianValidator.ts
  src/GeneralValidator.ts
  
  // Each validator handles its own service validation
  export class GitHubValidator extends BaseValidator {
    static validateGitHubRequest(args: any): IGitHubRequest { ... }
    static validateGitHubIssueRequest(args: any): IGitHubIssueRequest { ... }
  }
  
  // Bad: Monolithic validation file
  src/validate.ts // 200+ lines with all validations mixed
  ```

- **Use BaseValidator for common validation utilities**
  ```typescript
  // Good: Shared validation utilities in base class
  export abstract class BaseValidator {
    protected static validateObject(args: any, fieldName: string): void { ... }
    protected static validateRequiredString(value: any, fieldName: string): string { ... }
    protected static validateUrl(url: string, fieldName: string): void { ... }
    protected static validateUrlPattern(url: string, pattern: RegExp, fieldName: string, exampleUrl: string): void { ... }
  }
  
  // Service validators extend base functionality
  export class SlackValidator extends BaseValidator {
    private static readonly SLACK_MESSAGE_URL_PATTERN = /https:\/\/[^.]+\.slack\.com\/archives\/[A-Z0-9]+\/p\d+/;
    
    static validateSlackRequest(args: any): ISlackRequest {
      this.validateObject(args);
      const url = this.validateRequiredString(args.url, "url");
      this.validateSlackMessageUrl(url);
      return { url, maxLength: this.withDefault(...) };
    }
  }
  ```

- **Eliminate intermediate validation layers**
  ```typescript
  // Good: Direct validator usage
  import { GitHubValidator } from "./github/GitHubValidator.js";
  import { SlackValidator } from "./slack/SlackValidator.js";
  
  const validatedArgs = GitHubValidator.validateGitHubRequest(args);
  const slackArgs = SlackValidator.validateSlackRequest(args);
  
  // Bad: Unnecessary intermediate functions
  export function validateGitHubRequest(args: any): IGitHubRequest {
    return GitHubValidator.validateGitHubRequest(args); // Just delegation
  }
  ```

- **Add service-specific validation features**
  ```typescript
  // Good: Service-specific validation methods
  export class GitHubValidator extends BaseValidator {
    static validateToken(token: string): void {
      if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
        throw new Error('Invalid GitHub token format');
      }
    }
    
    static extractOwnerAndRepo(url: string): { owner: string; repo: string } {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) throw new Error('Cannot extract owner and repository');
      return { owner: match[1], repo: match[2] };
    }
  }
  ```

- **Co-locate validators with their services**
  ```typescript
  // Good: Validators live with their services
  src/github/
  ├── GitHubValidator.ts    # GitHub validation logic
  ├── GitHubFetcher.ts      # GitHub API logic
  ├── GitHubTypes.ts        # GitHub type definitions
  └── model/                # GitHub model classes
  
  // Bad: Centralized validation directory
  src/validation/
  ├── GitHubValidator.ts    # Separated from GitHub service
  ├── SlackValidator.ts     # Separated from Slack service
  └── AtlassianValidator.ts # Separated from Atlassian service
  ```

#### ✅ Benefits of Service-Specific Validation
- **Improved Modularity**: Each service manages its own validation logic
- **Enhanced Cohesion**: Related validation code stays with the service it validates
- **Better Extensibility**: Easy to add service-specific validation features
- **Reduced Dependencies**: No need for centralized validation files
- **Clearer Ownership**: Each service team owns their validation logic
- **Tree-Shaking Optimization**: Unused validators are not included in bundles

#### ❌ What to Avoid
- **Monolithic validation files**
  ```typescript
  // Bad: One large file with all validations
  export function validateGitHubRequest(args: any): IGitHubRequest { ... }
  export function validateSlackRequest(args: any): ISlackRequest { ... }
  export function validateJiraRequest(args: any): JiraRequest { ... }
  export function validateConfluenceRequest(args: any): ConfluenceRequest { ... }
  // ... 200+ lines of mixed validation logic
  ```

- **Unnecessary validation wrapper functions**
  ```typescript
  // Bad: Wrapper functions that just delegate
  export function validateGitHubRequest(args: any): IGitHubRequest {
    return GitHubValidator.validateGitHubRequest(args);
  }
  
  // Good: Use validator directly
  const validatedArgs = GitHubValidator.validateGitHubRequest(args);
  ```

- **Centralized validation directories when not needed**
  ```typescript
  // Bad: Artificial separation from services
  src/validation/GitHubValidator.ts  // Far from GitHub service
  src/github/GitHubFetcher.ts        // Has to import from distant location
  
  // Good: Co-located with service
  src/github/GitHubValidator.ts      // Next to GitHubFetcher.ts
  src/github/GitHubFetcher.ts        // Can import locally
  ```

### 19. Refactoring Workflow & Incremental Improvement (2025-08-23 Update)

#### ✅ What to Do
- **Follow systematic refactoring steps**
  ```typescript
  // Step 1: Create new structure alongside old
  src/validation/BaseValidator.ts        # New base class
  src/github/GitHubValidator.ts          # New service validator
  src/validate.ts                        # Keep old file temporarily
  
  // Step 2: Update consumers to use new structure
  import { GitHubValidator } from "./github/GitHubValidator.js";
  const validatedArgs = GitHubValidator.validateGitHubRequest(args);
  
  // Step 3: Remove old structure after verification
  rm src/validate.ts                     # Remove old centralized file
  ```

- **Maintain backward compatibility during transition**
  ```typescript
  // Good: Keep old interface while implementing new structure
  export function validateGitHubRequest(args: any): IGitHubRequest {
    return GitHubValidator.validateGitHubRequest(args); // Delegate to new validator
  }
  
  // Then gradually migrate consumers and remove wrapper
  ```

- **Verify each step with compilation**
  ```typescript
  // Good: Compile after each major change
  npm run build  // Must pass after each refactoring step
  
  // Fix any issues immediately before proceeding
  ```

- **Remove unnecessary files and directories**
  ```typescript
  // Good: Clean up after successful migration
  rm src/validate.ts                     # Remove old validation file
  rm src/validation/index.ts             # Remove unnecessary index files
  rmdir src/validation                   # Remove empty directories (if applicable)
  ```

#### ✅ Refactoring Decision Criteria
1. **Cohesion**: Keep related code together (validators with their services)
2. **Coupling**: Reduce dependencies between unrelated modules
3. **Clarity**: Make the code structure more intuitive and discoverable
4. **Maintainability**: Easier to modify and extend individual services
5. **Performance**: Enable better tree-shaking and bundle optimization

#### ❌ What to Avoid
- **Big-bang refactoring**: Changing everything at once without verification
- **Breaking changes without migration path**: Removing old interfaces before consumers are updated
- **Leaving dead code**: Keeping old files after successful migration
- **Inconsistent patterns**: Applying new patterns to some services but not others
