/**
 * Jira User domain class
 * Represents user information in Jira (assignee, reporter, comment author, etc.)
 */
export class JiraUser {
  private _displayName: string;

  constructor(data: { displayName?: string }) {
    this._displayName = data.displayName || "Unknown User";
  }

  get data(): { displayName?: string } {
    return {
      displayName: this._displayName
    };
  }

  get displayName(): string {
    return this._displayName;
  }

  get isUnknown(): boolean {
    return this._displayName === "Unknown User";
  }
}
