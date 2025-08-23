import { IConfluenceApiResponse } from "../AtlassianTypes.js";
import { ConfluenceSpace } from "./ConfluenceSpace.js";
import { ConfluenceVersion } from "./ConfluenceVersion.js";
import { ConfluenceBody } from "./ConfluenceBody.js";

export class ConfluencePage {
  private _title: string;
  private _space?: ConfluenceSpace;
  private _version?: ConfluenceVersion;
  private _body?: ConfluenceBody;

  constructor(data: IConfluenceApiResponse) {
    this._title = data.title || "No title";
    this._space = data.space ? new ConfluenceSpace(data.space) : undefined;
    this._version = data.version ? new ConfluenceVersion(data.version) : undefined;
    this._body = data.body ? new ConfluenceBody(data.body) : undefined;
  }

  get data(): IConfluenceApiResponse {
    return {
      title: this._title,
      space: this._space?.data,
      version: this._version?.data,
      body: this._body?.data
    };
  }

  get title(): string {
    return this._title;
  }

  get space(): ConfluenceSpace | undefined {
    return this._space;
  }

  get version(): ConfluenceVersion | undefined {
    return this._version;
  }

  get body(): ConfluenceBody | undefined {
    return this._body;
  }

  get spaceKey(): string {
    return this._space?.key || "Unknown space";
  }

  get spaceName(): string {
    return this._space?.name || "Unknown space name";
  }

  get authorName(): string {
    return this._version?.authorName || "Unknown author";
  }

  get htmlContent(): string {
    return this._body?.htmlContent || "No content";
  }

  get hasSpace(): boolean {
    return Boolean(this._space);
  }

  get hasVersion(): boolean {
    return Boolean(this._version);
  }

  get hasBody(): boolean {
    return Boolean(this._body);
  }

  get hasContent(): boolean {
    return this._body?.hasContent || false;
  }

  get contentLength(): number {
    return this._body?.contentLength || 0;
  }

  get shortContent(): string {
    return this._body?.shortContent || "No content";
  }

  get pageInfo(): {
    title: string;
    space: string;
    author: string;
    hasContent: boolean;
    contentLength: number;
  } {
    return {
      title: this._title,
      space: this._space?.displayInfo || "Unknown space",
      author: this.authorName,
      hasContent: this.hasContent,
      contentLength: this.contentLength,
    };
  }
}
