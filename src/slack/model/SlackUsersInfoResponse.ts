import { ISlackUsersInfoResponse } from "../SlackTypes.js";
import { SlackUser } from "./SlackUser.js";

export class SlackUsersInfoResponse {
  private data: ISlackUsersInfoResponse;

  constructor(data: ISlackUsersInfoResponse) {
    this.data = data;
  }

  get ok(): boolean {
    return this.data.ok;
  }

  get user(): SlackUser | undefined {
    if (!this.data.user) {
      return undefined;
    }
    return new SlackUser(this.data.user);
  }

  get error(): string | undefined {
    return this.data.error;
  }

  get hasUser(): boolean {
    return Boolean(this.user);
  }

  get isSuccess(): boolean {
    return this.ok && !this.error && this.hasUser;
  }
}
