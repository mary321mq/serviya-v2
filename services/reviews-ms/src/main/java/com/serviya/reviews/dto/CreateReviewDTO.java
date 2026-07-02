package com.serviya.reviews.dto;

import lombok.Data;

@Data
public class CreateReviewDTO {
    private String tecnicoId;
    private String technicianId;
    private Long requestId;
    private String serviceRequestId;
    private Integer rating;
    private String comments;
    private String comment;
}
