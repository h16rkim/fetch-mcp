import { IRequestPayload } from "./types.js";

/**
 * RequestPayload Model Class
 * Encapsulates request payload data and provides business logic for web content fetching
 */
export class RequestPayload {
  private _url: string;
  private _headers?: Record<string, string>;
  private _maxLength?: number;
  private _startIndex?: number;

  constructor(data: IRequestPayload) {
    this._url = data.url;
    this._headers = data.headers;
    this._maxLength = data.max_length;
    this._startIndex = data.start_index;
  }

  get data(): IRequestPayload {
    return {
      url: this._url,
      headers: this._headers,
      max_length: this._maxLength,
      start_index: this._startIndex
    };
  }

  get url(): string {
    return this._url;
  }

  get headers(): Record<string, string> | undefined {
    return this._headers;
  }

  get maxLength(): number | undefined {
    return this._maxLength;
  }

  get startIndex(): number | undefined {
    return this._startIndex;
  }

  get hasHeaders(): boolean {
    return this._headers !== undefined && Object.keys(this._headers).length > 0;
  }

  get hasMaxLength(): boolean {
    return this._maxLength !== undefined;
  }

  get hasStartIndex(): boolean {
    return this._startIndex !== undefined;
  }

  /**
   * Get effective max length with default fallback
   */
  getEffectiveMaxLength(defaultMaxLength: number): number {
    return this._maxLength ?? defaultMaxLength;
  }

  /**
   * Get effective start index with default fallback
   */
  getEffectiveStartIndex(defaultStartIndex: number): number {
    return this._startIndex ?? defaultStartIndex;
  }

  /**
   * Get headers with default empty object fallback
   */
  getEffectiveHeaders(): Record<string, string> {
    return this._headers ?? {};
  }

  /**
   * Check if URL is valid
   */
  get isValidUrl(): boolean {
    try {
      new URL(this._url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get URL protocol
   */
  get protocol(): string {
    try {
      return new URL(this._url).protocol;
    } catch {
      return "";
    }
  }

  /**
   * Check if URL uses HTTPS
   */
  get isHttps(): boolean {
    return this.protocol === "https:";
  }

  /**
   * Get URL hostname
   */
  get hostname(): string {
    try {
      return new URL(this._url).hostname;
    } catch {
      return "";
    }
  }

  /**
   * Create a summary of the request payload
   */
  getSummary(): {
    url: string;
    hasHeaders: boolean;
    hasMaxLength: boolean;
    hasStartIndex: boolean;
    isValidUrl: boolean;
    isHttps: boolean;
    hostname: string;
  } {
    return {
      url: this._url,
      hasHeaders: this.hasHeaders,
      hasMaxLength: this.hasMaxLength,
      hasStartIndex: this.hasStartIndex,
      isValidUrl: this.isValidUrl,
      isHttps: this.isHttps,
      hostname: this.hostname
    };
  }
}
