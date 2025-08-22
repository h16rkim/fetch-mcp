/**
 * Slack API response models for better code organization and readability
 */

import { SlackMessage, SlackReaction, SlackAttachment, SlackFile, SlackUser } from "./types.js";

export interface SlackApiResponse {
  message: SlackMessage;
  user?: SlackUser;
  channel: string;
  isReply: boolean;
  threadTs?: string;
  replies?: SlackMessage[];
}

export class SlackUserInfo {
  private user: SlackUser;

  constructor(user: SlackUser) {
    this.user = user;
  }

  get id(): string {
    return this.user.id;
  }

  get name(): string {
    return this.user.name || "Unknown";
  }

  get realName(): string {
    return this.user.real_name || "Unknown";
  }

  get displayName(): string {
    return this.user.display_name || "Unknown";
  }

  get profileDisplayName(): string {
    return this.user.profile?.display_name || "Unknown";
  }

  get profileRealName(): string {
    return this.user.profile?.real_name || "Unknown";
  }

  get profileFirstName(): string {
    return this.user.profile?.first_name || "Unknown";
  }

  get profileLastName(): string {
    return this.user.profile?.last_name || "Unknown";
  }

  /**
   * Get the best available display name for the user
   * Priority: profile.display_name > display_name > profile.real_name > real_name > name > "Unknown User"
   */
  get bestDisplayName(): string {
    return this.user.profile?.display_name || 
           this.user.display_name || 
           this.user.profile?.real_name || 
           this.user.real_name || 
           this.user.name || 
           "Unknown User";
  }

  /**
   * Get full name if available (first + last name)
   */
  get fullName(): string {
    const firstName = this.user.profile?.first_name;
    const lastName = this.user.profile?.last_name;
    
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
    return Boolean(this.user.profile);
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

export class SlackReactionInfo {
  private reaction: SlackReaction;

  constructor(reaction: SlackReaction) {
    this.reaction = reaction;
  }

  get name(): string {
    return this.reaction.name || "unknown";
  }

  get count(): number {
    return this.reaction.count || 0;
  }

  get users(): string[] {
    return this.reaction.users || [];
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

export class SlackAttachmentInfo {
  private attachment: SlackAttachment;

  constructor(attachment: SlackAttachment) {
    this.attachment = attachment;
  }

  get id(): number | undefined {
    return this.attachment.id;
  }

  get color(): string | undefined {
    return this.attachment.color;
  }

  get fallback(): string | undefined {
    return this.attachment.fallback;
  }

  get title(): string | undefined {
    return this.attachment.title;
  }

  get titleLink(): string | undefined {
    return this.attachment.title_link;
  }

  get text(): string | undefined {
    return this.attachment.text;
  }

  get pretext(): string | undefined {
    return this.attachment.pretext;
  }

  get imageUrl(): string | undefined {
    return this.attachment.image_url;
  }

  get thumbUrl(): string | undefined {
    return this.attachment.thumb_url;
  }

  get fromUrl(): string | undefined {
    return this.attachment.from_url;
  }

  get serviceName(): string | undefined {
    return this.attachment.service_name;
  }

  get serviceIcon(): string | undefined {
    return this.attachment.service_icon;
  }

  get authorName(): string | undefined {
    return this.attachment.author_name;
  }

  get authorLink(): string | undefined {
    return this.attachment.author_link;
  }

  get authorIcon(): string | undefined {
    return this.attachment.author_icon;
  }

  get fields(): Array<{ title: string; value: string; short?: boolean }> {
    return this.attachment.fields || [];
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

export class SlackFileInfo {
  private file: SlackFile;

  constructor(file: SlackFile) {
    this.file = file;
  }

  get id(): string {
    return this.file.id;
  }

  get name(): string | undefined {
    return this.file.name;
  }

  get title(): string | undefined {
    return this.file.title;
  }

  get displayName(): string {
    return this.name || this.title || 'Unnamed file';
  }

  get mimetype(): string | undefined {
    return this.file.mimetype;
  }

  get filetype(): string | undefined {
    return this.file.filetype;
  }

  get prettyType(): string | undefined {
    return this.file.pretty_type;
  }

  get user(): string | undefined {
    return this.file.user;
  }

  get size(): number | undefined {
    return this.file.size;
  }

  get sizeInKB(): number | undefined {
    return this.size ? Math.round(this.size / 1024) : undefined;
  }

  get urlPrivate(): string | undefined {
    return this.file.url_private;
  }

  get urlPrivateDownload(): string | undefined {
    return this.file.url_private_download;
  }

  get permalink(): string | undefined {
    return this.file.permalink;
  }

  get permalinkPublic(): string | undefined {
    return this.file.permalink_public;
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

export class SlackMessageInfo {
  private message: SlackMessage;

  constructor(message: SlackMessage) {
    this.message = message;
  }

  get type(): string {
    return this.message.type || "message";
  }

  get subtype(): string | undefined {
    return this.message.subtype;
  }

  get messageType(): string {
    const subtype = this.subtype ? ` (${this.subtype})` : "";
    return `${this.type}${subtype}`;
  }

  get timestamp(): string {
    return this.message.ts;
  }

  get formattedTimestamp(): string {
    if (!this.message.ts) {
      return "Unknown time";
    }
    return new Date(parseFloat(this.message.ts) * 1000).toISOString();
  }

  get user(): string | undefined {
    return this.message.user;
  }

  get botId(): string | undefined {
    return this.message.bot_id;
  }

  get username(): string | undefined {
    return this.message.username;
  }

  get text(): string {
    return this.message.text || "No content";
  }

  get threadTimestamp(): string | undefined {
    return this.message.thread_ts;
  }

  get isThreaded(): boolean {
    return Boolean(this.threadTimestamp);
  }

  get replyCount(): number {
    return this.message.reply_count || 0;
  }

  get replyUsersCount(): number {
    return this.message.reply_users_count || 0;
  }

  get latestReply(): string | undefined {
    return this.message.latest_reply;
  }

  get threadInfo(): string {
    return this.isThreaded ? `Yes (${this.replyCount} replies)` : "No";
  }

  get reactions(): SlackReactionInfo[] {
    if (!this.message.reactions) {
      return [];
    }
    return this.message.reactions.map(reaction => new SlackReactionInfo(reaction));
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

  get attachments(): SlackAttachmentInfo[] {
    if (!this.message.attachments) {
      return [];
    }
    return this.message.attachments.map(attachment => new SlackAttachmentInfo(attachment));
  }

  get hasAttachments(): boolean {
    return this.attachments.length > 0;
  }

  get files(): SlackFileInfo[] {
    if (!this.message.files) {
      return [];
    }
    return this.message.files.map(file => new SlackFileInfo(file));
  }

  get hasFiles(): boolean {
    return this.files.length > 0;
  }

  get formattedFiles(): Array<{ name: string; info: string; url?: string }> {
    return this.files.map(file => file.getFileDetails());
  }

  get edited(): { user: string; timestamp: string } | undefined {
    if (!this.message.edited) {
      return undefined;
    }
    return {
      user: this.message.edited.user,
      timestamp: new Date(parseFloat(this.message.edited.ts) * 1000).toISOString()
    };
  }

  get isEdited(): boolean {
    return Boolean(this.edited);
  }

  get isStarred(): boolean {
    return Boolean(this.message.is_starred);
  }

  get pinnedTo(): string[] {
    return this.message.pinned_to || [];
  }

  get isPinned(): boolean {
    return this.pinnedTo.length > 0;
  }

  get permalink(): string | undefined {
    return this.message.permalink;
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

export interface SlackApiResponse {
  message: SlackMessage;
  user?: SlackUser;
  channel: string;
  isReply: boolean;
  threadTs?: string;
  replies?: SlackMessage[];
}

export class SlackMessageModel {
  private data: SlackApiResponse;
  private userInfo?: SlackUserInfo;
  private messageInfo: SlackMessageInfo;

  constructor(data: SlackApiResponse) {
    this.data = data;
    this.userInfo = data.user ? new SlackUserInfo(data.user) : undefined;
    this.messageInfo = new SlackMessageInfo(data.message);
  }

  get channel(): string {
    return this.data.channel;
  }

  get timestamp(): string {
    return this.messageInfo.timestamp;
  }

  get formattedTimestamp(): string {
    return this.messageInfo.formattedTimestamp;
  }

  get author(): string {
    return this.userInfo?.bestDisplayName || "Unknown User";
  }

  get authorId(): string {
    return this.messageInfo.user || "Unknown";
  }

  get authorInfo(): SlackUserInfo | undefined {
    return this.userInfo;
  }

  get text(): string {
    return this.messageInfo.text;
  }

  get messageType(): string {
    return this.messageInfo.messageType;
  }

  get isThreaded(): boolean {
    return this.messageInfo.isThreaded;
  }

  get threadTimestamp(): string | undefined {
    return this.messageInfo.threadTimestamp;
  }

  get replyCount(): number {
    return this.messageInfo.replyCount;
  }

  get threadInfo(): string {
    return this.messageInfo.threadInfo;
  }

  get isReply(): boolean {
    return this.data.isReply;
  }

  get originalThreadTimestamp(): string | undefined {
    return this.data.threadTs;
  }

  get messageContext(): string {
    return this.isReply ? "Reply to Thread" : "Original Message";
  }

  get reactions(): SlackReactionInfo[] {
    return this.messageInfo.reactions;
  }

  get hasReactions(): boolean {
    return this.messageInfo.hasReactions;
  }

  get formattedReactions(): string {
    return this.messageInfo.formattedReactions;
  }

  get attachments(): SlackAttachmentInfo[] {
    return this.messageInfo.attachments;
  }

  get hasAttachments(): boolean {
    return this.messageInfo.hasAttachments;
  }

  get files(): SlackFileInfo[] {
    return this.messageInfo.files;
  }

  get hasFiles(): boolean {
    return this.messageInfo.hasFiles;
  }

  get formattedFiles(): Array<{ name: string; info: string; url?: string }> {
    return this.messageInfo.formattedFiles;
  }

  get replies(): SlackMessage[] {
    return this.data.replies || [];
  }

  get hasReplies(): boolean {
    return this.replies.length > 0;
  }

  get formattedReplies(): Array<{ author: string; text: string; timestamp: string }> {
    if (!this.hasReplies) {
      return [];
    }

    return this.replies.map(reply => {
      const replyInfo = new SlackMessageInfo(reply);
      return {
        author: reply.user || "Unknown User",
        text: replyInfo.text,
        timestamp: replyInfo.formattedTimestamp
      };
    });
  }

  get isEdited(): boolean {
    return this.messageInfo.isEdited;
  }

  get editedInfo(): { user: string; timestamp: string } | null {
    return this.messageInfo.edited || null;
  }

  get isStarred(): boolean {
    return this.messageInfo.isStarred;
  }

  get isPinned(): boolean {
    return this.messageInfo.isPinned;
  }

  get permalink(): string | undefined {
    return this.messageInfo.permalink;
  }

  get messageDetails(): SlackMessageInfo {
    return this.messageInfo;
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
    return this.messageInfo.getFormattedAttachments();
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
    const messageSummary = this.messageInfo.getSummary();
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
  private messages: SlackMessage[];
  private channel: string;
  private threadTs: string;
  private messageInfos: SlackMessageInfo[];

  constructor(messages: SlackMessage[], channel: string, threadTs: string) {
    this.messages = messages;
    this.channel = channel;
    this.threadTs = threadTs;
    this.messageInfos = messages.map(msg => new SlackMessageInfo(msg));
  }

  get originalMessage(): SlackMessage | undefined {
    return this.messages.find(msg => msg.ts === this.threadTs);
  }

  get originalMessageInfo(): SlackMessageInfo | undefined {
    return this.messageInfos.find(msgInfo => msgInfo.timestamp === this.threadTs);
  }

  get replies(): SlackMessage[] {
    return this.messages.filter(msg => msg.ts !== this.threadTs);
  }

  get replyInfos(): SlackMessageInfo[] {
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

  get latestReply(): SlackMessage | undefined {
    if (this.replies.length === 0) {
      return undefined;
    }

    return this.replies.reduce((latest, current) => {
      const latestTs = parseFloat(latest.ts);
      const currentTs = parseFloat(current.ts);
      return currentTs > latestTs ? current : latest;
    });
  }

  get latestReplyInfo(): SlackMessageInfo | undefined {
    const latestReply = this.latestReply;
    if (!latestReply) {
      return undefined;
    }
    return new SlackMessageInfo(latestReply);
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
