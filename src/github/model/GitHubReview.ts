import { IGitHubReview } from "../GitHubTypes.js";
import { GitHubUser } from "./GitHubUser.js";

export class GitHubReview {
  private _data: IGitHubReview;
  private _user?: GitHubUser;

  constructor(data: IGitHubReview) {
    this._data = data;
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
    
    return result;
  }
}
