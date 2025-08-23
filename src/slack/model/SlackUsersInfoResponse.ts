import { ISlackUsersInfoResponse, ISlackUser } from "../SlackTypes.js";
import { SlackUser } from "./SlackUser.js";

export class SlackUsersInfoResponse {
  private _ok: boolean;
  private _user?: SlackUser;
  private _error?: string;

  constructor(data: ISlackUsersInfoResponse) {
    this._ok = data.ok;
    this._user = data.user ? new SlackUser(data.user) : undefined;
    this._error = data.error;
  }

  get data(): ISlackUsersInfoResponse {
    return {
      ok: this._ok,
      user: this._user?.data,
      error: this._error
    };
  }

  get ok(): boolean {
    return this._ok;
  }

  get user(): SlackUser | undefined {
    return this._user;
  }

  get error(): string | undefined {
    return this._error;
  }

  get hasUser(): boolean {
    return Boolean(this._user);
  }

  get isSuccess(): boolean {
    return this._ok && !this._error && this.hasUser;
  }
}
