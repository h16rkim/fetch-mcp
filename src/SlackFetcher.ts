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
   * Parse Slack message URL to extract channel and timestamp
   */
  private static parseSlackUrl(url: string): { channel: string; timestamp: string } {
    // URL format: https://inflab-team.slack.com/archives/C05PE858KM3/p1755772660352549
    const urlMatch = url.match(/\/archives\/([A-Z0-9]+)\/p(\d+)/);
    
    if (!urlMatch) {
      throw new Error("Invalid Slack message URL format. Expected format: .../archives/{CHANNEL_ID}/p{TIMESTAMP}");
    }
    
    const channel = urlMatch[1];
    const timestamp = urlMatch[2];
    
    // Convert timestamp format (remove 'p' prefix and add decimal point)
    const formattedTimestamp = timestamp.substring(0, 10) + '.' + timestamp.substring(10);
    
    return { channel, timestamp: formattedTimestamp };
  }

  /**
   * Apply length limits to text content
   */
  private static applyLengthLimits(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength);
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
      
      // Build replies text with user information from the map
      let repliesText = "\n\nReplies:\n";
      for (const reply of replies) {
        const userInfo = userInfos.find(info => info.userId === reply.user);
        const userName = userInfo?.userName ?? "Unknown User";
        const replyText = reply.text || "No content";
        const replyTime = reply.ts ? new Date(parseFloat(reply.ts) * 1000).toISOString() : "Unknown time";
        
        repliesText += `- ${userName} (${replyTime}): ${replyText}\n`;
      }

      return repliesText;
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

    let reactionsText = "\n\nReactions:\n";
    reactions.forEach(reaction => {
      const emoji = reaction.name || "unknown";
      const count = reaction.count || 0;
      reactionsText += `${emoji}: ${count} `;
    });

    return reactionsText.trim();
  }

  /**
   * Format attachments
   */
  private static formatAttachments(attachments?: SlackAttachment[]): string {
    if (!attachments || attachments.length === 0) {
      return "";
    }

    let attachmentsText = "\n\nAttachments:\n";
    attachments.forEach((attachment, index) => {
      attachmentsText += `${index + 1}. `;
      
      if (attachment.title) {
        attachmentsText += `Title: ${attachment.title}\n`;
      }
      
      if (attachment.text) {
        attachmentsText += `Content: ${attachment.text}\n`;
      }
      
      if (attachment.pretext) {
        attachmentsText += `Pretext: ${attachment.pretext}\n`;
      }
      
      if (attachment.image_url) {
        attachmentsText += `Image: ${attachment.image_url}\n`;
      }
      
      if (attachment.thumb_url) {
        attachmentsText += `Thumbnail: ${attachment.thumb_url}\n`;
      }
      
      if (attachment.from_url) {
        attachmentsText += `URL: ${attachment.from_url}\n`;
      }
      
      if (attachment.service_name) {
        attachmentsText += `Service: ${attachment.service_name}\n`;
      }
      
      if (attachment.author_name) {
        attachmentsText += `Author: ${attachment.author_name}\n`;
      }
      
      if (attachment.fields && attachment.fields.length > 0) {
        attachmentsText += `Fields:\n`;
        attachment.fields.forEach(field => {
          attachmentsText += `  - ${field.title}: ${field.value}\n`;
        });
      }
      
      attachmentsText += "\n";
    });

    return attachmentsText;
  }

  /**
   * Fetch Slack message information
   */
  static async fetchSlackMessage(request: SlackRequest): Promise<SlackResult> {
    try {
      const accessToken = this.getAccessToken();
      const { channel, timestamp } = this.parseSlackUrl(request.url);
      
      // Get message information
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

      const message: SlackMessage = data.messages[0];
      
      // Get user information
      const userName = await this.getUserInfo(accessToken, message.user || "Unknown");
      
      // Get message content
      const messageText = message.text || "No content";
      const messageTime = message.ts ? new Date(parseFloat(message.ts) * 1000).toISOString() : "Unknown time";
      
      // Get message type and subtype info
      const messageType = message.type || "message";
      const messageSubtype = message.subtype ? ` (${message.subtype})` : "";
      
      // Get thread info
      const threadInfo = message.thread_ts ? `\nThread: Yes (${message.reply_count || 0} replies)` : "";
      
      // Get replies
      const repliesText = await this.getMessageReplies(accessToken, channel, timestamp);
      
      // Format reactions
      const reactionsText = this.formatReactions(message.reactions);
      
      // Format attachments
      const attachmentsText = this.formatAttachments(message.attachments);
      
      // Format files if present
      let filesText = "";
      if (message.files && message.files.length > 0) {
        filesText = "\n\nFiles:\n";
        message.files.forEach((file, index) => {
          filesText += `${index + 1}. ${file.name || file.title || 'Unnamed file'}`;
          if (file.mimetype) filesText += ` (${file.mimetype})`;
          if (file.size) filesText += ` - ${Math.round(file.size / 1024)}KB`;
          if (file.permalink) filesText += `\n   URL: ${file.permalink}`;
          filesText += "\n";
        });
      }

      const result = `Slack Message Information:
Channel: ${channel}
Timestamp: ${messageTime}
Author: ${userName}
Type: ${messageType}${messageSubtype}${threadInfo}
URL: ${request.url}

Message:
${messageText}${reactionsText}${attachmentsText}${filesText}${repliesText}`;

      const processedContent = this.applyLengthLimits(
        result,
        request.maxLength ?? this.DEFAULT_MAX_LENGTH
      );

      return {
        content: [{ type: "text", text: processedContent }],
        isError: false,
      };

    } catch (error) {
      return this.createErrorResult((error as Error).message);
    }
  }
}
