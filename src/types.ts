/**
 * General Types and Interfaces
 */

export type RequestPayload = {
  url: string;
  headers?: Record<string, string>;
  max_length?: number;
  start_index?: number;
};

export interface IMcpResult {
  content: Array<{ type: "text"; text: string }>;
  isError: boolean;
}
