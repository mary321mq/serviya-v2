package com.serviya.payment.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.*;

@Entity
@Table(name = "configuracion_pago")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracionPago {

  @Id private Long id; // Siempre será 1

  private BigDecimal comisionPorcentaje;
  private BigDecimal igvPorcentaje;
  private Boolean yapeEnabled;
  private Boolean culqiEnabled;
}
