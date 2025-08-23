export class ConfluenceSpace {
  private _key: string;
  private _name: string;

  constructor(data: { key?: string; name?: string }) {
    this._key = data.key || "Unknown space";
    this._name = data.name || "Unknown space name";
  }

  get data(): { key?: string; name?: string } {
    return {
      key: this._key,
      name: this._name
    };
  }

  get key(): string {
    return this._key;
  }

  get name(): string {
    return this._name;
  }

  get displayInfo(): string {
    return `${this._name} (${this._key})`;
  }
}
