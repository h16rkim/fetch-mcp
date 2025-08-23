import { ConfluenceAuthor } from "./ConfluenceAuthor.js";

export class ConfluenceVersion {
  private _by?: ConfluenceAuthor;

  constructor(data: { by?: { publicName?: string } }) {
    this._by = data.by ? new ConfluenceAuthor(data.by) : undefined;
  }

  get data(): { by?: { publicName?: string } } {
    return {
      by: this._by?.data
    };
  }

  get by(): ConfluenceAuthor | undefined {
    return this._by;
  }

  get authorName(): string {
    return this._by?.publicName || "Unknown author";
  }

  get hasAuthor(): boolean {
    return Boolean(this._by);
  }
}
