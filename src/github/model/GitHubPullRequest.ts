import { IGitHubPullRequest, IGitHubLabel, IGitHubMilestone, IGitHubPullRequestBase } from "../GitHubTypes.js";
import { GitHubUser } from "./GitHubUser.js";

export class GitHubPullRequest {
  private _id: number;
  private _number: number;
  private _title: string;
  private _body?: string;
  private _state: "open" | "closed";
  private _locked: boolean;
  private _user: GitHubUser;
  private _assignee?: GitHubUser;
  private _assignees: GitHubUser[];
  private _requestedReviewers: GitHubUser[];
  private _labels: IGitHubLabel[];
  private _milestone?: IGitHubMilestone;
  private _head: IGitHubPullRequestBase;
  private _base: IGitHubPullRequestBase;
  private _htmlUrl: string;
  private _diffUrl: string;
  private _patchUrl: string;
  private _issueUrl: string;
  private _commitsUrl: string;
  private _reviewCommentsUrl: string;
  private _commentsUrl: string;
  private _statusesUrl: string;
  private _createdAt: string;
  private _updatedAt: string;
  private _closedAt?: string;
  private _mergedAt?: string;
  private _mergeCommitSha?: string;
  private _draft: boolean;
  private _merged: boolean;
  private _mergeable?: boolean;
  private _mergeableState?: string;
  private _mergedBy?: GitHubUser;
  private _comments: number;
  private _reviewComments: number;
  private _maintainerCanModify: boolean;
  private _commits: number;
  private _additions: number;
  private _deletions: number;
  private _changedFiles: number;

  constructor(data: IGitHubPullRequest) {
    this._id = data.id;
    this._number = data.number;
    this._title = data.title;
    this._body = data.body;
    this._state = data.state;
    this._locked = data.locked;
    this._user = new GitHubUser(data.user);
    this._assignee = data.assignee ? new GitHubUser(data.assignee) : undefined;
    this._assignees = data.assignees.map(assignee => new GitHubUser(assignee));
    this._requestedReviewers = data.requested_reviewers.map(reviewer => new GitHubUser(reviewer));
    this._labels = data.labels;
    this._milestone = data.milestone;
    this._head = data.head;
    this._base = data.base;
    this._htmlUrl = data.html_url;
    this._diffUrl = data.diff_url;
    this._patchUrl = data.patch_url;
    this._issueUrl = data.issue_url;
    this._commitsUrl = data.commits_url;
    this._reviewCommentsUrl = data.review_comments_url;
    this._commentsUrl = data.comments_url;
    this._statusesUrl = data.statuses_url;
    this._createdAt = data.created_at;
    this._updatedAt = data.updated_at;
    this._closedAt = data.closed_at;
    this._mergedAt = data.merged_at;
    this._mergeCommitSha = data.merge_commit_sha;
    this._draft = data.draft;
    this._merged = data.merged;
    this._mergeable = data.mergeable;
    this._mergeableState = data.mergeable_state;
    this._mergedBy = data.merged_by ? new GitHubUser(data.merged_by) : undefined;
    this._comments = data.comments;
    this._reviewComments = data.review_comments;
    this._maintainerCanModify = data.maintainer_can_modify;
    this._commits = data.commits;
    this._additions = data.additions;
    this._deletions = data.deletions;
    this._changedFiles = data.changed_files;
  }

  get data(): IGitHubPullRequest {
    return {
      id: this._id,
      number: this._number,
      title: this._title,
      body: this._body,
      state: this._state,
      locked: this._locked,
      user: this._user.data,
      assignee: this._assignee?.data,
      assignees: this._assignees.map(assignee => assignee.data),
      requested_reviewers: this._requestedReviewers.map(reviewer => reviewer.data),
      labels: this._labels,
      milestone: this._milestone,
      head: this._head,
      base: this._base,
      html_url: this._htmlUrl,
      diff_url: this._diffUrl,
      patch_url: this._patchUrl,
      issue_url: this._issueUrl,
      commits_url: this._commitsUrl,
      review_comments_url: this._reviewCommentsUrl,
      comments_url: this._commentsUrl,
      statuses_url: this._statusesUrl,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      closed_at: this._closedAt,
      merged_at: this._mergedAt,
      merge_commit_sha: this._mergeCommitSha,
      draft: this._draft,
      merged: this._merged,
      mergeable: this._mergeable,
      mergeable_state: this._mergeableState,
      merged_by: this._mergedBy?.data,
      comments: this._comments,
      review_comments: this._reviewComments,
      maintainer_can_modify: this._maintainerCanModify,
      commits: this._commits,
      additions: this._additions,
      deletions: this._deletions,
      changed_files: this._changedFiles
    };
  }

  get id(): number {
    return this._id;
  }

  get number(): number {
    return this._number;
  }

  get title(): string {
    return this._title;
  }

  get body(): string | undefined {
    return this._body;
  }

  get state(): "open" | "closed" {
    return this._state;
  }

  get locked(): boolean {
    return this._locked;
  }

  get user(): GitHubUser {
    return this._user;
  }

  get assignee(): GitHubUser | undefined {
    return this._assignee;
  }

  get assignees(): GitHubUser[] {
    return this._assignees;
  }

  get requestedReviewers(): GitHubUser[] {
    return this._requestedReviewers;
  }

  get labels(): IGitHubLabel[] {
    return this._labels;
  }

  get milestone(): IGitHubMilestone | undefined {
    return this._milestone;
  }

  get head(): IGitHubPullRequestBase {
    return this._head;
  }

  get base(): IGitHubPullRequestBase {
    return this._base;
  }

  get htmlUrl(): string {
    return this._htmlUrl;
  }

  get diffUrl(): string {
    return this._diffUrl;
  }

  get patchUrl(): string {
    return this._patchUrl;
  }

  get issueUrl(): string {
    return this._issueUrl;
  }

  get commitsUrl(): string {
    return this._commitsUrl;
  }

  get reviewCommentsUrl(): string {
    return this._reviewCommentsUrl;
  }

  get commentsUrl(): string {
    return this._commentsUrl;
  }

  get statusesUrl(): string {
    return this._statusesUrl;
  }

  get createdAt(): string {
    return this._createdAt;
  }

  get updatedAt(): string {
    return this._updatedAt;
  }

  get closedAt(): string | undefined {
    return this._closedAt;
  }

  get mergedAt(): string | undefined {
    return this._mergedAt;
  }

  get mergeCommitSha(): string | undefined {
    return this._mergeCommitSha;
  }

  get draft(): boolean {
    return this._draft;
  }

  get merged(): boolean {
    return this._merged;
  }

  get mergeable(): boolean | undefined {
    return this._mergeable;
  }

  get mergeableState(): string | undefined {
    return this._mergeableState;
  }

  get mergedBy(): GitHubUser | undefined {
    return this._mergedBy;
  }

  get comments(): number {
    return this._comments;
  }

  get reviewComments(): number {
    return this._reviewComments;
  }

  get maintainerCanModify(): boolean {
    return this._maintainerCanModify;
  }

  get commits(): number {
    return this._commits;
  }

  get additions(): number {
    return this._additions;
  }

  get deletions(): number {
    return this._deletions;
  }

  get changedFiles(): number {
    return this._changedFiles;
  }

  get formattedCreatedAt(): string {
    return new Date(this._createdAt).toISOString();
  }

  get formattedUpdatedAt(): string {
    return new Date(this._updatedAt).toISOString();
  }

  get formattedClosedAt(): string | undefined {
    return this._closedAt ? new Date(this._closedAt).toISOString() : undefined;
  }

  get formattedMergedAt(): string | undefined {
    return this._mergedAt ? new Date(this._mergedAt).toISOString() : undefined;
  }

  get stateIcon(): string {
    if (this._merged) {
      return "🟣";
    } else if (this._state === "closed") {
      return "🔴";
    } else if (this._draft) {
      return "📝";
    } else {
      return "🟢";
    }
  }

  get stateText(): string {
    if (this._merged) {
      return "Merged";
    } else if (this._state === "closed") {
      return "Closed";
    } else if (this._draft) {
      return "Draft";
    } else {
      return "Open";
    }
  }

  get isOpen(): boolean {
    return this._state === "open";
  }

  get isClosed(): boolean {
    return this._state === "closed";
  }

  get isDraft(): boolean {
    return this._draft;
  }

  get isMerged(): boolean {
    return this._merged;
  }

  get hasAssignees(): boolean {
    return this._assignees.length > 0;
  }

  get hasRequestedReviewers(): boolean {
    return this._requestedReviewers.length > 0;
  }

  get hasLabels(): boolean {
    return this._labels.length > 0;
  }

  get hasMilestone(): boolean {
    return Boolean(this._milestone);
  }

  get hasComments(): boolean {
    return this._comments > 0;
  }

  get hasReviewComments(): boolean {
    return this._reviewComments > 0;
  }

  get labelNames(): string[] {
    return this._labels.map(label => label.name);
  }

  get assigneeNames(): string[] {
    return this._assignees.map(assignee => assignee.login);
  }

  get requestedReviewerNames(): string[] {
    return this._requestedReviewers.map(reviewer => reviewer.login);
  }

  get changesSummary(): string {
    const parts = [];
    
    if (this._additions > 0) {
      parts.push(`+${this._additions}`);
    }
    
    if (this._deletions > 0) {
      parts.push(`-${this._deletions}`);
    }
    
    if (this._changedFiles > 0) {
      parts.push(`${this._changedFiles} files`);
    }
    
    return parts.join(" ");
  }

  get branchInfo(): string {
    return `${this._head.label} → ${this._base.label}`;
  }

  get shortMergeCommitSha(): string | undefined {
    return this._mergeCommitSha ? this._mergeCommitSha.substring(0, 7) : undefined;
  }
}
