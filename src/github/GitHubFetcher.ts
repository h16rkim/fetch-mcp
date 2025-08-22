import {
  IGitHubRequest,
  IGitHubPullRequestUrl,
  IGitHubPullRequestResponse,
  IGitHubFilesResponse,
  IGitHubCommentsResponse,
  IGitHubReviewsResponse,
  IGitHubCommitsResponse,
  IGitHubReviewCommentsResponse,
} from "./GitHubTypes.js";
import { Constants } from "../constants.js";
import { GitHubPullRequestModel } from "./model/GitHubPullRequestModel.js";
import { GitHubPullRequestResponse } from "./model/GitHubPullRequestResponse.js";
import { GitHubFilesResponse } from "./model/GitHubFilesResponse.js";
import { GitHubCommentsResponse } from "./model/GitHubCommentsResponse.js";
import { GitHubReviewsResponse } from "./model/GitHubReviewsResponse.js";
import { GitHubCommitsResponse } from "./model/GitHubCommitsResponse.js";
import { GitHubReviewCommentsResponse } from "./model/GitHubReviewCommentsResponse.js";
import { McpResult } from "../McpModels.js";

export class GitHubFetcher {
  private static readonly API_BASE_URL = "https://api.github.com";

  /**
   * Get GitHub access token from environment variables
   */
  private static getAccessToken(): string {
    const token = process.env[Constants.ENV_GITHUB_ACCESS_TOKEN];

    if (!token) {
      throw new Error(
        `${Constants.ENV_GITHUB_ACCESS_TOKEN} environment variable is not set`
      );
    }

    return token;
  }

  /**
   * Parse GitHub Pull Request URL to extract owner, repo, and pull number
   */
  private static parseGitHubPullRequestUrl(url: string): IGitHubPullRequestUrl {
    // URL format: https://github.com/owner/repo/pull/123
    const urlMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);

    if (!urlMatch) {
      throw new Error(
        "Invalid GitHub Pull Request URL format. Expected format: https://github.com/owner/repo/pull/number"
      );
    }

    const owner = urlMatch[1];
    const repo = urlMatch[2];
    const pullNumber = parseInt(urlMatch[3], 10);

    return {
      owner,
      repo,
      pullNumber,
    };
  }

  /**
   * Create error result
   */
  private static createErrorResult(message: string): McpResult {
    return McpResult.error(message);
  }

  /**
   * Make authenticated GitHub API request
   */
  private static async makeGitHubApiRequest(
    url: string,
    accessToken: string
  ): Promise<Response> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return response;
  }

  /**
   * Get Pull Request information
   */
  private static async getPullRequest(
    accessToken: string,
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubPullRequestResponse> {
    try {
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        if (response.status === 404) {
          return new GitHubPullRequestResponse({
            ok: false,
            error: "Pull Request not found or access denied",
          });
        } else if (response.status === 403) {
          return new GitHubPullRequestResponse({
            ok: false,
            error: "Access denied. Check your GitHub token permissions",
          });
        } else {
          return new GitHubPullRequestResponse({
            ok: false,
            error: `GitHub API error: ${response.status} ${response.statusText}`,
          });
        }
      }

      const data = await response.json();
      return new GitHubPullRequestResponse({
        ok: true,
        data,
      });
    } catch (error) {
      return new GitHubPullRequestResponse({
        ok: false,
        error: `Failed to fetch Pull Request: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Get Pull Request files
   */
  private static async getPullRequestFiles(
    accessToken: string,
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubFilesResponse> {
    try {
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}/files`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        return new GitHubFilesResponse({
          ok: false,
          error: `Failed to fetch files: ${response.status} ${response.statusText}`,
        });
      }

      const data = await response.json();
      return new GitHubFilesResponse({
        ok: true,
        data,
      });
    } catch (error) {
      return new GitHubFilesResponse({
        ok: false,
        error: `Failed to fetch Pull Request files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Get Pull Request comments
   */
  private static async getPullRequestComments(
    accessToken: string,
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubCommentsResponse> {
    try {
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/issues/${pullNumber}/comments`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        return new GitHubCommentsResponse({
          ok: false,
          error: `Failed to fetch comments: ${response.status} ${response.statusText}`,
        });
      }

      const data = await response.json();
      return new GitHubCommentsResponse({
        ok: true,
        data,
      });
    } catch (error) {
      return new GitHubCommentsResponse({
        ok: false,
        error: `Failed to fetch Pull Request comments: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Get Pull Request reviews
   */
  private static async getPullRequestReviews(
    accessToken: string,
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubReviewsResponse> {
    try {
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        return new GitHubReviewsResponse({
          ok: false,
          error: `Failed to fetch reviews: ${response.status} ${response.statusText}`,
        });
      }

      const data = await response.json();
      return new GitHubReviewsResponse({
        ok: true,
        data,
      });
    } catch (error) {
      return new GitHubReviewsResponse({
        ok: false,
        error: `Failed to fetch Pull Request reviews: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Get Pull Request review comments
   */
  private static async getPullRequestReviewComments(
    accessToken: string,
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubReviewCommentsResponse> {
    try {
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}/comments`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        return new GitHubReviewCommentsResponse({
          ok: false,
          error: `Failed to fetch review comments: ${response.status} ${response.statusText}`,
        });
      }

      const data = await response.json();
      return new GitHubReviewCommentsResponse({
        ok: true,
        data,
      });
    } catch (error) {
      return new GitHubReviewCommentsResponse({
        ok: false,
        error: `Failed to fetch Pull Request review comments: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Get Pull Request commits
   */
  private static async getPullRequestCommits(
    accessToken: string,
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubCommitsResponse> {
    try {
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}/commits`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        return new GitHubCommitsResponse({
          ok: false,
          error: `Failed to fetch commits: ${response.status} ${response.statusText}`,
        });
      }

      const data = await response.json();
      return new GitHubCommitsResponse({
        ok: true,
        data,
      });
    } catch (error) {
      return new GitHubCommitsResponse({
        ok: false,
        error: `Failed to fetch Pull Request commits: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Fetch GitHub Pull Request information
   */
  public static async fetchGitHubPullRequest(
    request: IGitHubRequest
  ): Promise<McpResult> {
    try {
      const accessToken = this.getAccessToken();
      const { owner, repo, pullNumber } = this.parseGitHubPullRequestUrl(request.url);

      // Fetch all PR data in parallel for better performance
      const [
        pullRequestResponse,
        filesResponse,
        commentsResponse,
        reviewsResponse,
        reviewCommentsResponse,
        commitsResponse,
      ] = await Promise.all([
        this.getPullRequest(accessToken, owner, repo, pullNumber),
        this.getPullRequestFiles(accessToken, owner, repo, pullNumber),
        this.getPullRequestComments(accessToken, owner, repo, pullNumber),
        this.getPullRequestReviews(accessToken, owner, repo, pullNumber),
        this.getPullRequestReviewComments(accessToken, owner, repo, pullNumber),
        this.getPullRequestCommits(accessToken, owner, repo, pullNumber),
      ]);

      // Check if the main PR request failed
      if (!pullRequestResponse.isSuccess) {
        return this.createErrorResult(
          pullRequestResponse.error || "Failed to fetch Pull Request"
        );
      }

      const pullRequest = pullRequestResponse.pullRequest!;
      const files = filesResponse.isSuccess ? filesResponse.files : [];
      const comments = commentsResponse.isSuccess ? commentsResponse.comments : [];
      const reviews = reviewsResponse.isSuccess ? reviewsResponse.reviews : [];
      const reviewComments = reviewCommentsResponse.isSuccess ? reviewCommentsResponse.reviewComments : [];
      const commits = commitsResponse.isSuccess ? commitsResponse.commits : [];

      // Combine review comments with regular comments for comprehensive view
      const allComments = [...comments];
      reviewComments.forEach(reviewComment => {
        // Convert review comment to regular comment format for unified display
        allComments.push({
          id: reviewComment.id,
          user: reviewComment.user,
          createdAt: reviewComment.createdAt,
          updatedAt: reviewComment.updatedAt,
          body: `**Review Comment on ${reviewComment.path}:**\n${reviewComment.body}`,
          htmlUrl: reviewComment.htmlUrl,
          issueUrl: reviewComment.pullRequestUrl,
          authorAssociation: reviewComment.authorAssociation,
        } as any);
      });

      // Create comprehensive PR model
      const prModel = new GitHubPullRequestModel(
        pullRequest,
        files,
        allComments,
        reviews,
        commits
      );

      // Generate comprehensive summary
      const summary = prModel.generateSummary();

      return McpResult.success(summary);
    } catch (error) {
      return this.createErrorResult(
        `Failed to fetch GitHub Pull Request: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
