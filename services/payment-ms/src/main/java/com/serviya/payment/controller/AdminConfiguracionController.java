package com.serviya.payment.controller;

import com.serviya.payment.entity.ConfiguracionPago;
import com.serviya.payment.repository.ConfiguracionPagoRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/configuracion")
@RequiredArgsConstructor
public class AdminConfiguracionController {

  private final ConfiguracionPagoRepository configuracionPagoRepository;

  @GetMapping
  public ResponseEntity<ConfiguracionPago> getConfiguracion() {
    return ResponseEntity.ok(getConfigActual());
  }

  @PutMapping
  public ResponseEntity<ConfiguracionPago> updateConfiguracion(
      @RequestBody ConfiguracionPago newConfig) {
    ConfiguracionPago config = getConfigActual();

    config.setComisionPorcentaje(newConfig.getComisionPorcentaje());
    config.setIgvPorcentaje(newConfig.getIgvPorcentaje());
    config.setYapeEnabled(newConfig.getYapeEnabled());
    config.setCulqiEnabled(newConfig.getCulqiEnabled());

    return ResponseEntity.ok(configuracionPagoRepository.save(config));
  }

  private ConfiguracionPago getConfigActual() {
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
