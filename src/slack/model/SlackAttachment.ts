import { ISlackAttachment } from "../SlackTypes.js";

export class SlackAttachment {
  private _id?: number;
  private _color?: string;
  private _fallback?: string;
  private _title?: string;
  private _titleLink?: string;
  private _text?: string;
  private _pretext?: string;
  private _imageUrl?: string;
  private _thumbUrl?: string;
  private _fromUrl?: string;
  private _serviceName?: string;
  private _serviceIcon?: string;
  private _authorName?: string;
  private _authorLink?: string;
  private _authorIcon?: string;
  private _fields: Array<{ title: string; value: string; short?: boolean }>;

  constructor(data: ISlackAttachment) {
    this._id = data.id;
    this._color = data.color;
    this._fallback = data.fallback;
    this._title = data.title;
    this._titleLink = data.title_link;
    this._text = data.text;
    this._pretext = data.pretext;
    this._imageUrl = data.image_url;
    this._thumbUrl = data.thumb_url;
    this._fromUrl = data.from_url;
    this._serviceName = data.service_name;
    this._serviceIcon = data.service_icon;
    this._authorName = data.author_name;
    this._authorLink = data.author_link;
    this._authorIcon = data.author_icon;
    this._fields = data.fields || [];
  }

  get data(): ISlackAttachment {
    return {
      id: this._id,
      color: this._color,
      fallback: this._fallback,
      title: this._title,
      title_link: this._titleLink,
      text: this._text,
      pretext: this._pretext,
      image_url: this._imageUrl,
      thumb_url: this._thumbUrl,
      from_url: this._fromUrl,
      service_name: this._serviceName,
      service_icon: this._serviceIcon,
      author_name: this._authorName,
      author_link: this._authorLink,
      author_icon: this._authorIcon,
      fields: this._fields
    };
  }

  get id(): number | undefined {
    return this._id;
  }

  get color(): string | undefined {
    return this._color;
  }

  get fallback(): string | undefined {
    return this._fallback;
  }

  get title(): string | undefined {
    return this._title;
  }

  get titleLink(): string | undefined {
    return this._titleLink;
  }

  get text(): string | undefined {
    return this._text;
  }

  get pretext(): string | undefined {
    return this._pretext;
  }

  get imageUrl(): string | undefined {
    return this._imageUrl;
  }

  get thumbUrl(): string | undefined {
    return this._thumbUrl;
  }

  get fromUrl(): string | undefined {
    return this._fromUrl;
  }

  get serviceName(): string | undefined {
    return this._serviceName;
  }

  get serviceIcon(): string | undefined {
    return this._serviceIcon;
  }

  get authorName(): string | undefined {
    return this._authorName;
  }

  get authorLink(): string | undefined {
    return this._authorLink;
  }

  get authorIcon(): string | undefined {
    return this._authorIcon;
  }

  get fields(): Array<{ title: string; value: string; short?: boolean }> {
    return this._fields;
  }

  get hasFields(): boolean {
    return this._fields.length > 0;
  }

  get hasTitle(): boolean {
    return Boolean(this._title);
  }

  get hasText(): boolean {
    return Boolean(this._text);
  }

  get hasImage(): boolean {
    return Boolean(this._imageUrl);
  }

  get hasAuthor(): boolean {
    return Boolean(this._authorName);
  }

  getFormattedFields(): Array<{ title: string; value: string }> {
    return this._fields.map(field => ({
      title: field.title,
      value: field.value,
    }));
  }
}
