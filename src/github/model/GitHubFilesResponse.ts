import { IGitHubFilesResponse } from "../GitHubTypes.js";
import { GitHubFile } from "./GitHubFile.js";

export class GitHubFilesResponse {
  private _data: IGitHubFilesResponse;

  constructor(data: IGitHubFilesResponse) {
    this._data = data;
  }

  get ok(): boolean {
    return this._data.ok;
  }

  get files(): GitHubFile[] {
    if (!this._data.data) {
      return [];
    }
    return this._data.data.map(file => new GitHubFile(file));
  }

  get error(): string | undefined {
    return this._data.error;
  }

  get hasFiles(): boolean {
    return this.files.length > 0;
  }

  get isSuccess(): boolean {
    return this.ok && !this.error;
  }

  get fileCount(): number {
    return this.files.length;
  }

  get addedFiles(): GitHubFile[] {
    return this.files.filter(file => file.status === "added");
  }

  get modifiedFiles(): GitHubFile[] {
    return this.files.filter(file => file.status === "modified");
  }

  get deletedFiles(): GitHubFile[] {
    return this.files.filter(file => file.status === "removed");
  }

  get renamedFiles(): GitHubFile[] {
    return this.files.filter(file => file.status === "renamed");
  }

  get totalAdditions(): number {
    return this.files.reduce((sum, file) => sum + file.additions, 0);
  }

  get totalDeletions(): number {
    return this.files.reduce((sum, file) => sum + file.deletions, 0);
  }

  get totalChanges(): number {
    return this.files.reduce((sum, file) => sum + file.changes, 0);
  }
}
