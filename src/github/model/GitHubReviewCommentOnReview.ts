import { IGitHubReviewCommentOnReview } from "../GitHubTypes.js";
import { GitHubUser } from "./GitHubUser.js";

export class GitHubReviewCommentOnReview {
  private _id: number;
  private _user: GitHubUser;
  private _createdAt: string;
  private _updatedAt: string;
  private _body: string;
  private _htmlUrl: string;
  private _pullRequestReviewId: number;
  private _authorAssociation: string;

  constructor(data: IGitHubReviewCommentOnReview) {
    this._id = data.id;
    this._user = new GitHubUser(data.user);
    this._createdAt = data.created_at;
    this._updatedAt = data.updated_at;
    this._body = data.body;
    this._htmlUrl = data.html_url;
    this._pullRequestReviewId = data.pull_request_review_id;
    this._authorAssociation = data.author_association;
  }

  get data(): IGitHubReviewCommentOnReview {
    return {
      id: this._id,
      user: this._user.data,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      body: this._body,
      html_url: this._htmlUrl,
      pull_request_review_id: this._pullRequestReviewId,
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

  get pullRequestReviewId(): number {
    return this._pullRequestReviewId;
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

  get displayInfo(): string {
    const editedText = this.isEdited ? " (edited)" : "";
    return `${this._user.displayInfo} - ${this.formattedCreatedAt}${editedText}\n${this._body}`;
  }
}
