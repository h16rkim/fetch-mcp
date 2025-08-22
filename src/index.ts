#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { validateRequestPayload, validateConfluenceRequest, validateJiraRequest, validateSlackRequest } from "./validate.js";
import { Fetcher } from "./Fetcher.js";
import { AtlassianFetcher } from "./atlassian/AtlassianFetcher.js";
import { SlackFetcher } from "./slack/SlackFetcher.js";
import { Constants } from "./constants.js";

const server = new Server(
  {
    name: "@h16rkim/fetch",
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
        name: Constants.FETCH,
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
              description: `Maximum number of characters to return (default: ${Constants.DEFAULT_MAX_LENGTH})`,
            },
            start_index: {
              type: "number",
              description: `Start content from this character index (default: ${Constants.DEFAULT_START_INDEX})`,
            },
          },
          required: ["url"],
        },
      },
      {
        name: Constants.FETCH_CONFLUENCE_PAGE,
        description: "Fetch Confluence page content using Atlassian API. Requires ATLASSIAN_USER and ATLASSIAN_API_TOKEN environment variables.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "Confluence page URL (e.g., https://your-domain.atlassian.net/wiki/spaces/SPACE/pages/123456/Page+Title)",
            },
            maxLength: {
              type: "number",
              description: `Maximum number of characters to return (default: ${Constants.DEFAULT_MAX_LENGTH})`,
            },
          },
          required: ["url"],
        },
      },
      {
        name: Constants.FETCH_JIRA_ISSUE,
        description: "Fetch Jira issue ticket information using Atlassian API. Requires ATLASSIAN_USER and ATLASSIAN_API_TOKEN environment variables.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "Jira ticket URL (e.g., https://your-domain.atlassian.net/browse/TICKET-123)",
            },
            maxLength: {
              type: "number",
              description: `Maximum number of characters to return (default: ${Constants.DEFAULT_MAX_LENGTH})`,
            },
          },
          required: ["url"],
        },
      },
      {
        name: Constants.FETCH_SLACK_MESSAGE,
        description: "Fetch Slack message information using Slack Web API. Requires SLACK_APP_USER_OAUTH_TOKEN environment variable.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "Slack message URL (e.g., https://your-workspace.slack.com/archives/CHANNEL_ID/pTIMESTAMP)",
            },
            maxLength: {
              type: "number",
              description: `Maximum number of characters to return (default: ${Constants.DEFAULT_MAX_LENGTH})`,
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

  if (request.params.name === Constants.FETCH) {
    const validatedArgs = validateRequestPayload(args);
    const fetchResult = await Fetcher.doFetch(validatedArgs);

    return fetchResult.toJson();
  }

  if (request.params.name === Constants.FETCH_CONFLUENCE_PAGE) {
    const validatedArgs = validateConfluenceRequest(args);
    const confluenceResult = await AtlassianFetcher.fetchConfluencePage(validatedArgs);

    return confluenceResult.toJson();
  }

  if (request.params.name === Constants.FETCH_JIRA_ISSUE) {
    const validatedArgs = validateJiraRequest(args);
    const jiraResult = await AtlassianFetcher.fetchJiraTicket(validatedArgs);

    return jiraResult.toJson();
  }

  if (request.params.name === Constants.FETCH_SLACK_MESSAGE) {
    const validatedArgs = validateSlackRequest(args);
    const slackResult = await SlackFetcher.fetchSlackMessage(validatedArgs);

    return slackResult.toJson();
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
