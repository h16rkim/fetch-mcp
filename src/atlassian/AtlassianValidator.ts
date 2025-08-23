import { IConfluenceRequest, IJiraRequest } from "./AtlassianTypes.js";
import { ConfluenceRequest } from "./ConfluenceRequest.js";
import { JiraRequest } from "./JiraRequest.js";
import { Constants } from "../constants.js";
import { BaseValidator } from "../validation/BaseValidator.js";

/**
 * Validator for Atlassian services (Confluence and Jira)
 */
export class AtlassianValidator extends BaseValidator {
  private static readonly CONFLUENCE_URL_PATTERN = /atlassian\.net\/wiki\/spaces\/[^\/]+\/pages\/\d+/;
  private static readonly JIRA_URL_PATTERN = /atlassian\.net\/browse\/[A-Z]+-\d+/;

  /**
   * Validate Confluence page request
   */
  static validateConfluenceRequest(args: any): ConfluenceRequest {
    this.validateObject(args);

    const url = this.validateRequiredString(args.url, "url");
    this.validateConfluenceUrl(url);

    const requestData: IConfluenceRequest = {
      url,
      maxLength: this.withDefault(
        this.validateOptionalPositiveNumber(args.maxLength, "maxLength"),
        Constants.DEFAULT_MAX_LENGTH
      ),
    };

    return new ConfluenceRequest(requestData);
  }

  /**
   * Validate Jira ticket request
   */
  static validateJiraRequest(args: any): JiraRequest {
    this.validateObject(args);

    const url = this.validateRequiredString(args.url, "url");
    this.validateJiraUrl(url);

    const requestData: IJiraRequest = {
      url,
      maxLength: this.withDefault(
        this.validateOptionalPositiveNumber(args.maxLength, "maxLength"),
        Constants.DEFAULT_MAX_LENGTH
      ),
    };

    return new JiraRequest(requestData);
  }

  /**
   * Validate Confluence URL format
   */
  private static validateConfluenceUrl(url: string, fieldName: string = "url"): void {
    this.validateUrlPattern(
      url,
      this.CONFLUENCE_URL_PATTERN,
      fieldName,
      "https://your-domain.atlassian.net/wiki/spaces/SPACE/pages/123456/Page+Title"
    );
  }

  /**
   * Validate Jira URL format
   */
  private static validateJiraUrl(url: string, fieldName: string = "url"): void {
    this.validateUrlPattern(
      url,
      this.JIRA_URL_PATTERN,
      fieldName,
      "https://your-domain.atlassian.net/browse/TICKET-123"
    );
  }

  /**
   * Check if URL is a Confluence URL
   */
  static isConfluenceUrl(url: string): boolean {
    return this.CONFLUENCE_URL_PATTERN.test(url);
  }

  /**
   * Check if URL is a Jira URL
   */
  static isJiraUrl(url: string): boolean {
    return this.JIRA_URL_PATTERN.test(url);
  }

  /**
   * Validate Atlassian domain
   */
  static validateAtlassianDomain(url: string): void {
    if (!url.includes('atlassian.net')) {
      throw new Error('Invalid URL: must be an Atlassian domain (*.atlassian.net)');
    }
  }
}
