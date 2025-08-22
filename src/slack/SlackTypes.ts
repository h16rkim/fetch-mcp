/**
 * Slack API Types and Interfaces
 */

export type SlackRequest = {
  url: string;
  maxLength?: number;
};

// Slack API Response Types
export interface ISlackUser {
  id: string;
  name?: string;
  real_name?: string;
  display_name?: string;
  profile?: {
    display_name?: string;
    real_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface ISlackReaction {
  name: string;
  count: number;
  users: string[];
}

export interface ISlackAttachment {
  id?: number;
  color?: string;
  fallback?: string;
  title?: string;
  title_link?: string;
  text?: string;
  pretext?: string;
  image_url?: string;
  thumb_url?: string;
  from_url?: string;
  service_name?: string;
  service_icon?: string;
  author_name?: string;
  author_link?: string;
  author_icon?: string;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
}

export interface ISlackFile {
  id: string;
  name?: string;
  title?: string;
  mimetype?: string;
  filetype?: string;
  pretty_type?: string;
  user?: string;
  size?: number;
  url_private?: string;
  url_private_download?: string;
  permalink?: string;
  permalink_public?: string;
  thumb_64?: string;
  thumb_80?: string;
  thumb_360?: string;
  thumb_480?: string;
  thumb_720?: string;
  thumb_960?: string;
  thumb_1024?: string;
}

export interface ISlackMessage {
  type: string;
  subtype?: string;
  ts: string;
  user?: string;
  bot_id?: string;
  username?: string;
  text?: string;
  thread_ts?: string;
  reply_count?: number;
  reply_users_count?: number;
  latest_reply?: string;
  reactions?: ISlackReaction[];
  attachments?: ISlackAttachment[];
  files?: ISlackFile[];
  edited?: {
    user: string;
    ts: string;
  };
  is_starred?: boolean;
  pinned_to?: string[];
  permalink?: string;
}

export interface ISlackConversationsHistoryResponse {
  ok: boolean;
  messages?: ISlackMessage[];
  has_more?: boolean;
  pin_count?: number;
  response_metadata?: {
    next_cursor?: string;
  };
  error?: string;
}

export interface ISlackConversationsRepliesResponse {
  ok: boolean;
  messages?: ISlackMessage[];
  has_more?: boolean;
  response_metadata?: {
    next_cursor?: string;
  };
  error?: string;
}

export interface ISlackUsersInfoResponse {
  ok: boolean;
  user?: ISlackUser;
  error?: string;
}

export interface ISlackApiResponse {
  message: ISlackMessage;
  user?: ISlackUser;
  channel: string;
  isReply: boolean;
  threadTs?: string;
  replies?: ISlackMessage[];
}
