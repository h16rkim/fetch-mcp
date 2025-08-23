export class Constants {
  // Tool names
  static readonly FETCH = "fetch";
  static readonly FETCH_CONFLUENCE_PAGE = "fetch_confluence_page";
  static readonly FETCH_JIRA_ISSUE = "fetch_jira_issue";
  static readonly FETCH_SLACK_MESSAGE = "fetch_slack_message";
  static readonly FETCH_GITHUB_PULL_REQUEST = "fetch_github_pull_request";
  static readonly FETCH_GITHUB_ISSUE = "fetch_github_issue";

  // Default values
  static readonly DEFAULT_MAX_LENGTH = 5000;
  static readonly DEFAULT_START_INDEX = 0;

  // Environment variable names
  static readonly ENV_SLACK_APP_USER_OAUTH_TOKEN = "SLACK_APP_USER_OAUTH_TOKEN";
  static readonly ENV_ATLASSIAN_USER = "ATLASSIAN_USER";
  static readonly ENV_ATLASSIAN_API_TOKEN = "ATLASSIAN_API_TOKEN";
  static readonly ENV_GITHUB_ACCESS_TOKEN = "GITHUB_ACCESS_TOKEN";
}
