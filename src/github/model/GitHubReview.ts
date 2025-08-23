import { IGitHubReview } from "../GitHubTypes.js";
import { GitHubUser } from "./GitHubUser.js";
import { GitHubReviewCommentOnReview } from "./GitHubReviewCommentOnReview.js";

export class GitHubReview {
  private _data: IGitHubReview;
  private _user?: GitHubUser;
  private _comments: GitHubReviewCommentOnReview[];

  constructor(data: IGitHubReview, comments: GitHubReviewCommentOnReview[] = []) {
    this._data = data;
    this._comments = comments;
  }

  get data(): IGitHubReview {
    return this._data;
  }

  get id(): number {
    return this._data.id;
  }

  get user(): GitHubUser {
    if (!this._user) {
      this._user = new GitHubUser(this._data.user);
    }
    return this._user;
  }

  get body(): string | undefined {
    return this._data.body;
  }

  get state(): string {
    return this._data.state;
  }

  get htmlUrl(): string {
    return this._data.html_url;
  }

  get pullRequestUrl(): string {
    return this._data.pull_request_url;
  }

  get commitId(): string {
    return this._data.commit_id;
  }

  get submittedAt(): string | undefined {
    return this._data.submitted_at;
  }

  get authorAssociation(): string {
    return this._data.author_association;
  }

  get formattedSubmittedAt(): string | undefined {
    return this._data.submitted_at ? new Date(this._data.submitted_at).toISOString() : undefined;
  }

  get stateIcon(): string {
    switch (this.state) {
      case "APPROVED":
        return "✅";
      case "CHANGES_REQUESTED":
        return "❌";
      case "COMMENTED":
        return "💬";
      case "DISMISSED":
        return "🚫";
      case "PENDING":
        return "⏳";
      default:
        return "❓";
    }
  }

  get stateText(): string {
    switch (this.state) {
      case "APPROVED":
        return "Approved";
      case "CHANGES_REQUESTED":
        return "Changes Requested";
      case "COMMENTED":
        return "Commented";
      case "DISMISSED":
        return "Dismissed";
      case "PENDING":
        return "Pending";
      default:
        return this.state;
    }
  }

  get comments(): GitHubReviewCommentOnReview[] {
    return this._comments;
  }

  get hasComments(): boolean {
    return this._comments.length > 0;
  }

  get commentCount(): number {
    return this._comments.length;
  }

  get sortedCommentsByCreatedAt(): GitHubReviewCommentOnReview[] {
    return [...this._comments].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  get displayInfo(): string {
    const parts = [
      `${this.stateIcon} ${this.stateText}`,
      `by ${this.user.displayInfo}`
    ];
    
    if (this.formattedSubmittedAt) {
      parts.push(`at ${this.formattedSubmittedAt}`);
    }
    
    let result = parts.join(" ");
    
    if (this.body) {
      result += `\n${this.body}`;
    }

    // 댓글이 있으면 댓글 정보도 포함
    if (this.hasComments) {
      result += `\n\n**Review Comments (${this.commentCount}):**`;
      this.sortedCommentsByCreatedAt.forEach((comment, index) => {
        result += `\n${index + 1}. ${comment.displayInfo}`;
      });
    }
    
    return result;
  }
}
