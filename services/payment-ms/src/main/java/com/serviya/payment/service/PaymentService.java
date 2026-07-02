package com.serviya.payment.service;

import com.serviya.payment.dto.IntencionPagoRequestDTO;
import com.serviya.payment.dto.IntencionPagoResponseDTO;
import com.serviya.payment.dto.WebhookNotificacionDTO;

public interface PaymentService {
  IntencionPagoResponseDTO crearIntencionPago(IntencionPagoRequestDTO dto);

  void procesarWebhook(WebhookNotificacionDTO webhook);

  byte[] generarComprobantePdf(Long transaccionId, String clienteId);

  byte[] generarLiquidacionTecnicoPdf(Long transaccionId, String tecnicoId);

  byte[] generarComprobantePdfAdmin(Long transaccionId);
}
