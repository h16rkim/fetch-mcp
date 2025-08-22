import { SlackMessage } from "./SlackMessage.js";
import { SlackUser } from "./SlackUser.js";
import { SlackReaction } from "./SlackReaction.js";
import { SlackAttachment } from "./SlackAttachment.js";
import { SlackFile } from "./SlackFile.js";

export class SlackMessageModel {
  private message: SlackMessage;
  private user?: SlackUser;
  private channel: string;
  private isReply: boolean;
  private threadTs?: string;
  private replies: SlackMessage[];

  constructor(
    message: SlackMessage,
    channel: string,
    isReply: boolean,
    user?: SlackUser,
    threadTs?: string,
    replies: SlackMessage[] = []
  ) {
    this.message = message;
    this.user = user;
    this.channel = channel;
    this.isReply = isReply;
    this.threadTs = threadTs;
    this.replies = replies;
  }

  get channelId(): string {
    return this.channel;
  }

  get timestamp(): string {
    return this.message.timestamp;
  }

  get formattedTimestamp(): string {
    return this.message.formattedTimestamp;
  }

  get author(): string {
    return this.user?.bestDisplayName || "Unknown User";
  }

  get authorId(): string {
    return this.message.user || "Unknown";
  }

  get authorInfo(): SlackUser | undefined {
    return this.user;
  }

  get text(): string {
    return this.message.text;
  }

  get messageType(): string {
    return this.message.messageType;
  }

  get isThreaded(): boolean {
    return this.message.isThreaded;
  }

  get threadTimestamp(): string | undefined {
    return this.message.threadTimestamp;
  }

  get replyCount(): number {
    return this.message.replyCount;
  }

  get threadInfo(): string {
    return this.message.threadInfo;
  }

  get isMessageReply(): boolean {
    return this.isReply;
  }

  get originalThreadTimestamp(): string | undefined {
    return this.threadTs;
  }

  get messageContext(): string {
    return this.isReply ? "Reply to Thread" : "Original Message";
  }

  get reactions(): SlackReaction[] {
    return this.message.reactions;
  }

  get hasReactions(): boolean {
    return this.message.hasReactions;
  }

  get formattedReactions(): string {
    return this.message.formattedReactions;
  }

  get attachments(): SlackAttachment[] {
    return this.message.attachments;
  }

  get hasAttachments(): boolean {
    return this.message.hasAttachments;
  }

  get files(): SlackFile[] {
    return this.message.files;
  }

  get hasFiles(): boolean {
    return this.message.hasFiles;
  }

  get formattedFiles(): Array<{ name: string; info: string; url?: string }> {
    return this.message.formattedFiles;
  }

  get messageReplies(): SlackMessage[] {
    return this.replies;
  }

  get hasReplies(): boolean {
    return this.replies.length > 0;
  }

  get formattedReplies(): Array<{ author: string; text: string; timestamp: string }> {
    if (!this.hasReplies) {
      return [];
    }

    return this.replies.map(reply => ({
      author: reply.user || "Unknown User",
      text: reply.text,
      timestamp: reply.formattedTimestamp
    }));
  }

  get isEdited(): boolean {
    return this.message.isEdited;
  }

  get editedInfo(): { user: string; timestamp: string } | null {
    return this.message.edited || null;
  }

  get isStarred(): boolean {
    return this.message.isStarred;
  }

  get isPinned(): boolean {
    return this.message.isPinned;
  }

  get permalink(): string | undefined {
    return this.message.permalink;
  }

  get messageDetails(): SlackMessage {
    return this.message;
  }

  /**
   * Get formatted attachment information
   */
  getFormattedAttachments(): Array<{
    title?: string;
    text?: string;
    pretext?: string;
    imageUrl?: string;
    thumbUrl?: string;
    fromUrl?: string;
    serviceName?: string;
    authorName?: string;
    fields?: Array<{ title: string; value: string }>;
  }> {
    return this.message.getFormattedAttachments();
  }

  /**
   * Get a summary of the message
   */
  getSummary(): {
    channel: string;
    author: string;
    timestamp: string;
    messageType: string;
    hasThread: boolean;
    hasReactions: boolean;
    hasAttachments: boolean;
    hasFiles: boolean;
    isReply: boolean;
  } {
    const messageSummary = this.message.getSummary();
    return {
      channel: this.channel,
      author: this.author,
      timestamp: messageSummary.timestamp,
      messageType: messageSummary.type,
      hasThread: messageSummary.hasThread,
      hasReactions: messageSummary.hasReactions,
      hasAttachments: messageSummary.hasAttachments,
      hasFiles: messageSummary.hasFiles,
      isReply: this.isReply
    };
  }
}
