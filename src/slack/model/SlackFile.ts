import { ISlackFile } from "../SlackTypes.js";

export class SlackFile {
  private _id: string;
  private _name?: string;
  private _title?: string;
  private _mimetype?: string;
  private _filetype?: string;
  private _prettyType?: string;
  private _user?: string;
  private _size?: number;
  private _urlPrivate?: string;
  private _urlPrivateDownload?: string;
  private _permalink?: string;
  private _permalinkPublic?: string;

  constructor(data: ISlackFile) {
    this._id = data.id;
    this._name = data.name;
    this._title = data.title;
    this._mimetype = data.mimetype;
    this._filetype = data.filetype;
    this._prettyType = data.pretty_type;
    this._user = data.user;
    this._size = data.size;
    this._urlPrivate = data.url_private;
    this._urlPrivateDownload = data.url_private_download;
    this._permalink = data.permalink;
    this._permalinkPublic = data.permalink_public;
  }

  get data(): ISlackFile {
    return {
      id: this._id,
      name: this._name,
      title: this._title,
      mimetype: this._mimetype,
      filetype: this._filetype,
      pretty_type: this._prettyType,
      user: this._user,
      size: this._size,
      url_private: this._urlPrivate,
      url_private_download: this._urlPrivateDownload,
      permalink: this._permalink,
      permalink_public: this._permalinkPublic
    };
  }

  get id(): string {
    return this._id;
  }

  get name(): string | undefined {
    return this._name;
  }

  get title(): string | undefined {
    return this._title;
  }

  get displayName(): string {
    return this._name || this._title || "Unnamed file";
  }

  get mimetype(): string | undefined {
    return this._mimetype;
  }

  get filetype(): string | undefined {
    return this._filetype;
  }

  get prettyType(): string | undefined {
    return this._prettyType;
  }

  get user(): string | undefined {
    return this._user;
  }

  get size(): number | undefined {
    return this._size;
  }

  get sizeInKB(): number | undefined {
    return this._size ? Math.round(this._size / 1024) : undefined;
  }

  get urlPrivate(): string | undefined {
    return this._urlPrivate;
  }

  get urlPrivateDownload(): string | undefined {
    return this._urlPrivateDownload;
  }

  get permalink(): string | undefined {
    return this._permalink;
  }

  get permalinkPublic(): string | undefined {
    return this._permalinkPublic;
  }

  get hasSize(): boolean {
    return Boolean(this._size);
  }

  get hasMimetype(): boolean {
    return Boolean(this._mimetype);
  }

  get hasPermalink(): boolean {
    return Boolean(this._permalink);
  }

  get formattedFileInfo(): string {
    let fileInfo = this.displayName;
    if (this._mimetype) fileInfo += ` (${this._mimetype})`;
    if (this._size) fileInfo += ` - ${this.sizeInKB}KB`;
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
      url: this._permalink,
    };
  }
}
