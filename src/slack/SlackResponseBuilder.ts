import { ResponseBuilder } from "../ResponseBuilder.js";
import { SlackMessageModel } from "./model/SlackMessageModel.js";
import { SlackUser } from "./model/SlackUser.js";
import { ISlackRequest } from "./SlackTypes.js";

/**
 * Slack service specific response builder
 * Uses ResponseBuilder to generate formatted response strings for Slack entities
 */
export class SlackResponseBuilder {
  private _responseBuilder: ResponseBuilder;

  constructor() {
    this._responseBuilder = new ResponseBuilder();
  }

  /**
   * Get the underlying ResponseBuilder instance
   */
  get responseBuilder(): ResponseBuilder {
    return this._responseBuilder;
  }

  /**
   * Generate comprehensive Slack message summary
   */
  async generateSlackMessageSummary(
    messageModel: SlackMessageModel,
    request: ISlackRequest,
    accessToken: string,
    getUserInfo: (token: string, userId: string) => Promise<SlackUser | undefined>,
    maxLength: number
  ): Promise<string> {
    this._responseBuilder.clear();

    // Basic message info
    this._responseBuilder
      .addTitle(`Slack ${messageModel.messageContext} Information:`)
      .addField("Channel", messageModel.channelId)
      .addField("Timestamp", messageModel.formattedTimestamp)
      .addField("Author", messageModel.author)
      .addField("Type", messageModel.messageType)
      .addField("Thread", messageModel.threadInfo)
      .addFieldIf(
        messageModel.isMessageReply &&
          Boolean(messageModel.originalThreadTimestamp),
        "Original Thread Timestamp",
        messageModel.originalThreadTimestamp || ""
      )
      .addField("URL", request.url)
      .addSection("Message", messageModel.text);

    // Add reactions if present
    if (messageModel.hasReactions) {
      this._responseBuilder.addRaw(`\nReactions:\n${messageModel.formattedReactions}`);
    }

    // Add attachments if present
    if (messageModel.hasAttachments) {
      const attachmentItems = this.formatAttachments(messageModel);
      this._responseBuilder.addNumberedList("Attachments", attachmentItems);
    }

    // Add files if present
    if (messageModel.hasFiles) {
      const fileItems = this.formatFiles(messageModel);
      this._responseBuilder.addNumberedList("Files", fileItems);
    }

    // Add replies if present
    if (messageModel.hasReplies) {
      const replyItems = await this.formatReplies(messageModel, accessToken, getUserInfo);
      this._responseBuilder.addBulletList("Replies", replyItems);
    }

    return this._responseBuilder.build(maxLength);
  }

  /**
   * Format attachments for display
   */
  private formatAttachments(messageModel: SlackMessageModel): string[] {
    return messageModel
      .getFormattedAttachments()
      .map((attachment, index) => {
        const attachmentBuilder = new ResponseBuilder();

        if (attachment.title) {
          attachmentBuilder.addField("Title", attachment.title);
        }

        if (attachment.text) {
          attachmentBuilder.addField("Content", attachment.text);
        }

        if (attachment.pretext) {
          attachmentBuilder.addField("Pretext", attachment.pretext);
        }

        if (attachment.imageUrl) {
          attachmentBuilder.addField("Image", attachment.imageUrl);
        }

        if (attachment.thumbUrl) {
          attachmentBuilder.addField("Thumbnail", attachment.thumbUrl);
        }

        if (attachment.fromUrl) {
          attachmentBuilder.addField("URL", attachment.fromUrl);
        }

        if (attachment.serviceName) {
          attachmentBuilder.addField("Service", attachment.serviceName);
        }

        if (attachment.authorName) {
          attachmentBuilder.addField("Author", attachment.authorName);
        }

        if (attachment.fields && attachment.fields.length > 0) {
          const fieldItems = attachment.fields.map(
            field => `${field.title}: ${field.value}`
          );
          attachmentBuilder.addBulletList("Fields", fieldItems);
        }

        return `${index + 1}. ${attachmentBuilder.build()}`;
      });
  }

  /**
   * Format files for display
   */
  private formatFiles(messageModel: SlackMessageModel): string[] {
    return messageModel.formattedFiles.map(file => {
      let fileInfo = file.info;
      if (file.url) fileInfo += `\n   URL: ${file.url}`;
      return fileInfo;
    });
  }

  /**
   * Format replies for display with user information
   */
  private async formatReplies(
    messageModel: SlackMessageModel,
    accessToken: string,
    getUserInfo: (token: string, userId: string) => Promise<SlackUser | undefined>
  ): Promise<string[]> {
    // Get unique user IDs from replies
    const uniqueUserIds = [
      ...new Set(
        messageModel.formattedReplies
          .map(reply => reply.author)
          .filter(userId => Boolean(userId))
      ),
    ];

    // Fetch all user information in parallel using SlackUser
    const userInfos = await Promise.all(
      uniqueUserIds.map(async userId => {
        const userInfo = await getUserInfo(accessToken, userId);
        return { userId, userInfo };
      })
    );

    return messageModel.formattedReplies.map(reply => {
      const userInfoData = userInfos.find(
        info => info.userId === reply.author
      );
      const userName =
        userInfoData?.userInfo?.bestDisplayName ?? "Unknown User";
      return `${userName} (${reply.timestamp}): ${reply.text}`;
    });
  }

  /**
   * Clear the internal ResponseBuilder state
   */
  clear(): SlackResponseBuilder {
    this._responseBuilder.clear();
    return this;
  }

  /**
   * Get the current length of the built string
   */
  getLength(): number {
    return this._responseBuilder.getLength();
  }
}
