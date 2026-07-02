package com.serviya.technician.entity;

import com.serviya.technician.enums.EstadoDisponibilidad;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "tecnico_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TecnicoProfile {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 255)
  private String categorias;

  @Column(length = 50)
  private String department;

  @Column(length = 50)
  private String province;

  @Column(length = 50)
  private String district;

  @Column(length = 255)
  private String addressLine;

  @Column(length = 255)
  private String reference;

  private Double lat;
  private Double lng;

  private Boolean hasStore;

  @Column(length = 150)
  private String storeName;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EstadoDisponibilidad estadoDisponibilidad;

  @Column(precision = 3, scale = 2)
  private BigDecimal ranking; // e.g. 4.50

  @Column(nullable = false, unique = true)
  private String clienteId;

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
