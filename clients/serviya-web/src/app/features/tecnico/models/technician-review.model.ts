export interface TechnicianReviewReply {
  readonly id: number;
  readonly responseText: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TechnicianReview {
  readonly publicId: string;
  readonly serviceRequestId: string;
  readonly technicianId: string;
  readonly rating: number;
  readonly comment: string | null;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly response: TechnicianReviewReply | null;
}

export interface CreateTechnicianReviewResponsePayload {
  readonly responseText: string;
}
