package com.serviya.payment.entity;

import com.serviya.payment.enums.EstadoPago;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "transacciones_pago")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransaccionPago {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long solicitudId;

  @Column(nullable = false)
  private String clienteId;

  private String tecnicoId;

  @Column(precision = 12, scale = 2, nullable = false)
  private BigDecimal montoTotal;

  @Column(precision = 12, scale = 2, nullable = false)
  private BigDecimal comisionServiya;

  @Column(precision = 12, scale = 2, nullable = false)
  private BigDecimal gananciaTecnico;

  @Column(length = 50, nullable = false)
  private String pasarela;

  @Column(unique = true)
  private String codigoOperacionExterna;

  @Column(length = 20, nullable = false)
  private String tipoComprobante;

  @Column(length = 10, nullable = false)
  private String tipoDocumento;

  @Column(length = 20, nullable = false)
  private String numeroDocumento;

  @Column(length = 160, nullable = false)
  private String nombreCliente;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EstadoPago estadoPago;

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
