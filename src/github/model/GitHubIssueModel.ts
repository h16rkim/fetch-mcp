import { GitHubIssue } from "./GitHubIssue.js";
import { GitHubIssueComment } from "./GitHubIssueComment.js";

export class GitHubIssueModel {
  private _issue: GitHubIssue;
  private _comments: GitHubIssueComment[];

  constructor(
    issue: GitHubIssue,
    comments: GitHubIssueComment[] = []
  ) {
    this._issue = issue;
    this._comments = comments;
  }

  get issue(): GitHubIssue {
    return this._issue;
  }

  get comments(): GitHubIssueComment[] {
    return this._comments;
  }

  get hasComments(): boolean {
    return this._comments.length > 0;
  }

  get commentCount(): number {
    return this._comments.length;
  }

  get sortedCommentsByCreatedAt(): GitHubIssueComment[] {
    return [...this._comments].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  get latestComment(): GitHubIssueComment | undefined {
    if (this._comments.length === 0) {
      return undefined;
    }
    return this._comments.reduce((latest, comment) => 
      new Date(comment.createdAt) > new Date(latest.createdAt) ? comment : latest
    );
  }

  get uniqueCommentAuthors(): string[] {
    const authors = new Set(this._comments.map(comment => comment.user.login));
    return Array.from(authors);
  }

  get ownerComments(): GitHubIssueComment[] {
    return this._comments.filter(comment => comment.authorAssociation === "OWNER");
  }

  get memberComments(): GitHubIssueComment[] {
    return this._comments.filter(comment => comment.authorAssociation === "MEMBER");
  }

  get collaboratorComments(): GitHubIssueComment[] {
    return this._comments.filter(comment => comment.authorAssociation === "COLLABORATOR");
  }

  getCommentsByAuthor(authorLogin: string): GitHubIssueComment[] {
    return this._comments.filter(comment => comment.user.login === authorLogin);
  }

  generateSummary(): string {
    const sections = [];

    // Basic Issue Info
    sections.push(`# Issue #${this._issue.number}: ${this._issue.title}`);
    sections.push(`${this._issue.stateIcon} **Status**: ${this._issue.stateText}`);
    sections.push(`**Author**: ${this._issue.user.displayInfo}`);
    sections.push(`**Created**: ${this._issue.formattedCreatedAt}`);
    sections.push(`**Updated**: ${this._issue.formattedUpdatedAt}`);

    if (this._issue.closedAt) {
      sections.push(`**Closed**: ${this._issue.formattedClosedAt}`);
      if (this._issue.closedBy) {
        sections.push(`**Closed by**: ${this._issue.closedBy.displayInfo}`);
      }
    }

    // Labels
    if (this._issue.hasLabels) {
      sections.push(`**Labels**: ${this._issue.labelNames.join(", ")}`);
    }

    // Assignees
    if (this._issue.hasAssignees) {
      sections.push(`**Assignees**: ${this._issue.assigneeNames.join(", ")}`);
    }

    // Milestone
    if (this._issue.hasMilestone) {
      sections.push(`**Milestone**: ${this._issue.milestone!.title}`);
    }

    // Comments count
    sections.push(`**Comments**: ${this._issue.comments}`);

    // Description
    if (this._issue.body) {
      sections.push(`\n## Description\n${this._issue.body}`);
    }

    // Comments
    if (this.hasComments) {
      sections.push(`\n## Comments (${this.commentCount})`);
      
      const sortedComments = this.sortedCommentsByCreatedAt;
      sortedComments.forEach((comment, index) => {
        sections.push(`\n### Comment ${index + 1}`);
        sections.push(comment.displayInfo);
      });
    }

    // Statistics
    if (this.hasComments) {
      sections.push(`\n## Comment Statistics`);
      sections.push(`- **Total Comments**: ${this.commentCount}`);
      sections.push(`- **Unique Authors**: ${this.uniqueCommentAuthors.length}`);
      sections.push(`- **Authors**: ${this.uniqueCommentAuthors.join(", ")}`);
      
      if (this.ownerComments.length > 0) {
        sections.push(`- **Owner Comments**: ${this.ownerComments.length}`);
      }
      
      if (this.memberComments.length > 0) {
        sections.push(`- **Member Comments**: ${this.memberComments.length}`);
      }
      
      if (this.collaboratorComments.length > 0) {
        sections.push(`- **Collaborator Comments**: ${this.collaboratorComments.length}`);
      }
    }

    return sections.join("\n");
  }
}
