import { 
  ISlackRequest,
  ISlackConversationsHistoryResponse, 
  ISlackConversationsRepliesResponse, 
  ISlackUsersInfoResponse,
  ISlackMessage,
  ISlackUser
} from "./SlackTypes.js";
import { Constants } from "../constants.js";
import { ResponseBuilder } from "../ResponseBuilder.js";
import { SlackMessageModel } from "./model/SlackMessageModel.js";
import { SlackUser } from "./model/SlackUser.js";
import { SlackMessage } from "./model/SlackMessage.js";
import { SlackConversationsHistoryResponse } from "./model/SlackConversationsHistoryResponse.js";
import { SlackConversationsRepliesResponse } from "./model/SlackConversationsRepliesResponse.js";
import { SlackUsersInfoResponse } from "./model/SlackUsersInfoResponse.js";
import { McpResult } from "../McpModels.js";

export class SlackFetcher {
  private static readonly DEFAULT_MAX_LENGTH = Constants.DEFAULT_MAX_LENGTH;

  /**
   * Get Slack user OAuth token from environment variables
   */
  private static getAccessToken(): string {
    const token = process.env[Constants.ENV_SLACK_APP_USER_OAUTH_TOKEN];
    
    if (!token) {
      throw new Error(`${Constants.ENV_SLACK_APP_USER_OAUTH_TOKEN} environment variable is not set`);
    }
    
    return token;
  }

  /**
   * Parse Slack message URL to extract channel, timestamp, and thread info
   */
  private static parseSlackUrl(url: string): { channel: string; timestamp: string; threadTs?: string; isReply: boolean } {
    // URL format: https://inflab-team.slack.com/archives/C05PE858KM3/p1755772660352549
    // Reply URL format: https://inflab-team.slack.com/archives/C04PDK00Z6G/p1755850522927879?thread_ts=1755849456.239589&cid=C04PDK00Z6G
    const urlMatch = url.match(/\/archives\/([A-Z0-9]+)\/p(\d+)/);
    
    if (!urlMatch) {
      throw new Error("Invalid Slack message URL format. Expected format: .../archives/{CHANNEL_ID}/p{TIMESTAMP}");
    }
    
    const channel = urlMatch[1];
    const timestamp = urlMatch[2];
    
    // Convert timestamp format (remove 'p' prefix and add decimal point)
    const formattedTimestamp = timestamp.substring(0, 10) + '.' + timestamp.substring(10);
    
    // Check if this is a reply URL by looking for thread_ts parameter
    const urlObj = new URL(url);
    const threadTs = urlObj.searchParams.get('thread_ts');
    const isReply = Boolean(threadTs);
    
    return { 
      channel, 
      timestamp: formattedTimestamp, 
      threadTs: threadTs || undefined,
      isReply 
    };
  }

  /**
   * Create error result
   */
  private static createErrorResult(message: string): McpResult {
    return McpResult.error(message);
  }

  /**
   * Get user information by user ID
   */
  private static async getUserInfo(accessToken: string, userId: string): Promise<string> {
    try {
      const response = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return "Unknown User";
      }

      const rawData: ISlackUsersInfoResponse = await response.json();
      const data = new SlackUsersInfoResponse(rawData);
      
      if (!data.isSuccess) {
        return "Unknown User";
      }

      return data.user?.bestDisplayName || "Unknown User";
    } catch {
      return "Unknown User";
    }
  }

  /**
   * Get user information object by user ID
   */
  private static async getUserInfoObject(accessToken: string, userId: string): Promise<SlackUser | undefined> {
    try {
      const response = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return undefined;
      }

      const rawData: ISlackUsersInfoResponse = await response.json();
      const data = new SlackUsersInfoResponse(rawData);
      
      if (!data.isSuccess) {
        return undefined;
      }

      return data.user;
    } catch {
      return undefined;
    }
  }

  /**
   * Get SlackUser by user ID
   */
  private static async getSlackUserInfo(accessToken: string, userId: string): Promise<SlackUser | undefined> {
    try {
      const response = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return undefined;
      }

      const rawData: ISlackUsersInfoResponse = await response.json();
      const data = new SlackUsersInfoResponse(rawData);
      
      if (!data.isSuccess) {
        return undefined;
      }

      return data.user;
    } catch {
      return undefined;
    }
  }

  /**
   * Get specific reply message from thread
   */
  private static async getSpecificReply(accessToken: string, channel: string, threadTs: string, replyTs: string): Promise<SlackMessage | null> {
    try {
      const response = await fetch(`https://slack.com/api/conversations.replies?channel=${channel}&ts=${threadTs}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const rawData: ISlackConversationsRepliesResponse = await response.json();
      const data = new SlackConversationsRepliesResponse(rawData);
      
      if (!data.isSuccess) {
        return null;
      }

      // Find the specific reply message by timestamp
      const replyMessage = data.messages.find(msg => msg.timestamp === replyTs);
      return replyMessage || null;
    } catch {
      return null;
    }
  }

  /**
   * Get message replies as array (thread)
   */
  private static async getMessageRepliesArray(accessToken: string, channel: string, timestamp: string): Promise<SlackMessage[]> {
    try {
      const response = await fetch(`https://slack.com/api/conversations.replies?channel=${channel}&ts=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const rawData: ISlackConversationsRepliesResponse = await response.json();
      const data = new SlackConversationsRepliesResponse(rawData);
      
      if (!data.isSuccess || !data.hasReplies) {
        return [];
      }

      // Return SlackMessage class objects for replies
      return data.replies;

    } catch {
      return [];
    }
  }

  /**
   * Fetch Slack message information
   */
  static async fetchSlackMessage(request: ISlackRequest): Promise<McpResult> {
    try {
      const accessToken = this.getAccessToken();
      const { channel, timestamp, threadTs, isReply } = this.parseSlackUrl(request.url);
      
      if (isReply && threadTs) {
        // This is a reply URL, fetch the specific reply message
        return await this.handleReplyMessage(accessToken, channel, threadTs, timestamp, request);
      } else {
        // This is a regular message URL, fetch the message
        return await this.handleRegularMessage(accessToken, channel, timestamp, request);
      }

    } catch (error) {
      return this.createErrorResult((error as Error).message);
    }
  }

  /**
   * Handle reply message fetching
   */
  private static async handleReplyMessage(
    accessToken: string, 
    channel: string, 
    threadTs: string, 
    timestamp: string, 
    request: ISlackRequest
  ): Promise<McpResult> {
    const replyMessage = await this.getSpecificReply(accessToken, channel, threadTs, timestamp);
    
    if (!replyMessage) {
      return this.createErrorResult("Reply message not found");
    }
    
    const user = replyMessage.user ? await this.getUserInfoObject(accessToken, replyMessage.user) : undefined;
    const messageModel = new SlackMessageModel(replyMessage, channel, true, user, threadTs);
    
    return this.buildSlackResponse(messageModel, request, accessToken);
  }

  /**
   * Handle regular message fetching
   */
  private static async handleRegularMessage(
    accessToken: string, 
    channel: string, 
    timestamp: string, 
    request: ISlackRequest
  ): Promise<McpResult> {
    const response = await fetch(`https://slack.com/api/conversations.history?channel=${channel}&latest=${timestamp}&limit=1&inclusive=true`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return this.createErrorResult("Authentication failed. Please check your SLACK_APP_USER_OAUTH_TOKEN");
      }
      return this.createErrorResult(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const rawData: ISlackConversationsHistoryResponse = await response.json();
    const data = new SlackConversationsHistoryResponse(rawData);
    
    if (!data.isSuccess) {
      return this.createErrorResult(`Slack API error: ${data.error || 'Unknown error'}`);
    }

    if (!data.hasMessages) {
      return this.createErrorResult("Message not found");
    }

    const message = data.messages[0];
    const user = message.user ? await this.getUserInfoObject(accessToken, message.user) : undefined;
    
    // Get replies only for original messages
    const replies = message.threadTimestamp 
      ? await this.getMessageRepliesArray(accessToken, channel, message.timestamp || timestamp)
      : [];

    const messageModel = new SlackMessageModel(message, channel, false, user, undefined, replies);
    
    return this.buildSlackResponse(messageModel, request, accessToken);
  }

  /**
   * Build Slack response using SlackMessageModel
   */
  private static async buildSlackResponse(
    messageModel: SlackMessageModel, 
    request: ISlackRequest,
    accessToken: string
  ): Promise<McpResult> {
    // Build the response using ResponseBuilder and SlackMessageModel
    const builder = new ResponseBuilder()
      .addTitle(`Slack ${messageModel.messageContext} Information:`)
      .addField("Channel", messageModel.channelId)
      .addField("Timestamp", messageModel.formattedTimestamp)
      .addField("Author", messageModel.author)
      .addField("Type", messageModel.messageType)
      .addField("Thread", messageModel.threadInfo)
      .addFieldIf(messageModel.isMessageReply && Boolean(messageModel.originalThreadTimestamp), "Original Thread Timestamp", messageModel.originalThreadTimestamp || "")
      .addField("URL", request.url)
      .addSection("Message", messageModel.text);

    // Add reactions if present
    if (messageModel.hasReactions) {
      builder.addRaw(`\nReactions:\n${messageModel.formattedReactions}`);
    }
    
    // Add attachments if present
    if (messageModel.hasAttachments) {
      const attachmentItems = messageModel.getFormattedAttachments().map((attachment, index) => {
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
          const fieldItems = attachment.fields.map(field => `${field.title}: ${field.value}`);
          attachmentBuilder.addBulletList("Fields", fieldItems);
        }
        
        return `${index + 1}. ${attachmentBuilder.build()}`;
      });

      builder.addNumberedList("Attachments", attachmentItems);
    }
    
    // Add files if present
    if (messageModel.hasFiles) {
      const fileItems = messageModel.formattedFiles.map(file => {
        let fileInfo = file.info;
        if (file.url) fileInfo += `\n   URL: ${file.url}`;
        return fileInfo;
      });

      builder.addNumberedList("Files", fileItems);
    }
    
    // Add replies if present
    if (messageModel.hasReplies) {
      // Get unique user IDs from replies
      const uniqueUserIds = [...new Set(messageModel.formattedReplies.map(reply => reply.author).filter(userId => Boolean(userId)))];

      // Fetch all user information in parallel using SlackUser
      const userInfos = await Promise.all(uniqueUserIds.map(async userId => {
        const userInfo = await this.getSlackUserInfo(accessToken, userId);
        return { userId, userInfo };
      }));

      const replyItems = messageModel.formattedReplies.map(reply => {
        const userInfoData = userInfos.find(info => info.userId === reply.author);
        const userName = userInfoData?.userInfo?.bestDisplayName ?? "Unknown User";
        return `${userName} (${reply.timestamp}): ${reply.text}`;
      });

      builder.addBulletList("Replies", replyItems);
    }

    const result = builder.build(request.maxLength ?? this.DEFAULT_MAX_LENGTH);

    return McpResult.success(result);
  }
}
