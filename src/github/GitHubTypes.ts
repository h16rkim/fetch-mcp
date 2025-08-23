/**
 * GitHub API Types and Interfaces
 */

export interface IGitHubRequest {
  url: string;
}

// GitHub API Response Types
export interface IGitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
  name?: string;
  email?: string;
  bio?: string;
  company?: string;
  location?: string;
  blog?: string;
  twitter_username?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  created_at: string;
  updated_at: string;
}

export interface IGitHubLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface IGitHubMilestone {
  id: number;
  number: number;
  title: string;
  description?: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  due_on?: string;
  closed_at?: string;
}

export interface IGitHubPullRequestBase {
  label: string;
  ref: string;
  sha: string;
  user: IGitHubUser;
  repo: {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description?: string;
    private: boolean;
    fork: boolean;
    language?: string;
    default_branch: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
  };
}

export interface IGitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: "open" | "closed";
  locked: boolean;
  user: IGitHubUser;
  assignee?: IGitHubUser;
  assignees: IGitHubUser[];
  requested_reviewers: IGitHubUser[];
  labels: IGitHubLabel[];
  milestone?: IGitHubMilestone;
  head: IGitHubPullRequestBase;
  base: IGitHubPullRequestBase;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  commits_url: string;
  review_comments_url: string;
  comments_url: string;
  statuses_url: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  merged_at?: string;
  merge_commit_sha?: string;
  draft: boolean;
  merged: boolean;
  mergeable?: boolean;
  mergeable_state?: string;
  merged_by?: IGitHubUser;
  comments: number;
  review_comments: number;
  maintainer_can_modify: boolean;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface IGitHubFile {
  sha: string;
  filename: string;
  status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
  previous_filename?: string;
}

export interface IGitHubCommit {
  sha: string;
  url: string;
  html_url: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
  message: string;
  tree: {
    sha: string;
    url: string;
  };
  parents: Array<{
    sha: string;
    url: string;
    html_url: string;
  }>;
  verification?: {
    verified: boolean;
    reason: string;
    signature?: string;
    payload?: string;
  };
}

export interface IGitHubComment {
  id: number;
  user: IGitHubUser;
  created_at: string;
  updated_at: string;
  body: string;
  html_url: string;
  issue_url: string;
  author_association: string;
}

export interface IGitHubReviewComment {
  id: number;
  user: IGitHubUser;
  created_at: string;
  updated_at: string;
  body: string;
  html_url: string;
  pull_request_url: string;
  diff_hunk: string;
  path: string;
  position?: number;
  original_position?: number;
  commit_id: string;
  original_commit_id: string;
  in_reply_to_id?: number;
  author_association: string;
  line?: number;
  original_line?: number;
  side: "LEFT" | "RIGHT";
  start_line?: number;
  original_start_line?: number;
  start_side?: "LEFT" | "RIGHT";
}

export interface IGitHubReview {
  id: number;
  user: IGitHubUser;
  body?: string;
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING";
  html_url: string;
  pull_request_url: string;
  commit_id: string;
  submitted_at?: string;
  author_association: string;
}

// GitHub Issue Types
export interface IGitHubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: "open" | "closed";
  locked: boolean;
  user: IGitHubUser;
  assignee?: IGitHubUser;
  assignees: IGitHubUser[];
  labels: IGitHubLabel[];
  milestone?: IGitHubMilestone;
  html_url: string;
  repository_url: string;
  comments_url: string;
  events_url: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  closed_by?: IGitHubUser;
  comments: number;
  author_association: string;
  state_reason?: string;
  draft?: boolean;
}

export interface IGitHubIssueComment {
  id: number;
  user: IGitHubUser;
  created_at: string;
  updated_at: string;
  body: string;
  html_url: string;
  issue_url: string;
  author_association: string;
}

// Issue Request Type
export interface IGitHubIssueRequest {
  url: string;
}

// URL Parsing Types
export interface IGitHubPullRequestUrl {
  owner: string;
  repo: string;
  pullNumber: number;
}

export interface IGitHubIssueUrl {
  owner: string;
  repo: string;
  issueNumber: number;
}
