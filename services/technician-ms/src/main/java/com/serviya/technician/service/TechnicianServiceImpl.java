package com.serviya.technician.service;

import com.serviya.technician.client.CreateNotificationDTO;
import com.serviya.technician.client.NotificationClient;
import com.serviya.technician.dto.PostulacionRequestDTO;
import com.serviya.technician.dto.UbicacionDTO;
import com.serviya.technician.entity.Postulacion;
import com.serviya.technician.entity.TecnicoProfile;
import com.serviya.technician.enums.EstadoDisponibilidad;
import com.serviya.technician.enums.EstadoPostulacion;
import com.serviya.technician.repository.PostulacionRepository;
import com.serviya.technician.repository.TecnicoProfileRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TechnicianServiceImpl implements TechnicianService {

  private final PostulacionRepository postulacionRepository;
  private final TecnicoProfileRepository profileRepository;
  private final KeycloakRoleService keycloakRoleService;
  private final NotificationClient notificationClient;

  @Override
  @Transactional(readOnly = true)
  public Postulacion obtenerPostulacion(String clienteId) {
    return postulacionRepository
        .findByClienteIdAndEstadoIn(
            clienteId,
            List.of(
                EstadoPostulacion.DRAFT,
                EstadoPostulacion.SUBMITTED,
                EstadoPostulacion.UNDER_REVIEW,
                EstadoPostulacion.APPROVED,
                EstadoPostulacion.REJECTED))
        .stream()
        .findFirst()
        .orElseGet(
            () ->
                Postulacion.builder().clienteId(clienteId).estado(EstadoPostulacion.DRAFT).build());
  }

  @Override
  @Transactional(readOnly = true)
  public Postulacion obtenerPostulacionPorId(Long id) {
    return postulacionRepository
        .findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Postulación no encontrada"));
  }

  @Override
  @Transactional
  public Postulacion guardarPostulacion(String clienteId, PostulacionRequestDTO dto) {
    Postulacion p =
        postulacionRepository
            .findByClienteIdAndEstadoIn(
                clienteId,
                List.of(
                    EstadoPostulacion.DRAFT,
                    EstadoPostulacion.SUBMITTED,
                    EstadoPostulacion.UNDER_REVIEW,
                    EstadoPostulacion.APPROVED,
                    EstadoPostulacion.REJECTED))
            .stream()
            .findFirst()
            .orElseGet(
                () ->
                    Postulacion.builder()
                        .clienteId(clienteId)
                        .estado(EstadoPostulacion.DRAFT)
                        .build());

    if (p.getEstado() != EstadoPostulacion.DRAFT) {
      throw new IllegalStateException("Only DRAFT applications can be modified");
    }

    p.setFullName(dto.getFullName());
    p.setPhone(dto.getPhone());

    p.setDepartment(dto.getDepartment());
    p.setProvince(dto.getProvince());
    p.setDistrict(dto.getDistrict());
    p.setAddressLine(dto.getAddressLine());
    p.setReference(dto.getReference());
    p.setLat(dto.getLat());
    p.setLng(dto.getLng());
    p.setHasStore(dto.getHasStore());
    p.setStoreName(dto.getStoreName());

    p.setAboutMe(dto.getAboutMe());
    p.setIdentityDocumentType(dto.getIdentityDocumentType());
    p.setIdentityDocumentNumber(dto.getIdentityDocumentNumber());
    p.setRuc(dto.getRuc());
    p.setCategorias(dto.getCategorias());

    p.setRequestedService(dto.getRequestedService());
    p.setExperience(dto.getExperience());
    p.setAvailability(dto.getAvailability());
    p.setPreferredSchedule(dto.getPreferredSchedule());

    return postulacionRepository.save(p);
  }

  @Override
  @Transactional
  public void enviarPostulacion(String clienteId) {
    Postulacion p = obtenerPostulacion(clienteId);
    if (p.getEstado() != EstadoPostulacion.DRAFT) {
      throw new IllegalStateException("Application is not in DRAFT state");
    }
    p.setEstado(EstadoPostulacion.SUBMITTED);
    Postulacion saved = postulacionRepository.save(p);
    notifyUser(
        saved.getClienteId(),
        "Postulacion enviada",
        "Recibimos tu postulacion para ser tecnico. Te avisaremos cuando sea revisada.",
        "/cliente/postular-tecnico",
        "TECHNICIAN_APPLICATION_SUBMITTED",
        "technician-application-" + saved.getId());
  }

  @Override
  @Transactional(readOnly = true)
  public List<Postulacion> listarPostulacionesPendientes() {
    return postulacionRepository.findByEstado(EstadoPostulacion.SUBMITTED);
  }

  @Override
  @Transactional(readOnly = true)
  public List<Postulacion> listarTodasLasPostulaciones() {
    return postulacionRepository.findAll();
  }

  @Override
  @Transactional
  public void aprobarPostulacion(Long postulacionId, String evaluadorName, String notas) {
    Postulacion p =
        postulacionRepository
            .findById(postulacionId)
            .orElseThrow(() -> new IllegalArgumentException("Postulacion no encontrada"));

    if (p.getEstado() != EstadoPostulacion.SUBMITTED
        && p.getEstado() != EstadoPostulacion.UNDER_REVIEW) {
      throw new IllegalStateException("La postulacion no esta pendiente");
    }

    p.setEstado(EstadoPostulacion.APPROVED);
    p.setEvaluatorName(evaluadorName);
    p.setEvaluatorRole("Super Admin");
    p.setEvaluatorNotes(notas);
    p.setEvaluatedAt(java.time.LocalDateTime.now());
    postulacionRepository.save(p);

    // Crear perfil de tecnico si no existe
    if (profileRepository.findByClienteId(p.getClienteId()).isEmpty()) {
      TecnicoProfile profile =
          TecnicoProfile.builder()
              .clienteId(p.getClienteId())
              .categorias(p.getCategorias() != null ? p.getCategorias() : "GENERAL")
              .department(p.getDepartment())
              .province(p.getProvince())
              .district(p.getDistrict())
              .addressLine(p.getAddressLine())
              .reference(p.getReference())
              .lat(p.getLat())
              .lng(p.getLng())
              .hasStore(p.getHasStore())
              .storeName(p.getStoreName())
              .estadoDisponibilidad(EstadoDisponibilidad.OFFLINE)
              .ranking(new BigDecimal("5.00")) // Empieza con 5 estrellas!
              .build();
      profileRepository.save(profile);
    }

    keycloakRoleService.assignTecnicoRole(p.getClienteId());
    notifyUser(
        p.getClienteId(),
        "Solicitud aprobada",
        "Tu postulacion fue aprobada. Ya puedes ingresar al panel tecnico.",
        "/tecnico",
        "TECHNICIAN_APPLICATION_APPROVED",
        "technician-application-" + p.getId());
    System.out.println(
        "Postulacion aprobada, se asignó el rol TECNICO al usuario " + p.getClienteId());
  }

  @Override
  @Transactional
  public void rechazarPostulacion(Long postulacionId, String evaluadorName, String notas) {
    Postulacion p =
        postulacionRepository
            .findById(postulacionId)
            .orElseThrow(() -> new IllegalArgumentException("Postulacion no encontrada"));

    if (p.getEstado() != EstadoPostulacion.SUBMITTED
        && p.getEstado() != EstadoPostulacion.UNDER_REVIEW) {
      throw new IllegalStateException("La postulacion no esta pendiente");
    }

    p.setEstado(EstadoPostulacion.REJECTED);
    p.setEvaluatorName(evaluadorName);
    p.setEvaluatorRole("Super Admin");
    p.setEvaluatorNotes(notas);
    p.setEvaluatedAt(java.time.LocalDateTime.now());
    postulacionRepository.save(p);
    notifyUser(
        p.getClienteId(),
        "Solicitud rechazada",
        "Tu postulacion para ser tecnico fue rechazada. Revisa tus datos y vuelve a intentarlo.",
        "/cliente/postular-tecnico",
        "TECHNICIAN_APPLICATION_REJECTED",
        "technician-application-" + p.getId());
  }

  @Override
  @Transactional
  public void eliminarPostulacion(Long postulacionId) {
    postulacionRepository.deleteById(postulacionId);
  }

  @Override
  @Transactional
  public void cambiarDisponibilidad(String clienteId, EstadoDisponibilidad estado) {
    TecnicoProfile profile = obtenerPerfil(clienteId);

    // Regla: No puede pasar a ONLINE si está BUSY, a menos que se haya forzado.
    // Asumiremos que el sistema lo cambia de BUSY a ONLINE cuando termina el trabajo.
    if (profile.getEstadoDisponibilidad() == EstadoDisponibilidad.BUSY
        && estado == EstadoDisponibilidad.ONLINE) {
      // Permitir, significa que termino el trabajo y vuelve a estar online
    }

    profile.setEstadoDisponibilidad(estado);
    profileRepository.save(profile);
  }

  @Override
  @Transactional
  public void actualizarUbicacion(String clienteId, UbicacionDTO ubicacion) {
    TecnicoProfile profile = obtenerPerfil(clienteId);

    if (profile.getEstadoDisponibilidad() == EstadoDisponibilidad.OFFLINE) {
      throw new IllegalStateException("No se puede actualizar GPS si el tecnico esta OFFLINE");
    }

    profile.setLat(ubicacion.getLatitud());
    profile.setLng(ubicacion.getLongitud());
    profileRepository.save(profile);
  }

  @Override
  @Transactional(readOnly = true)
  public TecnicoProfile obtenerPerfil(String clienteId) {
    return profileRepository
        .findByClienteId(clienteId)
        .orElseThrow(() -> new IllegalStateException("Perfil de tecnico no encontrado"));
  }

  @Override
  @Transactional(readOnly = true)
  public List<com.serviya.technician.dto.TechnicianBasicDTO> obtenerTecnicosOnline(
      String categoria, Double lat, Double lng) {
    List<TecnicoProfile> onlineTecnicos =
        profileRepository.findByEstadoDisponibilidadAndCategoriasContainingIgnoreCase(
            EstadoDisponibilidad.ONLINE, categoria);

    return onlineTecnicos.stream()
        .filter(t -> t.getLat() != null && t.getLng() != null)
        .map(
            t -> {
              double distancia = 0.0;
              if (lat != null && lng != null) {
                distancia = calcularDistancia(lat, lng, t.getLat(), t.getLng());
              }
              String nombreTecnico =
                  postulacionRepository
                      .findByClienteIdAndEstadoIn(
                          t.getClienteId(),
                          List.of(
                              EstadoPostulacion.APPROVED,
                              EstadoPostulacion.SUBMITTED,
                              EstadoPostulacion.UNDER_REVIEW,
                              EstadoPostulacion.REJECTED,
                              EstadoPostulacion.DRAFT))
                      .stream()
                      .findFirst()
                      .map(Postulacion::getFullName)
                      .orElse("Técnico " + t.getClienteId().substring(0, 4));

              return com.serviya.technician.dto.TechnicianBasicDTO.builder()
                  .tecnicoId(t.getClienteId())
                  .nombreCompleto(nombreTecnico)
                  .categorias(t.getCategorias())
                  .lat(t.getLat())
                  .lng(t.getLng())
                  .ranking(t.getRanking() != null ? t.getRanking() : java.math.BigDecimal.ZERO)
                  // You would normally add a distance field in the DTO, but for sorting we can use
                  // a wrapper or just add it to DTO.
                  // For now, let's just sort here.
                  .build();
            })
        // Sort by distance (if coords provided) then by ranking descending
        .sorted(
            (t1, t2) -> {
              if (lat != null && lng != null) {
                double d1 = calcularDistancia(lat, lng, t1.getLat(), t1.getLng());
                double d2 = calcularDistancia(lat, lng, t2.getLat(), t2.getLng());
                if (Double.compare(d1, d2) != 0) {
                  return Double.compare(d1, d2); // Ascending distance
                }
              }
              // Descending ranking
              return t2.getRanking().compareTo(t1.getRanking());
            })
        .collect(java.util.stream.Collectors.toList());
  }

  private double calcularDistancia(double lat1, double lon1, double lat2, double lon2) {
    // Haversine formula
    final int R = 6371; // Earth radius in km
    double latDistance = Math.toRadians(lat2 - lat1);
    double lonDistance = Math.toRadians(lon2 - lon1);
    double a =
        Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
            + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2)
                * Math.sin(lonDistance / 2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private void notifyUser(
      String receiverId,
      String title,
      String message,
      String actionUrl,
      String type,
      String correlationId) {
    if (receiverId == null || receiverId.isBlank()) {
      return;
    }
    CreateNotificationDTO notification = new CreateNotificationDTO();
    notification.setReceiverId(receiverId);
    notification.setTitle(title);
    notification.setMessage(message);
    notification.setActionUrl(actionUrl);
    notification.setType(type);
    notification.setChannel("IN_APP");
    notification.setCorrelationId(correlationId);
    try {
      notificationClient.sendNotification(notification);
    } catch (Exception e) {
      System.err.println("Failed to send technician notification " + type + ": " + e.getMessage());
    }
  }
}
