import { JSDOM } from "jsdom";
import { ConfluenceRequest, JiraRequest } from "./types.js";

interface AtlassianResult {
  content: Array<{ type: "text"; text: string }>;
  isError: boolean;
}

export class AtlassianFetcher {
  private static readonly DEFAULT_MAX_LENGTH = 5000;

  /**
   * Get Atlassian credentials from environment variables
   */
  private static getCredentials(): { user: string; token: string } {
    const user = process.env.ATLASSIAN_USER;
    const token = process.env.ATLASSIAN_API_TOKEN;
    
    if (!user) {
      throw new Error("ATLASSIAN_USER environment variable is not set");
    }
    if (!token) {
      throw new Error("ATLASSIAN_API_TOKEN environment variable is not set");
    }
    
    return { user, token };
  }

  /**
   * Create Basic Authorization header
   */
  private static createAuthHeader(): string {
    const { user, token } = this.getCredentials();
    const credentials = `${user}:${token}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');
    return `Basic ${base64Credentials}`;
  }

  /**
   * Apply length limits to text content
   */
  private static applyLengthLimits(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength);
  }

  /**
   * Extract domain from URL for API authentication
   */
  private static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.origin;
    } catch (error) {
      throw new Error(`Invalid URL format: ${url}`);
    }
  }

  /**
   * Create error result
   */
  private static createErrorResult(message: string): AtlassianResult {
    return {
      content: [{ 
        type: "text", 
        text: `Error: ${message}` 
      }],
      isError: true,
    };
  }

  /**
   * Fetch Confluence page content
   */
  static async fetchConfluencePage(request: ConfluenceRequest): Promise<AtlassianResult> {
    try {
      const authHeader = this.createAuthHeader();
      const domain = this.extractDomain(request.url);
      
      // Extract page ID from Confluence URL
      const pageIdMatch = request.url.match(/\/pages\/(\d+)/);
      if (!pageIdMatch) {
        return this.createErrorResult("Invalid Confluence URL format. Expected format: .../pages/{pageId}");
      }
      
      const pageId = pageIdMatch[1];
      const apiUrl = `${domain}/wiki/rest/api/content/${pageId}?expand=body.storage,version,space`;

      const response = await fetch(apiUrl, {
        headers: {
          "Authorization": authHeader,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return this.createErrorResult("Authentication failed. Please check your ATLASSIAN_USER and ATLASSIAN_API_TOKEN");
        }
        if (response.status === 404) {
          return this.createErrorResult(`Confluence page not found: ${pageId}`);
        }
        return this.createErrorResult(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract content from Confluence page according to the new specification
      const title = data.title || "No title";
      const spaceKey = data.space?.key || "Unknown space";
      const spaceName = data.space?.name || "Unknown space name";
      const authorName = data.version?.by?.publicName || "Unknown author";
      const htmlContent = data.body?.storage?.value || "No content";

      // Convert HTML to plain text
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      // Remove scripts and styles
      this.removeElementsByTagName(document, "script");
      this.removeElementsByTagName(document, "style");
      
      const textContent = document.body.textContent || "";
      const normalizedText = textContent.replace(/\s+/g, " ").trim();

      const result = `Title: ${title}
Space: ${spaceKey} (${spaceName})
Author: ${authorName}
URL: ${request.url}

Content:
${normalizedText}`;

      const processedContent = this.applyLengthLimits(
        result,
        request.maxLength ?? this.DEFAULT_MAX_LENGTH
      );

      return {
        content: [{ type: "text", text: processedContent }],
        isError: false,
      };

    } catch (error) {
      return this.createErrorResult((error as Error).message);
    }
  }

  /**
   * Fetch Jira ticket information
   */
  static async fetchJiraTicket(request: JiraRequest): Promise<AtlassianResult> {
    try {
      const authHeader = this.createAuthHeader();
      const domain = this.extractDomain(request.url);
      
      // Extract ticket key from Jira URL (e.g., UCC-3742 from https://inflab.atlassian.net/browse/UCC-3742)
      const ticketKeyMatch = request.url.match(/\/browse\/([A-Z]+-\d+)/);
      if (!ticketKeyMatch) {
        return this.createErrorResult("Invalid Jira URL format. Expected format: .../browse/{TICKET-KEY}");
      }
      
      const ticketKey = ticketKeyMatch[1];
      const apiUrl = `${domain}/rest/api/3/issue/${ticketKey}?expand=names,schema,operations,editmeta,changelog,renderedFields`;

      const response = await fetch(apiUrl, {
        headers: {
          "Authorization": authHeader,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return this.createErrorResult("Authentication failed. Please check your ATLASSIAN_USER and ATLASSIAN_API_TOKEN");
        }
        if (response.status === 404) {
          return this.createErrorResult(`Jira ticket not found: ${ticketKey}`);
        }
        return this.createErrorResult(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract ticket information
      const key = data.key || "Unknown key";
      const summary = data.fields?.summary || "No summary";
      const assignee = data.fields?.assignee?.displayName || "Unassigned";
      const status = data.fields?.status?.name || "Unknown status";
      const priority = data.fields?.priority?.name || "Unknown priority";
      const issueType = data.fields?.issuetype?.name || "Unknown type";
      const reporter = data.fields?.reporter?.displayName || "Unknown reporter";
      const created = data.fields?.created || "Unknown";
      const updated = data.fields?.updated || "Unknown";
      
      // Get description (can be in different formats)
      let description = "No description";
      if (data.fields?.description) {
        if (typeof data.fields.description === 'string') {
          description = data.fields.description;
        } else if (data.fields.description.content) {
          // Handle Atlassian Document Format (ADF)
          description = this.extractTextFromADF(data.fields.description);
        }
      }

      // Get subtasks if available
      let subtasksInfo = "";
      if (data.fields?.subtasks && data.fields.subtasks.length > 0) {
        subtasksInfo = "\n\nSubtasks:\n";
        data.fields.subtasks.forEach((subtask: any, index: number) => {
          subtasksInfo += `${index + 1}. ${subtask.key}: ${subtask.fields?.summary || 'No summary'} (${subtask.fields?.status?.name || 'Unknown status'})\n`;
        });
      }

      // Get comments if available (from changelog or separate API call would be needed for full comments)
      let commentsInfo = "";
      if (data.fields?.comment && data.fields.comment.comments && data.fields.comment.comments.length > 0) {
        commentsInfo = "\n\nRecent Comments:\n";
        data.fields.comment.comments.slice(-3).forEach((comment: any, index: number) => {
          const author = comment.author?.displayName || "Unknown author";
          const body = typeof comment.body === 'string' ? comment.body : this.extractTextFromADF(comment.body);
          const created = comment.created || "Unknown date";
          commentsInfo += `${index + 1}. ${author} (${created}):\n${body}\n\n`;
        });
      }

      const result = `Ticket: ${key}
Title: ${summary}
Type: ${issueType}
Status: ${status}
Priority: ${priority}
Assignee: ${assignee}
Reporter: ${reporter}
Created: ${created}
Updated: ${updated}
URL: ${request.url}

Description:
${description}${subtasksInfo}${commentsInfo}`;

      const processedContent = this.applyLengthLimits(
        result,
        request.maxLength ?? this.DEFAULT_MAX_LENGTH
      );

      return {
        content: [{ type: "text", text: processedContent }],
        isError: false,
      };

    } catch (error) {
      return this.createErrorResult((error as Error).message);
    }
  }

  /**
   * Extract text content from Atlassian Document Format (ADF)
   */
  private static extractTextFromADF(adfContent: any): string {
    if (!adfContent || typeof adfContent !== 'object') {
      return String(adfContent || '');
    }

    let text = '';
    
    if (adfContent.type === 'text') {
      return adfContent.text || '';
    }
    
    if (adfContent.content && Array.isArray(adfContent.content)) {
      for (const item of adfContent.content) {
        text += this.extractTextFromADF(item);
        if (item.type === 'paragraph' || item.type === 'heading') {
          text += '\n';
        }
      }
    }
    
    return text;
  }

  /**
   * Helper method to remove elements by tag name
   */
  private static removeElementsByTagName(document: Document, tagName: string): void {
    const elements = document.getElementsByTagName(tagName);
    Array.from(elements).forEach(element => element.remove());
  }
}
