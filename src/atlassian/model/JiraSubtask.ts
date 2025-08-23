import { JiraStatus } from "./JiraStatus.js";

/**
 * Jira Subtask domain class
 * Represents subtask information in Jira tickets
 */
export class JiraSubtask {
  private _key: string;
  private _summary: string;
  private _status: JiraStatus;

  constructor(data: {
    key?: string;
    fields?: {
      summary?: string;
      status?: {
        name?: string;
      };
    };
  }) {
    this._key = data.key || "Unknown key";
    this._summary = data.fields?.summary || "No summary";
    this._status = new JiraStatus(data.fields?.status || {});
  }

  get data(): {
    key?: string;
    fields?: {
      summary?: string;
      status?: {
        name?: string;
      };
    };
  } {
    return {
      key: this._key,
      fields: {
        summary: this._summary,
        status: this._status.data
      }
    };
  }

  get key(): string {
    return this._key;
  }

  get summary(): string {
    return this._summary;
  }

  get status(): JiraStatus {
    return this._status;
  }

  get statusName(): string {
    return this._status.name;
  }

  get displayInfo(): string {
    return `${this._key}: ${this._summary} (${this._status.name})`;
  }

  get isCompleted(): boolean {
    return this._status.isClosed;
  }

  get isInProgress(): boolean {
    return this._status.isOpen;
  }
}
