import { JSDOM } from "jsdom";
import { ConfluenceRequest, JiraRequest } from "./types.js";

interface AtlassianResult {
  content: Array<{ type: "text"; text: string }>;
  isError: boolean;
}

export class AtlassianFetcher {
  private static readonly DEFAULT_MAX_LENGTH = 5000;

  /**
   * Get Atlassian API token from environment variables
   */
  private static getApiToken(): string {
    const token = process.env.ATLASSIAN_API_TOKEN;
    if (!token) {
      throw new Error("ATLASSIAN_API_TOKEN environment variable is not set");
    }
    return token;
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
      const apiToken = this.getApiToken();
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
          "Authorization": `Bearer ${apiToken}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return this.createErrorResult("Authentication failed. Please check your ATLASSIAN_API_TOKEN");
        }
        if (response.status === 404) {
          return this.createErrorResult(`Confluence page not found: ${pageId}`);
        }
        return this.createErrorResult(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract content from Confluence page
      const title = data.title || "No title";
      const spaceKey = data.space?.key || "Unknown space";
      const version = data.version?.number || "Unknown version";
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
Space: ${spaceKey}
Version: ${version}
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
   * Parse JIRA URL to extract base URL and issue key
   */
  private static parseJiraUrl(url: string): { baseUrl: string; issueKey: string } {
    try {
      const urlObj = new URL(url);
      const baseUrl = urlObj.origin;
      
      // Extract issue key from URL path like /browse/UCC-2689
      const pathMatch = urlObj.pathname.match(/\/browse\/([A-Z]+-\d+)/);
      if (!pathMatch) {
        throw new Error("Invalid JIRA URL format. Expected format: .../browse/{ISSUE-KEY}");
      }
      
      const issueKey = pathMatch[1];
      return { baseUrl, issueKey };
    } catch (error) {
      throw new Error(`Invalid JIRA URL format: ${url}`);
    }
  }

  /**
   * Fetch JIRA issue details
   */
  static async fetchJiraIssue(request: JiraRequest): Promise<AtlassianResult> {
    try {
      const apiToken = this.getApiToken();
      
      // Parse JIRA URL to get base URL and issue key
      const { baseUrl, issueKey } = this.parseJiraUrl(request.url);
      
      const apiUrl = `${baseUrl}/rest/api/3/issue/${issueKey}?expand=names,schema,operations,editmeta,changelog,renderedFields`;

      const response = await fetch(apiUrl, {
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return this.createErrorResult("Authentication failed. Please check your ATLASSIAN_API_TOKEN");
        }
        if (response.status === 404) {
          return this.createErrorResult(`JIRA issue not found: ${issueKey}`);
        }
        return this.createErrorResult(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract key information from JIRA issue
      const key = data.key || "Unknown key";
      const summary = data.fields?.summary || "No summary";
      const status = data.fields?.status?.name || "Unknown status";
      const issueType = data.fields?.issuetype?.name || "Unknown type";
      const priority = data.fields?.priority?.name || "Unknown priority";
      const assignee = data.fields?.assignee?.displayName || "Unassigned";
      const reporter = data.fields?.reporter?.displayName || "Unknown reporter";
      const created = data.fields?.created || "Unknown";
      const updated = data.fields?.updated || "Unknown";
      const description = data.fields?.description || "No description";

      // Convert description from ADF (Atlassian Document Format) to text if it's an object
      let descriptionText = "";
      if (typeof description === "object" && description.content) {
        descriptionText = this.extractTextFromADF(description);
      } else if (typeof description === "string") {
        descriptionText = description;
      }

      const result = `Issue Key: ${key}
Summary: ${summary}
Status: ${status}
Type: ${issueType}
Priority: ${priority}
Assignee: ${assignee}
Reporter: ${reporter}
Created: ${created}
Updated: ${updated}
URL: ${request.url}

Description:
${descriptionText}`;

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
  private static extractTextFromADF(adf: any): string {
    if (!adf || typeof adf !== "object") {
      return "";
    }

    let text = "";

    if (adf.text) {
      text += adf.text;
    }

    if (adf.content && Array.isArray(adf.content)) {
      for (const item of adf.content) {
        text += this.extractTextFromADF(item);
        if (item.type === "paragraph" || item.type === "heading") {
          text += "\n";
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
