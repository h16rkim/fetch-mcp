import { IGitHubFile } from "../GitHubTypes.js";

export class GitHubFile {
  private _sha: string;
  private _filename: string;
  private _status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
  private _additions: number;
  private _deletions: number;
  private _changes: number;
  private _blobUrl: string;
  private _rawUrl: string;
  private _contentsUrl: string;
  private _patch?: string;
  private _previousFilename?: string;

  constructor(data: IGitHubFile) {
    this._sha = data.sha;
    this._filename = data.filename;
    this._status = data.status;
    this._additions = data.additions;
    this._deletions = data.deletions;
    this._changes = data.changes;
    this._blobUrl = data.blob_url;
    this._rawUrl = data.raw_url;
    this._contentsUrl = data.contents_url;
    this._patch = data.patch;
    this._previousFilename = data.previous_filename;
  }

  get data(): IGitHubFile {
    return {
      sha: this._sha,
      filename: this._filename,
      status: this._status,
      additions: this._additions,
      deletions: this._deletions,
      changes: this._changes,
      blob_url: this._blobUrl,
      raw_url: this._rawUrl,
      contents_url: this._contentsUrl,
      patch: this._patch,
      previous_filename: this._previousFilename
    };
  }

  get sha(): string {
    return this._sha;
  }

  get filename(): string {
    return this._filename;
  }

  get status(): "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged" {
    return this._status;
  }

  get additions(): number {
    return this._additions;
  }

  get deletions(): number {
    return this._deletions;
  }

  get changes(): number {
    return this._changes;
  }

  get blobUrl(): string {
    return this._blobUrl;
  }

  get rawUrl(): string {
    return this._rawUrl;
  }

  get contentsUrl(): string {
    return this._contentsUrl;
  }

  get patch(): string | undefined {
    return this._patch;
  }

  get previousFilename(): string | undefined {
    return this._previousFilename;
  }

  get isRenamed(): boolean {
    return this._status === "renamed" && Boolean(this._previousFilename);
  }

  get changesSummary(): string {
    const parts = [];
    
    if (this._additions > 0) {
      parts.push(`+${this._additions}`);
    }
    
    if (this._deletions > 0) {
      parts.push(`-${this._deletions}`);
    }
    
    return parts.join(" ");
  }

  get statusIcon(): string {
    switch (this._status) {
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
    const parts = [this.statusIcon, this._filename];
    
    if (this.isRenamed) {
      parts.push(`(renamed from ${this._previousFilename})`);
    }
    
    const changesSummary = this.changesSummary;
    if (changesSummary) {
      parts.push(`[${changesSummary}]`);
    }
    
    return parts.join(" ");
  }
}
