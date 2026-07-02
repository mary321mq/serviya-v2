package com.serviya.reviews.controller;

import com.serviya.reviews.dto.CreateReviewDTO;
import com.serviya.reviews.entity.ReviewEntity;
import com.serviya.reviews.repository.ReviewRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;

    @PostMapping("/reviews")
    public ResponseEntity<Map<String, Object>> createReview(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String clienteIdHeader,
            @RequestBody CreateReviewDTO dto) {
        String currentClientId = resolveUserId(jwt, clienteIdHeader, null);
        Long requestId = requiredRequestId(dto);
        if (reviewRepository.existsByClienteIdAndRequestId(currentClientId, requestId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La solicitud ya fue calificada por el cliente.");
        }
        ReviewEntity review = ReviewEntity.builder()
                .clienteId(currentClientId)
                .tecnicoId(required(firstText(dto.getTecnicoId(), dto.getTechnicianId()), "tecnicoId"))
                .requestId(requestId)
                .rating(requiredRating(dto.getRating()))
                .comments(firstText(dto.getComments(), dto.getComment()))
                .status("PUBLISHED")
                .build();

        return ResponseEntity.ok(toReviewDto(reviewRepository.save(review)));
    }

    @GetMapping("/reviews/technician/{tecnicoId}")
    public ResponseEntity<List<Map<String, Object>>> getReviewsByTechnician(@PathVariable String tecnicoId) {
        return ResponseEntity.ok(reviewRepository.findByTecnicoIdOrderByCreatedAtDesc(tecnicoId).stream()
                .map(this::toReviewDto)
                .toList());
    }

    @GetMapping("/me/reviews/eligible")
    public ResponseEntity<List<Map<String, Object>>> getEligibleReviews() {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/me/reviews")
    public ResponseEntity<List<Map<String, Object>>> getMyReviews(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String clienteIdHeader) {
        String clienteId = resolveUserId(jwt, clienteIdHeader, null);
        return ResponseEntity.ok(reviewRepository.findByClienteIdOrderByCreatedAtDesc(clienteId).stream()
                .map(this::toReviewDto)
                .toList());
    }

    @GetMapping("/me/reviews/{reviewId}")
    public ResponseEntity<Map<String, Object>> getMyReview(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String clienteIdHeader,
            @PathVariable Long reviewId) {
        String clienteId = resolveUserId(jwt, clienteIdHeader, null);
        ReviewEntity review = findReview(reviewId);
        if (!clienteId.equals(review.getClienteId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Review does not belong to current client");
        }
        return ResponseEntity.ok(toReviewDto(review));
    }

    @GetMapping("/me/technician/reviews")
    public ResponseEntity<List<Map<String, Object>>> getTechnicianReviews(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String tecnicoIdHeader) {
        String tecnicoId = resolveUserId(jwt, tecnicoIdHeader, null);
        return ResponseEntity.ok(reviewRepository.findByTecnicoIdOrderByCreatedAtDesc(tecnicoId).stream()
                .map(this::toTechnicianReviewDto)
                .toList());
    }

    @GetMapping("/me/technician/reviews/{reviewId}")
    public ResponseEntity<Map<String, Object>> getTechnicianReview(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String tecnicoIdHeader,
            @PathVariable Long reviewId) {
        String tecnicoId = resolveUserId(jwt, tecnicoIdHeader, null);
        ReviewEntity review = findReview(reviewId);
        if (!tecnicoId.equals(review.getTecnicoId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Review does not belong to current technician");
        }
        return ResponseEntity.ok(toTechnicianReviewDto(review));
    }

    @PostMapping("/me/technician/reviews/{reviewId}/response")
    public ResponseEntity<Map<String, Object>> respondToReview(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String tecnicoIdHeader,
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> payload) {
        String tecnicoId = resolveUserId(jwt, tecnicoIdHeader, null);
        ReviewEntity review = findReview(reviewId);
        if (!tecnicoId.equals(review.getTecnicoId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Review does not belong to current technician");
        }

        LocalDateTime now = LocalDateTime.now();
        review.setResponseText(required(payload.get("responseText"), "responseText"));
        review.setResponseStatus("PUBLISHED");
        if (review.getResponseCreatedAt() == null) {
            review.setResponseCreatedAt(now);
        }
        review.setResponseUpdatedAt(now);
        reviewRepository.save(review);
        return ResponseEntity.ok(toResponseDto(review));
    }

    @GetMapping("/admin/reviews")
    public ResponseEntity<List<Map<String, Object>>> getAdminReviews() {
        return ResponseEntity.ok(reviewRepository.findAll().stream()
                .map(this::toReviewDto)
                .toList());
    }

    @GetMapping("/admin/reviews/{reviewId}")
    public ResponseEntity<Map<String, Object>> getAdminReview(@PathVariable Long reviewId) {
        return ResponseEntity.ok(toReviewDto(findReview(reviewId)));
    }

    @PostMapping("/admin/reviews/{reviewId}/hide")
    public ResponseEntity<Map<String, Object>> hideReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> payload) {
        ReviewEntity review = findReview(reviewId);
        review.setStatus("HIDDEN");
        review.setModerationReason(payload.get("reason"));
        return ResponseEntity.ok(toReviewDto(reviewRepository.save(review)));
    }

    @PostMapping("/admin/reviews/{reviewId}/restore")
    public ResponseEntity<Map<String, Object>> restoreReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> payload) {
        ReviewEntity review = findReview(reviewId);
        review.setStatus("PUBLISHED");
        review.setModerationReason(payload.get("reason"));
        return ResponseEntity.ok(toReviewDto(reviewRepository.save(review)));
    }

    private ReviewEntity findReview(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
    }

    private Map<String, Object> toTechnicianReviewDto(ReviewEntity review) {
        Map<String, Object> dto = toReviewDto(review);
        dto.put("response", review.getResponseText() == null ? null : toResponseDto(review));
        return dto;
    }

    private Map<String, Object> toReviewDto(ReviewEntity review) {
        Map<String, Object> dto = new java.util.LinkedHashMap<>();
        dto.put("publicId", String.valueOf(review.getId()));
        dto.put("serviceRequestId", String.valueOf(review.getRequestId()));
        dto.put("technicianId", review.getTecnicoId());
        dto.put("rating", review.getRating());
        dto.put("comment", review.getComments() == null ? "" : review.getComments());
        dto.put("status", review.getStatus() == null ? "PUBLISHED" : review.getStatus());
        dto.put("createdAt", review.getCreatedAt());
        dto.put("updatedAt", review.getUpdatedAt() == null ? review.getCreatedAt() : review.getUpdatedAt());
        return dto;
    }

    private Map<String, Object> toResponseDto(ReviewEntity review) {
        Map<String, Object> dto = new java.util.LinkedHashMap<>();
        dto.put("id", review.getId());
        dto.put("responseText", review.getResponseText());
        dto.put("status", review.getResponseStatus() == null ? "PUBLISHED" : review.getResponseStatus());
        dto.put("createdAt", review.getResponseCreatedAt());
        dto.put("updatedAt", review.getResponseUpdatedAt() == null ? review.getResponseCreatedAt() : review.getResponseUpdatedAt());
        return dto;
    }

    private Long requiredRequestId(CreateReviewDTO dto) {
        if (dto.getRequestId() != null) {
            return dto.getRequestId();
        }
        if (dto.getServiceRequestId() != null && !dto.getServiceRequestId().isBlank()) {
            try {
                return Long.parseLong(dto.getServiceRequestId());
            } catch (NumberFormatException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "serviceRequestId must be numeric");
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "requestId is required");
    }

    private Integer requiredRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rating must be between 1 and 5");
        }
        return rating;
    }

    private String required(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " is required");
        }
        return value;
    }

    private String firstText(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        return fallback;
    }

    private String resolveUserId(Jwt jwt, String headerValue, String fallback) {
        if (jwt != null && jwt.getSubject() != null && !jwt.getSubject().isBlank()) {
            return jwt.getSubject();
        }
        if (headerValue != null && !headerValue.isBlank()) {
            return headerValue;
        }
        return fallback;
    }
}
