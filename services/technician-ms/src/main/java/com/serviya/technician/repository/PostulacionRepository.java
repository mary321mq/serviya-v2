package com.serviya.technician.repository;

import com.serviya.technician.entity.Postulacion;
import com.serviya.technician.enums.EstadoPostulacion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostulacionRepository extends JpaRepository<Postulacion, Long> {
  Optional<Postulacion> findByClienteIdAndEstado(String clienteId, EstadoPostulacion estado);

  List<Postulacion> findByClienteIdAndEstadoIn(String clienteId, List<EstadoPostulacion> estados);

  List<Postulacion> findByEstado(EstadoPostulacion estado);
}
