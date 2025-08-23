import { JSDOM } from "jsdom";
import {
  ConfluenceRequest,
  JiraRequest,
  IConfluenceApiResponse,
  IJiraApiResponse,
} from "./AtlassianTypes.js";
import { Constants } from "../constants.js";
import { ConfluencePage } from "./model/ConfluencePage.js";
import { JiraTicket } from "./model/JiraTicket.js";
import { ResponseBuilder } from "../ResponseBuilder.js";
import { JiraResponseBuilder } from "./JiraResponseBuilder.js";
import { ConfluenceResponseBuilder } from "./ConfluenceResponseBuilder.js";
import { McpResult } from "../McpModels.js";

export class AtlassianFetcher {
  private static readonly DEFAULT_MAX_LENGTH = Constants.DEFAULT_MAX_LENGTH;

  /**
   * Get Atlassian credentials from environment variables
   */
  private static getCredentials(): { user: string; token: string } {
    const user = process.env[Constants.ENV_ATLASSIAN_USER];
    const token = process.env[Constants.ENV_ATLASSIAN_API_TOKEN];

    if (!user) {
      throw new Error(
        `${Constants.ENV_ATLASSIAN_USER} environment variable is not set`
      );
    }
    if (!token) {
      throw new Error(
        `${Constants.ENV_ATLASSIAN_API_TOKEN} environment variable is not set`
      );
    }

    return { user, token };
  }

  /**
   * Create Basic Authorization header
   */
  private static createAuthHeader(): string {
    const { user, token } = this.getCredentials();
    const credentials = `${user}:${token}`;
    const base64Credentials = Buffer.from(credentials).toString("base64");
    return `Basic ${base64Credentials}`;
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
  private static createErrorResult(message: string): McpResult {
    return McpResult.error(message);
  }

  /**
   * Make authenticated API request to Atlassian
   */
  private static async makeAtlassianRequest(url: string): Promise<Response> {
    const authHeader = this.createAuthHeader();

    return fetch(url, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Handle API response errors
   */
  private static handleApiError(
    response: Response,
    resourceType: string,
    resourceId: string
  ): McpResult {
    if (response.status === 401) {
      return this.createErrorResult(
        "Authentication failed. Please check your ATLASSIAN_USER and ATLASSIAN_API_TOKEN"
      );
    }
    if (response.status === 404) {
      return this.createErrorResult(`${resourceType} not found: ${resourceId}`);
    }
    return this.createErrorResult(
      `HTTP error: ${response.status} ${response.statusText}`
    );
  }

  /**
   * Convert HTML to plain text
   */
  private static htmlToPlainText(htmlContent: string): string {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Remove scripts and styles
    this.removeElementsByTagName(document, "script");
    this.removeElementsByTagName(document, "style");

    const textContent = document.body.textContent || "";
    return textContent.replace(/\s+/g, " ").trim();
  }

  /**
   * Format Confluence page content
   */
  private static formatConfluenceContent(
    page: ConfluencePage,
    url: string,
    maxLength?: number
  ): string {
    const normalizedText = this.htmlToPlainText(page.htmlContent);
    const responseBuilder = new ConfluenceResponseBuilder();
    
    return responseBuilder.generateConfluencePageSummary(
      page,
      url,
      normalizedText,
      maxLength
    );
  }

  /**
   * Format Jira ticket content
   */
  private static formatJiraContent(
    ticket: JiraTicket,
    url: string,
    maxLength?: number
  ): string {
    const responseBuilder = new JiraResponseBuilder();
    
    return responseBuilder.generateJiraTicketSummary(
      ticket,
      url,
      maxLength
    );
  }

  /**
   * Fetch Confluence page content
   */
  static async fetchConfluencePage(
    request: ConfluenceRequest
  ): Promise<McpResult> {
    try {
      const domain = this.extractDomain(request.url);

      // Extract page ID from Confluence URL
      const pageIdMatch = request.url.match(/\/pages\/(\d+)/);
      if (!pageIdMatch) {
        return this.createErrorResult(
          "Invalid Confluence URL format. Expected format: .../pages/{pageId}"
        );
      }

      const pageId = pageIdMatch[1];
      const apiUrl = `${domain}/wiki/rest/api/content/${pageId}?expand=body.export_view,version,space`;

      const response = await this.makeAtlassianRequest(apiUrl);

      if (!response.ok) {
        return this.handleApiError(response, "Confluence page", pageId);
      }

      const data: IConfluenceApiResponse = await response.json();
      const page = new ConfluencePage(data);

      const result = this.formatConfluenceContent(
        page,
        request.url,
        request.maxLength ?? this.DEFAULT_MAX_LENGTH
      );

      return McpResult.success(result);
    } catch (error) {
      return this.createErrorResult((error as Error).message);
    }
  }

  /**
   * Fetch Jira ticket information
   */
  static async fetchJiraTicket(request: JiraRequest): Promise<McpResult> {
    try {
      const domain = this.extractDomain(request.url);

      // Extract ticket key from Jira URL
      const ticketKeyMatch = request.url.match(/\/browse\/([A-Z]+-\d+)/);
      if (!ticketKeyMatch) {
        return this.createErrorResult(
          "Invalid Jira URL format. Expected format: .../browse/{TICKET-KEY}"
        );
      }

      const ticketKey = ticketKeyMatch[1];
      // Include comment in expand parameter to ensure comments are fetched
      const apiUrl = `${domain}/rest/api/3/issue/${ticketKey}?expand=names,schema,operations,editmeta,changelog,renderedFields,comment`;

      const response = await this.makeAtlassianRequest(apiUrl);

      if (!response.ok) {
        return this.handleApiError(response, "Jira ticket", ticketKey);
      }

      const data: IJiraApiResponse = await response.json();
      const ticket = new JiraTicket(data);

      const result = this.formatJiraContent(
        ticket,
        request.url,
        request.maxLength ?? this.DEFAULT_MAX_LENGTH
      );

      return McpResult.success(result);
    } catch (error) {
      return this.createErrorResult((error as Error).message);
    }
  }

  /**
   * Helper method to remove elements by tag name
   */
  private static removeElementsByTagName(
    document: Document,
    tagName: string
  ): void {
    const elements = document.getElementsByTagName(tagName);
    Array.from(elements).forEach(element => element.remove());
  }
}
