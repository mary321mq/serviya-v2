package com.serviya.technician.entity;

import com.serviya.technician.enums.EstadoPostulacion;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "postulaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Postulacion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String clienteId;

  @Column(nullable = false, length = 150)
  private String fullName;

  @Column(length = 20)
  private String phone;

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

  @Column(length = 500)
  private String aboutMe;

  @Column(length = 50)
  private String identityDocumentType;

  @Column(length = 50)
  private String identityDocumentNumber;

  @Column(length = 20)
  private String ruc;

  @Column(length = 255)
  private String categorias;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EstadoPostulacion estado;

  @Column(length = 150)
  private String requestedService;

  @Column(length = 100)
  private String experience;

  @Column(length = 100)
  private String availability;

  @Column(length = 150)
  private String preferredSchedule;

  @Column(length = 1000)
  private String evaluatorNotes;

  @Column(length = 150)
  private String evaluatorName;

  @Column(length = 50)
  private String evaluatorRole;

  private LocalDateTime evaluatedAt;

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
