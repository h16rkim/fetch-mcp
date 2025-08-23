import { GitHubPullRequest } from "./GitHubPullRequest.js";
import { GitHubFile } from "./GitHubFile.js";
import { GitHubComment } from "./GitHubComment.js";
import { GitHubReview } from "./GitHubReview.js";

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
    const sections = [];

    // Basic PR Info
    sections.push(`# Pull Request #${this._pullRequest.number}: ${this._pullRequest.title}`);
    sections.push(`${this._pullRequest.stateIcon} **Status**: ${this._pullRequest.stateText}`);
    sections.push(`**Author**: ${this._pullRequest.user.displayInfo}`);
    sections.push(`**Created**: ${this._pullRequest.formattedCreatedAt}`);
    sections.push(`**Updated**: ${this._pullRequest.formattedUpdatedAt}`);

    if (this._pullRequest.mergedAt) {
      sections.push(`**Merged**: ${this._pullRequest.formattedMergedAt}`);
      if (this._pullRequest.mergedBy) {
        sections.push(`**Merged by**: ${this._pullRequest.mergedBy.displayInfo}`);
      }
    }

    if (this._pullRequest.closedAt && !this._pullRequest.merged) {
      sections.push(`**Closed**: ${this._pullRequest.formattedClosedAt}`);
    }

    // Branch Info
    sections.push(`**Branch**: ${this._pullRequest.head.ref} → ${this._pullRequest.base.ref}`);

    // Labels
    if (this._pullRequest.labelNames.length > 0) {
      sections.push(`**Labels**: ${this._pullRequest.labelNames.join(", ")}`);
    }

    // Assignees
    if (this._pullRequest.assigneeNames.length > 0) {
      sections.push(`**Assignees**: ${this._pullRequest.assigneeNames.join(", ")}`);
    }

    // Reviewers
    if (this._pullRequest.reviewerNames.length > 0) {
      sections.push(`**Requested Reviewers**: ${this._pullRequest.reviewerNames.join(", ")}`);
    }

    // Changes Summary
    sections.push(`**Changes**: ${this._pullRequest.changesSummary}`);

    // Description
    if (this._pullRequest.body) {
      sections.push(`\n## Description\n${this._pullRequest.body}`);
    }

    // Files Changed
    if (this.hasFiles) {
      sections.push(`\n## Files Changed (${this._files.length})`);
      this._files.forEach(file => {
        sections.push(`- ${file.displayInfo}`);
      });
    }

    // Reviews
    if (this.hasReviews) {
      sections.push(`\n## Reviews (${this._reviews.length})`);
      this._reviews.forEach(review => {
        sections.push(`- ${review.displayInfo}`);
      });
    }

    // Comments
    if (this.hasComments) {
      sections.push(`\n## Comments (${this._comments.length})`);
      this._comments.forEach(comment => {
        sections.push(`- ${comment.displayInfo}`);
      });
    }

    return sections.join("\n");
  }
}
