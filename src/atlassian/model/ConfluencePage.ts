import { IConfluenceApiResponse } from "../AtlassianTypes.js";

export class ConfluencePage {
  private _data: IConfluenceApiResponse;

  constructor(data: IConfluenceApiResponse) {
    this._data = data;
  }

  get data(): IConfluenceApiResponse {
    return this._data;
  }

  get title(): string {
    return this._data.title || "No title";
  }

  get spaceKey(): string {
    return this._data.space?.key || "Unknown space";
  }

  get spaceName(): string {
    return this._data.space?.name || "Unknown space name";
  }

  get authorName(): string {
    return this._data.version?.by?.publicName || "Unknown author";
  }

  get htmlContent(): string {
    return this._data.body?.export_view?.value || "No content";
  }
}
