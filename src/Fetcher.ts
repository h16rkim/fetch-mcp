import { JSDOM } from "jsdom";
import is_ip_private from "private-ip";
import { RequestPayload } from "./types.js";

interface FetchResult {
  content: Array<{ type: "text"; text: string }>;
  isError: boolean;
}

export class Fetcher {
  private static readonly DEFAULT_MAX_LENGTH = 5000;
  private static readonly DEFAULT_START_INDEX = 0;

  /**
   * Apply length limits to text content
   */
  private static applyLengthLimits(
    text: string, 
    maxLength: number, 
    startIndex: number
  ): string {
    if (startIndex >= text.length) {
      return "";
    }
    
    const endIndex = Math.min(startIndex + maxLength, text.length);
    return text.substring(startIndex, endIndex);
  }

  /**
   * Validate URL and perform HTTP request
   */
  private static async performHttpRequest(requestPayload: RequestPayload): Promise<Response> {
    const { url, headers } = requestPayload;

    // Security check for private IPs
    if (is_ip_private(url)) {
      throw new Error(
        `Fetcher blocked an attempt to fetch a private IP ${url}. ` +
        `This is to prevent a security vulnerability where a local MCP could ` +
        `fetch privileged local IPs and exfiltrate data.`
      );
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
        "Cache-Control" : "no-cache",
        "Connection": "close",
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return response;
  }

  /**
   * Process response as plain text (HTML with scripts/styles removed)
   */
  private static async processAsText(
    requestPayload: RequestPayload, 
    response: Response
  ): Promise<FetchResult> {
    const htmlContent = await response.text();
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Remove scripts and styles for clean text extraction
    this.removeElementsByTagName(document, "script");
    this.removeElementsByTagName(document, "style");

    const rawText = document.body.textContent || "";
    const normalizedText = rawText.replace(/\s+/g, " ").trim();
    
    const processedText = this.applyLengthLimits(
      normalizedText,
      requestPayload.max_length ?? this.DEFAULT_MAX_LENGTH,
      requestPayload.start_index ?? this.DEFAULT_START_INDEX
    );

    return {
      content: [{ type: "text", text: processedText }],
      isError: false,
    };
  }

  /**
   * Process response as JSON
   */
  private static async processAsJson(
    requestPayload: RequestPayload, 
    response: Response
  ): Promise<FetchResult> {
    const jsonData = await response.json();
    const jsonString = JSON.stringify(jsonData);
    
    const processedJson = this.applyLengthLimits(
      jsonString,
      requestPayload.max_length ?? this.DEFAULT_MAX_LENGTH,
      requestPayload.start_index ?? this.DEFAULT_START_INDEX
    );
    
    return {
      content: [{ type: "text", text: processedJson }],
      isError: false,
    };
  }

  /**
   * Process response as raw HTML
   */
  private static async processAsHtml(
    requestPayload: RequestPayload, 
    response: Response
  ): Promise<FetchResult> {
    const htmlContent = await response.text();
    
    const processedHtml = this.applyLengthLimits(
      htmlContent,
      requestPayload.max_length ?? this.DEFAULT_MAX_LENGTH,
      requestPayload.start_index ?? this.DEFAULT_START_INDEX
    );
    
    return {
      content: [{ type: "text", text: processedHtml }],
      isError: false,
    };
  }

  /**
   * Helper method to remove elements by tag name
   */
  private static removeElementsByTagName(document: Document, tagName: string): void {
    const elements = document.getElementsByTagName(tagName);
    Array.from(elements).forEach(element => element.remove());
  }

  /**
   * Try to process response in a specific format, return null if it fails
   */
  private static async tryProcessFormat(
    processor: (payload: RequestPayload, response: Response) => Promise<FetchResult>,
    requestPayload: RequestPayload,
    response: Response
  ): Promise<FetchResult | null> {
    try {
      return await processor(requestPayload, response);
    } catch {
      return null;
    }
  }

  /**
   * Create error result
   */
  private static createErrorResult(url: string, error: Error): FetchResult {
    return {
      content: [{ 
        type: "text", 
        text: `Failed to fetch ${url}: ${error.message}` 
      }],
      isError: true,
    };
  }

  /**
   * Main fetch method that automatically detects the best format
   * Priority: Text -> JSON -> HTML (fallback)
   */
  static async doFetch(requestPayload: RequestPayload): Promise<FetchResult> {
    try {
      const response = await this.performHttpRequest(requestPayload);
      
      // Try text format first (most common use case)
      const textResult = await this.tryProcessFormat(
        this.processAsText.bind(this),
        requestPayload,
        response.clone()
      );
      if (textResult) return textResult;

      // Try JSON format second
      const jsonResult = await this.tryProcessFormat(
        this.processAsJson.bind(this),
        requestPayload,
        response.clone()
      );
      if (jsonResult) return jsonResult;

      // Fallback to HTML format
      return await this.processAsHtml(requestPayload, response);
      
    } catch (error) {
      return this.createErrorResult(
        requestPayload.url, 
        error as Error
      );
    }
  }
}
