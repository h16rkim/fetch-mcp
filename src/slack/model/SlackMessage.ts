import { ISlackMessage } from "../SlackTypes.js";
import { SlackReaction } from "./SlackReaction.js";
import { SlackAttachment } from "./SlackAttachment.js";
import { SlackFile } from "./SlackFile.js";

export class SlackMessage {
  private _data: ISlackMessage;

  constructor(data: ISlackMessage) {
    this._data = data;
  }

  get data(): ISlackMessage {
    return this._data;
  }

  get type(): string {
    return this._data.type || "message";
  }

  get subtype(): string | undefined {
    return this._data.subtype;
  }

  get messageType(): string {
    const subtype = this.subtype ? ` (${this.subtype})` : "";
    return `${this.type}${subtype}`;
  }

  get timestamp(): string {
    return this._data.ts;
  }

  get formattedTimestamp(): string {
    if (!this._data.ts) {
      return "Unknown time";
    }
    return new Date(parseFloat(this._data.ts) * 1000).toISOString();
  }

  get user(): string | undefined {
    return this._data.user;
  }

  get botId(): string | undefined {
    return this._data.bot_id;
  }

  get username(): string | undefined {
    return this._data.username;
  }

  get text(): string {
    return this._data.text || "No content";
  }

  get threadTimestamp(): string | undefined {
    return this._data.thread_ts;
  }

  get isThreaded(): boolean {
    return Boolean(this.threadTimestamp);
  }

  get replyCount(): number {
    return this._data.reply_count || 0;
  }

  get replyUsersCount(): number {
    return this._data.reply_users_count || 0;
  }

  get latestReply(): string | undefined {
    return this._data.latest_reply;
  }

  get threadInfo(): string {
    return this.isThreaded ? `Yes (${this.replyCount} replies)` : "No";
  }

  get reactions(): SlackReaction[] {
    if (!this._data.reactions) {
      return [];
    }
    return this._data.reactions.map(reaction => new SlackReaction(reaction));
  }

  get hasReactions(): boolean {
    return this.reactions.length > 0;
  }

  get formattedReactions(): string {
    if (!this.hasReactions) {
      return "";
    }
    return this.reactions.map(reaction => reaction.formattedReaction).join(' ');
  }

  get attachments(): SlackAttachment[] {
    if (!this._data.attachments) {
      return [];
    }
    return this._data.attachments.map(attachment => new SlackAttachment(attachment));
  }

  get hasAttachments(): boolean {
    return this.attachments.length > 0;
  }

  get files(): SlackFile[] {
    if (!this._data.files) {
      return [];
    }
    return this._data.files.map(file => new SlackFile(file));
  }

  get hasFiles(): boolean {
    return this.files.length > 0;
  }

  get formattedFiles(): Array<{ name: string; info: string; url?: string }> {
    return this.files.map(file => file.getFileDetails());
  }

  get edited(): { user: string; timestamp: string } | undefined {
    if (!this._data.edited) {
      return undefined;
    }
    return {
      user: this._data.edited.user,
      timestamp: new Date(parseFloat(this._data.edited.ts) * 1000).toISOString()
    };
  }

  get isEdited(): boolean {
    return Boolean(this.edited);
  }

  get isStarred(): boolean {
    return Boolean(this._data.is_starred);
  }

  get pinnedTo(): string[] {
    return this._data.pinned_to || [];
  }

  get isPinned(): boolean {
    return this.pinnedTo.length > 0;
  }

  get permalink(): string | undefined {
    return this._data.permalink;
  }

  get isBot(): boolean {
    return Boolean(this.botId);
  }

  get isFromUser(): boolean {
    return Boolean(this.user) && !this.isBot;
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
    return this.attachments.map(attachment => ({
      title: attachment.title,
      text: attachment.text,
      pretext: attachment.pretext,
      imageUrl: attachment.imageUrl,
      thumbUrl: attachment.thumbUrl,
      fromUrl: attachment.fromUrl,
      serviceName: attachment.serviceName,
      authorName: attachment.authorName,
      fields: attachment.getFormattedFields()
    }));
  }

  /**
   * Get message summary
   */
  getSummary(): {
    type: string;
    timestamp: string;
    hasThread: boolean;
    hasReactions: boolean;
    hasAttachments: boolean;
    hasFiles: boolean;
    isEdited: boolean;
    isStarred: boolean;
    isPinned: boolean;
    isBot: boolean;
  } {
    return {
      type: this.messageType,
      timestamp: this.formattedTimestamp,
      hasThread: this.isThreaded,
      hasReactions: this.hasReactions,
      hasAttachments: this.hasAttachments,
      hasFiles: this.hasFiles,
      isEdited: this.isEdited,
      isStarred: this.isStarred,
      isPinned: this.isPinned,
      isBot: this.isBot
    };
  }
}
