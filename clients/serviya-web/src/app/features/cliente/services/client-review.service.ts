import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import {
  ClientReview,
  ClientReviewEligibility,
  CreateClientReviewPayload
} from '../models/client-review.model';

@Injectable({ providedIn: 'root' })
export class ClientReviewService {
  private readonly api = inject(ApiClientService);

  getEligibleReviews(): Observable<ClientReviewEligibility[]> {
    return this.api.get<ClientReviewEligibility[]>('/review-ms/api/v1/me/reviews/eligible');
  }

  createReview(payload: CreateClientReviewPayload): Observable<ClientReview> {
    return this.api.post<ClientReview, CreateClientReviewPayload>(
      '/review-ms/api/v1/reviews',
      payload
    );
  }

  getReviews(): Observable<ClientReview[]> {
    return this.api.get<ClientReview[]>('/review-ms/api/v1/me/reviews');
  }

  getReview(reviewId: string): Observable<ClientReview> {
    return this.api.get<ClientReview>(`/review-ms/api/v1/me/reviews/${reviewId}`);
  }
}
