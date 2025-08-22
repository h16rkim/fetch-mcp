# Fetch MCP Server - Agent Development Guidelines

## 📋 Project Overview

This project is an MCP (Model Context Protocol) server that can fetch information from web content and various services (Atlassian Confluence/Jira, Slack).

## 🏗️ Current Architecture

### File Structure
```
src/
├── slack/                   # Slack-related files
│   ├── SlackTypes.ts       # Slack type definitions (I prefix)
│   ├── SlackFetcher.ts     # Slack API processing
│   └── model/              # Slack model classes (individual files)
│       ├── SlackUser.ts
│       ├── SlackReaction.ts
│       ├── SlackAttachment.ts
│       ├── SlackFile.ts
│       ├── SlackMessage.ts
│       ├── SlackMessageModel.ts
│       ├── SlackConversationsHistoryResponse.ts
│       ├── SlackConversationsRepliesResponse.ts
│       └── SlackUsersInfoResponse.ts
├── atlassian/              # Atlassian-related files
│   ├── AtlassianTypes.ts   # Atlassian type definitions (I prefix)
│   ├── AtlassianFetcher.ts # Atlassian API processing
│   └── model/              # Atlassian model classes (individual files)
│       ├── ConfluencePage.ts
│       └── JiraTicket.ts
├── types.ts                # Common type definitions (IMcpResult)
├── McpModels.ts           # MCP result model (McpResult)
├── constants.ts           # Constants definition (tool names, defaults)
├── validate.ts            # Input validation logic
├── ResponseBuilder.ts     # Response builder
├── Fetcher.ts            # General web content fetching
└── index.ts              # Main server and tool registration
```

### Currently Implemented Tools
1. **fetch**: General website content fetching
2. **fetch_confluence_page**: Confluence page fetching
3. **fetch_jira_issue**: Jira ticket fetching  
4. **fetch_slack_message**: Slack message fetching

## 🤖 AI Agent Work Guide

### Required Reference Documents

When AI Agent performs work in this project, it **must** first read the following documents:

#### 📋 [agent/rules/agent-workflow.md](./rules/agent-workflow.md)
- **AI Agent Workflow**: Complete workflow from code writing to verification
- **Verification Loop**: TypeScript compilation, linting, manual review steps
- **Error Handling**: Error handling methods and iteration rules
- **Architecture Compliance**: Project-specific pattern compliance checks
- **Documentation Update**: Documentation update procedures after work completion

### Pre-work Checklist

1. ✅ **Study agent-workflow.md document**: Understand the complete workflow
2. ✅ **Check AGENTS.md coding conventions**: Review rules for relevant file types
3. ✅ **Analyze existing code patterns**: Reference similar existing code structures
4. ✅ **Follow architecture**: Interface-Class pattern, direct imports, etc.

### Key Principles

- **Interface-Class Pattern**: "I" prefix interfaces + business logic classes
- **Individual Model Files**: Separate each model into individual files
- **Direct Import Pattern**: Direct imports without re-export layers
- **McpResult Consistency**: Use unified result types across all Fetchers
- **Documentation First**: Always update documentation after work completion


## 🎯 Coding Conventions and Architecture Lessons (2025-08-22 Update)

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

## 📚 References

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Slack Web API](https://api.slack.com/web)
- [Atlassian REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)

---


**Last Updated**: 2025-08-22  
**Author**: AI Assistant  
**Version**: 2.1
