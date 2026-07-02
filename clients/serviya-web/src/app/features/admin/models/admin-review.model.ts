export interface AdminReview {
  readonly publicId: string;
  readonly serviceRequestId: string;
  readonly technicianId: string;
  readonly rating: number;
  readonly comment: string | null;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ReviewModerationPayload {
  readonly reason: string;
}
