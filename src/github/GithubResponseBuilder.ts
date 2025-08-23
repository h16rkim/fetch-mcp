import { ResponseBuilder } from "../ResponseBuilder.js";
import { GitHubPullRequestModel } from "./model/GitHubPullRequestModel.js";
import { GitHubIssueModel } from "./model/GitHubIssueModel.js";

/**
 * GitHub service specific response builder
 * Uses ResponseBuilder to generate formatted response strings for GitHub entities
 */
export class GithubResponseBuilder {
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
   * Generate comprehensive Pull Request summary
   */
  generatePullRequestSummary(prModel: GitHubPullRequestModel): string {
    this._responseBuilder.clear();

    // Basic PR Info
    this._responseBuilder
      .addTitle(`# Pull Request #${prModel.pullRequest.number}: ${prModel.pullRequest.title}`)
      .addField(`${prModel.pullRequest.stateIcon} **Status**`, prModel.pullRequest.stateText)
      .addField("**Author**", prModel.pullRequest.user.displayInfo)
      .addField("**Created**", prModel.pullRequest.formattedCreatedAt)
      .addField("**Updated**", prModel.pullRequest.formattedUpdatedAt);

    // Merge/Close info
    if (prModel.pullRequest.mergedAt) {
      this._responseBuilder.addField("**Merged**", prModel.pullRequest.formattedMergedAt || "");
      if (prModel.pullRequest.mergedBy) {
        this._responseBuilder.addField("**Merged by**", prModel.pullRequest.mergedBy.displayInfo);
      }
    }

    if (prModel.pullRequest.closedAt && !prModel.pullRequest.merged) {
      this._responseBuilder.addField("**Closed**", prModel.pullRequest.formattedClosedAt || "");
    }

    // Branch Info
    this._responseBuilder.addField("**Branch**", `${prModel.pullRequest.head.ref} → ${prModel.pullRequest.base.ref}`);

    // Labels
    if (prModel.pullRequest.labelNames.length > 0) {
      this._responseBuilder.addField("**Labels**", prModel.pullRequest.labelNames.join(", "));
    }

    // Assignees
    if (prModel.pullRequest.assigneeNames.length > 0) {
      this._responseBuilder.addField("**Assignees**", prModel.pullRequest.assigneeNames.join(", "));
    }

    // Reviewers
    if (prModel.pullRequest.requestedReviewerNames.length > 0) {
      this._responseBuilder.addField("**Requested Reviewers**", prModel.pullRequest.requestedReviewerNames.join(", "));
    }

    // Changes Summary
    this._responseBuilder.addField("**Changes**", prModel.pullRequest.changesSummary);

    // Description
    if (prModel.pullRequest.body) {
      this._responseBuilder.addSection("## Description", prModel.pullRequest.body);
    }

    // Files Changed
    if (prModel.hasFiles) {
      const fileItems = prModel.files.map(file => file.displayInfo);
      this._responseBuilder.addBulletList(`## Files Changed (${prModel.files.length})`, fileItems);
    }

    // Reviews
    if (prModel.hasReviews) {
      const reviewItems = prModel.reviews.map(review => review.displayInfo);
      this._responseBuilder.addBulletList(`## Reviews (${prModel.reviews.length})`, reviewItems);
    }

    // Comments
    if (prModel.hasComments) {
      const commentItems = prModel.comments.map(comment => comment.displayInfo);
      this._responseBuilder.addBulletList(`## Comments (${prModel.comments.length})`, commentItems);
    }

    return this._responseBuilder.build();
  }

  /**
   * Generate comprehensive Issue summary
   */
  generateIssueSummary(issueModel: GitHubIssueModel): string {
    this._responseBuilder.clear();

    // Basic Issue Info
    this._responseBuilder
      .addTitle(`# Issue #${issueModel.issue.number}: ${issueModel.issue.title}`)
      .addField(`${issueModel.issue.stateIcon} **Status**`, issueModel.issue.stateText)
      .addField("**Author**", issueModel.issue.user.displayInfo)
      .addField("**Created**", issueModel.issue.formattedCreatedAt)
      .addField("**Updated**", issueModel.issue.formattedUpdatedAt);

    // Close info
    if (issueModel.issue.closedAt) {
      this._responseBuilder.addField("**Closed**", issueModel.issue.formattedClosedAt || "");
      if (issueModel.issue.closedBy) {
        this._responseBuilder.addField("**Closed by**", issueModel.issue.closedBy.displayInfo);
      }
    }

    // Labels
    if (issueModel.issue.hasLabels) {
      this._responseBuilder.addField("**Labels**", issueModel.issue.labelNames.join(", "));
    }

    // Assignees
    if (issueModel.issue.hasAssignees) {
      this._responseBuilder.addField("**Assignees**", issueModel.issue.assigneeNames.join(", "));
    }

    // Milestone
    if (issueModel.issue.hasMilestone) {
      this._responseBuilder.addField("**Milestone**", issueModel.issue.milestone!.title);
    }

    // Comments count
    this._responseBuilder.addField("**Comments**", issueModel.issue.comments.toString());

    // Description
    if (issueModel.issue.body) {
      this._responseBuilder.addSection("## Description", issueModel.issue.body);
    }

    // Comments
    if (issueModel.hasComments) {
      this._responseBuilder.addContent(`\n## Comments (${issueModel.commentCount})`);
      
      const sortedComments = issueModel.sortedCommentsByCreatedAt;
      sortedComments.forEach((comment, index) => {
        this._responseBuilder
          .addContent(`\n### Comment ${index + 1}`)
          .addContent(comment.displayInfo);
      });
    }

    // Statistics
    if (issueModel.hasComments) {
      this._responseBuilder.addContent("\n## Comment Statistics");
      
      const statisticsFields: Record<string, string> = {
        "**Total Comments**": issueModel.commentCount.toString(),
        "**Unique Authors**": issueModel.uniqueCommentAuthors.length.toString(),
        "**Authors**": issueModel.uniqueCommentAuthors.join(", ")
      };

      this._responseBuilder.addFields(statisticsFields);
      
      if (issueModel.ownerComments.length > 0) {
        this._responseBuilder.addField("**Owner Comments**", issueModel.ownerComments.length.toString());
      }
      
      if (issueModel.memberComments.length > 0) {
        this._responseBuilder.addField("**Member Comments**", issueModel.memberComments.length.toString());
      }
      
      if (issueModel.collaboratorComments.length > 0) {
        this._responseBuilder.addField("**Collaborator Comments**", issueModel.collaboratorComments.length.toString());
      }
    }

    return this._responseBuilder.build();
  }

  /**
   * Clear the internal ResponseBuilder state
   */
  clear(): GithubResponseBuilder {
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
