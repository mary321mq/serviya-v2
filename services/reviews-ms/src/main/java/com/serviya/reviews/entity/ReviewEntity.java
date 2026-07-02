package com.serviya.reviews.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long requestId; // ID de la solicitud de servicio

    @Column(nullable = false)
    private String clienteId;

    @Column(nullable = false)
    private String tecnicoId;

    @Column(nullable = false)
    private Integer rating; // 1 a 5

    @Column(length = 1000)
    private String comments;

    @Builder.Default
    @Column(nullable = false)
    private String status = "PUBLISHED";

    @Column(length = 1000)
    private String responseText;

    private String responseStatus;

    private LocalDateTime responseCreatedAt;

    private LocalDateTime responseUpdatedAt;

    @Column(length = 500)
    private String moderationReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    
    @PrePersist
    public void prePersist() {
        if (this.status == null || this.status.isBlank()) {
            this.status = "PUBLISHED";
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
