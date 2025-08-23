import { ResponseBuilder } from "../ResponseBuilder.js";
import { ConfluencePage } from "./model/ConfluencePage.js";

/**
 * Confluence service specific response builder
 * Uses ResponseBuilder to generate formatted response strings for Confluence entities
 */
export class ConfluenceResponseBuilder {
  private _responseBuilder: ResponseBuilder;

  constructor() {
    this._responseBuilder = new ResponseBuilder();
  }

  /**
   * Get the underlying ResponseBuilder instance
   */
  get responseBuilder(): ResponseBuilder {
    return this._responseBuilder;
  }

  /**
   * Generate comprehensive Confluence page summary
   */
  generateConfluencePageSummary(
    page: ConfluencePage,
    url: string,
    normalizedText: string,
    maxLength?: number
  ): string {
    this._responseBuilder.clear();

    // Basic page info
    this._responseBuilder
      .addField("Title", page.title)
      .addField("Space", `${page.spaceKey} (${page.spaceName})`)
      .addField("Author", page.authorName)
      .addField("URL", url)
      .addSection("Content", normalizedText);

    return this._responseBuilder.build(maxLength);
  }

  /**
   * Clear the internal ResponseBuilder state
   */
  clear(): ConfluenceResponseBuilder {
    this._responseBuilder.clear();
    return this;
  }

  /**
   * Get the current length of the built string
   */
  getLength(): number {
    return this._responseBuilder.getLength();
  }
}
