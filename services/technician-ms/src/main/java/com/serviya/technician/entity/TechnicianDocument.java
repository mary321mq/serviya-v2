package com.serviya.technician.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "technician_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianDocument {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(nullable = false)
  private String clienteId;

  @Column(nullable = false)
  private String documentType;

  @Column(nullable = false)
  private String originalFilename;

  @Column(nullable = false)
  private String fileUrl;

  @Column(nullable = false)
  private String status;

  private LocalDateTime uploadedAt;

  @PrePersist
  protected void onCreate() {
    this.uploadedAt = LocalDateTime.now();
    if (this.status == null) this.status = "PENDING_VERIFICATION";
  }
}
