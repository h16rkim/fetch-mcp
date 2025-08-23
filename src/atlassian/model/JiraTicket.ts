import { IJiraApiResponse } from "../AtlassianTypes.js";

export class JiraTicket {
  private _key: string;
  private _fields?: {
    summary?: string;
    assignee?: {
      displayName?: string;
    };
    status?: {
      name?: string;
    };
    priority?: {
      name?: string;
    };
    issuetype?: {
      name?: string;
    };
    reporter?: {
      displayName?: string;
    };
    created?: string;
    updated?: string;
    description?: any;
    subtasks?: Array<{
      key?: string;
      fields?: {
        summary?: string;
        status?: {
          name?: string;
        };
      };
    }>;
    comment?: {
      comments?: Array<{
        author?: {
          displayName?: string;
        };
        body?: any;
        created?: string;
      }>;
    };
  };

  constructor(data: IJiraApiResponse) {
    this._key = data.key || "Unknown key";
    this._fields = data.fields;
  }

  get data(): IJiraApiResponse {
    return {
      key: this._key,
      fields: this._fields
    };
  }

  get key(): string {
    return this._key;
  }

  get summary(): string {
    return this._fields?.summary || "No summary";
  }

  get assignee(): string {
    return this._fields?.assignee?.displayName || "Unassigned";
  }

  get status(): string {
    return this._fields?.status?.name || "Unknown status";
  }

  get priority(): string {
    return this._fields?.priority?.name || "Unknown priority";
  }

  get issueType(): string {
    return this._fields?.issuetype?.name || "Unknown type";
  }

  get reporter(): string {
    return this._fields?.reporter?.displayName || "Unknown reporter";
  }

  get created(): string {
    return this._fields?.created || "Unknown";
  }

  get updated(): string {
    return this._fields?.updated || "Unknown";
  }

  get description(): string {
    if (!this._fields?.description) {
      return "No description";
    }

    const desc = this._fields.description;
    if (typeof desc === "string") {
      return desc;
    } else if (desc.content) {
      return this.extractTextFromADF(desc);
    }

    return "No description";
  }

  get subtasks(): Array<{ key: string; summary: string; status: string }> {
    if (
      !this._fields?.subtasks ||
      this._fields.subtasks.length === 0
    ) {
      return [];
    }

    return this._fields.subtasks.map((subtask: any) => ({
      key: subtask.key || "Unknown key",
      summary: subtask.fields?.summary || "No summary",
      status: subtask.fields?.status?.name || "Unknown status",
    }));
  }

  get comments(): Array<{ author: string; body: string; created: string }> {
    if (
      !this._fields?.comment?.comments ||
      this._fields.comment.comments.length === 0
    ) {
      return [];
    }

    // Get latest 20 comments
    return this._fields.comment.comments.slice(-20).map((comment: any) => ({
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
