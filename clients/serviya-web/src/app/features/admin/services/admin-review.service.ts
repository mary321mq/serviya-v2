import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import { AdminReview, ReviewModerationPayload } from '../models/admin-review.model';

@Injectable({ providedIn: 'root' })
export class AdminReviewService {
  private readonly api = inject(ApiClientService);

  getReviews(): Observable<AdminReview[]> {
    return this.api.get<AdminReview[]>('/review-ms/api/v1/admin/reviews');
  }

  getReview(reviewId: string): Observable<AdminReview> {
    return this.api.get<AdminReview>(`/review-ms/api/v1/admin/reviews/${reviewId}`);
  }

  hide(reviewId: string, payload: ReviewModerationPayload): Observable<AdminReview> {
    return this.api.post<AdminReview, ReviewModerationPayload>(
      `/review-ms/api/v1/admin/reviews/${reviewId}/hide`,
      payload
    );
  }

  restore(reviewId: string, payload: ReviewModerationPayload): Observable<AdminReview> {
    return this.api.post<AdminReview, ReviewModerationPayload>(
      `/review-ms/api/v1/admin/reviews/${reviewId}/restore`,
      payload
    );
  }
}
