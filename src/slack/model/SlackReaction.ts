import { ISlackReaction } from "../SlackTypes.js";

export class SlackReaction {
  private _name: string;
  private _count: number;
  private _users: string[];

  constructor(data: ISlackReaction) {
    this._name = data.name || "unknown";
    this._count = data.count || 0;
    this._users = data.users || [];
  }

  get data(): ISlackReaction {
    return {
      name: this._name,
      count: this._count,
      users: this._users
    };
  }

  get name(): string {
    return this._name;
  }

  get count(): number {
    return this._count;
  }

  get users(): string[] {
    return this._users;
  }

  get userCount(): number {
    return this._users.length;
  }

  get formattedReaction(): string {
    return `${this._name}: ${this._count}`;
  }

  get hasUsers(): boolean {
    return this._users.length > 0;
  }
}
