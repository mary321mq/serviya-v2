package com.serviya.payment.repository;

import com.serviya.payment.entity.ConfiguracionPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfiguracionPagoRepository extends JpaRepository<ConfiguracionPago, Long> {}
