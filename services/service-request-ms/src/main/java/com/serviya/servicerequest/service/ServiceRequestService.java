package com.serviya.servicerequest.service;

import com.serviya.servicerequest.dto.CreateServiceRequestDTO;
import com.serviya.servicerequest.dto.QuoteServiceRequestDTO;
import com.serviya.servicerequest.dto.ServiceRequestResponseDTO;

public interface ServiceRequestService {
    ServiceRequestResponseDTO crearSolicitud(CreateServiceRequestDTO dto, String clienteId);
    java.util.List<ServiceRequestResponseDTO> listarSolicitudesCliente(String clienteId);
    java.util.List<ServiceRequestResponseDTO> listarSolicitudesTecnico(String tecnicoId);
    java.util.List<ServiceRequestResponseDTO> listarSolicitudesAdmin();
    ServiceRequestResponseDTO obtenerSolicitudCliente(Long requestId, String clienteId);
    ServiceRequestResponseDTO obtenerSolicitudTecnico(Long requestId, String tecnicoId);
    ServiceRequestResponseDTO cancelarSolicitudCliente(Long requestId, String clienteId);
    void rechazarTrabajoTecnico(Long requestId, String tecnicoId);
    void terminarTrabajoCliente(Long requestId, String clienteId);
    java.util.List<ServiceRequestResponseDTO> listarPendientesCotizacion();
    ServiceRequestResponseDTO cotizarSolicitud(Long requestId, QuoteServiceRequestDTO dto, String trabajadorId);
    ServiceRequestResponseDTO marcarComoPagado(Long requestId, String clienteId);
    java.util.List<com.serviya.servicerequest.dto.TechnicianMatchDTO> getMatches(Long requestId);
    void asignarTecnico(Long requestId, String tecnicoId);
    void aceptarTrabajo(Long requestId, String tecnicoId);
    void terminarTrabajo(Long requestId, String tecnicoId);
    ServiceRequestResponseDTO agregarEvidencias(Long requestId, String clienteId, java.util.List<String> urls);
}
