import { IGitHubComment } from "../GitHubTypes.js";
import { GitHubUser } from "./GitHubUser.js";

export class GitHubComment {
  private _id: number;
  private _user: GitHubUser;
  private _createdAt: string;
  private _updatedAt: string;
  private _body: string;
  private _htmlUrl: string;
  private _issueUrl: string;
  private _authorAssociation: string;

  constructor(data: IGitHubComment) {
    this._id = data.id;
    this._user = new GitHubUser(data.user);
    this._createdAt = data.created_at;
    this._updatedAt = data.updated_at;
    this._body = data.body;
    this._htmlUrl = data.html_url;
    this._issueUrl = data.issue_url;
    this._authorAssociation = data.author_association;
  }

  get data(): IGitHubComment {
    return {
      id: this._id,
      user: this._user.data,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      body: this._body,
      html_url: this._htmlUrl,
      issue_url: this._issueUrl,
      author_association: this._authorAssociation
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

  get issueUrl(): string {
    return this._issueUrl;
  }

  get authorAssociation(): string {
    return this._authorAssociation;
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

  get shortBody(): string {
    const maxLength = 100;
    if (this._body.length <= maxLength) {
      return this._body;
    }
    return this._body.substring(0, maxLength) + "...";
  }

  get displayInfo(): string {
    const editedText = this.isEdited ? " (edited)" : "";
    return `${this._user.displayInfo} - ${this.formattedCreatedAt}${editedText}\n${this._body}`;
  }
}
