package com.serviya.technician.repository;

import com.serviya.technician.entity.TecnicoProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TecnicoProfileRepository extends JpaRepository<TecnicoProfile, Long> {
  Optional<TecnicoProfile> findByClienteId(String clienteId);

  java.util.List<TecnicoProfile> findByEstadoDisponibilidadAndCategoriasContainingIgnoreCase(
      com.serviya.technician.enums.EstadoDisponibilidad estado, String categoria);
}
