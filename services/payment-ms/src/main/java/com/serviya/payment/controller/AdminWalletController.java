package com.serviya.payment.controller;

import com.serviya.payment.entity.Wallet;
import com.serviya.payment.repository.WalletRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/wallets")
@RequiredArgsConstructor
public class AdminWalletController {

  private final WalletRepository walletRepository;

  @GetMapping
  public ResponseEntity<List<Wallet>> getWallets() {
    return ResponseEntity.ok(walletRepository.findAll());
  }
}
