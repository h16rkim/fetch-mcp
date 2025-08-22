import { IGitHubComment } from "../GitHubTypes.js";
import { GitHubUser } from "./GitHubUser.js";

export class GitHubComment {
  private _data: IGitHubComment;
  private _user?: GitHubUser;

  constructor(data: IGitHubComment) {
    this._data = data;
  }

  get data(): IGitHubComment {
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

  get issueUrl(): string {
    return this._data.issue_url;
  }

  get authorAssociation(): string {
    return this._data.author_association;
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

  get shortBody(): string {
    const maxLength = 100;
    if (this.body.length <= maxLength) {
      return this.body;
    }
    return this.body.substring(0, maxLength) + "...";
  }

  get displayInfo(): string {
    const editedText = this.isEdited ? " (edited)" : "";
    return `${this.user.displayInfo} - ${this.formattedCreatedAt}${editedText}\n${this.body}`;
  }
}
