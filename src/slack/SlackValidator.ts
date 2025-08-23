import { ISlackRequest } from "./SlackTypes.js";
import { SlackRequest } from "./SlackRequest.js";
import { Constants } from "../constants.js";
import { BaseValidator } from "../validation/BaseValidator.js";

/**
 * Validator for Slack service
 */
export class SlackValidator extends BaseValidator {
  private static readonly SLACK_MESSAGE_URL_PATTERN = /https:\/\/[^.]+\.slack\.com\/archives\/[A-Z0-9]+\/p\d+/;
  private static readonly SLACK_CHANNEL_ID_PATTERN = /^[A-Z0-9]+$/;
  private static readonly SLACK_TIMESTAMP_PATTERN = /^\d+\.\d+$/;

  /**
   * Validate Slack message request
   */
  static validateSlackRequest(args: any): SlackRequest {
    this.validateObject(args);

    const url = this.validateRequiredString(args.url, "url");
    this.validateSlackMessageUrl(url);

    const requestData: ISlackRequest = {
      url,
      maxLength: this.withDefault(
        this.validateOptionalPositiveNumber(args.maxLength, "maxLength"),
        Constants.DEFAULT_MAX_LENGTH
      ),
    };

    return new SlackRequest(requestData);
  }

  /**
   * Validate Slack message URL format
   */
  private static validateSlackMessageUrl(url: string, fieldName: string = "url"): void {
    this.validateUrlPattern(
      url,
      this.SLACK_MESSAGE_URL_PATTERN,
      fieldName,
      "https://your-workspace.slack.com/archives/CHANNEL_ID/pTIMESTAMP"
    );
  }

  /**
   * Validate Slack channel ID format
   */
  static validateChannelId(channelId: string): void {
    if (!this.SLACK_CHANNEL_ID_PATTERN.test(channelId)) {
      throw new Error('Invalid channel ID: must be alphanumeric uppercase (e.g., C1234567890)');
    }
  }

  /**
   * Validate Slack timestamp format
   */
  static validateTimestamp(timestamp: string): void {
    if (!this.SLACK_TIMESTAMP_PATTERN.test(timestamp)) {
      throw new Error('Invalid timestamp: must be in format XXXXXXXXXX.XXXXXX');
    }
  }

  /**
   * Check if URL is a Slack message URL
   */
  static isSlackMessageUrl(url: string): boolean {
    return this.SLACK_MESSAGE_URL_PATTERN.test(url);
  }

  /**
   * Extract workspace name from Slack URL
   */
  static extractWorkspace(url: string): string {
    const match = url.match(/https:\/\/([^.]+)\.slack\.com/);
    if (!match) {
      throw new Error('Invalid Slack URL: cannot extract workspace name');
    }
    return match[1];
  }

  /**
   * Validate Slack workspace name
   */
  static validateWorkspace(workspace: string): void {
    if (!/^[a-z0-9-]+$/.test(workspace)) {
      throw new Error('Invalid workspace name: must contain only lowercase letters, numbers, and hyphens');
    }
  }

  /**
   * Validate Slack token format
   */
  static validateToken(token: string): void {
    if (!token.startsWith('xoxp-') && !token.startsWith('xoxb-')) {
      throw new Error('Invalid Slack token: must start with xoxp- (user token) or xoxb- (bot token)');
    }
  }
}
