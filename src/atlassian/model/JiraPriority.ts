/**
 * Jira Priority domain class
 * Represents priority information in Jira tickets
 */
export class JiraPriority {
  private _name: string;

  constructor(data: { name?: string }) {
    this._name = data.name || "Unknown priority";
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
    return this._name === "Unknown priority";
  }

  get isHigh(): boolean {
    const highPriorities = ["Highest", "High", "Critical", "Blocker"];
    return highPriorities.includes(this._name);
  }

  get isLow(): boolean {
    const lowPriorities = ["Lowest", "Low", "Trivial"];
    return lowPriorities.includes(this._name);
  }

  get isMedium(): boolean {
    return this._name === "Medium" || this._name === "Normal";
  }
}
