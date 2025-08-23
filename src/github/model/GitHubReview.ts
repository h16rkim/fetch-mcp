import { IGitHubReview } from "../GitHubTypes.js";
import { GitHubUser } from "./GitHubUser.js";
import { GitHubReviewCommentOnReview } from "./GitHubReviewCommentOnReview.js";

export class GitHubReview {
  private _id: number;
  private _user: GitHubUser;
  private _body?: string;
  private _state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING";
  private _htmlUrl: string;
  private _pullRequestUrl: string;
  private _commitId: string;
  private _submittedAt?: string;
  private _authorAssociation: string;
  private _comments: GitHubReviewCommentOnReview[];

  constructor(data: IGitHubReview, comments: GitHubReviewCommentOnReview[] = []) {
    this._id = data.id;
    this._user = new GitHubUser(data.user);
    this._body = data.body;
    this._state = data.state;
    this._htmlUrl = data.html_url;
    this._pullRequestUrl = data.pull_request_url;
    this._commitId = data.commit_id;
    this._submittedAt = data.submitted_at;
    this._authorAssociation = data.author_association;
    this._comments = comments;
  }

  get data(): IGitHubReview {
    return {
      id: this._id,
      user: this._user.data,
      body: this._body,
      state: this._state,
      html_url: this._htmlUrl,
      pull_request_url: this._pullRequestUrl,
      commit_id: this._commitId,
      submitted_at: this._submittedAt,
      author_association: this._authorAssociation
    };
  }

  get id(): number {
    return this._id;
  }

  get user(): GitHubUser {
    return this._user;
  }

  get body(): string | undefined {
    return this._body;
  }

  get state(): string {
    return this._state;
  }

  get htmlUrl(): string {
    return this._htmlUrl;
  }

  get pullRequestUrl(): string {
    return this._pullRequestUrl;
  }

  get commitId(): string {
    return this._commitId;
  }

  get submittedAt(): string | undefined {
    return this._submittedAt;
  }

  get authorAssociation(): string {
    return this._authorAssociation;
  }

  get formattedSubmittedAt(): string | undefined {
    return this._submittedAt ? new Date(this._submittedAt).toISOString() : undefined;
  }

  get stateIcon(): string {
    switch (this._state) {
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
    switch (this._state) {
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
        return this._state;
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
      `by ${this._user.displayInfo}`
    ];
    
    if (this.formattedSubmittedAt) {
      parts.push(`at ${this.formattedSubmittedAt}`);
    }
    
    let result = parts.join(" ");
    
    if (this._body) {
      result += `\n${this._body}`;
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
