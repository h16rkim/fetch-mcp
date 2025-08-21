export class Constants {
  // Tool names
  static readonly FETCH = "fetch";
  static readonly FETCH_CONFLUENCE_PAGE = "fetch_confluence_page";
  static readonly FETCH_JIRA_ISSUE = "fetch_jira_issue";
  static readonly FETCH_SLACK_MESSAGE = "fetch_slack_message";
  
  // Default values
  static readonly DEFAULT_MAX_LENGTH = 5000;
  static readonly DEFAULT_START_INDEX = 0;
  
  // Environment variable names
  static readonly ENV_SLACK_REFRESH_TOKEN = "SLACK_REFRESH_TOKEN";
  static readonly ENV_SLACK_CLIENT_ID = "SLACK_CLIENT_ID";
  static readonly ENV_SLACK_CLIENT_SECRET = "SLACK_CLIENT_SECRET";
  static readonly ENV_ATLASSIAN_USER = "ATLASSIAN_USER";
  static readonly ENV_ATLASSIAN_API_TOKEN = "ATLASSIAN_API_TOKEN";
}
