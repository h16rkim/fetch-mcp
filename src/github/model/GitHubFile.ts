import { IGitHubFile } from "../GitHubTypes.js";

export class GitHubFile {
  private _data: IGitHubFile;

  constructor(data: IGitHubFile) {
    this._data = data;
  }

  get data(): IGitHubFile {
    return this._data;
  }

  get sha(): string {
    return this._data.sha;
  }

  get filename(): string {
    return this._data.filename;
  }

  get status(): string {
    return this._data.status;
  }

  get additions(): number {
    return this._data.additions;
  }

  get deletions(): number {
    return this._data.deletions;
  }

  get changes(): number {
    return this._data.changes;
  }

  get blobUrl(): string {
    return this._data.blob_url;
  }

  get rawUrl(): string {
    return this._data.raw_url;
  }

  get contentsUrl(): string {
    return this._data.contents_url;
  }

  get patch(): string | undefined {
    return this._data.patch;
  }

  get previousFilename(): string | undefined {
    return this._data.previous_filename;
  }

  get isRenamed(): boolean {
    return this.status === "renamed" && Boolean(this.previousFilename);
  }

  get changesSummary(): string {
    const parts = [];
    
    if (this.additions > 0) {
      parts.push(`+${this.additions}`);
    }
    
    if (this.deletions > 0) {
      parts.push(`-${this.deletions}`);
    }
    
    return parts.join(" ");
  }

  get statusIcon(): string {
    switch (this.status) {
      case "added":
        return "➕";
      case "removed":
        return "➖";
      case "modified":
        return "📝";
      case "renamed":
        return "📄";
      case "copied":
        return "📋";
      default:
        return "📄";
    }
  }

  get displayInfo(): string {
    const parts = [this.statusIcon, this.filename];
    
    if (this.isRenamed) {
      parts.push(`(renamed from ${this.previousFilename})`);
    }
    
    const changesSummary = this.changesSummary;
    if (changesSummary) {
      parts.push(`[${changesSummary}]`);
    }
    
    return parts.join(" ");
  }
}
