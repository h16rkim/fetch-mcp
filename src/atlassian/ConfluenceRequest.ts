import { IConfluenceRequest } from "./AtlassianTypes.js";

/**
 * ConfluenceRequest Model Class
 * Encapsulates Confluence request data and provides business logic for Confluence page fetching
 */
export class ConfluenceRequest {
  private _url: string;
  private _maxLength?: number;

  constructor(data: IConfluenceRequest) {
    this._url = data.url;
    this._maxLength = data.maxLength;
  }

  get data(): IConfluenceRequest {
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
   * Check if URL is valid Confluence page URL
   */
  get isValidConfluenceUrl(): boolean {
    const confluenceUrlPattern = /https:\/\/[^\/]+\.atlassian\.net\/wiki\/spaces\/[^\/]+\/pages\/\d+/;
    return confluenceUrlPattern.test(this._url);
  }

  /**
   * Extract space key from Confluence URL
   */
  get spaceKey(): string {
    const match = this._url.match(/\/spaces\/([^\/]+)\//);
    return match ? match[1] : "";
  }

  /**
   * Extract page ID from Confluence URL
   */
  get pageId(): string {
    const match = this._url.match(/\/pages\/(\d+)/);
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
   * Create a summary of the Confluence request
   */
  getSummary(): {
    url: string;
    spaceKey: string;
    pageId: string;
    domain: string;
    fullDomain: string;
    hasMaxLength: boolean;
    isValidConfluenceUrl: boolean;
    isHttps: boolean;
  } {
    return {
      url: this._url,
      spaceKey: this.spaceKey,
      pageId: this.pageId,
      domain: this.domain,
      fullDomain: this.fullDomain,
      hasMaxLength: this.hasMaxLength,
      isValidConfluenceUrl: this.isValidConfluenceUrl,
      isHttps: this.isHttps
    };
  }
}
