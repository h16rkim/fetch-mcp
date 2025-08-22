import { ISlackFile } from "../SlackTypes.js";

export class SlackFile {
  private _data: ISlackFile;

  constructor(data: ISlackFile) {
    this._data = data;
  }

  get data(): ISlackFile {
    return this._data;
  }

  get id(): string {
    return this._data.id;
  }

  get name(): string | undefined {
    return this._data.name;
  }

  get title(): string | undefined {
    return this._data.title;
  }

  get displayName(): string {
    return this.name || this.title || 'Unnamed file';
  }

  get mimetype(): string | undefined {
    return this._data.mimetype;
  }

  get filetype(): string | undefined {
    return this._data.filetype;
  }

  get prettyType(): string | undefined {
    return this._data.pretty_type;
  }

  get user(): string | undefined {
    return this._data.user;
  }

  get size(): number | undefined {
    return this._data.size;
  }

  get sizeInKB(): number | undefined {
    return this.size ? Math.round(this.size / 1024) : undefined;
  }

  get urlPrivate(): string | undefined {
    return this._data.url_private;
  }

  get urlPrivateDownload(): string | undefined {
    return this._data.url_private_download;
  }

  get permalink(): string | undefined {
    return this._data.permalink;
  }

  get permalinkPublic(): string | undefined {
    return this._data.permalink_public;
  }

  get hasSize(): boolean {
    return Boolean(this.size);
  }

  get hasMimetype(): boolean {
    return Boolean(this.mimetype);
  }

  get hasPermalink(): boolean {
    return Boolean(this.permalink);
  }

  get formattedFileInfo(): string {
    let fileInfo = this.displayName;
    if (this.mimetype) fileInfo += ` (${this.mimetype})`;
    if (this.size) fileInfo += ` - ${this.sizeInKB}KB`;
    return fileInfo;
  }

  getFileDetails(): {
    name: string;
    info: string;
    url?: string;
  } {
    return {
      name: this.displayName,
      info: this.formattedFileInfo,
      url: this.permalink
    };
  }
}
