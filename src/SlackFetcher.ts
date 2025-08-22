import { 
  SlackRequest, 
  SlackConversationsHistoryResponse, 
  SlackConversationsRepliesResponse, 
  SlackUsersInfoResponse,
  SlackMessage,
  SlackUser
} from "./types.js";
import { Constants } from "./constants.js";
import { ResponseBuilder } from "./ResponseBuilder.js";
import { 
  SlackMessageModel, 
  SlackApiResponse, 
  SlackUserInfo, 
  SlackMessageInfo 
} from "./SlackModels.js";

interface SlackResult {
  content: Array<{ type: "text"; text: string }>;
  isError: boolean;
}

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
  private static createErrorResult(message: string): SlackResult {
    return {
      content: [{ 
        type: "text", 
        text: `Error: ${message}` 
      }],
      isError: true,
    };
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

      const data: SlackUsersInfoResponse = await response.json();
      
      if (!data.ok || !data.user) {
        return "Unknown User";
      }

      const userInfo = new SlackUserInfo(data.user);
      return userInfo.bestDisplayName;
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

      const data: SlackUsersInfoResponse = await response.json();
      
      if (!data.ok || !data.user) {
        return undefined;
      }

      return data.user;
    } catch {
      return undefined;
    }
  }

  /**
   * Get SlackUserInfo by user ID
   */
  private static async getSlackUserInfo(accessToken: string, userId: string): Promise<SlackUserInfo | undefined> {
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

      const data: SlackUsersInfoResponse = await response.json();
      
      if (!data.ok || !data.user) {
        return undefined;
      }

      return new SlackUserInfo(data.user);
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

      const data: SlackConversationsRepliesResponse = await response.json();
      
      if (!data.ok || !data.messages) {
        return null;
      }

      // Find the specific reply message by timestamp
      const replyMessage = data.messages.find(msg => msg.ts === replyTs);
      return replyMessage || null;
    } catch {
      return null;
    }
  }

  /**
   * Get message replies (thread)
   */
  private static async getMessageReplies(accessToken: string, channel: string, timestamp: string): Promise<string> {
    try {
      const response = await fetch(`https://slack.com/api/conversations.replies?channel=${channel}&ts=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return "";
      }

      const data: SlackConversationsRepliesResponse = await response.json();
      
      if (!data.ok || !data.messages || data.messages.length <= 1) {
        return "";
      }

      // Skip the first message (original message) and get replies
      const replies = data.messages.slice(1);
      
      // Extract unique user IDs from replies
      const uniqueUserIds = [...new Set(replies.map(reply => reply.user).filter(userId => Boolean(userId)))] as string[];

      // Fetch all user information in parallel using SlackUserInfo
      const userInfos = await Promise.all(uniqueUserIds.map(async userId => {
        const userInfo = await this.getSlackUserInfo(accessToken, userId);
        return { userId, userInfo };
      }));
      
      // Build replies using ResponseBuilder
      const replyItems = replies.map(reply => {
        const userInfoData = userInfos.find(info => info.userId === reply.user);
        const userName = userInfoData?.userInfo?.bestDisplayName ?? "Unknown User";
        const replyText = reply.text || "No content";
        const replyTime = reply.ts ? new Date(parseFloat(reply.ts) * 1000).toISOString() : "Unknown time";
        
        return `${userName} (${replyTime}): ${replyText}`;
      });

      return new ResponseBuilder()
        .addBulletList("Replies", replyItems)
        .build();

    } catch {
      return "";
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

      const data: SlackConversationsRepliesResponse = await response.json();
      
      if (!data.ok || !data.messages || data.messages.length <= 1) {
        return [];
      }

      // Skip the first message (original message) and get replies
      return data.messages.slice(1);

    } catch {
      return [];
    }
  }

  /**
   * Fetch Slack message information
   */
  static async fetchSlackMessage(request: SlackRequest): Promise<SlackResult> {
    try {
      const accessToken = this.getAccessToken();
      const { channel, timestamp, threadTs, isReply } = this.parseSlackUrl(request.url);
      
      let message: SlackMessage;
      let user: SlackUser | undefined;

      if (isReply && threadTs) {
        // This is a reply URL, fetch the specific reply message
        const replyMessage = await this.getSpecificReply(accessToken, channel, threadTs, timestamp);
        
        if (!replyMessage) {
          return this.createErrorResult("Reply message not found");
        }
        
        message = replyMessage;
      } else {
        // This is a regular message URL, fetch the message
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

        const data: SlackConversationsHistoryResponse = await response.json();
        
        if (!data.ok) {
          return this.createErrorResult(`Slack API error: ${data.error || 'Unknown error'}`);
        }

        if (!data.messages || data.messages.length === 0) {
          return this.createErrorResult("Message not found");
        }

        message = data.messages[0];
      }
      
      // Get user information
      if (message.user) {
        user = await this.getUserInfoObject(accessToken, message.user);
      }
      
      // Get replies only for original messages (not for reply messages)
      let replies: SlackMessage[] = [];
      if (!isReply && message.thread_ts) {
        replies = await this.getMessageRepliesArray(accessToken, channel, message.ts || timestamp);
      }

      // Create SlackMessageModel
      const slackApiResponse: SlackApiResponse = {
        message,
        user,
        channel,
        isReply,
        threadTs,
        replies
      };

      const messageModel = new SlackMessageModel(slackApiResponse);

      // Build the response using ResponseBuilder and SlackMessageModel
      const builder = new ResponseBuilder()
        .addTitle(`Slack ${messageModel.messageContext} Information:`)
        .addField("Channel", messageModel.channel)
        .addField("Timestamp", messageModel.formattedTimestamp)
        .addField("Author", messageModel.author)
        .addField("Type", messageModel.messageType)
        .addField("Thread", messageModel.threadInfo)
        .addFieldIf(messageModel.isReply && Boolean(messageModel.originalThreadTimestamp), "Original Thread Timestamp", messageModel.originalThreadTimestamp || "")
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

        // Fetch all user information in parallel using SlackUserInfo
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

      return {
        content: [{ type: "text", text: result }],
        isError: false,
      };

    } catch (error) {
      return this.createErrorResult((error as Error).message);
    }
  }
}
