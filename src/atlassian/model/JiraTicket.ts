import { IJiraApiResponse } from "../AtlassianTypes.js";

export class JiraTicket {
  private _data: IJiraApiResponse;

  constructor(data: IJiraApiResponse) {
    this._data = data;
  }

  get data(): IJiraApiResponse {
    return this._data;
  }

  get key(): string {
    return this._data.key || "Unknown key";
  }

  get summary(): string {
    return this._data.fields?.summary || "No summary";
  }

  get assignee(): string {
    return this._data.fields?.assignee?.displayName || "Unassigned";
  }

  get status(): string {
    return this._data.fields?.status?.name || "Unknown status";
  }

  get priority(): string {
    return this._data.fields?.priority?.name || "Unknown priority";
  }

  get issueType(): string {
    return this._data.fields?.issuetype?.name || "Unknown type";
  }

  get reporter(): string {
    return this._data.fields?.reporter?.displayName || "Unknown reporter";
  }

  get created(): string {
    return this._data.fields?.created || "Unknown";
  }

  get updated(): string {
    return this._data.fields?.updated || "Unknown";
  }

  get description(): string {
    if (!this._data.fields?.description) {
      return "No description";
    }

    const desc = this._data.fields.description;
    if (typeof desc === "string") {
      return desc;
    } else if (desc.content) {
      return this.extractTextFromADF(desc);
    }

    return "No description";
  }

  get subtasks(): Array<{ key: string; summary: string; status: string }> {
    if (
      !this._data.fields?.subtasks ||
      this._data.fields.subtasks.length === 0
    ) {
      return [];
    }

    return this._data.fields.subtasks.map(subtask => ({
      key: subtask.key || "Unknown key",
      summary: subtask.fields?.summary || "No summary",
      status: subtask.fields?.status?.name || "Unknown status",
    }));
  }

  get comments(): Array<{ author: string; body: string; created: string }> {
    if (
      !this._data.fields?.comment?.comments ||
      this._data.fields.comment.comments.length === 0
    ) {
      return [];
    }

    // Get latest 20 comments
    return this._data.fields.comment.comments.slice(-20).map(comment => ({
      author: comment.author?.displayName || "Unknown author",
      body:
        typeof comment.body === "string"
          ? comment.body
          : this.extractTextFromADF(comment.body),
      created: comment.created || "Unknown date",
    }));
  }

  get hasSubtasks(): boolean {
    return this.subtasks.length > 0;
  }

  get hasComments(): boolean {
    return this.comments.length > 0;
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
