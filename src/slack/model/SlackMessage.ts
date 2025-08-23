import { ISlackMessage, ISlackReaction, ISlackAttachment, ISlackFile } from "../SlackTypes.js";
import { SlackReaction } from "./SlackReaction.js";
import { SlackAttachment } from "./SlackAttachment.js";
import { SlackFile } from "./SlackFile.js";

export class SlackMessage {
  private _type: string;
  private _subtype?: string;
  private _ts: string;
  private _user?: string;
  private _botId?: string;
  private _username?: string;
  private _text: string;
  private _threadTs?: string;
  private _replyCount?: number;
  private _replyUsersCount?: number;
  private _latestReply?: string;
  private _reactions: SlackReaction[];
  private _attachments: SlackAttachment[];
  private _files: SlackFile[];
  private _edited?: { user: string; ts: string };
  private _isStarred?: boolean;
  private _pinnedTo: string[];
  private _permalink?: string;

  constructor(data: ISlackMessage) {
    this._type = data.type || "message";
    this._subtype = data.subtype;
    this._ts = data.ts;
    this._user = data.user;
    this._botId = data.bot_id;
    this._username = data.username;
    this._text = data.text || "No content";
    this._threadTs = data.thread_ts;
    this._replyCount = data.reply_count;
    this._replyUsersCount = data.reply_users_count;
    this._latestReply = data.latest_reply;
    this._reactions = (data.reactions || []).map(reaction => new SlackReaction(reaction));
    this._attachments = (data.attachments || []).map(attachment => new SlackAttachment(attachment));
    this._files = (data.files || []).map(file => new SlackFile(file));
    this._edited = data.edited;
    this._isStarred = data.is_starred;
    this._pinnedTo = data.pinned_to || [];
    this._permalink = data.permalink;
  }

  get data(): ISlackMessage {
    return {
      type: this._type,
      subtype: this._subtype,
      ts: this._ts,
      user: this._user,
      bot_id: this._botId,
      username: this._username,
      text: this._text,
      thread_ts: this._threadTs,
      reply_count: this._replyCount,
      reply_users_count: this._replyUsersCount,
      latest_reply: this._latestReply,
      reactions: this._reactions.map(reaction => reaction.data),
      attachments: this._attachments.map(attachment => attachment.data),
      files: this._files.map(file => file.data),
      edited: this._edited,
      is_starred: this._isStarred,
      pinned_to: this._pinnedTo,
      permalink: this._permalink
    };
  }

  get type(): string {
    return this._type;
  }

  get subtype(): string | undefined {
    return this._subtype;
  }

  get messageType(): string {
    const subtype = this._subtype ? ` (${this._subtype})` : "";
    return `${this._type}${subtype}`;
  }

  get timestamp(): string {
    return this._ts;
  }

  get formattedTimestamp(): string {
    if (!this._ts) {
      return "Unknown time";
    }
    return new Date(parseFloat(this._ts) * 1000).toISOString();
  }

  get user(): string | undefined {
    return this._user;
  }

  get botId(): string | undefined {
    return this._botId;
  }

  get username(): string | undefined {
    return this._username;
  }

  get text(): string {
    return this._text;
  }

  get threadTimestamp(): string | undefined {
    return this._threadTs;
  }

  get isThreaded(): boolean {
    return Boolean(this._threadTs);
  }

  get replyCount(): number {
    return this._replyCount || 0;
  }

  get replyUsersCount(): number {
    return this._replyUsersCount || 0;
  }

  get latestReply(): string | undefined {
    return this._latestReply;
  }

  get threadInfo(): string {
    return this.isThreaded ? `Yes (${this.replyCount} replies)` : "No";
  }

  get reactions(): SlackReaction[] {
    return this._reactions;
  }

  get hasReactions(): boolean {
    return this._reactions.length > 0;
  }

  get formattedReactions(): string {
    if (!this.hasReactions) {
      return "";
    }
    return this._reactions.map(reaction => reaction.formattedReaction).join(" ");
  }

  get attachments(): SlackAttachment[] {
    return this._attachments;
  }

  get hasAttachments(): boolean {
    return this._attachments.length > 0;
  }

  get files(): SlackFile[] {
    return this._files;
  }

  get hasFiles(): boolean {
    return this._files.length > 0;
  }

  get formattedFiles(): Array<{ name: string; info: string; url?: string }> {
    return this._files.map(file => file.getFileDetails());
  }

  get edited(): { user: string; timestamp: string } | undefined {
    if (!this._edited) {
      return undefined;
    }
    return {
      user: this._edited.user,
      timestamp: new Date(
        parseFloat(this._edited.ts) * 1000
      ).toISOString(),
    };
  }

  get isEdited(): boolean {
    return Boolean(this._edited);
  }

  get isStarred(): boolean {
    return Boolean(this._isStarred);
  }

  get pinnedTo(): string[] {
    return this._pinnedTo;
  }

  get isPinned(): boolean {
    return this._pinnedTo.length > 0;
  }

  get permalink(): string | undefined {
    return this._permalink;
  }

  get isBot(): boolean {
    return Boolean(this._botId);
  }

  get isFromUser(): boolean {
    return Boolean(this._user) && !this.isBot;
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
    return this._attachments.map(attachment => ({
      title: attachment.title,
      text: attachment.text,
      pretext: attachment.pretext,
      imageUrl: attachment.imageUrl,
      thumbUrl: attachment.thumbUrl,
      fromUrl: attachment.fromUrl,
      serviceName: attachment.serviceName,
      authorName: attachment.authorName,
      fields: attachment.getFormattedFields(),
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
      isBot: this.isBot,
    };
  }
}
