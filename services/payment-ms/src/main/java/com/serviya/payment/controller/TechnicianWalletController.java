package com.serviya.payment.controller;

import com.serviya.payment.entity.Wallet;
import com.serviya.payment.entity.WalletMovement;
import com.serviya.payment.entity.WithdrawalMethod;
import com.serviya.payment.entity.WithdrawalRequest;
import com.serviya.payment.repository.WalletMovementRepository;
import com.serviya.payment.repository.WalletRepository;
import com.serviya.payment.repository.WithdrawalMethodRepository;
import com.serviya.payment.repository.WithdrawalRequestRepository;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class TechnicianWalletController {

  private final WalletRepository walletRepository;
  private final WalletMovementRepository walletMovementRepository;
  private final WithdrawalMethodRepository withdrawalMethodRepository;
  private final WithdrawalRequestRepository withdrawalRequestRepository;

  @GetMapping("/me")
  public ResponseEntity<Map<String, Object>> getMyWallet(@AuthenticationPrincipal Jwt jwt) {
    String technicianId = jwt.getSubject();
    Wallet wallet = getOrCreateWallet(technicianId);
    Map<String, Object> dto = new LinkedHashMap<>();
    dto.put("technicianId", wallet.getTechnicianId());
    dto.put("balance", wallet.getBalance());
    dto.put("currency", wallet.getCurrency());
    dto.put("updatedAt", wallet.getUpdatedAt());
    dto.put("movements", walletMovementRepository.findByTechnicianIdOrderByCreatedAtDesc(technicianId));
    dto.put("withdrawalMethods", withdrawalMethodRepository.findByTechnicianIdOrderByCreatedAtDesc(technicianId));
    dto.put("withdrawals", withdrawalRequestRepository.findByTechnicianIdOrderByCreatedAtDesc(technicianId));
    return ResponseEntity.ok(dto);
  }

  @GetMapping("/me/movements")
  public ResponseEntity<List<WalletMovement>> getMovements(@AuthenticationPrincipal Jwt jwt) {
    return ResponseEntity.ok(walletMovementRepository.findByTechnicianIdOrderByCreatedAtDesc(jwt.getSubject()));
  }

  @GetMapping("/me/methods")
  public ResponseEntity<List<WithdrawalMethod>> getMethods(@AuthenticationPrincipal Jwt jwt) {
    return ResponseEntity.ok(withdrawalMethodRepository.findByTechnicianIdOrderByCreatedAtDesc(jwt.getSubject()));
  }

  @PostMapping("/me/methods")
  @Transactional
  public ResponseEntity<WithdrawalMethod> createMethod(
      @AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> payload) {
    String type = required(payload.get("type"), "type").toUpperCase();
    if (!type.matches("CARD|YAPE|PLIN|PAYPAL")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Modalidad de retiro no soportada.");
    }

    WithdrawalMethod method =
        WithdrawalMethod.builder()
            .technicianId(jwt.getSubject())
            .type(type)
            .holderName(required(payload.get("holderName"), "holderName"))
            .destination(required(payload.get("destination"), "destination"))
            .alias(payload.getOrDefault("alias", type))
            .active(true)
            .build();
    return ResponseEntity.ok(withdrawalMethodRepository.save(method));
  }

  @GetMapping("/me/withdrawals")
  public ResponseEntity<List<WithdrawalRequest>> getWithdrawals(@AuthenticationPrincipal Jwt jwt) {
    return ResponseEntity.ok(withdrawalRequestRepository.findByTechnicianIdOrderByCreatedAtDesc(jwt.getSubject()));
  }

  @PostMapping("/me/withdrawals")
  @Transactional
  public ResponseEntity<WithdrawalRequest> requestWithdrawal(
      @AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> payload) {
    String technicianId = jwt.getSubject();
    Long methodId = toLong(payload.get("methodId"));
    BigDecimal amount = toAmount(payload.get("amount"));
    if (amount.compareTo(BigDecimal.ZERO) <= 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El monto debe ser mayor a cero.");
    }

    WithdrawalMethod method =
        withdrawalMethodRepository
            .findByIdAndTechnicianId(methodId, technicianId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Metodo de retiro no encontrado."));
    if (!method.isActive()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El metodo de retiro no esta activo.");
    }

    Wallet wallet = getOrCreateWallet(technicianId);
    if (wallet.getBalance().compareTo(amount) < 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Saldo insuficiente para retirar.");
    }

    wallet.setBalance(wallet.getBalance().subtract(amount));
    walletRepository.save(wallet);

    String summary = method.getType() + " - " + method.getAlias() + " (" + mask(method.getDestination()) + ")";
    WithdrawalRequest withdrawal =
        withdrawalRequestRepository.save(
            WithdrawalRequest.builder()
                .technicianId(technicianId)
                .methodId(method.getId())
                .amount(amount)
                .currency(wallet.getCurrency())
                .status("PENDIENTE")
                .destinationSummary(summary)
                .build());

    walletMovementRepository.save(
        WalletMovement.builder()
            .technicianId(technicianId)
            .type("RETIRO_SOLICITADO")
            .amount(amount.negate())
            .currency(wallet.getCurrency())
            .description("Retiro solicitado a " + summary)
            .build());

    return ResponseEntity.ok(withdrawal);
  }

  private Wallet getOrCreateWallet(String technicianId) {
    return walletRepository
        .findByTechnicianId(technicianId)
        .orElseGet(() -> walletRepository.save(Wallet.builder().technicianId(technicianId).build()));
  }

  private String required(String value, String field) {
    if (value == null || value.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " es requerido.");
    }
    return value.trim();
  }

  private Long toLong(Object value) {
    if (value instanceof Number number) {
      return number.longValue();
    }
    try {
      return Long.parseLong(String.valueOf(value));
    } catch (Exception ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "methodId es requerido.");
    }
  }

  private BigDecimal toAmount(Object value) {
    try {
      return new BigDecimal(String.valueOf(value)).setScale(2, java.math.RoundingMode.HALF_UP);
    } catch (Exception ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amount es requerido.");
    }
  }

  private String mask(String value) {
    if (value == null || value.length() <= 4) {
      return "****";
    }
    return "****" + value.substring(value.length() - 4);
  }
}
