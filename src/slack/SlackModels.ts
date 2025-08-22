/**
 * Slack API response models for better code organization and readability
 */

import { 
  ISlackMessage, 
  ISlackReaction, 
  ISlackAttachment, 
  ISlackFile, 
  ISlackUser,
  ISlackConversationsHistoryResponse,
  ISlackConversationsRepliesResponse,
  ISlackUsersInfoResponse,
  ISlackApiResponse
} from "./SlackTypes.js";

export class SlackUser {
  private _data: ISlackUser;

  constructor(data: ISlackUser) {
    this._data = data;
  }

  get data(): ISlackUser {
    return this._data;
  }

  get id(): string {
    return this._data.id;
  }

  get name(): string {
    return this._data.name || "Unknown";
  }

  get realName(): string {
    return this._data.real_name || "Unknown";
  }

  get displayName(): string {
    return this._data.display_name || "Unknown";
  }

  get profileDisplayName(): string {
    return this._data.profile?.display_name || "Unknown";
  }

  get profileRealName(): string {
    return this._data.profile?.real_name || "Unknown";
  }

  get profileFirstName(): string {
    return this._data.profile?.first_name || "Unknown";
  }

  get profileLastName(): string {
    return this._data.profile?.last_name || "Unknown";
  }

  /**
   * Get the best available display name for the user
   * Priority: profile.display_name > display_name > profile.real_name > real_name > name > "Unknown User"
   */
  get bestDisplayName(): string {
    return this._data.profile?.display_name || 
           this._data.display_name || 
           this._data.profile?.real_name || 
           this._data.real_name || 
           this._data.name || 
           "Unknown User";
  }

  /**
   * Get full name if available (first + last name)
   */
  get fullName(): string {
    const firstName = this._data.profile?.first_name;
    const lastName = this._data.profile?.last_name;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }
    
    return this.bestDisplayName;
  }

  /**
   * Check if user has profile information
   */
  get hasProfile(): boolean {
    return Boolean(this._data.profile);
  }

  /**
   * Get user information summary
   */
  getSummary(): {
    id: string;
    bestDisplayName: string;
    realName: string;
    hasProfile: boolean;
  } {
    return {
      id: this.id,
      bestDisplayName: this.bestDisplayName,
      realName: this.realName,
      hasProfile: this.hasProfile
    };
  }
}

export class SlackReaction {
  private _data: ISlackReaction;

  constructor(data: ISlackReaction) {
    this._data = data;
  }

  get data(): ISlackReaction {
    return this._data;
  }

  get name(): string {
    return this._data.name || "unknown";
  }

  get count(): number {
    return this._data.count || 0;
  }

  get users(): string[] {
    return this._data.users || [];
  }

  get userCount(): number {
    return this.users.length;
  }

  get formattedReaction(): string {
    return `${this.name}: ${this.count}`;
  }

  get hasUsers(): boolean {
    return this.users.length > 0;
  }
}

export class SlackAttachment {
  private _data: ISlackAttachment;

  constructor(data: ISlackAttachment) {
    this._data = data;
  }

  get data(): ISlackAttachment {
    return this._data;
  }

  get id(): number | undefined {
    return this._data.id;
  }

  get color(): string | undefined {
    return this._data.color;
  }

  get fallback(): string | undefined {
    return this._data.fallback;
  }

  get title(): string | undefined {
    return this._data.title;
  }

  get titleLink(): string | undefined {
    return this._data.title_link;
  }

  get text(): string | undefined {
    return this._data.text;
  }

  get pretext(): string | undefined {
    return this._data.pretext;
  }

  get imageUrl(): string | undefined {
    return this._data.image_url;
  }

  get thumbUrl(): string | undefined {
    return this._data.thumb_url;
  }

  get fromUrl(): string | undefined {
    return this._data.from_url;
  }

  get serviceName(): string | undefined {
    return this._data.service_name;
  }

  get serviceIcon(): string | undefined {
    return this._data.service_icon;
  }

  get authorName(): string | undefined {
    return this._data.author_name;
  }

  get authorLink(): string | undefined {
    return this._data.author_link;
  }

  get authorIcon(): string | undefined {
    return this._data.author_icon;
  }

  get fields(): Array<{ title: string; value: string; short?: boolean }> {
    return this._data.fields || [];
  }

  get hasFields(): boolean {
    return this.fields.length > 0;
  }

  get hasTitle(): boolean {
    return Boolean(this.title);
  }

  get hasText(): boolean {
    return Boolean(this.text);
  }

  get hasImage(): boolean {
    return Boolean(this.imageUrl);
  }

  get hasAuthor(): boolean {
    return Boolean(this.authorName);
  }

  getFormattedFields(): Array<{ title: string; value: string }> {
    return this.fields.map(field => ({
      title: field.title,
      value: field.value
    }));
  }
}

export class SlackFile {
  private _data: ISlackFile;

  constructor(data: ISlackFile) {
    this._data = data;
  }

  get data(): ISlackFile {
    return this._data;
  }

  get id(): string {
    return this._data.id;
  }

  get name(): string | undefined {
    return this._data.name;
  }

  get title(): string | undefined {
    return this._data.title;
  }

  get displayName(): string {
    return this.name || this.title || 'Unnamed file';
  }

  get mimetype(): string | undefined {
    return this._data.mimetype;
  }

  get filetype(): string | undefined {
    return this._data.filetype;
  }

  get prettyType(): string | undefined {
    return this._data.pretty_type;
  }

  get user(): string | undefined {
    return this._data.user;
  }

  get size(): number | undefined {
    return this._data.size;
  }

  get sizeInKB(): number | undefined {
    return this.size ? Math.round(this.size / 1024) : undefined;
  }

  get urlPrivate(): string | undefined {
    return this._data.url_private;
  }

  get urlPrivateDownload(): string | undefined {
    return this._data.url_private_download;
  }

  get permalink(): string | undefined {
    return this._data.permalink;
  }

  get permalinkPublic(): string | undefined {
    return this._data.permalink_public;
  }

  get hasSize(): boolean {
    return Boolean(this.size);
  }

  get hasMimetype(): boolean {
    return Boolean(this.mimetype);
  }

  get hasPermalink(): boolean {
    return Boolean(this.permalink);
  }

  get formattedFileInfo(): string {
    let fileInfo = this.displayName;
    if (this.mimetype) fileInfo += ` (${this.mimetype})`;
    if (this.size) fileInfo += ` - ${this.sizeInKB}KB`;
    return fileInfo;
  }

  getFileDetails(): {
    name: string;
    info: string;
    url?: string;
  } {
    return {
      name: this.displayName,
      info: this.formattedFileInfo,
      url: this.permalink
    };
  }
}

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

export class SlackThreadModel {
  private messages: ISlackMessage[];
  private channel: string;
  private threadTs: string;
  private messageInfos: SlackMessage[];

  constructor(messages: ISlackMessage[], channel: string, threadTs: string) {
    this.messages = messages;
    this.channel = channel;
    this.threadTs = threadTs;
    this.messageInfos = messages.map(msg => new SlackMessage(msg));
  }

  get originalMessage(): ISlackMessage | undefined {
    return this.messages.find(msg => msg.ts === this.threadTs);
  }

  get originalMessageInfo(): SlackMessage | undefined {
    return this.messageInfos.find(msgInfo => msgInfo.timestamp === this.threadTs);
  }

  get replies(): ISlackMessage[] {
    return this.messages.filter(msg => msg.ts !== this.threadTs);
  }

  get replyInfos(): SlackMessage[] {
    return this.messageInfos.filter(msgInfo => msgInfo.timestamp !== this.threadTs);
  }

  get totalMessages(): number {
    return this.messages.length;
  }

  get replyCount(): number {
    return this.replies.length;
  }

  get participants(): string[] {
    const userIds = this.messageInfos
      .map(msgInfo => msgInfo.user)
      .filter(userId => Boolean(userId)) as string[];
    
    return [...new Set(userIds)];
  }

  get participantCount(): number {
    return this.participants.length;
  }

  get threadTimestamp(): string {
    return this.threadTs;
  }

  get channelId(): string {
    return this.channel;
  }

  get latestReply(): ISlackMessage | undefined {
    if (this.replies.length === 0) {
      return undefined;
    }

    return this.replies.reduce((latest, current) => {
      const latestTs = parseFloat(latest.ts);
      const currentTs = parseFloat(current.ts);
      return currentTs > latestTs ? current : latest;
    });
  }

  get latestReplyInfo(): SlackMessage | undefined {
    const latestReply = this.latestReply;
    if (!latestReply) {
      return undefined;
    }
    return new SlackMessage(latestReply);
  }

  get threadDuration(): number | undefined {
    const originalMsgInfo = this.originalMessageInfo;
    const latestReplyInfo = this.latestReplyInfo;
    
    if (!originalMsgInfo || !latestReplyInfo) {
      return undefined;
    }

    const startTime = parseFloat(originalMsgInfo.timestamp);
    const endTime = parseFloat(latestReplyInfo.timestamp);
    return endTime - startTime; // Duration in seconds
  }

  get formattedThreadDuration(): string | undefined {
    const duration = this.threadDuration;
    
    if (duration === undefined) {
      return undefined;
    }

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get thread summary
   */
  getThreadSummary(): {
    totalMessages: number;
    replyCount: number;
    participantCount: number;
    duration?: string;
    hasOriginalMessage: boolean;
  } {
    return {
      totalMessages: this.totalMessages,
      replyCount: this.replyCount,
      participantCount: this.participantCount,
      duration: this.formattedThreadDuration,
      hasOriginalMessage: Boolean(this.originalMessageInfo)
    };
  }
}

// HTTP Response Classes
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
      nextCursor: this.data.response_metadata.next_cursor
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
      nextCursor: this.data.response_metadata.next_cursor
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

  get replies(): SlackMessage[] {
    // Skip the first message (original message) and get replies
    return this.messages.slice(1);
  }

  get hasReplies(): boolean {
    return this.replies.length > 0;
  }
}

export class SlackUsersInfoResponse {
  private data: ISlackUsersInfoResponse;

  constructor(data: ISlackUsersInfoResponse) {
    this.data = data;
  }

  get ok(): boolean {
    return this.data.ok;
  }

  get user(): SlackUser | undefined {
    if (!this.data.user) {
      return undefined;
    }
    return new SlackUser(this.data.user);
  }

  get error(): string | undefined {
    return this.data.error;
  }

  get hasUser(): boolean {
    return Boolean(this.user);
  }

  get isSuccess(): boolean {
    return this.ok && !this.error && this.hasUser;
  }
}

// Alias classes for backward compatibility
export class SlackUserInfo extends SlackUser {}
export class SlackReactionInfo extends SlackReaction {}
export class SlackAttachmentInfo extends SlackAttachment {}
export class SlackFileInfo extends SlackFile {}
export class SlackMessageInfo extends SlackMessage {}
