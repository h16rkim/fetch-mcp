import { ISlackReaction } from "../SlackTypes.js";

export class SlackReaction {
  private _data: ISlackReaction;

  constructor(data: ISlackReaction) {
    this._data = data;
  }

  get data(): ISlackReaction {
    return this._data;
  }

  get name(): string {
    return this._data.name || "unknown";
  }

  get count(): number {
    return this._data.count || 0;
  }

  get users(): string[] {
    return this._data.users || [];
  }

  get userCount(): number {
    return this.users.length;
  }

  get formattedReaction(): string {
    return `${this.name}: ${this.count}`;
  }

  get hasUsers(): boolean {
    return this.users.length > 0;
  }
}
