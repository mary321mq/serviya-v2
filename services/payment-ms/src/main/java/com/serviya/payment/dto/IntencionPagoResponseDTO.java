package com.serviya.payment.dto;

import com.serviya.payment.enums.EstadoPago;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntencionPagoResponseDTO {
  private Long id;
  private EstadoPago estadoPago;
  private String codigoOperacionExterna;
}
