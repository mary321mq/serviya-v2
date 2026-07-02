import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import {
  CreateTechnicianReviewResponsePayload,
  TechnicianReview,
  TechnicianReviewReply
} from '../models/technician-review.model';

@Injectable({ providedIn: 'root' })
export class TechnicianReviewService {
  private readonly api = inject(ApiClientService);

  getReviews(): Observable<TechnicianReview[]> {
    return this.api.get<TechnicianReview[]>('/review-ms/api/v1/me/technician/reviews');
  }

  getReview(reviewId: string): Observable<TechnicianReview> {
    return this.api.get<TechnicianReview>(`/review-ms/api/v1/me/technician/reviews/${reviewId}`);
  }

  respond(
    reviewId: string,
    payload: CreateTechnicianReviewResponsePayload
  ): Observable<TechnicianReviewReply> {
    return this.api.post<TechnicianReviewReply, CreateTechnicianReviewResponsePayload>(
      `/review-ms/api/v1/me/technician/reviews/${reviewId}/response`,
      payload
    );
  }
}
