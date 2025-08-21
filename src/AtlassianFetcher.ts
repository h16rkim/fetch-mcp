import { JSDOM } from "jsdom";
import { ConfluenceRequest } from "./types.js";

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
   * Helper method to remove elements by tag name
   */
  private static removeElementsByTagName(document: Document, tagName: string): void {
    const elements = document.getElementsByTagName(tagName);
    Array.from(elements).forEach(element => element.remove());
  }
}
