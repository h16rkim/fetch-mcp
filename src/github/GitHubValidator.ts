import { IGitHubRequest, IGitHubIssueRequest } from "./GitHubTypes.js";
import { BaseValidator } from "../validation/BaseValidator.js";

/**
 * Validator for GitHub service
 */
export class GitHubValidator extends BaseValidator {
  private static readonly GITHUB_PR_URL_PATTERN = /github\.com\/[^\/]+\/[^\/]+\/pull\/\d+/;
  private static readonly GITHUB_ISSUE_URL_PATTERN = /github\.com\/[^\/]+\/[^\/]+\/issues\/\d+/;
  private static readonly GITHUB_REPO_PATTERN = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;

  /**
   * Validate GitHub Pull Request request
   */
  static validateGitHubRequest(args: any): IGitHubRequest {
    this.validateObject(args);

    const url = this.validateRequiredString(args.url, "url");
    this.validateGitHubPullRequestUrl(url);

    return {
      url,
    };
  }

  /**
   * Validate GitHub Issue request
   */
  static validateGitHubIssueRequest(args: any): IGitHubIssueRequest {
    this.validateObject(args);

    const url = this.validateRequiredString(args.url, "url");
    this.validateGitHubIssueUrl(url);

    return {
      url,
    };
  }

  /**
   * Validate GitHub Pull Request URL format
   */
  private static validateGitHubPullRequestUrl(url: string, fieldName: string = "url"): void {
    this.validateUrlPattern(
      url,
      this.GITHUB_PR_URL_PATTERN,
      fieldName,
      "https://github.com/owner/repo/pull/123"
    );
  }

  /**
   * Validate GitHub Issue URL format
   */
  private static validateGitHubIssueUrl(url: string, fieldName: string = "url"): void {
    this.validateUrlPattern(
      url,
      this.GITHUB_ISSUE_URL_PATTERN,
      fieldName,
      "https://github.com/owner/repo/issues/123"
    );
  }

  /**
   * Check if URL is a GitHub Pull Request URL
   */
  static isGitHubPullRequestUrl(url: string): boolean {
    return this.GITHUB_PR_URL_PATTERN.test(url);
  }

  /**
   * Check if URL is a GitHub Issue URL
   */
  static isGitHubIssueUrl(url: string): boolean {
    return this.GITHUB_ISSUE_URL_PATTERN.test(url);
  }

  /**
   * Validate GitHub repository format (owner/repo)
   */
  static validateRepository(repo: string): void {
    if (!this.GITHUB_REPO_PATTERN.test(repo)) {
      throw new Error('Invalid repository format: must be in format "owner/repo"');
    }
  }

  /**
   * Validate GitHub token format
   */
  static validateToken(token: string): void {
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      throw new Error('Invalid GitHub token: must start with ghp_ (classic) or github_pat_ (fine-grained)');
    }
  }

  /**
   * Extract owner and repo from GitHub URL
   */
  static extractOwnerAndRepo(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL: cannot extract owner and repository');
    }
    
    const [, owner, repo] = match;
    this.validateRepository(`${owner}/${repo}`);
    
    return { owner, repo };
  }

  /**
   * Extract pull request number from URL
   */
  static extractPullRequestNumber(url: string): number {
    const match = url.match(/\/pull\/(\d+)/);
    if (!match) {
      throw new Error('Invalid GitHub Pull Request URL: cannot extract PR number');
    }
    
    return parseInt(match[1], 10);
  }

  /**
   * Extract issue number from URL
   */
  static extractIssueNumber(url: string): number {
    const match = url.match(/\/issues\/(\d+)/);
    if (!match) {
      throw new Error('Invalid GitHub Issue URL: cannot extract issue number');
    }
    
    return parseInt(match[1], 10);
  }

  /**
   * Validate GitHub domain
   */
  static validateGitHubDomain(url: string): void {
    if (!url.includes('github.com')) {
      throw new Error('Invalid URL: must be a GitHub domain (github.com)');
    }
  }
}
