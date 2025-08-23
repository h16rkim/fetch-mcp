import { IJiraRequest } from "./AtlassianTypes.js";

/**
 * JiraRequest Model Class
 * Encapsulates Jira request data and provides business logic for Jira ticket fetching
 */
export class JiraRequest {
  private _url: string;
  private _maxLength?: number;

  constructor(data: IJiraRequest) {
    this._url = data.url;
    this._maxLength = data.maxLength;
  }

  get data(): IJiraRequest {
    return {
      url: this._url,
      maxLength: this._maxLength
    };
  }

  get url(): string {
    return this._url;
  }

  get maxLength(): number | undefined {
    return this._maxLength;
  }

  get hasMaxLength(): boolean {
    return this._maxLength !== undefined;
  }

  /**
   * Get effective max length with default fallback
   */
  getEffectiveMaxLength(defaultMaxLength: number): number {
    return this._maxLength ?? defaultMaxLength;
  }

  /**
   * Check if URL is valid Jira ticket URL
   */
  get isValidJiraUrl(): boolean {
    const jiraUrlPattern = /https:\/\/[^\/]+\.atlassian\.net\/browse\/[A-Z]+-\d+/;
    return jiraUrlPattern.test(this._url);
  }

  /**
   * Extract ticket key from Jira URL
   */
  get ticketKey(): string {
    const match = this._url.match(/\/browse\/([A-Z]+-\d+)/);
    return match ? match[1] : "";
  }

  /**
   * Extract project key from ticket key
   */
  get projectKey(): string {
    const ticketKey = this.ticketKey;
    const match = ticketKey.match(/^([A-Z]+)-/);
    return match ? match[1] : "";
  }

  /**
   * Extract ticket number from ticket key
   */
  get ticketNumber(): string {
    const ticketKey = this.ticketKey;
    const match = ticketKey.match(/-(\d+)$/);
    return match ? match[1] : "";
  }

  /**
   * Get domain from URL
   */
  get domain(): string {
    const match = this._url.match(/https:\/\/([^\/]+)\.atlassian\.net/);
    return match ? match[1] : "";
  }

  /**
   * Get full domain with atlassian.net
   */
  get fullDomain(): string {
    const domain = this.domain;
    return domain ? `${domain}.atlassian.net` : "";
  }

  /**
   * Check if URL uses HTTPS
   */
  get isHttps(): boolean {
    return this._url.startsWith("https://");
  }

  /**
   * Create a summary of the Jira request
   */
  getSummary(): {
    url: string;
    ticketKey: string;
    projectKey: string;
    ticketNumber: string;
    domain: string;
    fullDomain: string;
    hasMaxLength: boolean;
    isValidJiraUrl: boolean;
    isHttps: boolean;
  } {
    return {
      url: this._url,
      ticketKey: this.ticketKey,
      projectKey: this.projectKey,
      ticketNumber: this.ticketNumber,
      domain: this.domain,
      fullDomain: this.fullDomain,
      hasMaxLength: this.hasMaxLength,
      isValidJiraUrl: this.isValidJiraUrl,
      isHttps: this.isHttps
    };
  }
}
