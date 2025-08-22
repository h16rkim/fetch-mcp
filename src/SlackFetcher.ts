import { 
  SlackRequest, 
  SlackConversationsHistoryResponse, 
  SlackConversationsRepliesResponse, 
  SlackUsersInfoResponse,
  SlackMessage,
  SlackReaction,
  SlackAttachment
} from "./types.js";
import { Constants } from "./constants.js";
import { ResponseBuilder } from "./ResponseBuilder.js";

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

      const user = data.user;
      return user.profile?.display_name || 
             user.display_name || 
             user.profile?.real_name || 
             user.real_name || 
             user.name || 
             "Unknown User";
    } catch {
      return "Unknown User";
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

      // Fetch all user information in parallel
      const userInfos = await Promise.all(uniqueUserIds.map(userId =>
        this.getUserInfo(accessToken, userId).then(userName => ({ userId, userName }))
      ));
      
      // Build replies using ResponseBuilder
      const replyItems = replies.map(reply => {
        const userInfo = userInfos.find(info => info.userId === reply.user);
        const userName = userInfo?.userName ?? "Unknown User";
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
   * Format reactions (emojis)
   */
  private static formatReactions(reactions?: SlackReaction[]): string {
    if (!reactions || reactions.length === 0) {
      return "";
    }

    const reactionItems = reactions.map(reaction => {
      const emoji = reaction.name || "unknown";
      const count = reaction.count || 0;
      return `${emoji}: ${count}`;
    });

    return new ResponseBuilder()
      .addRaw(`\nReactions:\n${reactionItems.join(' ')}`)
      .build();
  }

  /**
   * Format attachments
   */
  private static formatAttachments(attachments?: SlackAttachment[]): string {
    if (!attachments || attachments.length === 0) {
      return "";
    }

    const attachmentItems = attachments.map((attachment, index) => {
      const builder = new ResponseBuilder();
      
      if (attachment.title) {
        builder.addField("Title", attachment.title);
      }
      
      if (attachment.text) {
        builder.addField("Content", attachment.text);
      }
      
      if (attachment.pretext) {
        builder.addField("Pretext", attachment.pretext);
      }
      
      if (attachment.image_url) {
        builder.addField("Image", attachment.image_url);
      }
      
      if (attachment.thumb_url) {
        builder.addField("Thumbnail", attachment.thumb_url);
      }
      
      if (attachment.from_url) {
        builder.addField("URL", attachment.from_url);
      }
      
      if (attachment.service_name) {
        builder.addField("Service", attachment.service_name);
      }
      
      if (attachment.author_name) {
        builder.addField("Author", attachment.author_name);
      }
      
      if (attachment.fields && attachment.fields.length > 0) {
        const fieldItems = attachment.fields.map(field => `${field.title}: ${field.value}`);
        builder.addBulletList("Fields", fieldItems);
      }
      
      return `${index + 1}. ${builder.build()}`;
    });

    return new ResponseBuilder()
      .addNumberedList("Attachments", attachmentItems)
      .build();
  }

  /**
   * Format files if present
   */
  private static formatFiles(files?: any[]): string {
    if (!files || files.length === 0) {
      return "";
    }

    const fileItems = files.map((file, index) => {
      let fileInfo = file.name || file.title || 'Unnamed file';
      if (file.mimetype) fileInfo += ` (${file.mimetype})`;
      if (file.size) fileInfo += ` - ${Math.round(file.size / 1024)}KB`;
      if (file.permalink) fileInfo += `\n   URL: ${file.permalink}`;
      return fileInfo;
    });

    return new ResponseBuilder()
      .addNumberedList("Files", fileItems)
      .build();
  }

  /**
   * Fetch Slack message information
   */
  static async fetchSlackMessage(request: SlackRequest): Promise<SlackResult> {
    try {
      const accessToken = this.getAccessToken();
      const { channel, timestamp, threadTs, isReply } = this.parseSlackUrl(request.url);
      
      let message: SlackMessage;
      let messageContext = "";

      if (isReply && threadTs) {
        // This is a reply URL, fetch the specific reply message
        const replyMessage = await this.getSpecificReply(accessToken, channel, threadTs, timestamp);
        
        if (!replyMessage) {
          return this.createErrorResult("Reply message not found");
        }
        
        message = replyMessage;
        messageContext = "Reply to Thread";
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
        messageContext = "Original Message";
      }
      
      // Get user information
      const userName = await this.getUserInfo(accessToken, message.user || "Unknown");
      
      // Get message content
      const messageText = message.text || "No content";
      const messageTime = message.ts ? new Date(parseFloat(message.ts) * 1000).toISOString() : "Unknown time";
      
      // Get message type and subtype info
      const messageType = message.type || "message";
      const messageSubtype = message.subtype ? ` (${message.subtype})` : "";
      
      // Get thread info
      const threadInfo = message.thread_ts ? `Yes (${message.reply_count || 0} replies)` : "No";
      
      // Get replies only for original messages (not for reply messages)
      const repliesText = !isReply ? await this.getMessageReplies(accessToken, channel, message.ts || timestamp) : "";
      
      // Format reactions
      const reactionsText = this.formatReactions(message.reactions);
      
      // Format attachments
      const attachmentsText = this.formatAttachments(message.attachments);
      
      // Format files if present
      const filesText = this.formatFiles(message.files);

      // Build the response using ResponseBuilder
      const builder = new ResponseBuilder()
        .addTitle(`Slack ${messageContext} Information:`)
        .addField("Channel", channel)
        .addField("Timestamp", messageTime)
        .addField("Author", userName)
        .addField("Type", `${messageType}${messageSubtype}`)
        .addField("Thread", threadInfo)
        .addFieldIf(isReply && Boolean(threadTs), "Original Thread Timestamp", threadTs || "")
        .addField("URL", request.url)
        .addSection("Message", messageText);

      // Add optional sections
      if (reactionsText) {
        builder.addRaw(reactionsText);
      }
      
      if (attachmentsText) {
        builder.addRaw(attachmentsText);
      }
      
      if (filesText) {
        builder.addRaw(filesText);
      }
      
      if (repliesText) {
        builder.addRaw(repliesText);
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
