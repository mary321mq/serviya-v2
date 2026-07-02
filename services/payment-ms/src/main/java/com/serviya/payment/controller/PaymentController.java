package com.serviya.payment.controller;

import com.serviya.payment.dto.IntencionPagoRequestDTO;
import com.serviya.payment.dto.IntencionPagoResponseDTO;
import com.serviya.payment.dto.WebhookNotificacionDTO;
import com.serviya.payment.entity.TransaccionPago;
import com.serviya.payment.repository.TransaccionPagoRepository;
import com.serviya.payment.service.PaymentService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pagos")
@RequiredArgsConstructor
public class PaymentController {

  private final PaymentService paymentService;
  private final TransaccionPagoRepository transaccionPagoRepository;

  @PostMapping("/intencion")
  public ResponseEntity<IntencionPagoResponseDTO> crearIntencionPago(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody IntencionPagoRequestDTO dto) {

    // Forzar el clienteId del JWT por seguridad
    String keycloakId = jwt.getSubject();
    dto.setClienteId(keycloakId);

    IntencionPagoResponseDTO response = paymentService.crearIntencionPago(dto);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/webhook")
  public ResponseEntity<Void> recibirWebhook(@Valid @RequestBody WebhookNotificacionDTO webhook) {
    paymentService.procesarWebhook(webhook);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/mis-pagos")
  public ResponseEntity<List<TransaccionPago>> listarMisPagos(@AuthenticationPrincipal Jwt jwt) {
    return ResponseEntity.ok(transaccionPagoRepository.findByClienteIdOrderByCreatedAtDesc(jwt.getSubject()));
  }

  @GetMapping("/{id}/comprobante")
  public ResponseEntity<byte[]> descargarComprobante(
      @PathVariable("id") Long id, @AuthenticationPrincipal Jwt jwt) {
    byte[] pdf = paymentService.generarComprobantePdf(id, jwt.getSubject());
    String filename = "comprobante-serviya-" + id + ".pdf";

    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment().filename(filename).build().toString())
        .body(pdf);
  }

  @GetMapping("/{id}/liquidacion")
  public ResponseEntity<byte[]> descargarLiquidacion(
      @PathVariable("id") Long id, @AuthenticationPrincipal Jwt jwt) {
    byte[] pdf = paymentService.generarLiquidacionTecnicoPdf(id, jwt.getSubject());
    String filename = "liquidacion-serviya-" + id + ".pdf";

    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment().filename(filename).build().toString())
        .body(pdf);
  }
}
