package com.serviya.payment.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "wallet_movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletMovement {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String technicianId;

  @Column(nullable = false, length = 30)
  private String type;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal amount;

  @Column(nullable = false)
  @Builder.Default
  private String currency = "PEN";

  @Column(length = 240)
  private String description;

  @Column(updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}
