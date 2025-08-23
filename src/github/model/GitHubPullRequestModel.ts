import { GitHubPullRequest } from "./GitHubPullRequest.js";
import { GitHubFile } from "./GitHubFile.js";
import { GitHubComment } from "./GitHubComment.js";
import { GitHubReview } from "./GitHubReview.js";
import { GithubResponseBuilder } from "../GithubResponseBuilder.js";

export class GitHubPullRequestModel {
  private _pullRequest: GitHubPullRequest;
  private _files: GitHubFile[];
  private _comments: GitHubComment[];
  private _reviews: GitHubReview[];

  constructor(
    pullRequest: GitHubPullRequest,
    files: GitHubFile[] = [],
    comments: GitHubComment[] = [],
    reviews: GitHubReview[] = []
  ) {
    this._pullRequest = pullRequest;
    this._files = files;
    this._comments = comments;
    this._reviews = reviews;
  }

  get pullRequest(): GitHubPullRequest {
    return this._pullRequest;
  }

  get files(): GitHubFile[] {
    return this._files;
  }

  get comments(): GitHubComment[] {
    return this._comments;
  }

  get reviews(): GitHubReview[] {
    return this._reviews;
  }

  get hasFiles(): boolean {
    return this._files.length > 0;
  }

  get hasComments(): boolean {
    return this._comments.length > 0;
  }

  get hasReviews(): boolean {
    return this._reviews.length > 0;
  }

  get approvedReviews(): GitHubReview[] {
    return this._reviews.filter(review => review.state === "APPROVED");
  }

  get changesRequestedReviews(): GitHubReview[] {
    return this._reviews.filter(review => review.state === "CHANGES_REQUESTED");
  }

  get commentReviews(): GitHubReview[] {
    return this._reviews.filter(review => review.state === "COMMENTED");
  }

  get addedFiles(): GitHubFile[] {
    return this._files.filter(file => file.status === "added");
  }

  get modifiedFiles(): GitHubFile[] {
    return this._files.filter(file => file.status === "modified");
  }

  get deletedFiles(): GitHubFile[] {
    return this._files.filter(file => file.status === "removed");
  }

  get renamedFiles(): GitHubFile[] {
    return this._files.filter(file => file.status === "renamed");
  }

  generateSummary(): string {
    const responseBuilder = new GithubResponseBuilder();
    return responseBuilder.generatePullRequestSummary(this);
  }
}
