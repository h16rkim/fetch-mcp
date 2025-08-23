import { ISlackRequest } from "./SlackTypes.js";
import { Constants } from "../constants.js";

/**
 * SlackRequest Model Class
 * Encapsulates Slack request data and provides business logic for Slack message fetching
 */
export class SlackRequest {
  private _url: string;
  private _maxLength?: number;

  constructor(data: ISlackRequest) {
    this._url = data.url;
    this._maxLength = data.maxLength;
  }

  get data(): ISlackRequest {
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
   * Check if URL is valid Slack message URL
   */
  get isValidSlackUrl(): boolean {
    const slackUrlPattern = /https:\/\/[^.]+\.slack\.com\/archives\/[A-Z0-9]+\/p\d+/;
    return slackUrlPattern.test(this._url);
  }

  /**
   * Extract channel ID from Slack URL
   */
  get channelId(): string {
    const match = this._url.match(/\/archives\/([A-Z0-9]+)\//);
    return match ? match[1] : "";
  }

  /**
   * Extract timestamp from Slack URL
   */
  get timestamp(): string {
    const match = this._url.match(/\/p(\d+)/);
    if (match) {
      const ts = match[1];
      return `${ts.slice(0, -6)}.${ts.slice(-6)}`;
    }
    return "";
  }

  /**
   * Check if this is a thread reply URL
   */
  get isThreadReply(): boolean {
    return this._url.includes("thread_ts=");
  }

  /**
   * Extract thread timestamp from URL if it's a thread reply
   */
  get threadTimestamp(): string | undefined {
    if (!this.isThreadReply) {
      return undefined;
    }
    const match = this._url.match(/thread_ts=(\d+\.\d+)/);
    return match ? match[1] : undefined;
  }

  /**
   * Get workspace name from URL
   */
  get workspaceName(): string {
    const match = this._url.match(/https:\/\/([^.]+)\.slack\.com/);
    return match ? match[1] : "";
  }

  /**
   * Create a summary of the Slack request
   */
  getSummary(): {
    url: string;
    channelId: string;
    timestamp: string;
    isThreadReply: boolean;
    threadTimestamp?: string;
    workspaceName: string;
    hasMaxLength: boolean;
    isValidSlackUrl: boolean;
  } {
    return {
      url: this._url,
      channelId: this.channelId,
      timestamp: this.timestamp,
      isThreadReply: this.isThreadReply,
      threadTimestamp: this.threadTimestamp,
      workspaceName: this.workspaceName,
      hasMaxLength: this.hasMaxLength,
      isValidSlackUrl: this.isValidSlackUrl
    };
  }
}
