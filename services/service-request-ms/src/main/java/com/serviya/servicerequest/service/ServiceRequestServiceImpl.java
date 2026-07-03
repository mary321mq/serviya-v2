package com.serviya.servicerequest.service;

import com.serviya.servicerequest.dto.CatalogServiceDTO;
import com.serviya.servicerequest.dto.CreateServiceRequestDTO;
import com.serviya.servicerequest.dto.QuoteServiceRequestDTO;
import com.serviya.servicerequest.dto.ServiceRequestItemDTO;
import com.serviya.servicerequest.dto.ServiceRequestResponseDTO;
import com.serviya.servicerequest.entity.CatalogServiceEntity;
import com.serviya.servicerequest.entity.ServiceRequest;
import com.serviya.servicerequest.entity.ServiceRequestItem;
import com.serviya.servicerequest.enums.EstadoSolicitud;
import com.serviya.servicerequest.enums.TipoCobro;
import com.serviya.servicerequest.repository.CatalogServiceRepository;
import com.serviya.servicerequest.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.serviya.servicerequest.client.PaymentClient;
import com.serviya.servicerequest.client.CreditWalletRequestDTO;

@Service
@RequiredArgsConstructor
public class ServiceRequestServiceImpl implements ServiceRequestService {

    private static final java.util.List<EstadoSolicitud> TECHNICIAN_BUSY_STATES =
            java.util.List.of(EstadoSolicitud.TECNICO_ASIGNADO, EstadoSolicitud.EN_PROCESO);

    private final ServiceRequestRepository serviceRequestRepository;
    private final CatalogServiceRepository catalogServiceRepository;
    private final PaymentClient paymentClient;
    private final com.serviya.servicerequest.client.TechnicianAvailabilityClient technicianAvailabilityClient;

    @Override
    @Transactional
    public ServiceRequestResponseDTO crearSolicitud(CreateServiceRequestDTO dto, String clienteId) {
        CatalogServiceEntity catalogo = catalogServiceRepository.findById(dto.getCatalogServiceId())
                .orElseThrow(() -> new IllegalArgumentException("Servicio de catálogo no encontrado"));

        ServiceRequest solicitud = ServiceRequest.builder()
                .clienteId(clienteId)
                .catalogoServicio(catalogo)
                .direccionFisica(dto.getDireccionFisica())
                .latitud(dto.getLatitud())
                .longitud(dto.getLongitud())
                .cantidad(dto.getCantidad() != null ? dto.getCantidad() : 1)
                .build();

        java.util.List<String> evidenciaUrls = new java.util.ArrayList<>();
        if (dto.getEvidenciaUrls() != null) {
            evidenciaUrls.addAll(dto.getEvidenciaUrls().stream()
                    .filter(url -> url != null && !url.isBlank())
                    .distinct()
                    .toList());
        }
        if (dto.getUrlEvidencia() != null && !dto.getUrlEvidencia().isBlank()
                && !evidenciaUrls.contains(dto.getUrlEvidencia())) {
            evidenciaUrls.add(0, dto.getUrlEvidencia());
        }
        solicitud.setEvidenciaUrls(evidenciaUrls);
        if (!evidenciaUrls.isEmpty()) {
            solicitud.setUrlEvidencia(evidenciaUrls.get(0));
        }

        if (catalogo.getTipoCobro() == TipoCobro.FIJO) {
            solicitud.setCostoTotal(catalogo.getPrecioBaseReferencial());
            solicitud.setEstadoSolicitud(EstadoSolicitud.COTIZADO_ESPERANDO_PAGO);
        } else if (catalogo.getTipoCobro() == TipoCobro.COTIZACION) {
            if (com.serviya.servicerequest.enums.ModalidadEvaluacion.PRESENCIAL.equals(catalogo.getModalidadEvaluacion())) {
                solicitud.setCostoVisita(catalogo.getPrecioBaseReferencial());
                solicitud.setEstadoSolicitud(EstadoSolicitud.ESPERANDO_PAGO_VISITA);
            } else {
                solicitud.setCostoVisita(java.math.BigDecimal.ZERO);
                solicitud.setEstadoSolicitud(EstadoSolicitud.PENDIENTE_EVALUACION);
            }
        } else if (catalogo.getTipoCobro() == TipoCobro.POR_UNIDAD || 
                   catalogo.getTipoCobro() == TipoCobro.POR_METRO) {
            java.math.BigDecimal total = catalogo.getPrecioBaseReferencial().multiply(java.math.BigDecimal.valueOf(solicitud.getCantidad()));
            solicitud.setCostoTotal(total);
            solicitud.setEstadoSolicitud(EstadoSolicitud.COTIZADO_ESPERANDO_PAGO);
        } else {
            solicitud.setEstadoSolicitud(EstadoSolicitud.PENDIENTE_EVALUACION);
        }

        ServiceRequest saved = serviceRequestRepository.save(solicitud);
        notifyUser(
                saved.getClienteId(),
                "Solicitud creada",
                "Recibimos tu solicitud #" + saved.getId() + " para " + catalogo.getNombre() + ". Te avisaremos cada avance.",
                "/cliente/solicitudes/" + saved.getId(),
                "REQUEST_CREATED",
                "request-" + saved.getId());

        if (saved.getEstadoSolicitud() == EstadoSolicitud.ESPERANDO_PAGO_VISITA) {
            notifyUser(
                    saved.getClienteId(),
                    "Pago de visita pendiente",
                    "Tu solicitud #" + saved.getId() + " necesita el pago de visita para pasar a evaluacion.",
                    "/cliente/solicitudes/" + saved.getId(),
                    "VISIT_PAYMENT_PENDING",
                    "request-" + saved.getId());
        } else if (saved.getEstadoSolicitud() == EstadoSolicitud.COTIZADO_ESPERANDO_PAGO) {
            notifyUser(
                    saved.getClienteId(),
                    "Pago pendiente",
                    "Tu solicitud #" + saved.getId() + " ya tiene un monto listo para pagar.",
                    "/cliente/solicitudes/" + saved.getId(),
                    "PAYMENT_PENDING",
                    "request-" + saved.getId());
        }
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<ServiceRequestResponseDTO> listarSolicitudesCliente(String clienteId) {
        return serviceRequestRepository.findByClienteIdOrderByCreatedAtDesc(clienteId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<ServiceRequestResponseDTO> listarSolicitudesTecnico(String tecnicoId) {
        return serviceRequestRepository.findByTecnicoIdOrderByCreatedAtDesc(tecnicoId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<ServiceRequestResponseDTO> listarSolicitudesAdmin() {
        return serviceRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceRequestResponseDTO obtenerSolicitudCliente(Long requestId, String clienteId) {
        return serviceRequestRepository.findByIdAndClienteId(requestId, clienteId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceRequestResponseDTO obtenerSolicitudTecnico(Long requestId, String tecnicoId) {
        return serviceRequestRepository.findByIdAndTecnicoId(requestId, tecnicoId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada para este técnico"));
    }

    @Override
    @Transactional
    public ServiceRequestResponseDTO cancelarSolicitudCliente(Long requestId, String clienteId) {
        ServiceRequest req = serviceRequestRepository.findByIdAndClienteId(requestId, clienteId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        if (req.getEstadoSolicitud() == EstadoSolicitud.TECNICO_ASIGNADO
                || req.getEstadoSolicitud() == EstadoSolicitud.EN_PROCESO
                || req.getEstadoSolicitud() == EstadoSolicitud.COMPLETADO) {
            throw new IllegalStateException("La solicitud ya no se puede cancelar");
        }

        req.setEstadoSolicitud(EstadoSolicitud.CANCELADO);
        return mapToResponse(serviceRequestRepository.save(req));
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<ServiceRequestResponseDTO> listarPendientesCotizacion() {
        return serviceRequestRepository
                .findAll()
                .stream()
                .filter(request -> request.getCatalogoServicio().getTipoCobro() == TipoCobro.COTIZACION)
                .filter(request -> request.getEstadoSolicitud() == EstadoSolicitud.PENDIENTE_EVALUACION || 
                                   request.getEstadoSolicitud() == EstadoSolicitud.COTIZADO_ESPERANDO_PAGO)
                .sorted(java.util.Comparator.comparing(ServiceRequest::getCreatedAt).reversed())
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public ServiceRequestResponseDTO cotizarSolicitud(Long requestId, QuoteServiceRequestDTO dto, String trabajadorId) {
        ServiceRequest req = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        if (req.getCatalogoServicio().getTipoCobro() != TipoCobro.COTIZACION) {
            throw new IllegalStateException("La solicitud no requiere cotizacion manual");
        }
        if (req.getEstadoSolicitud() != EstadoSolicitud.PENDIENTE_EVALUACION) {
            throw new IllegalStateException("La solicitud no esta pendiente de cotizacion");
        }

        java.math.BigDecimal totalItems = java.math.BigDecimal.ZERO;
        req.getItems().clear();
        if (dto.getItems() != null) {
            for (com.serviya.servicerequest.dto.QuoteItemDTO itemDto : dto.getItems()) {
                java.math.BigDecimal subtotal = itemDto.getPrecioUnitario().multiply(java.math.BigDecimal.valueOf(itemDto.getCantidad()));
                ServiceRequestItem item = ServiceRequestItem.builder()
                        .solicitud(req)
                        .descripcion(itemDto.getDescripcion())
                        .cantidad(itemDto.getCantidad())
                        .precioUnitario(itemDto.getPrecioUnitario())
                        .subtotal(subtotal)
                        .build();
                req.getItems().add(item);
                totalItems = totalItems.add(subtotal);
            }
        }

        req.setCostoTotal(totalItems);
        req.setEstadoSolicitud(EstadoSolicitud.COTIZADO_ESPERANDO_PAGO);

        ServiceRequest saved = serviceRequestRepository.save(req);

        notifyUser(
                req.getClienteId(),
                "Nueva cotizacion",
                "Tu solicitud #" + requestId + " fue cotizada por S/ " + req.getCostoTotal() + ". Ya puedes revisarla y pagar.",
                "/cliente/solicitudes/" + requestId,
                "QUOTE_READY",
                "request-" + requestId);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ServiceRequestResponseDTO marcarComoPagado(Long requestId, String clienteId) {
        ServiceRequest req = serviceRequestRepository.findByIdAndClienteId(requestId, clienteId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        if (req.getEstadoSolicitud() == EstadoSolicitud.ESPERANDO_PAGO_VISITA) {
            req.setEstadoSolicitud(EstadoSolicitud.PENDIENTE_EVALUACION);
        } else if (req.getEstadoSolicitud() == EstadoSolicitud.COTIZADO_ESPERANDO_PAGO) {
            req.setEstadoSolicitud(EstadoSolicitud.PAGADO_BUSCANDO_TECNICO);
        } else {
            throw new IllegalStateException("La solicitud no esta esperando confirmacion de pago");
        }

        ServiceRequest saved = serviceRequestRepository.save(req);

        notifyUser(
                req.getClienteId(),
                "Pago confirmado",
                "El pago de tu solicitud #" + requestId + " fue confirmado.",
                "/cliente/solicitudes/" + requestId,
                "REQUEST_PAYMENT_CONFIRMED",
                "request-" + requestId);

        return mapToResponse(saved);
    }

    private ServiceRequestResponseDTO mapToResponse(ServiceRequest entity) {
        CatalogServiceDTO catalogoDTO = new CatalogServiceDTO();
        catalogoDTO.setId(entity.getCatalogoServicio().getId());
        catalogoDTO.setCodigo(entity.getCatalogoServicio().getCodigo());
        if (entity.getCatalogoServicio().getCategoria() != null) {
            catalogoDTO.setCategoryCode(entity.getCatalogoServicio().getCategoria().getCodigo());
        }
        catalogoDTO.setNombre(entity.getCatalogoServicio().getNombre());
        catalogoDTO.setDescripcion(entity.getCatalogoServicio().getDescripcion());
        catalogoDTO.setPrecioBaseReferencial(entity.getCatalogoServicio().getPrecioBaseReferencial());
        catalogoDTO.setRequiereFoto(entity.getCatalogoServicio().getRequiereFoto());
        catalogoDTO.setTipoCobro(entity.getCatalogoServicio().getTipoCobro());
        catalogoDTO.setModalidadEvaluacion(entity.getCatalogoServicio().getModalidadEvaluacion());

        java.util.List<ServiceRequestItemDTO> itemsDto = new java.util.ArrayList<>();
        if (entity.getItems() != null) {
            for (ServiceRequestItem item : entity.getItems()) {
                itemsDto.add(ServiceRequestItemDTO.builder()
                        .id(item.getId())
                        .descripcion(item.getDescripcion())
                        .cantidad(item.getCantidad())
                        .precioUnitario(item.getPrecioUnitario())
                        .subtotal(item.getSubtotal())
                        .build());
            }
        }

        java.util.List<String> evidenciaUrls = new java.util.ArrayList<>();
        if (entity.getEvidenciaUrls() != null) {
            evidenciaUrls.addAll(entity.getEvidenciaUrls().stream()
                    .filter(url -> url != null && !url.isBlank())
                    .distinct()
                    .toList());
        }
        if (entity.getUrlEvidencia() != null && !entity.getUrlEvidencia().isBlank()
                && !evidenciaUrls.contains(entity.getUrlEvidencia())) {
            evidenciaUrls.add(0, entity.getUrlEvidencia());
        }

        return ServiceRequestResponseDTO.builder()
                .id(entity.getId())
                .clienteId(entity.getClienteId())
                .tecnicoId(entity.getTecnicoId())
                .catalogoServicio(catalogoDTO)
                .urlEvidencia(entity.getUrlEvidencia())
                .evidenciaUrls(evidenciaUrls)
                .direccionFisica(entity.getDireccionFisica())
                .latitud(entity.getLatitud())
                .longitud(entity.getLongitud())
                .costoVisita(entity.getCostoVisita())
                .items(itemsDto)
                .costoTotal(entity.getCostoTotal())
                .montoTecnico(entity.getMontoTecnico())
                .estadoSolicitud(entity.getEstadoSolicitud())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .clienteConfirmoFin(entity.isClienteConfirmoFin())
                .tecnicoConfirmoFin(entity.isTecnicoConfirmoFin())
                .build();
    }

    private final com.serviya.servicerequest.client.AssignmentClient assignmentClient;
    private final com.serviya.servicerequest.client.NotificationClient notificationClient;

    @Override
    @Transactional(readOnly = true)
    public java.util.List<com.serviya.servicerequest.dto.TechnicianMatchDTO> getMatches(Long requestId) {
        ServiceRequest req = serviceRequestRepository.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
            
        if (req.getLatitud() == null || req.getLongitud() == null) {
            return java.util.Collections.emptyList();
        }
        
        String categoria = req.getCatalogoServicio().getCodigo(); 
        if (categoria.contains("-")) {
            categoria = categoria.split("-")[0];
        }
        
        java.util.List<com.serviya.servicerequest.dto.TechnicianMatchDTO> matches = assignmentClient.buscarTecnicos(req.getLatitud(), req.getLongitud(), categoria);
        
        if (req.getTecnicosRechazados() != null && !req.getTecnicosRechazados().isEmpty()) {
            matches = matches.stream()
                .filter(m -> !req.getTecnicosRechazados().contains(m.getTecnicoId()))
                .collect(java.util.stream.Collectors.toList());
        }

        matches = matches.stream()
                .filter(m -> !tecnicoTieneTrabajoActivo(m.getTecnicoId()))
                .collect(java.util.stream.Collectors.toList());
        
        return matches;
    }

    @Override
    @Transactional
    public void asignarTecnico(Long requestId, String tecnicoId) {
        ServiceRequest req = serviceRequestRepository.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        if (req.getTecnicosRechazados() != null && req.getTecnicosRechazados().contains(tecnicoId)) {
            throw new IllegalStateException("Este tecnico ya rechazo la solicitud. Selecciona otro tecnico.");
        }
        if (tecnicoTieneTrabajoActivo(tecnicoId)) {
            throw new IllegalStateException("El tecnico ya tiene una solicitud activa. Selecciona otro tecnico.");
        }
        
        req.setTecnicoId(tecnicoId);
        
        // Calculate 10% commission
        if (req.getCostoTotal() != null) {
            java.math.BigDecimal montoTecnico = req.getCostoTotal().multiply(new java.math.BigDecimal("0.90")).setScale(2, java.math.RoundingMode.HALF_UP);
            req.setMontoTecnico(montoTecnico);
        }
        
        req.setEstadoSolicitud(com.serviya.servicerequest.enums.EstadoSolicitud.TECNICO_ASIGNADO);
        serviceRequestRepository.save(req);
        updateTechnicianAvailability(tecnicoId, "BUSY");

        notifyUser(
                tecnicoId,
                "Nueva solicitud asignada",
                "Un cliente te selecciono para la solicitud #" + requestId + ".",
                "/tecnico/solicitudes/" + requestId,
                "TECHNICIAN_ASSIGNED",
                "request-" + requestId);
        notifyUser(
                req.getClienteId(),
                "Solicitud aprobada",
                "Ya asignamos un tecnico para tu solicitud #" + requestId + ".",
                "/cliente/solicitudes/" + requestId,
                "REQUEST_APPROVED",
                "request-" + requestId);
    }

    @Override
    @Transactional
    public void aceptarTrabajo(Long requestId, String tecnicoId) {
        ServiceRequest req = serviceRequestRepository.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
            
        if (!tecnicoId.equals(req.getTecnicoId())) {
            throw new IllegalArgumentException("El tecnico no corresponde a esta solicitud");
        }
        
        req.setEstadoSolicitud(com.serviya.servicerequest.enums.EstadoSolicitud.EN_PROCESO);
        serviceRequestRepository.save(req);
        updateTechnicianAvailability(tecnicoId, "BUSY");
        notifyUser(
                req.getClienteId(),
                "Tecnico en camino",
                "El tecnico acepto el trabajo y esta en camino.",
                "/cliente/solicitudes/" + requestId,
                "TECHNICIAN_ON_THE_WAY",
                "request-" + requestId);
    }

    @Override
    @Transactional
    public void rechazarTrabajoTecnico(Long requestId, String tecnicoId) {
        ServiceRequest req = serviceRequestRepository.findByIdAndTecnicoId(requestId, tecnicoId)
            .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
            
        if (req.getEstadoSolicitud() != com.serviya.servicerequest.enums.EstadoSolicitud.TECNICO_ASIGNADO) {
            throw new IllegalStateException("Solo puedes rechazar solicitudes asignadas.");
        }
        
        req.getTecnicosRechazados().add(tecnicoId);
        req.setTecnicoId(null);
        req.setEstadoSolicitud(com.serviya.servicerequest.enums.EstadoSolicitud.PAGADO_BUSCANDO_TECNICO);
        serviceRequestRepository.save(req);
        if (!tecnicoTieneTrabajoActivo(tecnicoId)) {
            updateTechnicianAvailability(tecnicoId, "ONLINE");
        }
        notifyUser(
                req.getClienteId(),
                "Tecnico no disponible",
                "El tecnico rechazo la solicitud #" + requestId + ". Ya no volvera a aparecer para esta solicitud; selecciona otro tecnico.",
                "/cliente/solicitudes/" + requestId + "/tecnicos",
                "TECHNICIAN_REJECTED",
                "request-" + requestId);
    }

    @Override
    @Transactional
    public void terminarTrabajo(Long requestId, String tecnicoId) {
        ServiceRequest req = serviceRequestRepository.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
            
        if (!tecnicoId.equals(req.getTecnicoId())) {
            throw new IllegalArgumentException("El tecnico no corresponde a esta solicitud");
        }

        // Validate state before proceeding
        com.serviya.servicerequest.enums.EstadoSolicitud estado = req.getEstadoSolicitud();
        if (estado == com.serviya.servicerequest.enums.EstadoSolicitud.COMPLETADO ||
            estado == com.serviya.servicerequest.enums.EstadoSolicitud.CANCELADO ||
            estado == com.serviya.servicerequest.enums.EstadoSolicitud.REEMBOLSADO) {
            return; // Already in terminal state — idempotent, no error
        }

        // Idempotency: if tecnico already confirmed, skip
        if (req.isTecnicoConfirmoFin()) {
            if (req.isClienteConfirmoFin()) {
                marcarComoCompletado(req);
            }
            return;
        }
        
        req.setTecnicoConfirmoFin(true);

        if (req.isClienteConfirmoFin()) {
            marcarComoCompletado(req);
        } else {
            serviceRequestRepository.save(req);
            notifyUser(
                    req.getClienteId(),
                    "Confirmación pendiente",
                    "El técnico indicó que finalizó el trabajo #" + requestId + ". Por favor, confirma para liberar el pago.",
                    "/cliente/solicitudes/" + requestId,
                    "CONFIRMATION_PENDING",
                    "request-" + requestId);
        }
    }

    @Override
    @Transactional
    public void terminarTrabajoCliente(Long requestId, String clienteId) {
        ServiceRequest req = serviceRequestRepository.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
            
        if (!clienteId.equals(req.getClienteId())) {
            throw new IllegalArgumentException("No puedes terminar una solicitud que no te pertenece");
        }

        // Validate state before proceeding
        com.serviya.servicerequest.enums.EstadoSolicitud estado = req.getEstadoSolicitud();
        if (estado == com.serviya.servicerequest.enums.EstadoSolicitud.COMPLETADO ||
            estado == com.serviya.servicerequest.enums.EstadoSolicitud.CANCELADO ||
            estado == com.serviya.servicerequest.enums.EstadoSolicitud.REEMBOLSADO) {
            return; // Already in terminal state — idempotent, no error
        }

        // Idempotency: if cliente already confirmed, skip
        if (req.isClienteConfirmoFin()) {
            if (req.isTecnicoConfirmoFin()) {
                marcarComoCompletado(req);
            }
            return;
        }
        
        req.setClienteConfirmoFin(true);

        if (req.isTecnicoConfirmoFin()) {
            marcarComoCompletado(req);
        } else {
            serviceRequestRepository.save(req);
            notifyUser(
                    req.getTecnicoId(),
                    "Confirmación pendiente",
                    "El cliente indicó que el trabajo #" + requestId + " terminó. Por favor, confirma tu finalización.",
                    "/tecnico/solicitudes/" + requestId,
                    "CONFIRMATION_PENDING",
                    "request-" + requestId);
        }
    }

    private void marcarComoCompletado(ServiceRequest req) {
        req.setEstadoSolicitud(com.serviya.servicerequest.enums.EstadoSolicitud.COMPLETADO);
        serviceRequestRepository.save(req);
        
        // Pagar al técnico
        if (req.getMontoTecnico() != null) {
            paymentClient.creditWallet(req.getTecnicoId(), CreditWalletRequestDTO.builder()
                .amount(req.getMontoTecnico())
                .currency("PEN")
                .reason("Pago por servicio #" + req.getId())
                .build());
        }

        notifyUser(
                req.getClienteId(),
                "Resena pendiente",
                "El servicio #" + req.getId() + " finalizó correctamente. Califica el servicio para cerrar tu experiencia.",
                "/cliente/resenas/nueva/" + req.getId() + "?tecnicoId=" + req.getTecnicoId(),
                "REVIEW_PENDING",
                "request-" + req.getId());

        notifyUser(
                req.getTecnicoId(),
                "Trabajo Completado",
                "El trabajo #" + req.getId() + " fue marcado como completado y tu pago ha sido depositado.",
                "/tecnico/solicitudes/" + req.getId(),
                "JOB_COMPLETED",
                "request-" + req.getId());

        if (!tecnicoTieneTrabajoActivo(req.getTecnicoId())) {
            updateTechnicianAvailability(req.getTecnicoId(), "ONLINE");
        }
    }

    private boolean tecnicoTieneTrabajoActivo(String tecnicoId) {
        return tecnicoId != null
                && !tecnicoId.isBlank()
                && serviceRequestRepository.existsByTecnicoIdAndEstadoSolicitudIn(tecnicoId, TECHNICIAN_BUSY_STATES);
    }

    private void updateTechnicianAvailability(String tecnicoId, String estado) {
        if (tecnicoId == null || tecnicoId.isBlank()) {
            return;
        }
        try {
            technicianAvailabilityClient.updateAvailability(tecnicoId, java.util.Map.of("estado", estado));
        } catch (Exception e) {
            System.err.println("Failed to update technician availability " + tecnicoId + " -> " + estado + ": " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ServiceRequestResponseDTO agregarEvidencias(Long requestId, String clienteId, java.util.List<String> urls) {
        ServiceRequest req = serviceRequestRepository.findByIdAndClienteId(requestId, clienteId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
        
        java.util.List<String> existingUrls = new java.util.ArrayList<>(req.getEvidenciaUrls() != null ? req.getEvidenciaUrls() : new java.util.ArrayList<>());
        for (String url : urls) {
            if (url != null && !url.isBlank() && !existingUrls.contains(url)) {
                existingUrls.add(url);
            }
        }
        req.setEvidenciaUrls(existingUrls);
        if (!existingUrls.isEmpty()) {
            req.setUrlEvidencia(existingUrls.get(0));
        }
        
        ServiceRequest saved = serviceRequestRepository.save(req);
        return mapToResponse(saved);
    }

    private void notifyUser(String receiverId, String title, String message, String actionUrl, String type, String correlationId) {
        if (receiverId == null || receiverId.isBlank()) {
            return;
        }
        com.serviya.servicerequest.client.CreateNotificationDTO notif = new com.serviya.servicerequest.client.CreateNotificationDTO();
        notif.setReceiverId(receiverId);
        notif.setTitle(title);
        notif.setMessage(message);
        notif.setActionUrl(actionUrl);
        notif.setType(type);
        notif.setChannel("IN_APP");
        notif.setCorrelationId(correlationId);
        try {
            notificationClient.sendNotification(notif);
        } catch (Exception e) {
            System.err.println("Failed to send notification " + type + ": " + e.getMessage());
        }
    }
}
