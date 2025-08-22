import { IGitHubCommit } from "../GitHubTypes.js";

export class GitHubCommit {
  private _data: IGitHubCommit;

  constructor(data: IGitHubCommit) {
    this._data = data;
  }

  get data(): IGitHubCommit {
    return this._data;
  }

  get sha(): string {
    return this._data.sha;
  }

  get shortSha(): string {
    return this._data.sha.substring(0, 7);
  }

  get url(): string {
    return this._data.url;
  }

  get htmlUrl(): string {
    return this._data.html_url;
  }

  get author(): { name: string; email: string; date: string } {
    return this._data.author;
  }

  get committer(): { name: string; email: string; date: string } {
    return this._data.committer;
  }

  get message(): string {
    return this._data.message;
  }

  get shortMessage(): string {
    const firstLine = this.message.split('\n')[0];
    const maxLength = 72;
    if (firstLine.length <= maxLength) {
      return firstLine;
    }
    return firstLine.substring(0, maxLength) + "...";
  }

  get tree(): { sha: string; url: string } {
    return this._data.tree;
  }

  get parents(): Array<{ sha: string; url: string; html_url: string }> {
    return this._data.parents;
  }

  get verification(): { verified: boolean; reason: string; signature?: string; payload?: string } | undefined {
    return this._data.verification;
  }

  get formattedAuthorDate(): string {
    return new Date(this._data.author.date).toISOString();
  }

  get formattedCommitterDate(): string {
    return new Date(this._data.committer.date).toISOString();
  }

  get isVerified(): boolean {
    return this._data.verification?.verified || false;
  }

  get verificationIcon(): string {
    return this.isVerified ? "✅" : "❓";
  }

  get isMergeCommit(): boolean {
    return this._data.parents.length > 1;
  }

  get displayInfo(): string {
    const parts = [
      `${this.shortSha}`,
      this.shortMessage,
      `by ${this.author.name}`,
      `at ${this.formattedAuthorDate}`
    ];
    
    if (this.isVerified) {
      parts.push(`${this.verificationIcon} Verified`);
    }
    
    if (this.isMergeCommit) {
      parts.push("(Merge commit)");
    }
    
    return parts.join(" ");
  }
}
