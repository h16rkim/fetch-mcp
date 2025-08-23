export class ConfluenceAuthor {
  private _publicName: string;

  constructor(data: { publicName?: string }) {
    this._publicName = data.publicName || "Unknown author";
  }

  get data(): { publicName?: string } {
    return {
      publicName: this._publicName
    };
  }

  get publicName(): string {
    return this._publicName;
  }

  get displayName(): string {
    return this._publicName;
  }
}
