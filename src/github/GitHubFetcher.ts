import {
  IGitHubRequest,
  IGitHubPullRequestUrl,
  IGitHubIssueUrl,
  IGitHubIssueRequest,
  IGitHubPullRequest,
  IGitHubFile,
  IGitHubComment,
  IGitHubReview,
  IGitHubReviewComment,
  IGitHubReviewCommentOnReview,
  IGitHubIssue,
  IGitHubIssueComment,
} from "./GitHubTypes.js";
import { Constants } from "../constants.js";
import { GitHubPullRequestModel } from "./model/GitHubPullRequestModel.js";
import { GitHubIssueModel } from "./model/GitHubIssueModel.js";
import { GitHubPullRequest } from "./model/GitHubPullRequest.js";
import { GitHubFile } from "./model/GitHubFile.js";
import { GitHubComment } from "./model/GitHubComment.js";
import { GitHubReview } from "./model/GitHubReview.js";
import { GitHubReviewCommentOnReview } from "./model/GitHubReviewCommentOnReview.js";
import { GitHubReviewComment } from "./model/GitHubReviewComment.js";
import { GitHubIssue } from "./model/GitHubIssue.js";
import { GitHubIssueComment } from "./model/GitHubIssueComment.js";
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
   * Parse GitHub Issue URL to extract owner, repo, and issue number
   */
  private static parseGitHubIssueUrl(url: string): IGitHubIssueUrl {
    // URL format: https://github.com/owner/repo/issues/123
    const urlMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/);

    if (!urlMatch) {
      throw new Error(
        "Invalid GitHub Issue URL format. Expected format: https://github.com/owner/repo/issues/number"
      );
    }

    const owner = urlMatch[1];
    const repo = urlMatch[2];
    const issueNumber = parseInt(urlMatch[3], 10);

    return {
      owner,
      repo,
      issueNumber,
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
  ): Promise<GitHubPullRequest | null> {
    try {
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Pull Request not found or access denied");
        } else if (response.status === 403) {
          throw new Error("Access denied. Check your GitHub token permissions");
        } else {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
      }

      const data: IGitHubPullRequest = await response.json();
      return new GitHubPullRequest(data);
    } catch (error) {
      throw new Error(`Failed to fetch Pull Request: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  ): Promise<GitHubFile[]> {
    try {
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}/files`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`);
      }

      const data: IGitHubFile[] = await response.json();
      return data.map(file => new GitHubFile(file));
    } catch (error) {
      throw new Error(`Failed to fetch Pull Request files: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  ): Promise<GitHubComment[]> {
    try {
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/issues/${pullNumber}/comments`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
      }

      const data: IGitHubComment[] = await response.json();
      return data.map(comment => new GitHubComment(comment));
    } catch (error) {
      throw new Error(`Failed to fetch Pull Request comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  ): Promise<GitHubReview[]> {
    try {
      // 1. 리뷰 목록 조회
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
      }

      const reviewsData: IGitHubReview[] = await response.json();

      // 2. 리뷰 ID 배열 정리
      const reviewIds = reviewsData.map(review => review.id);

      // 3. Promise.all을 사용하여 각 리뷰의 댓글들 병렬 조회
      const reviewCommentsPromises = reviewIds.map(reviewId =>
        this.getReviewComments(accessToken, owner, repo, pullNumber, reviewId)
      );

      const allReviewComments = await Promise.all(reviewCommentsPromises);

      // 4. 리뷰와 댓글을 매핑하여 GitHubReview 객체 생성
      const reviews = reviewsData.map((reviewData, index) => {
        const reviewComments = allReviewComments[index];
        return new GitHubReview(reviewData, reviewComments);
      });

      return reviews;
    } catch (error) {
      throw new Error(`Failed to fetch Pull Request reviews: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  ): Promise<GitHubReviewComment[]> {
    try {
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}/comments`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        throw new Error(`Failed to fetch review comments: ${response.status} ${response.statusText}`);
      }

      const data: IGitHubReviewComment[] = await response.json();
      return data.map(comment => new GitHubReviewComment(comment));
    } catch (error) {
      throw new Error(`Failed to fetch Pull Request review comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get comments for a specific review
   */
  private static async getReviewComments(
    accessToken: string,
    owner: string,
    repo: string,
    pullNumber: number,
    reviewId: number
  ): Promise<GitHubReviewCommentOnReview[]> {
    try {
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews/${reviewId}/comments`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        throw new Error(`Failed to fetch review ${reviewId} comments: ${response.status} ${response.statusText}`);
      }

      const data: IGitHubReviewCommentOnReview[] = await response.json();
      return data.map(comment => new GitHubReviewCommentOnReview(comment));
    } catch (error) {
      throw new Error(`Failed to fetch review ${reviewId} comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Issue information
   */
  private static async getIssue(
    accessToken: string,
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<GitHubIssue | null> {
    try {
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/issues/${issueNumber}`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Issue not found or access denied");
        } else if (response.status === 403) {
          throw new Error("Access denied. Check your GitHub token permissions");
        } else {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
      }

      const data: IGitHubIssue = await response.json();
      return new GitHubIssue(data);
    } catch (error) {
      throw new Error(`Failed to fetch Issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Issue comments
   */
  private static async getIssueComments(
    accessToken: string,
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<GitHubIssueComment[]> {
    try {
      const url = `${this.API_BASE_URL}/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
      const response = await this.makeGitHubApiRequest(url, accessToken);

      if (!response.ok) {
        throw new Error(`Failed to fetch issue comments: ${response.status} ${response.statusText}`);
      }

      const data: IGitHubIssueComment[] = await response.json();
      return data.map(comment => new GitHubIssueComment(comment));
    } catch (error) {
      throw new Error(`Failed to fetch Issue comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        pullRequest,
        files,
        comments,
        reviews,
        reviewComments,
      ] = await Promise.all([
        this.getPullRequest(accessToken, owner, repo, pullNumber),
        this.getPullRequestFiles(accessToken, owner, repo, pullNumber),
        this.getPullRequestComments(accessToken, owner, repo, pullNumber),
        this.getPullRequestReviews(accessToken, owner, repo, pullNumber),
        this.getPullRequestReviewComments(accessToken, owner, repo, pullNumber),
      ]);

      // Check if the main PR request failed
      if (!pullRequest) {
        return this.createErrorResult("Failed to fetch Pull Request");
      }

      // Combine review comments with regular comments for comprehensive view
      const allComments = [...comments];
      reviewComments.forEach(reviewComment => {
        // Convert review comment to regular comment format for unified display
        const reviewCommentAsComment = new GitHubComment({
          id: reviewComment.id,
          user: reviewComment.user.data,
          created_at: reviewComment.createdAt,
          updated_at: reviewComment.updatedAt,
          body: `**Review Comment on ${reviewComment.path}:**\n${reviewComment.body}`,
          html_url: reviewComment.htmlUrl,
          issue_url: reviewComment.pullRequestUrl,
          author_association: reviewComment.authorAssociation,
        });
        allComments.push(reviewCommentAsComment);
      });

      // Create comprehensive PR model
      const prModel = new GitHubPullRequestModel(
        pullRequest,
        files,
        allComments,
        reviews
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

  /**
   * Fetch GitHub Issue information
   */
  public static async fetchGitHubIssue(
    request: IGitHubIssueRequest
  ): Promise<McpResult> {
    try {
      const accessToken = this.getAccessToken();
      const { owner, repo, issueNumber } = this.parseGitHubIssueUrl(request.url);

      // Fetch Issue data in parallel for better performance
      const [
        issue,
        comments,
      ] = await Promise.all([
        this.getIssue(accessToken, owner, repo, issueNumber),
        this.getIssueComments(accessToken, owner, repo, issueNumber),
      ]);

      // Check if the main Issue request failed
      if (!issue) {
        return this.createErrorResult("Failed to fetch Issue");
      }

      // Create comprehensive Issue model
      const issueModel = new GitHubIssueModel(issue, comments);

      // Generate comprehensive summary
      const summary = issueModel.generateSummary();

      return McpResult.success(summary);
    } catch (error) {
      return this.createErrorResult(
        `Failed to fetch GitHub Issue: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
