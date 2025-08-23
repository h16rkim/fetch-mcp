import { IGitHubIssue, IGitHubLabel, IGitHubMilestone } from "../GitHubTypes.js";
import { GitHubUser } from "./GitHubUser.js";

export class GitHubIssue {
  private _id: number;
  private _number: number;
  private _title: string;
  private _body?: string;
  private _state: "open" | "closed";
  private _locked: boolean;
  private _user: GitHubUser;
  private _assignee?: GitHubUser;
  private _assignees: GitHubUser[];
  private _labels: IGitHubLabel[];
  private _milestone?: IGitHubMilestone;
  private _htmlUrl: string;
  private _repositoryUrl: string;
  private _commentsUrl: string;
  private _eventsUrl: string;
  private _createdAt: string;
  private _updatedAt: string;
  private _closedAt?: string;
  private _closedBy?: GitHubUser;
  private _comments: number;
  private _authorAssociation: string;
  private _stateReason?: string;
  private _draft?: boolean;

  constructor(data: IGitHubIssue) {
    this._id = data.id;
    this._number = data.number;
    this._title = data.title;
    this._body = data.body;
    this._state = data.state;
    this._locked = data.locked;
    this._user = new GitHubUser(data.user);
    this._assignee = data.assignee ? new GitHubUser(data.assignee) : undefined;
    this._assignees = data.assignees.map(assignee => new GitHubUser(assignee));
    this._labels = data.labels;
    this._milestone = data.milestone;
    this._htmlUrl = data.html_url;
    this._repositoryUrl = data.repository_url;
    this._commentsUrl = data.comments_url;
    this._eventsUrl = data.events_url;
    this._createdAt = data.created_at;
    this._updatedAt = data.updated_at;
    this._closedAt = data.closed_at;
    this._closedBy = data.closed_by ? new GitHubUser(data.closed_by) : undefined;
    this._comments = data.comments;
    this._authorAssociation = data.author_association;
    this._stateReason = data.state_reason;
    this._draft = data.draft;
  }

  get data(): IGitHubIssue {
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
      labels: this._labels,
      milestone: this._milestone,
      html_url: this._htmlUrl,
      repository_url: this._repositoryUrl,
      comments_url: this._commentsUrl,
      events_url: this._eventsUrl,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      closed_at: this._closedAt,
      closed_by: this._closedBy?.data,
      comments: this._comments,
      author_association: this._authorAssociation,
      state_reason: this._stateReason,
      draft: this._draft
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

  get labels(): IGitHubLabel[] {
    return this._labels;
  }

  get milestone(): IGitHubMilestone | undefined {
    return this._milestone;
  }

  get htmlUrl(): string {
    return this._htmlUrl;
  }

  get repositoryUrl(): string {
    return this._repositoryUrl;
  }

  get commentsUrl(): string {
    return this._commentsUrl;
  }

  get eventsUrl(): string {
    return this._eventsUrl;
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

  get closedBy(): GitHubUser | undefined {
    return this._closedBy;
  }

  get comments(): number {
    return this._comments;
  }

  get authorAssociation(): string {
    return this._authorAssociation;
  }

  get stateReason(): string | undefined {
    return this._stateReason;
  }

  get draft(): boolean | undefined {
    return this._draft;
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

  get stateIcon(): string {
    if (this._state === "closed") {
      return "🟣";
    } else {
      return "🟢";
    }
  }

  get stateText(): string {
    return this._state === "closed" ? "Closed" : "Open";
  }

  get labelNames(): string[] {
    return this._labels.map(label => label.name);
  }

  get assigneeNames(): string[] {
    return this._assignees.map(assignee => assignee.login);
  }

  get isOpen(): boolean {
    return this._state === "open";
  }

  get isClosed(): boolean {
    return this._state === "closed";
  }

  get hasAssignees(): boolean {
    return this._assignees.length > 0;
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
}
