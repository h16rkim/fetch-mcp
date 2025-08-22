import { ISlackConversationsHistoryResponse } from "../SlackTypes.js";
import { SlackMessage } from "./SlackMessage.js";

export class SlackConversationsHistoryResponse {
  private data: ISlackConversationsHistoryResponse;

  constructor(data: ISlackConversationsHistoryResponse) {
    this.data = data;
  }

  get ok(): boolean {
    return this.data.ok;
  }

  get messages(): SlackMessage[] {
    if (!this.data.messages) {
      return [];
    }
    return this.data.messages.map(msg => new SlackMessage(msg));
  }

  get hasMore(): boolean {
    return Boolean(this.data.has_more);
  }

  get pinCount(): number | undefined {
    return this.data.pin_count;
  }

  get responseMetadata(): { nextCursor?: string } | undefined {
    if (!this.data.response_metadata) {
      return undefined;
    }
    return {
      nextCursor: this.data.response_metadata.next_cursor,
    };
  }

  get error(): string | undefined {
    return this.data.error;
  }

  get hasMessages(): boolean {
    return this.messages.length > 0;
  }

  get isSuccess(): boolean {
    return this.ok && !this.error;
  }
}
