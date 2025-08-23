import { IGitHubReviewComment } from "../GitHubTypes.js";
import { GitHubUser } from "./GitHubUser.js";

export class GitHubReviewComment {
  private _data: IGitHubReviewComment;
  private _user?: GitHubUser;

  constructor(data: IGitHubReviewComment) {
    this._data = data;
  }

  get data(): IGitHubReviewComment {
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

  get createdAt(): string {
    return this._data.created_at;
  }

  get updatedAt(): string {
    return this._data.updated_at;
  }

  get body(): string {
    return this._data.body;
  }

  get htmlUrl(): string {
    return this._data.html_url;
  }

  get pullRequestUrl(): string {
    return this._data.pull_request_url;
  }

  get diffHunk(): string {
    return this._data.diff_hunk;
  }

  get path(): string {
    return this._data.path;
  }

  get position(): number | undefined {
    return this._data.position;
  }

  get originalPosition(): number | undefined {
    return this._data.original_position;
  }

  get commitId(): string {
    return this._data.commit_id;
  }

  get originalCommitId(): string {
    return this._data.original_commit_id;
  }

  get inReplyToId(): number | undefined {
    return this._data.in_reply_to_id;
  }

  get authorAssociation(): string {
    return this._data.author_association;
  }

  get line(): number | undefined {
    return this._data.line;
  }

  get originalLine(): number | undefined {
    return this._data.original_line;
  }

  get side(): "LEFT" | "RIGHT" {
    return this._data.side;
  }

  get startLine(): number | undefined {
    return this._data.start_line;
  }

  get originalStartLine(): number | undefined {
    return this._data.original_start_line;
  }

  get startSide(): "LEFT" | "RIGHT" | undefined {
    return this._data.start_side;
  }

  get formattedCreatedAt(): string {
    return new Date(this._data.created_at).toISOString();
  }

  get formattedUpdatedAt(): string {
    return new Date(this._data.updated_at).toISOString();
  }

  get isEdited(): boolean {
    return this._data.created_at !== this._data.updated_at;
  }

  get isReply(): boolean {
    return Boolean(this._data.in_reply_to_id);
  }

  get shortCommitId(): string {
    return this._data.commit_id.substring(0, 7);
  }

  get displayInfo(): string {
    const parts = [
      `${this.user.displayInfo}`,
      `on ${this.path}`,
      `(${this.shortCommitId})`,
      `at ${this.formattedCreatedAt}`
    ];
    
    if (this.isEdited) {
      parts.push("(edited)");
    }
    
    if (this.isReply) {
      parts.push("(reply)");
    }
    
    return `${parts.join(" ")}\n${this.body}`;
  }
}
