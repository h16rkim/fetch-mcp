import { IGitHubCommitsResponse } from "../GitHubTypes.js";
import { GitHubCommit } from "./GitHubCommit.js";

export class GitHubCommitsResponse {
  private _data: IGitHubCommitsResponse;

  constructor(data: IGitHubCommitsResponse) {
    this._data = data;
  }

  get ok(): boolean {
    return this._data.ok;
  }

  get commits(): GitHubCommit[] {
    if (!this._data.data) {
      return [];
    }
    return this._data.data.map(commit => new GitHubCommit(commit));
  }

  get error(): string | undefined {
    return this._data.error;
  }

  get hasCommits(): boolean {
    return this.commits.length > 0;
  }

  get isSuccess(): boolean {
    return this.ok && !this.error;
  }

  get commitCount(): number {
    return this.commits.length;
  }

  get sortedByAuthorDate(): GitHubCommit[] {
    return [...this.commits].sort((a, b) => 
      new Date(a.author.date).getTime() - new Date(b.author.date).getTime()
    );
  }

  get latestCommit(): GitHubCommit | undefined {
    if (this.commits.length === 0) {
      return undefined;
    }
    return this.commits.reduce((latest, commit) => 
      new Date(commit.author.date) > new Date(latest.author.date) ? commit : latest
    );
  }

  get firstCommit(): GitHubCommit | undefined {
    if (this.commits.length === 0) {
      return undefined;
    }
    return this.commits.reduce((first, commit) => 
      new Date(commit.author.date) < new Date(first.author.date) ? commit : first
    );
  }

  get uniqueAuthors(): string[] {
    const authors = new Set(this.commits.map(commit => commit.author.name));
    return Array.from(authors);
  }

  get uniqueCommitters(): string[] {
    const committers = new Set(this.commits.map(commit => commit.committer.name));
    return Array.from(committers);
  }

  get verifiedCommits(): GitHubCommit[] {
    return this.commits.filter(commit => commit.isVerified);
  }

  get mergeCommits(): GitHubCommit[] {
    return this.commits.filter(commit => commit.isMergeCommit);
  }

  get regularCommits(): GitHubCommit[] {
    return this.commits.filter(commit => !commit.isMergeCommit);
  }

  getCommitsByAuthor(authorName: string): GitHubCommit[] {
    return this.commits.filter(commit => commit.author.name === authorName);
  }

  getCommitsByCommitter(committerName: string): GitHubCommit[] {
    return this.commits.filter(commit => commit.committer.name === committerName);
  }

  get commitSummary(): { total: number; verified: number; merges: number; regular: number; authors: number } {
    return {
      total: this.commitCount,
      verified: this.verifiedCommits.length,
      merges: this.mergeCommits.length,
      regular: this.regularCommits.length,
      authors: this.uniqueAuthors.length
    };
  }
}
