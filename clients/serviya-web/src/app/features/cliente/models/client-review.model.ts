export interface ClientReviewEligibility {
  readonly serviceRequestId: string;
  readonly technicianId: string;
  readonly completedAt: string;
  readonly reviewDeadlineAt: string;
  readonly status: string;
}

export interface ClientReview {
  readonly publicId: string;
  readonly serviceRequestId: string;
  readonly technicianId: string;
  readonly rating: number;
  readonly comment: string | null;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateClientReviewPayload {
  readonly serviceRequestId?: string;
  readonly requestId?: number;
  readonly technicianId?: string;
  readonly tecnicoId?: string;
  readonly rating: number;
  readonly comment?: string;
  readonly comments?: string;
}
