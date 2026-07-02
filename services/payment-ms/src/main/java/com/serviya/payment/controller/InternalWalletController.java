package com.serviya.payment.controller;

import com.serviya.payment.dto.CreditWalletRequestDTO;
import com.serviya.payment.dto.UpdateTransaccionTecnicoDTO;
import com.serviya.payment.entity.TransaccionPago;
import com.serviya.payment.entity.Wallet;
import com.serviya.payment.entity.WalletMovement;
import com.serviya.payment.enums.EstadoPago;
import com.serviya.payment.repository.TransaccionPagoRepository;
import com.serviya.payment.repository.WalletMovementRepository;
import com.serviya.payment.repository.WalletRepository;
import java.math.BigDecimal;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/internal/wallets")
@RequiredArgsConstructor
public class InternalWalletController {

  private final WalletRepository walletRepository;
  private final WalletMovementRepository walletMovementRepository;
  private final TransaccionPagoRepository transaccionPagoRepository;

  @PostMapping("/transaccion/{solicitudId}/tecnico")
  @Transactional
  public ResponseEntity<Void> updateTransaccionTecnico(
          @PathVariable("solicitudId") Long solicitudId, @RequestBody UpdateTransaccionTecnicoDTO request) {
    Optional<TransaccionPago> transaccionOpt = transaccionPagoRepository.findBySolicitudId(solicitudId);
    if (transaccionOpt.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    TransaccionPago transaccion = transaccionOpt.get();
    transaccion.setTecnicoId(request.getTecnicoId());
    if (request.getGananciaTecnico() != null) {
      transaccion.setGananciaTecnico(request.getGananciaTecnico());
    }
    transaccionPagoRepository.save(transaccion);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/{technicianId}/credit")
  @Transactional
  public ResponseEntity<Void> creditWallet(
      @PathVariable("technicianId") String technicianId, @RequestBody CreditWalletRequestDTO request) {

    BigDecimal amount = request.getAmount() == null ? BigDecimal.ZERO : request.getAmount();
    if (amount.compareTo(BigDecimal.ZERO) <= 0) {
      return ResponseEntity.badRequest().build();
    }

    Wallet wallet =
        walletRepository
            .findByTechnicianId(technicianId)
            .orElseGet(() -> Wallet.builder().technicianId(technicianId).build());

    wallet.setBalance(wallet.getBalance().add(amount));
    if (request.getCurrency() != null && !request.getCurrency().isBlank()) {
      wallet.setCurrency(request.getCurrency());
    }
    walletRepository.save(wallet);

    walletMovementRepository.save(
        WalletMovement.builder()
            .technicianId(technicianId)
            .type("ABONO_SERVIYA")
            .amount(amount)
            .currency(wallet.getCurrency())
            .description(
                request.getReason() == null || request.getReason().isBlank()
                    ? "Abono por servicio completado"
                    : request.getReason())
            .build());

    // Update the transaction state to LIQUIDADO_AL_TECNICO if we can find the transaccion for the reason
    if (request.getReason() != null && request.getReason().contains("#")) {
      try {
        String idStr = request.getReason().split("#")[1].trim();
        Long solicitudId = Long.parseLong(idStr);
        Optional<TransaccionPago> transaccionOpt = transaccionPagoRepository.findBySolicitudId(solicitudId);
        if (transaccionOpt.isPresent()) {
          TransaccionPago transaccion = transaccionOpt.get();
          transaccion.setEstadoPago(EstadoPago.LIQUIDADO_AL_TECNICO);
          transaccionPagoRepository.save(transaccion);
        }
      } catch (NumberFormatException e) {
        // ignore if we can't parse the id
      }
    }

    return ResponseEntity.ok().build();
  }
}
