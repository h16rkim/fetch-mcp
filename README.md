# Fetch MCP Server

![fetch mcp logo](logo.jpg)

This MCP server provides functionality to fetch web content and automatically return it in the most appropriate format (plain text, JSON, or HTML). It also supports fetching content from Atlassian services like Confluence and Jira, as well as Slack messages.

<a href="https://glama.ai/mcp/servers/nu09wf23ao">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/nu09wf23ao/badge" alt="Fetch Server MCP server" />
</a>

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
  - Requires `SLACK_REFRESH_TOKEN` environment variable
  - Input:
    - `url` (string, required): Slack message URL (e.g., https://your-workspace.slack.com/archives/CHANNEL_ID/pTIMESTAMP)
    - `maxLength` (number, optional): Maximum number of characters to return (default: 5000)
  - Returns comprehensive message information including:
    - Message author, content, and timestamp
    - Thread replies (if available)
    - Emoji reactions (if available)
    - File attachments (if available)
  - Automatically manages access token refresh using the provided refresh token

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
2. Configure OAuth & Permissions with required scopes (channels:history, users:read)
3. Install the app to your workspace
4. Copy the "User OAuth Token" from the OAuth & Permissions page

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

- Fetches web content using modern fetch API
- Supports custom headers for requests
- Automatically detects and returns content in the most appropriate format
- Uses JSDOM for HTML parsing and text extraction
- Intelligent fallback system: text → JSON → HTML
- Atlassian Confluence page content extraction
- Jira ticket information retrieval with comprehensive details
- Slack message fetching with thread replies, reactions, and attachments
- Support for Atlassian Document Format (ADF) content parsing
- Automatic Slack access token management and refresh

## Development

- Run `npm run dev` to start the TypeScript compiler in watch mode
- Use `npm test` to run the test suite

## Publish

`pnpm publish --access=public`

## License

This project is licensed under the MIT License.
