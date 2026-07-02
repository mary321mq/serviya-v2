package com.serviya.payment.repository;

import com.serviya.payment.entity.TransaccionPago;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransaccionPagoRepository extends JpaRepository<TransaccionPago, Long> {
  Optional<TransaccionPago> findByCodigoOperacionExterna(String codigoOperacionExterna);

  Optional<TransaccionPago> findByIdAndClienteId(Long id, String clienteId);

  Optional<TransaccionPago> findByIdAndTecnicoId(Long id, String tecnicoId);

  Optional<TransaccionPago> findBySolicitudId(Long solicitudId);

  List<TransaccionPago> findByClienteIdOrderByCreatedAtDesc(String clienteId);

  List<TransaccionPago> findAllByOrderByCreatedAtDesc();
}
