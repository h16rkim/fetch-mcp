import { IGitHubCommit } from "../GitHubTypes.js";

export class GitHubCommit {
  private _sha: string;
  private _url: string;
  private _htmlUrl: string;
  private _author: { name: string; email: string; date: string };
  private _committer: { name: string; email: string; date: string };
  private _message: string;
  private _tree: { sha: string; url: string };
  private _parents: Array<{ sha: string; url: string; html_url: string }>;
  private _verification?: { verified: boolean; reason: string; signature?: string; payload?: string };

  constructor(data: IGitHubCommit) {
    this._sha = data.sha;
    this._url = data.url;
    this._htmlUrl = data.html_url;
    this._author = data.author;
    this._committer = data.committer;
    this._message = data.message;
    this._tree = data.tree;
    this._parents = data.parents;
    this._verification = data.verification;
  }

  get data(): IGitHubCommit {
    return {
      sha: this._sha,
      url: this._url,
      html_url: this._htmlUrl,
      author: this._author,
      committer: this._committer,
      message: this._message,
      tree: this._tree,
      parents: this._parents,
      verification: this._verification
    };
  }

  get sha(): string {
    return this._sha;
  }

  get shortSha(): string {
    return this._sha.substring(0, 7);
  }

  get url(): string {
    return this._url;
  }

  get htmlUrl(): string {
    return this._htmlUrl;
  }

  get author(): { name: string; email: string; date: string } {
    return this._author;
  }

  get committer(): { name: string; email: string; date: string } {
    return this._committer;
  }

  get message(): string {
    return this._message;
  }

  get shortMessage(): string {
    const firstLine = this._message.split('\n')[0];
    const maxLength = 72;
    if (firstLine.length <= maxLength) {
      return firstLine;
    }
    return firstLine.substring(0, maxLength) + "...";
  }

  get tree(): { sha: string; url: string } {
    return this._tree;
  }

  get parents(): Array<{ sha: string; url: string; html_url: string }> {
    return this._parents;
  }

  get verification(): { verified: boolean; reason: string; signature?: string; payload?: string } | undefined {
    return this._verification;
  }

  get formattedAuthorDate(): string {
    return new Date(this._author.date).toISOString();
  }

  get formattedCommitterDate(): string {
    return new Date(this._committer.date).toISOString();
  }

  get isVerified(): boolean {
    return this._verification?.verified || false;
  }

  get verificationIcon(): string {
    return this.isVerified ? "✅" : "❓";
  }

  get isMergeCommit(): boolean {
    return this._parents.length > 1;
  }

  get displayInfo(): string {
    const parts = [
      `${this.shortSha}`,
      this.shortMessage,
      `by ${this._author.name}`,
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
