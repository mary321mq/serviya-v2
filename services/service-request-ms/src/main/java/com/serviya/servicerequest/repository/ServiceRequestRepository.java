package com.serviya.servicerequest.repository;

import com.serviya.servicerequest.entity.ServiceRequest;
import com.serviya.servicerequest.enums.EstadoSolicitud;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByEstadoSolicitudOrderByCreatedAtAsc(EstadoSolicitud estadoSolicitud);
    List<ServiceRequest> findAllByOrderByCreatedAtDesc();
    List<ServiceRequest> findByClienteIdOrderByCreatedAtDesc(String clienteId);
    List<ServiceRequest> findByTecnicoIdOrderByCreatedAtDesc(String tecnicoId);
    java.util.Optional<ServiceRequest> findByIdAndClienteId(Long id, String clienteId);
    java.util.Optional<ServiceRequest> findByIdAndTecnicoId(Long id, String tecnicoId);
    boolean existsByTecnicoIdAndEstadoSolicitudIn(String tecnicoId, Collection<EstadoSolicitud> estados);
}
