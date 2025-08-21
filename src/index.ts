#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { RequestPayloadSchema, ConfluenceRequestSchema, JiraRequestSchema } from "./types.js";
import { Fetcher } from "./Fetcher.js";
import { AtlassianFetcher } from "./AtlassianFetcher.js";

const server = new Server(
  {
    name: "zcaceres/fetch",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "fetch",
        description: "Fetch a website and return the content in the most appropriate format (text, JSON, or HTML)",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL of the website to fetch",
            },
            headers: {
              type: "object",
              description: "Optional headers to include in the request",
            },
            max_length: {
              type: "number",
              description: "Maximum number of characters to return (default: 5000)",
            },
            start_index: {
              type: "number",
              description: "Start content from this character index (default: 0)",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "fetch_confluence_page",
        description: "Fetch Confluence page content using Atlassian API. Requires ATLASSIAN_API_TOKEN environment variable.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "Confluence page URL (e.g., https://your-domain.atlassian.net/wiki/spaces/SPACE/pages/123456/Page+Title)",
            },
            maxLength: {
              type: "number",
              description: "Maximum number of characters to return (default: 5000)",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "fetch_jira_issue",
        description: "Fetch JIRA issue details using Atlassian API. Requires ATLASSIAN_API_TOKEN environment variable.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "JIRA issue URL (e.g., https://your-domain.atlassian.net/browse/PROJ-123)",
            },
            maxLength: {
              type: "number",
              description: "Maximum number of characters to return (default: 5000)",
            },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (request.params.name === "fetch") {
    const validatedArgs = RequestPayloadSchema.parse(args);
    const fetchResult = await Fetcher.doFetch(validatedArgs);
    return {
      content: fetchResult.content,
      isError: fetchResult.isError,
    };
  }

  if (request.params.name === "fetch_confluence_page") {
    const validatedArgs = ConfluenceRequestSchema.parse(args);
    const confluenceResult = await AtlassianFetcher.fetchConfluencePage(validatedArgs);
    return {
      content: confluenceResult.content,
      isError: confluenceResult.isError,
    };
  }

  if (request.params.name === "fetch_jira_issue") {
    const validatedArgs = JiraRequestSchema.parse(args);
    const jiraResult = await AtlassianFetcher.fetchJiraIssue(validatedArgs);
    return {
      content: jiraResult.content,
      isError: jiraResult.isError,
    };
  }
  
  throw new Error("Tool not found");
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
