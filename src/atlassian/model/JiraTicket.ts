import { IJiraApiResponse } from "../AtlassianTypes.js";
import { JiraUser } from "./JiraUser.js";
import { JiraStatus } from "./JiraStatus.js";
import { JiraPriority } from "./JiraPriority.js";
import { JiraIssueType } from "./JiraIssueType.js";
import { JiraSubtask } from "./JiraSubtask.js";
import { JiraComment } from "./JiraComment.js";

export class JiraTicket {
  private _key: string;
  private _summary: string;
  private _assignee?: JiraUser;
  private _status?: JiraStatus;
  private _priority?: JiraPriority;
  private _issueType?: JiraIssueType;
  private _reporter?: JiraUser;
  private _created: string;
  private _updated: string;
  private _description: any;
  private _subtasks: JiraSubtask[];
  private _comments: JiraComment[];

  constructor(data: IJiraApiResponse) {
    this._key = data.key || "Unknown key";
    this._summary = data.fields?.summary || "No summary";
    this._assignee = data.fields?.assignee ? new JiraUser(data.fields.assignee) : undefined;
    this._status = data.fields?.status ? new JiraStatus(data.fields.status) : undefined;
    this._priority = data.fields?.priority ? new JiraPriority(data.fields.priority) : undefined;
    this._issueType = data.fields?.issuetype ? new JiraIssueType(data.fields.issuetype) : undefined;
    this._reporter = data.fields?.reporter ? new JiraUser(data.fields.reporter) : undefined;
    this._created = data.fields?.created || "Unknown";
    this._updated = data.fields?.updated || "Unknown";
    this._description = data.fields?.description;
    
    // Initialize subtasks
    this._subtasks = (data.fields?.subtasks || []).map(subtask => new JiraSubtask(subtask));
    
    // Initialize comments (latest 20)
    const comments = data.fields?.comment?.comments || [];
    this._comments = comments.slice(-20).map(comment => 
      new JiraComment(comment, this.extractTextFromADF.bind(this))
    );
  }

  get data(): IJiraApiResponse {
    return {
      key: this._key,
      fields: {
        summary: this._summary,
        assignee: this._assignee?.data,
        status: this._status?.data,
        priority: this._priority?.data,
        issuetype: this._issueType?.data,
        reporter: this._reporter?.data,
        created: this._created,
        updated: this._updated,
        description: this._description,
        subtasks: this._subtasks.map(subtask => subtask.data),
        comment: {
          comments: this._comments.map(comment => comment.data)
        }
      }
    };
  }

  get key(): string {
    return this._key;
  }

  get summary(): string {
    return this._summary;
  }

  get assignee(): string {
    return this._assignee?.displayName || "Unassigned";
  }

  get assigneeInfo(): JiraUser | undefined {
    return this._assignee;
  }

  get status(): string {
    return this._status?.name || "Unknown status";
  }

  get statusInfo(): JiraStatus | undefined {
    return this._status;
  }

  get priority(): string {
    return this._priority?.name || "Unknown priority";
  }

  get priorityInfo(): JiraPriority | undefined {
    return this._priority;
  }

  get issueType(): string {
    return this._issueType?.name || "Unknown type";
  }

  get issueTypeInfo(): JiraIssueType | undefined {
    return this._issueType;
  }

  get reporter(): string {
    return this._reporter?.displayName || "Unknown reporter";
  }

  get reporterInfo(): JiraUser | undefined {
    return this._reporter;
  }

  get created(): string {
    return this._created;
  }

  get updated(): string {
    return this._updated;
  }

  get description(): string {
    if (!this._description) {
      return "No description";
    }

    if (typeof this._description === "string") {
      return this._description;
    } else if (this._description.content) {
      return this.extractTextFromADF(this._description);
    }

    return "No description";
  }

  get subtasks(): JiraSubtask[] {
    return this._subtasks;
  }

  get subtaskSummaries(): Array<{ key: string; summary: string; status: string }> {
    return this._subtasks.map(subtask => ({
      key: subtask.key,
      summary: subtask.summary,
      status: subtask.statusName,
    }));
  }

  get comments(): JiraComment[] {
    return this._comments;
  }

  get commentSummaries(): Array<{ author: string; body: string; created: string }> {
    return this._comments.map(comment => ({
      author: comment.authorName,
      body: comment.body,
      created: comment.created,
    }));
  }

  get hasSubtasks(): boolean {
    return this._subtasks.length > 0;
  }

  get hasComments(): boolean {
    return this._comments.length > 0;
  }

  get isAssigned(): boolean {
    return this._assignee !== undefined && !this._assignee.isUnknown;
  }

  get isOpen(): boolean {
    return this._status?.isOpen || false;
  }

  get isClosed(): boolean {
    return this._status?.isClosed || false;
  }

  get isHighPriority(): boolean {
    return this._priority?.isHigh || false;
  }

  get isBug(): boolean {
    return this._issueType?.isBug || false;
  }

  get completedSubtasks(): JiraSubtask[] {
    return this._subtasks.filter(subtask => subtask.isCompleted);
  }

  get inProgressSubtasks(): JiraSubtask[] {
    return this._subtasks.filter(subtask => subtask.isInProgress);
  }

  /**
   * Extract text content from Atlassian Document Format (ADF)
   */
  private extractTextFromADF(adfContent: any): string {
    if (!adfContent || typeof adfContent !== "object") {
      return String(adfContent || "");
    }

    let text = "";

    if (adfContent.type === "text") {
      const textContent = adfContent.text || "";
      // Check if this text has link marks
      if (adfContent.marks && Array.isArray(adfContent.marks)) {
        const linkMark = adfContent.marks.find(
          (mark: any) => mark.type === "link"
        );
        const href = linkMark?.attrs?.href;
        if (href) {
          return `[${textContent}](${href})`;
        }
      }
      return textContent;
    }

    if (adfContent.content && Array.isArray(adfContent.content)) {
      for (const item of adfContent.content) {
        text += this.extractTextFromADF(item);
        if (item.type === "paragraph" || item.type === "heading") {
          text += "\n";
        }
      }
    }

    return text;
  }
}
