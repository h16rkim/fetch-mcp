import { GitHubIssue } from "./GitHubIssue.js";
import { GitHubIssueComment } from "./GitHubIssueComment.js";
import { GithubResponseBuilder } from "../GithubResponseBuilder.js";

export class GitHubIssueModel {
  private _issue: GitHubIssue;
  private _comments: GitHubIssueComment[];

  constructor(
    issue: GitHubIssue,
    comments: GitHubIssueComment[] = []
  ) {
    this._issue = issue;
    this._comments = comments;
  }

  get issue(): GitHubIssue {
    return this._issue;
  }

  get comments(): GitHubIssueComment[] {
    return this._comments;
  }

  get hasComments(): boolean {
    return this._comments.length > 0;
  }

  get commentCount(): number {
    return this._comments.length;
  }

  get sortedCommentsByCreatedAt(): GitHubIssueComment[] {
    return [...this._comments].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  get latestComment(): GitHubIssueComment | undefined {
    if (this._comments.length === 0) {
      return undefined;
    }
    return this._comments.reduce((latest, comment) => 
      new Date(comment.createdAt) > new Date(latest.createdAt) ? comment : latest
    );
  }

  get uniqueCommentAuthors(): string[] {
    const authors = new Set(this._comments.map(comment => comment.user.login));
    return Array.from(authors);
  }

  get ownerComments(): GitHubIssueComment[] {
    return this._comments.filter(comment => comment.authorAssociation === "OWNER");
  }

  get memberComments(): GitHubIssueComment[] {
    return this._comments.filter(comment => comment.authorAssociation === "MEMBER");
  }

  get collaboratorComments(): GitHubIssueComment[] {
    return this._comments.filter(comment => comment.authorAssociation === "COLLABORATOR");
  }

  getCommentsByAuthor(authorLogin: string): GitHubIssueComment[] {
    return this._comments.filter(comment => comment.user.login === authorLogin);
  }

  generateSummary(): string {
    const responseBuilder = new GithubResponseBuilder();
    return responseBuilder.generateIssueSummary(this);
  }
}
