/**
 * Jira Issue Type domain class
 * Represents issue type information in Jira tickets
 */
export class JiraIssueType {
  private _name: string;

  constructor(data: { name?: string }) {
    this._name = data.name || "Unknown type";
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
    return this._name === "Unknown type";
  }

  get isBug(): boolean {
    const bugTypes = ["Bug", "Defect", "Error"];
    return bugTypes.includes(this._name);
  }

  get isStory(): boolean {
    const storyTypes = ["Story", "User Story", "Feature"];
    return storyTypes.includes(this._name);
  }

  get isTask(): boolean {
    const taskTypes = ["Task", "Sub-task", "Improvement"];
    return taskTypes.includes(this._name);
  }

  get isEpic(): boolean {
    return this._name === "Epic";
  }
}
