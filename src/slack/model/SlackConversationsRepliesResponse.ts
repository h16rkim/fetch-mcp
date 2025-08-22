import { ISlackConversationsRepliesResponse } from "../SlackTypes.js";
import { SlackMessage } from "./SlackMessage.js";

export class SlackConversationsRepliesResponse {
  private data: ISlackConversationsRepliesResponse;

  constructor(data: ISlackConversationsRepliesResponse) {
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

  get hasReplies(): boolean {
    return this.messages.length > 1; // First message is the original, rest are replies
  }

  get replies(): SlackMessage[] {
    return this.messages.slice(1); // Skip the original message
  }

  get isSuccess(): boolean {
    return this.ok && !this.error;
  }
}
