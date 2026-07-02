package com.serviya.payment.controller;

import com.serviya.payment.entity.TransaccionPago;
import com.serviya.payment.repository.TransaccionPagoRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

  private final TransaccionPagoRepository transaccionPagoRepository;
  private final com.serviya.payment.service.PaymentService paymentService;

  @GetMapping
  public ResponseEntity<List<TransaccionPago>> getAllPayments() {
    return ResponseEntity.ok(transaccionPagoRepository.findAllByOrderByCreatedAtDesc());
  }

  @GetMapping("/{id}/comprobante")
  public ResponseEntity<byte[]> descargarComprobante(@PathVariable("id") Long id) {
    byte[] pdf = paymentService.generarComprobantePdfAdmin(id);

    String filename = "comprobante-serviya-" + id + ".pdf";

    return ResponseEntity.ok()
        .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
        .header(
            org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
            org.springframework.http.ContentDisposition.attachment()
                .filename(filename)
                .build()
                .toString())
        .body(pdf);
  }
}
