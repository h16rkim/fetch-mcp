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
