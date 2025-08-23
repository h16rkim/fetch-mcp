import { ResponseBuilder } from "../ResponseBuilder.js";
import { JiraTicket } from "./model/JiraTicket.js";

/**
 * Jira service specific response builder
 * Uses ResponseBuilder to generate formatted response strings for Jira entities
 */
export class JiraResponseBuilder {
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
   * Generate comprehensive Jira ticket summary
   */
  generateJiraTicketSummary(
    ticket: JiraTicket,
    url: string,
    maxLength?: number
  ): string {
    this._responseBuilder.clear();

    // Basic ticket info
    this._responseBuilder
      .addField("Ticket", ticket.key)
      .addField("Title", ticket.summary)
      .addField("Type", ticket.issueType)
      .addField("Status", ticket.status)
      .addField("Priority", ticket.priority)
      .addField("Assignee", ticket.assignee)
      .addField("Reporter", ticket.reporter)
      .addField("Created", ticket.created)
      .addField("Updated", ticket.updated)
      .addField("URL", url)
      .addSection("Description", ticket.description);

    // Add subtasks if available
    if (ticket.hasSubtasks) {
      const subtaskItems = ticket.subtasks.map(
        subtask => `${subtask.key}: ${subtask.summary} (${subtask.status})`
      );
      this._responseBuilder.addNumberedList("Subtasks", subtaskItems);
    }

    // Add comments if available (latest 20)
    if (ticket.hasComments) {
      const commentItems = ticket.comments.map(
        comment => `${comment.author.displayName} (${comment.created}):\n${comment.body}`
      );
      this._responseBuilder.addNumberedList("Recent Comments (Latest 20)", commentItems);
    }

    return this._responseBuilder.build(maxLength);
  }

  /**
   * Clear the internal ResponseBuilder state
   */
  clear(): JiraResponseBuilder {
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
