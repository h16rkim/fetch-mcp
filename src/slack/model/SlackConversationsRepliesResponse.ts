import { ISlackConversationsRepliesResponse, ISlackMessage } from "../SlackTypes.js";
import { SlackMessage } from "./SlackMessage.js";

export class SlackConversationsRepliesResponse {
  private _ok: boolean;
  private _messages: SlackMessage[];
  private _hasMore: boolean;
  private _responseMetadata?: { nextCursor?: string };
  private _error?: string;

  constructor(data: ISlackConversationsRepliesResponse) {
    this._ok = data.ok;
    this._messages = (data.messages || []).map(msg => new SlackMessage(msg));
    this._hasMore = Boolean(data.has_more);
    this._responseMetadata = data.response_metadata ? {
      nextCursor: data.response_metadata.next_cursor,
    } : undefined;
    this._error = data.error;
  }

  get data(): ISlackConversationsRepliesResponse {
    return {
      ok: this._ok,
      messages: this._messages.map(msg => msg.data),
      has_more: this._hasMore,
      response_metadata: this._responseMetadata ? {
        next_cursor: this._responseMetadata.nextCursor,
      } : undefined,
      error: this._error
    };
  }

  get ok(): boolean {
    return this._ok;
  }

  get messages(): SlackMessage[] {
    return this._messages;
  }

  get hasMore(): boolean {
    return this._hasMore;
  }

  get responseMetadata(): { nextCursor?: string } | undefined {
    return this._responseMetadata;
  }

  get error(): string | undefined {
    return this._error;
  }

  get hasMessages(): boolean {
    return this._messages.length > 0;
  }

  get hasReplies(): boolean {
    return this._messages.length > 1; // First message is the original, rest are replies
  }

  get replies(): SlackMessage[] {
    return this._messages.slice(1); // Skip the original message
  }

  get isSuccess(): boolean {
    return this._ok && !this._error;
  }
}
