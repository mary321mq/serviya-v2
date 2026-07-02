package com.serviya.payment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookNotificacionDTO {
  @NotBlank(message = "codigoOperacionExterna es obligatorio")
  private String codigoOperacionExterna;

  @NotBlank(message = "estadoExterno es obligatorio")
  private String estadoExterno;
}
