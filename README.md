# Fetch MCP Server

![fetch mcp logo](logo.jpg)

This MCP server provides functionality to fetch web content and automatically return it in the most appropriate format (plain text, JSON, or HTML). It also supports fetching content from Atlassian services like Confluence and Jira, as well as Slack messages.

<a href="https://glama.ai/mcp/servers/nu09wf23ao">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/nu09wf23ao/badge" alt="Fetch Server MCP server" />
</a>

## Architecture

### Project Structure

```
src/
├── slack/                   # Slack service integration
│   ├── SlackTypes.ts       # Slack interface definitions (I prefix)
│   ├── SlackFetcher.ts     # Slack API client and processing
│   └── model/              # Individual Slack model classes
│       ├── SlackUser.ts
│       ├── SlackReaction.ts
│       ├── SlackAttachment.ts
│       ├── SlackFile.ts
│       ├── SlackMessage.ts
│       ├── SlackMessageModel.ts
│       ├── SlackConversationsHistoryResponse.ts
│       ├── SlackConversationsRepliesResponse.ts
│       └── SlackUsersInfoResponse.ts
├── atlassian/              # Atlassian service integration
│   ├── AtlassianTypes.ts   # Atlassian interface definitions (I prefix)
│   ├── AtlassianFetcher.ts # Atlassian API client and processing
│   └── model/              # Individual Atlassian model classes
│       ├── ConfluencePage.ts
│       └── JiraTicket.ts
├── github/                 # GitHub service integration
│   ├── GitHubTypes.ts      # GitHub interface definitions (I prefix)
│   ├── GitHubFetcher.ts    # GitHub API client and processing
│   └── model/              # Individual GitHub model classes
│       ├── GitHubUser.ts
│       ├── GitHubFile.ts
│       ├── GitHubComment.ts
│       ├── GitHubReview.ts
│       ├── GitHubReviewComment.ts
│       ├── GitHubReviewCommentOnReview.ts
│       ├── GitHubPullRequest.ts
│       ├── GitHubPullRequestModel.ts
│       ├── GitHubIssue.ts
│       ├── GitHubIssueComment.ts
│       └── GitHubIssueModel.ts
├── types.ts                # Common type definitions (IMcpResult)
├── McpModels.ts           # MCP result model (McpResult class)
├── constants.ts           # Application constants and configuration
├── validate.ts            # Input validation logic
├── ResponseBuilder.ts     # Response formatting utilities
├── Fetcher.ts            # General web content fetching
└── index.ts              # Main MCP server and tool registration
```

### Design Principles

- **Interface-Class Pattern**: Interfaces use "I" prefix, classes contain business logic
- **Service Separation**: Each service has its own directory with types, models, and fetcher
- **Individual Model Files**: Each model class is in its own file for better maintainability
- **Direct Import Pattern**: Import models directly from their files, avoiding re-export layers
- **Unified Results**: All services return `McpResult` with consistent `toJson()` interface
- **Type Safety**: Strong TypeScript typing with proper error handling
- **Modular Architecture**: Clear separation of concerns and easy extensibility

## Components

### Tools

- **fetch**
  - Fetch a website and return the content in the most appropriate format
  - Input:
    - `url` (string, required): URL of the website to fetch
    - `headers` (object, optional): Custom headers to include in the request
    - `max_length` (number, optional): Maximum number of characters to return (default: 5000)
    - `start_index` (number, optional): Start content from this character index (default: 0)
  - Returns content in the best available format:
    1. First attempts to return as plain text (HTML tags, scripts, and styles removed)
    2. If that fails, attempts to return as JSON
    3. Falls back to raw HTML if other formats fail

- **fetch_confluence_page**
  - Fetch Confluence page content using Atlassian API
  - Requires `ATLASSIAN_USER` and `ATLASSIAN_API_TOKEN` environment variables
  - Input:
    - `url` (string, required): Confluence page URL (e.g., https://your-domain.atlassian.net/wiki/spaces/SPACE/pages/123456/Page+Title)
    - `maxLength` (number, optional): Maximum number of characters to return (default: 5000)
  - Returns structured content including title, space, author, and page content

- **fetch_jira_ticket**
  - Fetch Jira ticket information using Atlassian API
  - Requires `ATLASSIAN_USER` and `ATLASSIAN_API_TOKEN` environment variables
  - Input:
    - `url` (string, required): Jira ticket URL (e.g., https://your-domain.atlassian.net/browse/TICKET-123)
    - `maxLength` (number, optional): Maximum number of characters to return (default: 5000)
  - Returns comprehensive ticket information including:
    - Ticket key, title, type, status, priority
    - Assignee, reporter, creation/update dates
    - Description content
    - Subtasks (if available)
    - Recent comments (if available)

- **fetch_slack_message**
  - Fetch Slack message information using Slack Web API
  - Requires `SLACK_APP_USER_OAUTH_TOKEN` environment variable
  - Input:
    - `url` (string, required): Slack message URL (e.g., https://your-workspace.slack.com/archives/CHANNEL_ID/pTIMESTAMP)
    - `maxLength` (number, optional): Maximum number of characters to return (default: 5000)
  - Returns comprehensive message information including:
    - Message author, content, and timestamp
    - Thread replies (if available)
    - Emoji reactions (if available)
    - File attachments (if available)
  - Supports both regular messages and thread replies

- **fetch_github_pull_request**
  - Fetch GitHub Pull Request information using GitHub API
  - Requires `GITHUB_ACCESS_TOKEN` environment variable
  - Input:
    - `url` (string, required): GitHub Pull Request URL (e.g., https://github.com/owner/repo/pull/123)
  - Returns comprehensive Pull Request information including:
    - PR title, description, status, and metadata
    - Author, assignees, and requested reviewers
    - Branch information (head and base)
    - Labels and milestone information
    - Changed files with additions/deletions
    - All commits in the PR
    - Reviews and review comments
    - Issue comments
    - Merge status and verification details

- **fetch_github_issue**
  - Fetch GitHub Issue information using GitHub API
  - Requires `GITHUB_ACCESS_TOKEN` environment variable
  - Input:
    - `url` (string, required): GitHub Issue URL (e.g., https://github.com/owner/repo/issues/123)
  - Returns comprehensive Issue information including:
    - Issue title, description, status, and metadata
    - Author, assignees, and labels
    - Milestone information
    - All comments with author details
    - Comment statistics and author associations
    - Creation and update timestamps

### Resources

This server does not provide any persistent resources. It's designed to fetch and transform web content on demand.

## Getting started

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the server: `npm run build`

### Environment Variables

For Atlassian services (Confluence and Jira), you need to set up authentication:

```bash
export ATLASSIAN_USER="your-email@example.com"
export ATLASSIAN_API_TOKEN="your-api-token"
```

To create an API token:
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a label and copy the generated token

For Slack services, you need to set up a user OAuth token:

```bash
export SLACK_APP_USER_OAUTH_TOKEN="xoxp-your-user-oauth-token"
```

To get a Slack user OAuth token:
1. Create a Slack app at https://api.slack.com/apps
2. Configure OAuth & Permissions with required scopes:
   - `channels:history` - Read messages in public channels
   - `users:read` - Read user profile information
   - `groups:history` - Read messages in private channels (if needed)
3. Install the app to your workspace
4. Copy the "User OAuth Token" from the OAuth & Permissions page

For GitHub services, you need to set up a personal access token:

```bash
export GITHUB_ACCESS_TOKEN="ghp_your-personal-access-token"
```

To get a GitHub personal access token:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name and select appropriate scopes:
   - `repo` - Full control of private repositories (if accessing private repos)
   - `public_repo` - Access public repositories (for public repos only)
   - `read:org` - Read org and team membership (if needed)
4. Click "Generate token" and copy the generated token
5. Store it securely as it won't be shown again

### Usage

To use the server, you can run it directly:

```bash
npm start
```

This will start the Fetch MCP Server running on stdio.

### Usage with Desktop App

To integrate this server with a desktop app, add the following to your app's server configuration:

```json
{
  "mcpServers": {
    "fetch": {
      "command": "node",
      "args": [
        "{ABSOLUTE PATH TO FILE HERE}/dist/index.js"
      ]
    }
  }
}
```

Or use the published package:

```json
{
  "fetch": {
    "command": "npx",
    "args": [
      "-y",
      "@h16rkim/mcp-fetch-server@latest"
    ],
    "transport": "stdio"
  }
}
```

## Features

### Core Capabilities
- Fetches web content using modern fetch API
- Supports custom headers for requests
- Automatically detects and returns content in the most appropriate format
- Uses JSDOM for HTML parsing and text extraction
- Intelligent fallback system: text → JSON → HTML

### Atlassian Integration
- Confluence page content extraction with rich formatting
- Jira ticket information retrieval with comprehensive details
- Support for Atlassian Document Format (ADF) content parsing
- Proper authentication handling with API tokens

### Slack Integration
- Message fetching with full context (author, timestamp, content)
- Thread replies support with proper hierarchy
- Emoji reactions and file attachments
- User information resolution with display names
- Robust error handling and authentication

### GitHub Integration
- Pull Request information retrieval with comprehensive details
- Changed files analysis with additions/deletions tracking
- Commit history and verification status
- Review and comment aggregation
- Branch and merge status information
- Labels, assignees, and milestone tracking
- Issue information retrieval with comprehensive details
- Issue comments with author associations and statistics
- Parallel API calls for optimal performance
- Proper authentication handling with Personal Access Tokens

### Technical Features
- **Type-Safe Architecture**: Full TypeScript support with proper interface definitions
- **Modular Design**: Service-specific modules with individual model files for easy maintenance
- **Unified Error Handling**: Consistent error responses across all services via `McpResult`
- **Performance Optimized**: Direct imports enable tree-shaking and faster compilation
- **Security Focused**: Input validation and private IP blocking
- **Maintainable Code**: Single responsibility principle with clear module boundaries

## Development

### Building and Running
- Run `npm run build` to compile TypeScript to JavaScript
- Run `npm run dev` to start the TypeScript compiler in watch mode
- Use `npm test` to run the test suite (when available)

### Adding New Services

To add a new service integration:

1. Create a new directory under `src/` (e.g., `src/newservice/`)
2. Add type definitions with "I" prefix (e.g., `NewServiceTypes.ts`)
3. Create individual model classes in `model/` directory (e.g., `model/NewServiceItem.ts`)
4. Implement the fetcher class (e.g., `NewServiceFetcher.ts`)
5. Add constants to `constants.ts`
6. Add validation to `validate.ts`
7. Register the tool in `index.ts`
8. Update this README

### Code Quality Guidelines

- Follow the established Interface-Class pattern
- Use "I" prefix for interfaces, no prefix for classes
- Create individual files for each model class
- Use direct imports from model files (avoid re-export layers)
- Implement business logic in model classes, not fetchers
- Return `McpResult` objects with `toJson()` method
- Use proper TypeScript typing throughout
- Follow the modular directory structure

## Publish

```bash
npm publish --access=public
```

## License

This project is licensed under the MIT License.

---

**Last Updated**: 2025-08-22  
**Version**: 2.1  
**Architecture**: Modular TypeScript with Interface-Class Pattern and Individual Model Files
