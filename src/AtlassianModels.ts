/**
 * Atlassian API response models for better code organization and readability
 */

export interface ConfluenceApiResponse {
  title?: string;
  space?: {
    key?: string;
    name?: string;
  };
  version?: {
    by?: {
      publicName?: string;
    };
  };
  body?: {
    export_view?: {
      value?: string;
    };
  };
}

export interface JiraApiResponse {
  key?: string;
  fields?: {
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
}

export class ConfluencePage {
  private data: ConfluenceApiResponse;

  constructor(data: ConfluenceApiResponse) {
    this.data = data;
  }

  get title(): string {
    return this.data.title || "No title";
  }

  get spaceKey(): string {
    return this.data.space?.key || "Unknown space";
  }

  get spaceName(): string {
    return this.data.space?.name || "Unknown space name";
  }

  get authorName(): string {
    return this.data.version?.by?.publicName || "Unknown author";
  }

  get htmlContent(): string {
    return this.data.body?.export_view?.value || "No content";
  }
}

export class JiraTicket {
  private data: JiraApiResponse;

  constructor(data: JiraApiResponse) {
    this.data = data;
  }

  get key(): string {
    return this.data.key || "Unknown key";
  }

  get summary(): string {
    return this.data.fields?.summary || "No summary";
  }

  get assignee(): string {
    return this.data.fields?.assignee?.displayName || "Unassigned";
  }

  get status(): string {
    return this.data.fields?.status?.name || "Unknown status";
  }

  get priority(): string {
    return this.data.fields?.priority?.name || "Unknown priority";
  }

  get issueType(): string {
    return this.data.fields?.issuetype?.name || "Unknown type";
  }

  get reporter(): string {
    return this.data.fields?.reporter?.displayName || "Unknown reporter";
  }

  get created(): string {
    return this.data.fields?.created || "Unknown";
  }

  get updated(): string {
    return this.data.fields?.updated || "Unknown";
  }

  get description(): string {
    if (!this.data.fields?.description) {
      return "No description";
    }

    const desc = this.data.fields.description;
    if (typeof desc === 'string') {
      return desc;
    } else if (desc.content) {
      return this.extractTextFromADF(desc);
    }

    return "No description";
  }

  get subtasks(): Array<{ key: string; summary: string; status: string }> {
    if (!this.data.fields?.subtasks || this.data.fields.subtasks.length === 0) {
      return [];
    }

    return this.data.fields.subtasks.map(subtask => ({
      key: subtask.key || "Unknown key",
      summary: subtask.fields?.summary || "No summary",
      status: subtask.fields?.status?.name || "Unknown status"
    }));
  }

  get comments(): Array<{ author: string; body: string; created: string }> {
    if (!this.data.fields?.comment?.comments || this.data.fields.comment.comments.length === 0) {
      return [];
    }

    // Get latest 20 comments
    return this.data.fields.comment.comments
      .slice(-20)
      .map(comment => ({
        author: comment.author?.displayName || "Unknown author",
        body: typeof comment.body === 'string' 
          ? comment.body 
          : this.extractTextFromADF(comment.body),
        created: comment.created || "Unknown date"
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
    if (!adfContent || typeof adfContent !== 'object') {
      return String(adfContent || '');
    }

    let text = '';
    
    if (adfContent.type === 'text') {
      const textContent = adfContent.text || '';
      // Check if this text has link marks
      if (adfContent.marks && Array.isArray(adfContent.marks)) {
        const linkMark = adfContent.marks.find((mark: any) => mark.type === 'link');
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
        if (item.type === 'paragraph' || item.type === 'heading') {
          text += '\n';
        }
      }
    }
    
    return text;
  }
}
