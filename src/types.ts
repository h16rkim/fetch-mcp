export type RequestPayload = {
  url: string;
  headers?: Record<string, string>;
  max_length?: number;
  start_index?: number;
};

export type ConfluenceRequest = {
  url: string;
  maxLength?: number;
};

export type JiraRequest = {
  url: string;
  maxLength?: number;
};
