import { RequestPayload } from "./types.js";
import { ConfluenceRequest, JiraRequest } from "./atlassian/AtlassianTypes.js";
import { ISlackRequest } from "./slack/SlackTypes.js";
import { IGitHubRequest, IGitHubIssueRequest } from "./github/GitHubTypes.js";
import { Constants } from "./constants.js";

// Base validation function that can be curried for optional validation
function validateObject(args: any, fieldName: string = "arguments"): void {
  if (!args || typeof args !== "object") {
    throw new Error(`Invalid ${fieldName}: must be an object`);
  }
}

// Curry function to create optional validators
function createOptionalValidator<T>(
  validator: (value: any, fieldName: string) => T
) {
  return (value: any, fieldName: string): T | undefined => {
    if (value === undefined) {
      return undefined;
    }
    return validator(value, fieldName);
  };
}

// Base validators
function validateRequiredString(value: any, fieldName: string): string {
  if (!value || typeof value !== "string") {
    throw new Error(`Invalid ${fieldName}: must be a string`);
  }
  return value;
}

function validateUrl(url: string, fieldName: string = "url"): void {
  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid ${fieldName}: must be a valid URL`);
  }
}

function validateGitHubPullRequestUrl(url: string, fieldName: string = "url"): void {
  validateUrl(url, fieldName);
  
  // Check if it's a GitHub Pull Request URL
  const githubPrPattern = /github\.com\/[^\/]+\/[^\/]+\/pull\/\d+/;
  if (!githubPrPattern.test(url)) {
    throw new Error(
      `Invalid ${fieldName}: must be a GitHub Pull Request URL (e.g., https://github.com/owner/repo/pull/123)`
    );
  }
}

function validateGitHubIssueUrl(url: string, fieldName: string = "url"): void {
  validateUrl(url, fieldName);
  
  // Check if it's a GitHub Issue URL
  const githubIssuePattern = /github\.com\/[^\/]+\/[^\/]+\/issues\/\d+/;
  if (!githubIssuePattern.test(url)) {
    throw new Error(
      `Invalid ${fieldName}: must be a GitHub Issue URL (e.g., https://github.com/owner/repo/issues/123)`
    );
  }
}

function validateObjectType(
  value: any,
  fieldName: string
): Record<string, string> {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Invalid ${fieldName}: must be an object`);
  }
  return value;
}

function validatePositiveNumber(value: any, fieldName: string): number {
  if (typeof value !== "number" || value < 1) {
    throw new Error(`Invalid ${fieldName}: must be a positive number`);
  }
  return value;
}

function validateNonNegativeNumber(value: any, fieldName: string): number {
  if (typeof value !== "number" || value < 0) {
    throw new Error(`Invalid ${fieldName}: must be a non-negative number`);
  }
  return value;
}

// Create optional validators using curry pattern
const validateOptionalObject = createOptionalValidator(validateObjectType);
const validateOptionalPositiveNumber = createOptionalValidator(
  validatePositiveNumber
);
const validateOptionalNonNegativeNumber = createOptionalValidator(
  validateNonNegativeNumber
);

// Helper function to provide default values for optional fields
function withDefault<T>(value: T | undefined, defaultValue: T): T {
  return value !== undefined ? value : defaultValue;
}

// Main validation functions using curried validators
export function validateRequestPayload(args: any): RequestPayload {
  validateObject(args);

  const url = validateRequiredString(args.url, "url");
  validateUrl(url);

  return {
    url,
    headers: validateOptionalObject(args.headers, "headers"),
    max_length: withDefault(
      validateOptionalPositiveNumber(args.max_length, "max_length"),
      Constants.DEFAULT_MAX_LENGTH
    ),
    start_index: withDefault(
      validateOptionalNonNegativeNumber(args.start_index, "start_index"),
      Constants.DEFAULT_START_INDEX
    ),
  };
}

export function validateConfluenceRequest(args: any): ConfluenceRequest {
  validateObject(args);

  const url = validateRequiredString(args.url, "url");
  validateUrl(url);

  return {
    url,
    maxLength: withDefault(
      validateOptionalPositiveNumber(args.maxLength, "maxLength"),
      Constants.DEFAULT_MAX_LENGTH
    ),
  };
}

export function validateJiraRequest(args: any): JiraRequest {
  validateObject(args);

  const url = validateRequiredString(args.url, "url");
  validateUrl(url);

  return {
    url,
    maxLength: withDefault(
      validateOptionalPositiveNumber(args.maxLength, "maxLength"),
      Constants.DEFAULT_MAX_LENGTH
    ),
  };
}

export function validateSlackRequest(args: any): ISlackRequest {
  validateObject(args);

  const url = validateRequiredString(args.url, "url");
  validateUrl(url);

  return {
    url,
    maxLength: withDefault(
      validateOptionalPositiveNumber(args.maxLength, "maxLength"),
      Constants.DEFAULT_MAX_LENGTH
    ),
  };
}

export function validateGitHubRequest(args: any): IGitHubRequest {
  validateObject(args);

  const url = validateRequiredString(args.url, "url");
  validateGitHubPullRequestUrl(url);

  return {
    url,
  };
}

export function validateGitHubIssueRequest(args: any): IGitHubIssueRequest {
  validateObject(args);

  const url = validateRequiredString(args.url, "url");
  validateGitHubIssueUrl(url);

  return {
    url,
  };
}
