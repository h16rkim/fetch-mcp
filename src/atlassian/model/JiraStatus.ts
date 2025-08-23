/**
 * Jira Status domain class
 * Represents status information in Jira tickets
 */
export class JiraStatus {
  private _name: string;

  constructor(data: { name?: string }) {
    this._name = data.name || "Unknown status";
  }

  get data(): { name?: string } {
    return {
      name: this._name
    };
  }

  get name(): string {
    return this._name;
  }

  get isUnknown(): boolean {
    return this._name === "Unknown status";
  }

  get isOpen(): boolean {
    const openStatuses = ["Open", "In Progress", "Reopened", "To Do"];
    return openStatuses.includes(this._name);
  }

  get isClosed(): boolean {
    const closedStatuses = ["Closed", "Resolved", "Done"];
    return closedStatuses.includes(this._name);
  }
}
