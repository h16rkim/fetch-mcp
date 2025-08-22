import { IGitHubCommentsResponse } from "../GitHubTypes.js";
import { GitHubComment } from "./GitHubComment.js";

export class GitHubCommentsResponse {
  private _data: IGitHubCommentsResponse;

  constructor(data: IGitHubCommentsResponse) {
    this._data = data;
  }

  get ok(): boolean {
    return this._data.ok;
  }

  get comments(): GitHubComment[] {
    if (!this._data.data) {
      return [];
    }
    return this._data.data.map(comment => new GitHubComment(comment));
  }

  get error(): string | undefined {
    return this._data.error;
  }

  get hasComments(): boolean {
    return this.comments.length > 0;
  }

  get isSuccess(): boolean {
    return this.ok && !this.error;
  }

  get commentCount(): number {
    return this.comments.length;
  }

  get sortedByCreatedAt(): GitHubComment[] {
    return [...this.comments].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  get latestComment(): GitHubComment | undefined {
    if (this.comments.length === 0) {
      return undefined;
    }
    return this.comments.reduce((latest, comment) => 
      new Date(comment.createdAt) > new Date(latest.createdAt) ? comment : latest
    );
  }

  get uniqueAuthors(): string[] {
    const authors = new Set(this.comments.map(comment => comment.user.login));
    return Array.from(authors);
  }

  getCommentsByAuthor(authorLogin: string): GitHubComment[] {
    return this.comments.filter(comment => comment.user.login === authorLogin);
  }
}
