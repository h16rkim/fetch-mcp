import { IGitHubRequest } from "./GitHubTypes.js";

/**
 * GitHubRequest Model Class
 * Encapsulates GitHub request data and provides business logic for GitHub API operations
 */
export class GitHubRequest {
  private _url: string;

  constructor(data: IGitHubRequest) {
    this._url = data.url;
  }

  get data(): IGitHubRequest {
    return {
      url: this._url
    };
  }

  get url(): string {
    return this._url;
  }

  /**
   * Check if URL is valid GitHub URL
   */
  get isValidGitHubUrl(): boolean {
    const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/(pull|issues)\/\d+$/;
    return githubUrlPattern.test(this._url);
  }

  /**
   * Check if this is a Pull Request URL
   */
  get isPullRequest(): boolean {
    return this._url.includes('/pull/');
  }

  /**
   * Check if this is an Issue URL
   */
  get isIssue(): boolean {
    return this._url.includes('/issues/');
  }

  /**
   * Extract owner from GitHub URL
   */
  get owner(): string {
    const match = this._url.match(/github\.com\/([^\/]+)\/[^\/]+/);
    return match ? match[1] : "";
  }

  /**
   * Extract repository name from GitHub URL
   */
  get repo(): string {
    const match = this._url.match(/github\.com\/[^\/]+\/([^\/]+)/);
    return match ? match[1] : "";
  }

  /**
   * Extract number (PR or Issue number) from GitHub URL
   */
  get number(): number {
    const match = this._url.match(/\/(pull|issues)\/(\d+)$/);
    return match ? parseInt(match[2], 10) : 0;
  }

  /**
   * Get repository full name (owner/repo)
   */
  get fullRepoName(): string {
    const owner = this.owner;
    const repo = this.repo;
    return owner && repo ? `${owner}/${repo}` : "";
  }

  /**
   * Get API URL for the resource
   */
  get apiUrl(): string {
    const owner = this.owner;
    const repo = this.repo;
    const number = this.number;
    
    if (!owner || !repo || !number) {
      return "";
    }

    if (this.isPullRequest) {
      return `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`;
    } else if (this.isIssue) {
      return `https://api.github.com/repos/${owner}/${repo}/issues/${number}`;
    }
    
    return "";
  }

  /**
   * Get repository API URL
   */
  get repoApiUrl(): string {
    const owner = this.owner;
    const repo = this.repo;
    return owner && repo ? `https://api.github.com/repos/${owner}/${repo}` : "";
  }

  /**
   * Check if URL uses HTTPS
   */
  get isHttps(): boolean {
    return this._url.startsWith("https://");
  }

  /**
   * Get resource type (pull_request or issue)
   */
  get resourceType(): "pull_request" | "issue" | "unknown" {
    if (this.isPullRequest) {
      return "pull_request";
    } else if (this.isIssue) {
      return "issue";
    }
    return "unknown";
  }

  /**
   * Create a summary of the GitHub request
   */
  getSummary(): {
    url: string;
    owner: string;
    repo: string;
    number: number;
    fullRepoName: string;
    resourceType: "pull_request" | "issue" | "unknown";
    apiUrl: string;
    repoApiUrl: string;
    isValidGitHubUrl: boolean;
    isHttps: boolean;
  } {
    return {
      url: this._url,
      owner: this.owner,
      repo: this.repo,
      number: this.number,
      fullRepoName: this.fullRepoName,
      resourceType: this.resourceType,
      apiUrl: this.apiUrl,
      repoApiUrl: this.repoApiUrl,
      isValidGitHubUrl: this.isValidGitHubUrl,
      isHttps: this.isHttps
    };
  }
}
