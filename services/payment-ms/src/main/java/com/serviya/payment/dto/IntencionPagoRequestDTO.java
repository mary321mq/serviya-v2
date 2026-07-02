package com.serviya.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntencionPagoRequestDTO {
  @NotNull(message = "solicitudId es obligatorio")
  private Long solicitudId;

  private String clienteId;

  @NotNull(message = "montoTotal es obligatorio")
  private BigDecimal montoTotal;

  private String pasarela; // Opcional, por si el cliente elige una pasarela

  private String codigoOperacionExterna;

  @NotBlank(message = "tipoComprobante es obligatorio")
  @Pattern(regexp = "BOLETA|FACTURA", message = "tipoComprobante debe ser BOLETA o FACTURA")
  private String tipoComprobante;

  @NotBlank(message = "tipoDocumento es obligatorio")
  @Pattern(regexp = "DNI|RUC", message = "tipoDocumento debe ser DNI o RUC")
  private String tipoDocumento;

  @NotBlank(message = "numeroDocumento es obligatorio")
  private String numeroDocumento;

  @NotBlank(message = "nombreCliente es obligatorio")
  private String nombreCliente;
}
