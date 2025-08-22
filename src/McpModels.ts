/**
 * MCP (Model Context Protocol) Models
 */

import { IMcpResult } from "./types.js";

export class McpResult {
  private content: Array<{ type: "text"; text: string }>;
  private isError: boolean;

  constructor(content: Array<{ type: "text"; text: string }>, isError: boolean = false) {
    this.content = content;
    this.isError = isError;
  }

  /**
   * Create a successful result
   */
  static success(text: string): McpResult {
    return new McpResult([{ type: "text", text }], false);
  }

  /**
   * Create an error result
   */
  static error(message: string): McpResult {
    return new McpResult([{ type: "text", text: `Error: ${message}` }], true);
  }

  /**
   * Get content array
   */
  get resultContent(): Array<{ type: "text"; text: string }> {
    return this.content;
  }

  /**
   * Get error status
   */
  get hasError(): boolean {
    return this.isError;
  }

  /**
   * Get text content (first item)
   */
  get text(): string {
    return this.content.length > 0 ? this.content[0].text : "";
  }

  /**
   * Add content to the result
   */
  addContent(text: string): McpResult {
    this.content.push({ type: "text", text });
    return this;
  }

  /**
   * Convert to IMcpResult interface
   */
  toJson() {
    return {
      content: this.content,
      isError: this.isError
    } satisfies IMcpResult;
  }

  /**
   * Check if result is successful
   */
  isSuccess(): boolean {
    return !this.isError;
  }

  /**
   * Get result summary
   */
  getSummary(): {
    contentCount: number;
    isError: boolean;
    totalLength: number;
  } {
    const totalLength = this.content.reduce((sum, item) => sum + item.text.length, 0);
    
    return {
      contentCount: this.content.length,
      isError: this.isError,
      totalLength
    };
  }
}
