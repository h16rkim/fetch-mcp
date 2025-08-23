export class ConfluenceExportView {
  private _value: string;

  constructor(data: { value?: string }) {
    this._value = data.value || "No content";
  }

  get data(): { value?: string } {
    return {
      value: this._value
    };
  }

  get value(): string {
    return this._value;
  }

  get htmlContent(): string {
    return this._value;
  }

  get hasContent(): boolean {
    return this._value !== "No content" && this._value.trim().length > 0;
  }

  get contentLength(): number {
    return this._value.length;
  }

  get shortContent(): string {
    const maxLength = 200;
    if (this._value.length <= maxLength) {
      return this._value;
    }
    return this._value.substring(0, maxLength) + "...";
  }
}
