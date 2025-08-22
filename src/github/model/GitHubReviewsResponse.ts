import { IGitHubReviewsResponse } from "../GitHubTypes.js";
import { GitHubReview } from "./GitHubReview.js";

export class GitHubReviewsResponse {
  private _data: IGitHubReviewsResponse;

  constructor(data: IGitHubReviewsResponse) {
    this._data = data;
  }

  get ok(): boolean {
    return this._data.ok;
  }

  get reviews(): GitHubReview[] {
    if (!this._data.data) {
      return [];
    }
    return this._data.data.map(review => new GitHubReview(review));
  }

  get error(): string | undefined {
    return this._data.error;
  }

  get hasReviews(): boolean {
    return this.reviews.length > 0;
  }

  get isSuccess(): boolean {
    return this.ok && !this.error;
  }

  get reviewCount(): number {
    return this.reviews.length;
  }

  get approvedReviews(): GitHubReview[] {
    return this.reviews.filter(review => review.state === "APPROVED");
  }

  get changesRequestedReviews(): GitHubReview[] {
    return this.reviews.filter(review => review.state === "CHANGES_REQUESTED");
  }

  get commentReviews(): GitHubReview[] {
    return this.reviews.filter(review => review.state === "COMMENTED");
  }

  get dismissedReviews(): GitHubReview[] {
    return this.reviews.filter(review => review.state === "DISMISSED");
  }

  get pendingReviews(): GitHubReview[] {
    return this.reviews.filter(review => review.state === "PENDING");
  }

  get sortedBySubmittedAt(): GitHubReview[] {
    return [...this.reviews]
      .filter(review => review.submittedAt)
      .sort((a, b) => {
        const dateA = new Date(a.submittedAt!).getTime();
        const dateB = new Date(b.submittedAt!).getTime();
        return dateA - dateB;
      });
  }

  get latestReview(): GitHubReview | undefined {
    const submittedReviews = this.reviews.filter(review => review.submittedAt);
    if (submittedReviews.length === 0) {
      return undefined;
    }
    return submittedReviews.reduce((latest, review) => 
      new Date(review.submittedAt!) > new Date(latest.submittedAt!) ? review : latest
    );
  }

  get uniqueReviewers(): string[] {
    const reviewers = new Set(this.reviews.map(review => review.user.login));
    return Array.from(reviewers);
  }

  getReviewsByAuthor(authorLogin: string): GitHubReview[] {
    return this.reviews.filter(review => review.user.login === authorLogin);
  }

  get reviewSummary(): { approved: number; changesRequested: number; commented: number; dismissed: number; pending: number } {
    return {
      approved: this.approvedReviews.length,
      changesRequested: this.changesRequestedReviews.length,
      commented: this.commentReviews.length,
      dismissed: this.dismissedReviews.length,
      pending: this.pendingReviews.length
    };
  }
}
