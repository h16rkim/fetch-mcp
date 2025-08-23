import { IGitHubReviewComment } from "../GitHubTypes.js";
import { GitHubUser } from "./GitHubUser.js";

export class GitHubReviewComment {
  private _id: number;
  private _user: GitHubUser;
  private _createdAt: string;
  private _updatedAt: string;
  private _body: string;
  private _htmlUrl: string;
  private _pullRequestUrl: string;
  private _diffHunk: string;
  private _path: string;
  private _position?: number;
  private _originalPosition?: number;
  private _commitId: string;
  private _originalCommitId: string;
  private _inReplyToId?: number;
  private _authorAssociation: string;
  private _line?: number;
  private _originalLine?: number;
  private _side: "LEFT" | "RIGHT";
  private _startLine?: number;
  private _originalStartLine?: number;
  private _startSide?: "LEFT" | "RIGHT";

  constructor(data: IGitHubReviewComment) {
    this._id = data.id;
    this._user = new GitHubUser(data.user);
    this._createdAt = data.created_at;
    this._updatedAt = data.updated_at;
    this._body = data.body;
    this._htmlUrl = data.html_url;
    this._pullRequestUrl = data.pull_request_url;
    this._diffHunk = data.diff_hunk;
    this._path = data.path;
    this._position = data.position;
    this._originalPosition = data.original_position;
    this._commitId = data.commit_id;
    this._originalCommitId = data.original_commit_id;
    this._inReplyToId = data.in_reply_to_id;
    this._authorAssociation = data.author_association;
    this._line = data.line;
    this._originalLine = data.original_line;
    this._side = data.side;
    this._startLine = data.start_line;
    this._originalStartLine = data.original_start_line;
    this._startSide = data.start_side;
  }

  get data(): IGitHubReviewComment {
    return {
      id: this._id,
      user: this._user.data,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      body: this._body,
      html_url: this._htmlUrl,
      pull_request_url: this._pullRequestUrl,
      diff_hunk: this._diffHunk,
      path: this._path,
      position: this._position,
      original_position: this._originalPosition,
      commit_id: this._commitId,
      original_commit_id: this._originalCommitId,
      in_reply_to_id: this._inReplyToId,
      author_association: this._authorAssociation,
      line: this._line,
      original_line: this._originalLine,
      side: this._side,
      start_line: this._startLine,
      original_start_line: this._originalStartLine,
      start_side: this._startSide
    };
  }

  get id(): number {
    return this._id;
  }

  get user(): GitHubUser {
    return this._user;
  }

  get createdAt(): string {
    return this._createdAt;
  }

  get updatedAt(): string {
    return this._updatedAt;
  }

  get body(): string {
    return this._body;
  }

  get htmlUrl(): string {
    return this._htmlUrl;
  }

  get pullRequestUrl(): string {
    return this._pullRequestUrl;
  }

  get diffHunk(): string {
    return this._diffHunk;
  }

  get path(): string {
    return this._path;
  }

  get position(): number | undefined {
    return this._position;
  }

  get originalPosition(): number | undefined {
    return this._originalPosition;
  }

  get commitId(): string {
    return this._commitId;
  }

  get originalCommitId(): string {
    return this._originalCommitId;
  }

  get inReplyToId(): number | undefined {
    return this._inReplyToId;
  }

  get authorAssociation(): string {
    return this._authorAssociation;
  }

  get line(): number | undefined {
    return this._line;
  }

  get originalLine(): number | undefined {
    return this._originalLine;
  }

  get side(): "LEFT" | "RIGHT" {
    return this._side;
  }

  get startLine(): number | undefined {
    return this._startLine;
  }

  get originalStartLine(): number | undefined {
    return this._originalStartLine;
  }

  get startSide(): "LEFT" | "RIGHT" | undefined {
    return this._startSide;
  }

  get formattedCreatedAt(): string {
    return new Date(this._createdAt).toISOString();
  }

  get formattedUpdatedAt(): string {
    return new Date(this._updatedAt).toISOString();
  }

  get isEdited(): boolean {
    return this._createdAt !== this._updatedAt;
  }

  get isReply(): boolean {
    return Boolean(this._inReplyToId);
  }

  get shortCommitId(): string {
    return this._commitId.substring(0, 7);
  }

  get displayInfo(): string {
    const parts = [
      `${this._user.displayInfo}`,
      `on ${this._path}`,
      `(${this.shortCommitId})`,
      `at ${this.formattedCreatedAt}`
    ];
    
    if (this.isEdited) {
      parts.push("(edited)");
    }
    
    if (this.isReply) {
      parts.push("(reply)");
    }
    
    return `${parts.join(" ")}\n${this._body}`;
  }
}
