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

#### 📋 [agent/rules/lesson.md](./rules/lesson.md)
- In lesson.md, you’ve summarized the lessons you’ve learned from your previous work. Read these lessons and try not to repeat the same mistakes in this task.


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


## 📚 References

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Slack Web API](https://api.slack.com/web)
- [Atlassian REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)

---


**Last Updated**: 2025-08-22  
**Author**: AI Assistant  
**Version**: 2.1
