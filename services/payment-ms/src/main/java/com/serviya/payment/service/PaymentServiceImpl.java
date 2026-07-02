package com.serviya.payment.service;

import com.serviya.payment.client.CreateNotificationDTO;
import com.serviya.payment.client.NotificationClient;
import com.serviya.payment.dto.IntencionPagoRequestDTO;
import com.serviya.payment.dto.IntencionPagoResponseDTO;
import com.serviya.payment.dto.WebhookNotificacionDTO;
import com.serviya.payment.entity.ConfiguracionPago;
import com.serviya.payment.entity.TransaccionPago;
import com.serviya.payment.enums.EstadoPago;
import com.serviya.payment.repository.ConfiguracionPagoRepository;
import com.serviya.payment.repository.TransaccionPagoRepository;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

  private final TransaccionPagoRepository transaccionPagoRepository;
  private final ConfiguracionPagoRepository configuracionPagoRepository;
  private final NotificationClient notificationClient;

  @Override
  @Transactional
  public IntencionPagoResponseDTO crearIntencionPago(IntencionPagoRequestDTO dto) {
    validarComprobante(dto);

    ConfiguracionPago config = getConfiguracionActual();

    BigDecimal montoTotal = dto.getMontoTotal().setScale(2, RoundingMode.HALF_UP);
    BigDecimal comision =
        montoTotal.multiply(config.getComisionPorcentaje()).setScale(2, RoundingMode.HALF_UP);
    BigDecimal gananciaPorcentaje = BigDecimal.ONE.subtract(config.getComisionPorcentaje());
    BigDecimal ganancia = montoTotal.multiply(gananciaPorcentaje).setScale(2, RoundingMode.HALF_UP);
    String pasarela = normalizarPasarela(dto.getPasarela());
    String codigoOperacionExterna = generarCodigoOperacion(dto, pasarela);

    TransaccionPago transaccion =
        TransaccionPago.builder()
            .solicitudId(dto.getSolicitudId())
            .clienteId(dto.getClienteId())
            .montoTotal(montoTotal)
            .comisionServiya(comision)
            .gananciaTecnico(ganancia)
            .pasarela(pasarela)
            .codigoOperacionExterna(codigoOperacionExterna)
            .tipoComprobante(dto.getTipoComprobante())
            .tipoDocumento(dto.getTipoDocumento())
            .numeroDocumento(dto.getNumeroDocumento())
            .nombreCliente(dto.getNombreCliente().trim())
            .estadoPago(EstadoPago.PENDIENTE)
            .build();

    TransaccionPago saved = transaccionPagoRepository.save(transaccion);
    notifyClient(
        saved.getClienteId(),
        "Pago pendiente",
        "Tu pago para la solicitud #"
            + saved.getSolicitudId()
            + " fue creado por S/ "
            + saved.getMontoTotal()
            + ". Completa el pago para continuar.",
        "/cliente/checkout?solicitudId="
            + saved.getSolicitudId()
            + "&monto="
            + saved.getMontoTotal(),
        "PAYMENT_PENDING",
        "payment-" + saved.getId());

    return IntencionPagoResponseDTO.builder()
        .id(saved.getId())
        .estadoPago(saved.getEstadoPago())
        .codigoOperacionExterna(saved.getCodigoOperacionExterna())
        .build();
  }

  @Override
  @Transactional
  public void procesarWebhook(WebhookNotificacionDTO webhook) {
    Optional<TransaccionPago> optTransaccion =
        buscarTransaccion(webhook.getCodigoOperacionExterna());

    if (optTransaccion.isPresent()) {
      TransaccionPago transaccion = optTransaccion.get();
      if ("APPROVED".equalsIgnoreCase(webhook.getEstadoExterno())) {
        transaccion.setEstadoPago(EstadoPago.PAGADO_ESCROW);
        transaccionPagoRepository.save(transaccion);
        notifyClient(
            transaccion.getClienteId(),
            "Pago realizado exitosamente",
            "Confirmamos el pago de la solicitud #"
                + transaccion.getSolicitudId()
                + " por S/ "
                + transaccion.getMontoTotal()
                + ".",
            "/cliente/pagos",
            "PAYMENT_SUCCESS",
            "payment-" + transaccion.getId());

        System.out.println(
            "Pago exitoso en Escrow para transaccion interna: " + transaccion.getId());
      } else if ("REJECTED".equalsIgnoreCase(webhook.getEstadoExterno())
          || "FAILED".equalsIgnoreCase(webhook.getEstadoExterno())) {
        transaccion.setEstadoPago(EstadoPago.FALLIDO);
        transaccionPagoRepository.save(transaccion);
        notifyClient(
            transaccion.getClienteId(),
            "Pago rechazado",
            "No pudimos confirmar el pago de la solicitud #"
                + transaccion.getSolicitudId()
                + ". Intentalo nuevamente.",
            "/cliente/checkout?solicitudId="
                + transaccion.getSolicitudId()
                + "&monto="
                + transaccion.getMontoTotal(),
            "PAYMENT_FAILED",
            "payment-" + transaccion.getId());
      }
    } else {
      // Manejo cuando el Webhook llega antes que guardemos el codigoExterno, o es una transaccion
      // no rastreada.
      // Para propósitos de esta implementación inicial, lanzaremos un log
      System.err.println(
          "Transaccion no encontrada para codigo de operacion: "
              + webhook.getCodigoOperacionExterna());
    }
  }

  @Override
  @Transactional(readOnly = true)
  public byte[] generarComprobantePdfAdmin(Long transaccionId) {
    TransaccionPago transaccion =
        transaccionPagoRepository
            .findById(transaccionId)
            .orElseThrow(() -> new IllegalArgumentException("Transaccion de pago no encontrada."));

    return generarPdfDesdeTransaccion(transaccion);
  }

  @Override
  @Transactional(readOnly = true)
  public byte[] generarComprobantePdf(Long transaccionId, String clienteId) {
    TransaccionPago transaccion =
        transaccionPagoRepository
            .findByIdAndClienteId(transaccionId, clienteId)
            .orElseThrow(() -> new IllegalArgumentException("Transaccion de pago no encontrada."));

    return generarPdfDesdeTransaccion(transaccion);
  }

  private byte[] generarPdfDesdeTransaccion(TransaccionPago transaccion) {
    if (transaccion.getEstadoPago() != EstadoPago.PAGADO_ESCROW) {
      throw new IllegalStateException("El comprobante solo esta disponible para pagos aprobados.");
    }

    try (PDDocument document = new PDDocument();
        ByteArrayOutputStream output = new ByteArrayOutputStream()) {
      PDPage page = new PDPage(PDRectangle.A4);
      document.addPage(page);

      try (PDPageContentStream content = new PDPageContentStream(document, page)) {
        float y = 780;

        try (InputStream is = getClass().getResourceAsStream("/images/logo.png")) {
          if (is != null) {
            byte[] imageBytes = is.readAllBytes();
            PDImageXObject logoImage =
                PDImageXObject.createFromByteArray(document, imageBytes, "logo");
            content.drawImage(logoImage, 72, y - 20, 100, 36);
            y -= 40;
          } else {
            writeText(content, PDType1Font.HELVETICA_BOLD, 18, 72, y, "SERVIYA");
          }
        } catch (Exception e) {
          writeText(content, PDType1Font.HELVETICA_BOLD, 18, 72, y, "SERVIYA");
        }

        writeText(content, PDType1Font.HELVETICA, 10, 72, y - 18, "Servicios tecnicos a domicilio");
        writeText(content, PDType1Font.HELVETICA, 10, 72, y - 34, "RUC: 20731293088");

        String titulo =
            "FACTURA".equals(transaccion.getTipoComprobante())
                ? "FACTURA ELECTRONICA"
                : "BOLETA DE VENTA ELECTRONICA";
        writeText(content, PDType1Font.HELVETICA_BOLD, 15, 340, y, titulo);
        writeText(
            content,
            PDType1Font.HELVETICA,
            11,
            340,
            y - 20,
            "Serie: " + String.format("%08d", transaccion.getId()));
        writeText(
            content,
            PDType1Font.HELVETICA,
            11,
            340,
            y - 38,
            "Fecha: " + transaccion.getUpdatedAt().toLocalDate());

        y -= 95;
        writeText(content, PDType1Font.HELVETICA_BOLD, 12, 72, y, "CLIENTE");
        writeText(
            content,
            PDType1Font.HELVETICA,
            11,
            72,
            y - 22,
            "Nombre/Razon social: " + transaccion.getNombreCliente());
        writeText(
            content,
            PDType1Font.HELVETICA,
            11,
            72,
            y - 40,
            transaccion.getTipoDocumento() + ": " + transaccion.getNumeroDocumento());

        y -= 95;
        drawLine(content, 72, y, 525, y);
        writeText(content, PDType1Font.HELVETICA_BOLD, 10, 82, y - 18, "Item");
        writeText(content, PDType1Font.HELVETICA_BOLD, 10, 140, y - 18, "Descripcion");
        writeText(content, PDType1Font.HELVETICA_BOLD, 10, 420, y - 18, "Total");
        drawLine(content, 72, y - 28, 525, y - 28);

        writeText(content, PDType1Font.HELVETICA, 10, 82, y - 50, "1");
        writeText(
            content,
            PDType1Font.HELVETICA,
            10,
            140,
            y - 50,
            "Pago de solicitud #" + transaccion.getSolicitudId());
        writeText(
            content, PDType1Font.HELVETICA, 10, 420, y - 50, "S/ " + transaccion.getMontoTotal());
        drawLine(content, 72, y - 66, 525, y - 66);

        ConfiguracionPago config = getConfiguracionActual();
        BigDecimal igvPorcentaje = config.getIgvPorcentaje();
        BigDecimal divisor = BigDecimal.ONE.add(igvPorcentaje);

        BigDecimal subtotal = transaccion.getMontoTotal().divide(divisor, 2, RoundingMode.HALF_UP);
        BigDecimal igv =
            transaccion.getMontoTotal().subtract(subtotal).setScale(2, RoundingMode.HALF_UP);
        writeText(content, PDType1Font.HELVETICA, 10, 340, y - 95, "Subtotal:");
        writeText(content, PDType1Font.HELVETICA, 10, 420, y - 95, "S/ " + subtotal);
        writeText(content, PDType1Font.HELVETICA, 10, 340, y - 115, "IGV:");
        writeText(content, PDType1Font.HELVETICA, 10, 420, y - 115, "S/ " + igv);
        writeText(content, PDType1Font.HELVETICA_BOLD, 12, 340, y - 140, "Total:");
        writeText(
            content,
            PDType1Font.HELVETICA_BOLD,
            12,
            420,
            y - 140,
            "S/ " + transaccion.getMontoTotal());

        writeText(
            content,
            PDType1Font.HELVETICA,
            9,
            72,
            95,
            "Operacion: " + transaccion.getCodigoOperacionExterna());
        writeText(
            content, PDType1Font.HELVETICA, 9, 72, 80, "Pasarela: " + transaccion.getPasarela());
        writeText(
            content,
            PDType1Font.HELVETICA,
            9,
            72,
            65,
            "Este comprobante fue generado automaticamente por ServiYa.");
      }

      document.save(output);
      return output.toByteArray();
    } catch (IOException ex) {
      throw new IllegalStateException("No se pudo generar el comprobante PDF.", ex);
    }
  }

  @Override
  @Transactional(readOnly = true)
  public byte[] generarLiquidacionTecnicoPdf(Long transaccionId, String tecnicoId) {
    TransaccionPago transaccion =
        transaccionPagoRepository
            .findByIdAndTecnicoId(transaccionId, tecnicoId)
            .orElseThrow(() -> new IllegalArgumentException("Transaccion de pago no encontrada."));

    if (transaccion.getEstadoPago() != EstadoPago.PAGADO_ESCROW) {
      throw new IllegalStateException("La liquidación solo esta disponible para pagos aprobados.");
    }

    try (PDDocument document = new PDDocument();
        ByteArrayOutputStream output = new ByteArrayOutputStream()) {
      PDPage page = new PDPage(PDRectangle.A4);
      document.addPage(page);

      try (PDPageContentStream content = new PDPageContentStream(document, page)) {
        float y = 780;
        writeText(content, PDType1Font.HELVETICA_BOLD, 18, 72, y, "SERVIYA");
        writeText(content, PDType1Font.HELVETICA, 10, 72, y - 18, "Liquidación de Pago a Técnico");
        writeText(content, PDType1Font.HELVETICA, 10, 72, y - 34, "RUC: 20138122256");

        writeText(content, PDType1Font.HELVETICA_BOLD, 15, 340, y, "LIQUIDACIÓN");
        writeText(
            content,
            PDType1Font.HELVETICA,
            11,
            340,
            y - 20,
            "Serie: LIQ-" + String.format("%08d", transaccion.getId()));
        writeText(
            content,
            PDType1Font.HELVETICA,
            11,
            340,
            y - 38,
            "Fecha: " + transaccion.getUpdatedAt().toLocalDate());

        y -= 95;
        writeText(content, PDType1Font.HELVETICA_BOLD, 12, 72, y, "TÉCNICO");
        writeText(
            content,
            PDType1Font.HELVETICA,
            11,
            72,
            y - 22,
            "ID Técnico: " + transaccion.getTecnicoId());

        y -= 95;
        drawLine(content, 72, y, 525, y);
        writeText(content, PDType1Font.HELVETICA_BOLD, 10, 82, y - 18, "Item");
        writeText(content, PDType1Font.HELVETICA_BOLD, 10, 140, y - 18, "Descripcion");
        writeText(content, PDType1Font.HELVETICA_BOLD, 10, 420, y - 18, "Monto");
        drawLine(content, 72, y - 28, 525, y - 28);

        writeText(content, PDType1Font.HELVETICA, 10, 82, y - 50, "1");
        writeText(
            content,
            PDType1Font.HELVETICA,
            10,
            140,
            y - 50,
            "Monto cobrado al cliente (Solicitud #" + transaccion.getSolicitudId() + ")");
        writeText(
            content, PDType1Font.HELVETICA, 10, 420, y - 50, "S/ " + transaccion.getMontoTotal());

        writeText(content, PDType1Font.HELVETICA, 10, 82, y - 65, "2");
        writeText(content, PDType1Font.HELVETICA, 10, 140, y - 65, "Comisión ServiYa (10%)");
        writeText(
            content,
            PDType1Font.HELVETICA,
            10,
            420,
            y - 65,
            "- S/ " + transaccion.getComisionServiya());

        drawLine(content, 72, y - 80, 525, y - 80);

        writeText(content, PDType1Font.HELVETICA_BOLD, 12, 280, y - 110, "A PAGAR AL TÉCNICO:");
        writeText(
            content,
            PDType1Font.HELVETICA_BOLD,
            12,
            420,
            y - 110,
            "S/ " + transaccion.getGananciaTecnico());

        writeText(
            content,
            PDType1Font.HELVETICA,
            9,
            72,
            95,
            "Operacion: " + transaccion.getCodigoOperacionExterna());
        writeText(
            content,
            PDType1Font.HELVETICA_BOLD,
            9,
            72,
            65,
            "IMPORTANTE: Por favor emitir Recibo por Honorarios Electrónico (RHE) por S/ "
                + transaccion.getGananciaTecnico());
        writeText(
            content,
            PDType1Font.HELVETICA_BOLD,
            9,
            72,
            50,
            "a nombre de ServiYa (RUC: 20138122256).");
      }

      document.save(output);
      return output.toByteArray();
    } catch (IOException ex) {
      throw new IllegalStateException("No se pudo generar la liquidación PDF.", ex);
    }
  }

  private void validarComprobante(IntencionPagoRequestDTO dto) {
    if (dto.getMontoTotal() == null || dto.getMontoTotal().compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("El montoTotal debe ser mayor a cero.");
    }
    if ("BOLETA".equals(dto.getTipoComprobante()) && !"DNI".equals(dto.getTipoDocumento())) {
      throw new IllegalArgumentException("La boleta debe emitirse con DNI.");
    }
    if ("FACTURA".equals(dto.getTipoComprobante()) && !"RUC".equals(dto.getTipoDocumento())) {
      throw new IllegalArgumentException("La factura debe emitirse con RUC.");
    }
    String numero = dto.getNumeroDocumento() == null ? "" : dto.getNumeroDocumento().trim();
    if ("DNI".equals(dto.getTipoDocumento()) && !numero.matches("\\d{8}")) {
      throw new IllegalArgumentException("El DNI debe tener 8 digitos.");
    }
    if ("RUC".equals(dto.getTipoDocumento()) && !numero.matches("\\d{11}")) {
      throw new IllegalArgumentException("El RUC debe tener 11 digitos.");
    }
    dto.setNumeroDocumento(numero);
  }

  private void notifyClient(
      String receiverId,
      String title,
      String message,
      String actionUrl,
      String type,
      String correlationId) {
    if (receiverId == null || receiverId.isBlank()) {
      return;
    }
    CreateNotificationDTO notification = new CreateNotificationDTO();
    notification.setReceiverId(receiverId);
    notification.setTitle(title);
    notification.setMessage(message);
    notification.setActionUrl(actionUrl);
    notification.setType(type);
    notification.setChannel("IN_APP");
    notification.setCorrelationId(correlationId);
    try {
      notificationClient.sendNotification(notification);
    } catch (Exception e) {
      System.err.println("Failed to send payment notification: " + e.getMessage());
    }
  }

  private String normalizarPasarela(String pasarela) {
    return pasarela != null && !pasarela.isBlank() ? pasarela.trim().toUpperCase() : "MERCADO_PAGO";
  }

  private String generarCodigoOperacion(IntencionPagoRequestDTO dto, String pasarela) {
    String codigoOperacionExterna = dto.getCodigoOperacionExterna();
    if ("YAPE_PLIN".equals(pasarela)
        && codigoOperacionExterna != null
        && !codigoOperacionExterna.isBlank()) {
      String numeroOperacion = codigoOperacionExterna.replaceAll("\\D", "");
      if (numeroOperacion.isBlank()) {
        numeroOperacion = "SINNUMERO";
      }
      return "YAPE-"
          + dto.getSolicitudId()
          + "-"
          + numeroOperacion
          + "-"
          + UUID.randomUUID().toString().substring(0, 8);
    }
    if (codigoOperacionExterna != null && !codigoOperacionExterna.isBlank()) {
      return codigoOperacionExterna.trim();
    }
    return "SIM-" + UUID.randomUUID();
  }

  private Optional<TransaccionPago> buscarTransaccion(String codigoOperacionExterna) {
    Optional<TransaccionPago> porCodigo =
        transaccionPagoRepository.findByCodigoOperacionExterna(codigoOperacionExterna);
    if (porCodigo.isPresent()) {
      return porCodigo;
    }
    try {
      return transaccionPagoRepository.findById(Long.parseLong(codigoOperacionExterna));
    } catch (NumberFormatException ex) {
      return Optional.empty();
    }
  }

  private void writeText(
      PDPageContentStream content, PDType1Font font, int size, float x, float y, String text)
      throws IOException {
    content.beginText();
    content.setFont(font, size);
    content.newLineAtOffset(x, y);
    content.showText(sanitizePdfText(text));
    content.endText();
  }

  private void drawLine(PDPageContentStream content, float x1, float y1, float x2, float y2)
      throws IOException {
    content.moveTo(x1, y1);
    content.lineTo(x2, y2);
    content.stroke();
  }

  private String sanitizePdfText(String text) {
    return text == null ? "" : text.replaceAll("[\\r\\n]", " ");
  }

  private ConfiguracionPago getConfiguracionActual() {
    return configuracionPagoRepository
        .findById(1L)
        .orElseGet(
            () -> {
              ConfiguracionPago config =
                  ConfiguracionPago.builder()
                      .id(1L)
                      .comisionPorcentaje(new BigDecimal("0.10"))
                      .igvPorcentaje(new BigDecimal("0.18"))
                      .yapeEnabled(true)
                      .culqiEnabled(true)
                      .build();
              return configuracionPagoRepository.save(config);
            });
  }
}
