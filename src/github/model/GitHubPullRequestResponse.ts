import { IGitHubPullRequestResponse } from "../GitHubTypes.js";
import { GitHubPullRequest } from "./GitHubPullRequest.js";

export class GitHubPullRequestResponse {
  private _data: IGitHubPullRequestResponse;

  constructor(data: IGitHubPullRequestResponse) {
    this._data = data;
  }

  get ok(): boolean {
    return this._data.ok;
  }

  get pullRequest(): GitHubPullRequest | undefined {
    if (!this._data.data) {
      return undefined;
    }
    return new GitHubPullRequest(this._data.data);
  }

  get error(): string | undefined {
    return this._data.error;
  }

  get hasPullRequest(): boolean {
    return Boolean(this.pullRequest);
  }

  get isSuccess(): boolean {
    return this.ok && !this.error && this.hasPullRequest;
  }
}
