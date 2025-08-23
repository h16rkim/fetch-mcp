import { IGitHubIssue, IGitHubLabel, IGitHubMilestone } from "../GitHubTypes.js";
import { GitHubUser } from "./GitHubUser.js";

export class GitHubIssue {
  private _data: IGitHubIssue;
  private _user?: GitHubUser;
  private _assignee?: GitHubUser;
  private _assignees?: GitHubUser[];
  private _closedBy?: GitHubUser;

  constructor(data: IGitHubIssue) {
    this._data = data;
  }

  get data(): IGitHubIssue {
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

  get labels(): IGitHubLabel[] {
    return this._data.labels;
  }

  get milestone(): IGitHubMilestone | undefined {
    return this._data.milestone;
  }

  get htmlUrl(): string {
    return this._data.html_url;
  }

  get repositoryUrl(): string {
    return this._data.repository_url;
  }

  get commentsUrl(): string {
    return this._data.comments_url;
  }

  get eventsUrl(): string {
    return this._data.events_url;
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

  get closedBy(): GitHubUser | undefined {
    if (this._data.closed_by && !this._closedBy) {
      this._closedBy = new GitHubUser(this._data.closed_by);
    }
    return this._closedBy;
  }

  get comments(): number {
    return this._data.comments;
  }

  get authorAssociation(): string {
    return this._data.author_association;
  }

  get stateReason(): string | undefined {
    return this._data.state_reason;
  }

  get draft(): boolean | undefined {
    return this._data.draft;
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

  get stateIcon(): string {
    if (this.state === "closed") {
      return "🟣";
    } else {
      return "🟢";
    }
  }

  get stateText(): string {
    return this.state === "closed" ? "Closed" : "Open";
  }

  get labelNames(): string[] {
    return this.labels.map(label => label.name);
  }

  get assigneeNames(): string[] {
    return this.assignees.map(assignee => assignee.login);
  }

  get isOpen(): boolean {
    return this.state === "open";
  }

  get isClosed(): boolean {
    return this.state === "closed";
  }

  get hasAssignees(): boolean {
    return this.assignees.length > 0;
  }

  get hasLabels(): boolean {
    return this.labels.length > 0;
  }

  get hasMilestone(): boolean {
    return Boolean(this.milestone);
  }

  get hasComments(): boolean {
    return this.comments > 0;
  }
}
