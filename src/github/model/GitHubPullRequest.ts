import { IGitHubPullRequest, IGitHubLabel, IGitHubMilestone } from "../GitHubTypes.js";
import { GitHubUser } from "./GitHubUser.js";

export class GitHubPullRequest {
  private _data: IGitHubPullRequest;
  private _user?: GitHubUser;
  private _assignee?: GitHubUser;
  private _assignees?: GitHubUser[];
  private _requestedReviewers?: GitHubUser[];
  private _mergedBy?: GitHubUser;

  constructor(data: IGitHubPullRequest) {
    this._data = data;
  }

  get data(): IGitHubPullRequest {
    return this._data;
  }

  get id(): number {
    return this._data.id;
  }

  get number(): number {
    return this._data.number;
  }

  get title(): string {
    return this._data.title;
  }

  get body(): string | undefined {
    return this._data.body;
  }

  get state(): string {
    return this._data.state;
  }

  get locked(): boolean {
    return this._data.locked;
  }

  get user(): GitHubUser {
    if (!this._user) {
      this._user = new GitHubUser(this._data.user);
    }
    return this._user;
  }

  get assignee(): GitHubUser | undefined {
    if (this._data.assignee && !this._assignee) {
      this._assignee = new GitHubUser(this._data.assignee);
    }
    return this._assignee;
  }

  get assignees(): GitHubUser[] {
    if (!this._assignees) {
      this._assignees = this._data.assignees.map(assignee => new GitHubUser(assignee));
    }
    return this._assignees;
  }

  get requestedReviewers(): GitHubUser[] {
    if (!this._requestedReviewers) {
      this._requestedReviewers = this._data.requested_reviewers.map(reviewer => new GitHubUser(reviewer));
    }
    return this._requestedReviewers;
  }

  get labels(): IGitHubLabel[] {
    return this._data.labels;
  }

  get milestone(): IGitHubMilestone | undefined {
    return this._data.milestone;
  }

  get head(): { label: string; ref: string; sha: string; user: GitHubUser; repo: any } {
    return {
      ...this._data.head,
      user: new GitHubUser(this._data.head.user)
    };
  }

  get base(): { label: string; ref: string; sha: string; user: GitHubUser; repo: any } {
    return {
      ...this._data.base,
      user: new GitHubUser(this._data.base.user)
    };
  }

  get htmlUrl(): string {
    return this._data.html_url;
  }

  get diffUrl(): string {
    return this._data.diff_url;
  }

  get patchUrl(): string {
    return this._data.patch_url;
  }

  get createdAt(): string {
    return this._data.created_at;
  }

  get updatedAt(): string {
    return this._data.updated_at;
  }

  get closedAt(): string | undefined {
    return this._data.closed_at;
  }

  get mergedAt(): string | undefined {
    return this._data.merged_at;
  }

  get mergeCommitSha(): string | undefined {
    return this._data.merge_commit_sha;
  }

  get draft(): boolean {
    return this._data.draft;
  }

  get merged(): boolean {
    return this._data.merged;
  }

  get mergeable(): boolean | undefined {
    return this._data.mergeable;
  }

  get mergeableState(): string | undefined {
    return this._data.mergeable_state;
  }

  get mergedBy(): GitHubUser | undefined {
    if (this._data.merged_by && !this._mergedBy) {
      this._mergedBy = new GitHubUser(this._data.merged_by);
    }
    return this._mergedBy;
  }

  get comments(): number {
    return this._data.comments;
  }

  get reviewComments(): number {
    return this._data.review_comments;
  }

  get commits(): number {
    return this._data.commits;
  }

  get additions(): number {
    return this._data.additions;
  }

  get deletions(): number {
    return this._data.deletions;
  }

  get changedFiles(): number {
    return this._data.changed_files;
  }

  get formattedCreatedAt(): string {
    return new Date(this._data.created_at).toISOString();
  }

  get formattedUpdatedAt(): string {
    return new Date(this._data.updated_at).toISOString();
  }

  get formattedClosedAt(): string | undefined {
    return this._data.closed_at ? new Date(this._data.closed_at).toISOString() : undefined;
  }

  get formattedMergedAt(): string | undefined {
    return this._data.merged_at ? new Date(this._data.merged_at).toISOString() : undefined;
  }

  get stateIcon(): string {
    if (this.merged) {
      return "🟣";
    } else if (this.state === "closed") {
      return "🔴";
    } else if (this.draft) {
      return "⚪";
    } else {
      return "🟢";
    }
  }

  get stateText(): string {
    if (this.merged) {
      return "Merged";
    } else if (this.state === "closed") {
      return "Closed";
    } else if (this.draft) {
      return "Draft";
    } else {
      return "Open";
    }
  }

  get changesSummary(): string {
    const parts = [];
    
    if (this.additions > 0) {
      parts.push(`+${this.additions}`);
    }
    
    if (this.deletions > 0) {
      parts.push(`-${this.deletions}`);
    }
    
    parts.push(`${this.changedFiles} files`);
    parts.push(`${this.commits} commits`);
    
    return parts.join(", ");
  }

  get labelNames(): string[] {
    return this.labels.map(label => label.name);
  }

  get assigneeNames(): string[] {
    return this.assignees.map(assignee => assignee.login);
  }

  get reviewerNames(): string[] {
    return this.requestedReviewers.map(reviewer => reviewer.login);
  }
}
