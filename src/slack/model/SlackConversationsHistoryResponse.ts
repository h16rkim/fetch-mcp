import { ISlackConversationsHistoryResponse, ISlackMessage } from "../SlackTypes.js";
import { SlackMessage } from "./SlackMessage.js";

export class SlackConversationsHistoryResponse {
  private _ok: boolean;
  private _messages: SlackMessage[];
  private _hasMore: boolean;
  private _pinCount?: number;
  private _responseMetadata?: { nextCursor?: string };
  private _error?: string;

  constructor(data: ISlackConversationsHistoryResponse) {
    this._ok = data.ok;
    this._messages = (data.messages || []).map(msg => new SlackMessage(msg));
    this._hasMore = Boolean(data.has_more);
    this._pinCount = data.pin_count;
    this._responseMetadata = data.response_metadata ? {
      nextCursor: data.response_metadata.next_cursor,
    } : undefined;
    this._error = data.error;
  }

  get data(): ISlackConversationsHistoryResponse {
    return {
      ok: this._ok,
      messages: this._messages.map(msg => msg.data),
      has_more: this._hasMore,
      pin_count: this._pinCount,
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

  get pinCount(): number | undefined {
    return this._pinCount;
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

  get isSuccess(): boolean {
    return this._ok && !this._error;
  }
}
