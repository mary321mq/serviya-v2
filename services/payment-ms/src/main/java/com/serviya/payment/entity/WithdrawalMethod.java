package com.serviya.payment.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "withdrawal_methods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalMethod {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String technicianId;

  @Column(nullable = false, length = 30)
  private String type;

  @Column(nullable = false, length = 120)
  private String holderName;

  @Column(nullable = false, length = 160)
  private String destination;

  @Column(length = 80)
  private String alias;

  @Column(nullable = false)
  @Builder.Default
  private boolean active = true;

  @Column(updatable = false)
  private LocalDateTime createdAt;

  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = this.createdAt;
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
