# Fetch MCP Server

![fetch mcp logo](logo.jpg)

This MCP server provides functionality to fetch web content and automatically return it in the most appropriate format (plain text, JSON, or HTML).

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

### Resources

This server does not provide any persistent resources. It's designed to fetch and transform web content on demand.

## Getting started

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the server: `npm run build`

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

## Development

- Run `npm run dev` to start the TypeScript compiler in watch mode
- Use `npm test` to run the test suite


## Publish

`pnpm publish --access=public`

## License

This project is licensed under the MIT License.
