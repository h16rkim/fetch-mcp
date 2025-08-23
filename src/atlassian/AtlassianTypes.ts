/**
 * Atlassian API Types and Interfaces
 */

export interface IConfluenceRequest {
  url: string;
  maxLength?: number;
}

export interface IJiraRequest {
  url: string;
  maxLength?: number;
}

export interface IConfluenceApiResponse {
  title?: string;
  space?: {
    key?: string;
    name?: string;
  };
  version?: {
    by?: {
      publicName?: string;
    };
  };
  body?: {
    export_view?: {
      value?: string;
    };
  };
}

export interface IJiraApiResponse {
  key?: string;
  fields?: {
    summary?: string;
    assignee?: {
      displayName?: string;
    };
    status?: {
      name?: string;
    };
    priority?: {
      name?: string;
    };
    issuetype?: {
      name?: string;
    };
    reporter?: {
      displayName?: string;
    };
    created?: string;
    updated?: string;
    description?: any;
    subtasks?: Array<{
      key?: string;
      fields?: {
        summary?: string;
        status?: {
          name?: string;
        };
      };
    }>;
    comment?: {
      comments?: Array<{
        author?: {
          displayName?: string;
        };
        body?: any;
        created?: string;
      }>;
    };
  };
}
