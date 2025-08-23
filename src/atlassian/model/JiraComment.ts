import { JiraUser } from "./JiraUser.js";

/**
 * Jira Comment domain class
 * Represents comment information in Jira tickets
 */
export class JiraComment {
  private _author: JiraUser;
  private _body: string;
  private _created: string;

  constructor(
    data: {
      author?: {
        displayName?: string;
      };
      body?: any;
      created?: string;
    },
    extractTextFromADF: (adfContent: any) => string
  ) {
    this._author = new JiraUser(data.author || {});
    this._body = this.processBody(data.body, extractTextFromADF);
    this._created = data.created || "Unknown date";
  }

  get data(): {
    author?: {
      displayName?: string;
    };
    body?: any;
    created?: string;
  } {
    return {
      author: this._author.data,
      body: this._body,
      created: this._created
    };
  }

  get author(): JiraUser {
    return this._author;
  }

  get authorName(): string {
    return this._author.displayName;
  }

  get body(): string {
    return this._body;
  }

  get created(): string {
    return this._created;
  }

  get displayInfo(): string {
    return `${this._author.displayName} (${this._created}):\n${this._body}`;
  }

  get hasContent(): boolean {
    return this._body.trim().length > 0;
  }

  get shortBody(): string {
    const maxLength = 100;
    if (this._body.length <= maxLength) {
      return this._body;
    }
    return this._body.substring(0, maxLength) + "...";
  }

  private processBody(body: any, extractTextFromADF: (adfContent: any) => string): string {
    if (typeof body === "string") {
      return body;
    }
    return extractTextFromADF(body);
  }
}
