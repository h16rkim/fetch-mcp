import { ISlackAttachment } from "../SlackTypes.js";

export class SlackAttachment {
  private _data: ISlackAttachment;

  constructor(data: ISlackAttachment) {
    this._data = data;
  }

  get data(): ISlackAttachment {
    return this._data;
  }

  get id(): number | undefined {
    return this._data.id;
  }

  get color(): string | undefined {
    return this._data.color;
  }

  get fallback(): string | undefined {
    return this._data.fallback;
  }

  get title(): string | undefined {
    return this._data.title;
  }

  get titleLink(): string | undefined {
    return this._data.title_link;
  }

  get text(): string | undefined {
    return this._data.text;
  }

  get pretext(): string | undefined {
    return this._data.pretext;
  }

  get imageUrl(): string | undefined {
    return this._data.image_url;
  }

  get thumbUrl(): string | undefined {
    return this._data.thumb_url;
  }

  get fromUrl(): string | undefined {
    return this._data.from_url;
  }

  get serviceName(): string | undefined {
    return this._data.service_name;
  }

  get serviceIcon(): string | undefined {
    return this._data.service_icon;
  }

  get authorName(): string | undefined {
    return this._data.author_name;
  }

  get authorLink(): string | undefined {
    return this._data.author_link;
  }

  get authorIcon(): string | undefined {
    return this._data.author_icon;
  }

  get fields(): Array<{ title: string; value: string; short?: boolean }> {
    return this._data.fields || [];
  }

  get hasFields(): boolean {
    return this.fields.length > 0;
  }

  get hasTitle(): boolean {
    return Boolean(this.title);
  }

  get hasText(): boolean {
    return Boolean(this.text);
  }

  get hasImage(): boolean {
    return Boolean(this.imageUrl);
  }

  get hasAuthor(): boolean {
    return Boolean(this.authorName);
  }

  getFormattedFields(): Array<{ title: string; value: string }> {
    return this.fields.map(field => ({
      title: field.title,
      value: field.value
    }));
  }
}
