package com.serviya.technician.controller;

import com.serviya.technician.dto.PostulacionRequestDTO;
import com.serviya.technician.dto.UbicacionDTO;
import com.serviya.technician.entity.Postulacion;
import com.serviya.technician.entity.TecnicoProfile;
import com.serviya.technician.enums.EstadoDisponibilidad;
import com.serviya.technician.service.TechnicianService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TechnicianController {

  private final TechnicianService technicianService;

  // Obtener postulacion
  @GetMapping("/me/technician/application")
  public ResponseEntity<Postulacion> getApplication(@AuthenticationPrincipal Jwt jwt) {
    return ResponseEntity.ok(technicianService.obtenerPostulacion(jwt.getSubject()));
  }

  // Guardar borrador postulacion
  @PutMapping("/me/technician/application")
  public ResponseEntity<Postulacion> saveApplication(
      @AuthenticationPrincipal Jwt jwt, @RequestBody PostulacionRequestDTO dto) {
    return ResponseEntity.ok(technicianService.guardarPostulacion(jwt.getSubject(), dto));
  }

  // Enviar postulacion
  @PostMapping("/me/technician/application/submit")
  public ResponseEntity<Void> submitApplication(@AuthenticationPrincipal Jwt jwt) {
    technicianService.enviarPostulacion(jwt.getSubject());
    return ResponseEntity.ok().build();
  }

  // Admin lista pendientes
  @GetMapping("/admin/technicians/applications/pending")
  public ResponseEntity<List<Postulacion>> listarPendientes() {
    return ResponseEntity.ok(technicianService.listarPostulacionesPendientes());
  }

  // Admin lista TODAS las postulaciones
  @GetMapping("/admin/technicians/applications")
  public ResponseEntity<List<Postulacion>> listarTodasLasPostulaciones() {
    return ResponseEntity.ok(technicianService.listarTodasLasPostulaciones());
  }

  // Admin obtiene por ID
  @GetMapping("/admin/technicians/applications/{id}")
  public ResponseEntity<Postulacion> obtenerPostulacionPorId(@PathVariable("id") Long id) {
    return ResponseEntity.ok(technicianService.obtenerPostulacionPorId(id));
  }

  // Admin aprueba
  @PostMapping("/admin/technicians/applications/{id}/approve")
  public ResponseEntity<Void> aprobarPostulacion(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable("id") Long id,
      @RequestBody Map<String, String> payload) {
    String evaluador = jwt.getClaimAsString("preferred_username");
    if (evaluador == null) evaluador = "Admin";
    technicianService.aprobarPostulacion(id, evaluador, payload.get("notas"));
    return ResponseEntity.ok().build();
  }

  // Admin rechaza
  @PostMapping("/admin/technicians/applications/{id}/reject")
  public ResponseEntity<Void> rechazarPostulacion(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable("id") Long id,
      @RequestBody Map<String, String> payload) {
    String evaluador = jwt.getClaimAsString("preferred_username");
    if (evaluador == null) evaluador = "Admin";
    technicianService.rechazarPostulacion(id, evaluador, payload.get("notas"));
    return ResponseEntity.ok().build();
  }

  // Admin elimina postulacion
  @DeleteMapping("/admin/technicians/applications/{id}")
  public ResponseEntity<Void> eliminarPostulacion(@PathVariable("id") Long id) {
    technicianService.eliminarPostulacion(id);
    return ResponseEntity.ok().build();
  }

  // Tecnico cambia su switch de disponibilidad
  @PostMapping("/me/technician/availability")
  public ResponseEntity<Void> cambiarDisponibilidad(
      @AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> payload) {
    EstadoDisponibilidad estado = EstadoDisponibilidad.valueOf(payload.get("estado"));
    technicianService.cambiarDisponibilidad(jwt.getSubject(), estado);
    return ResponseEntity.ok().build();
  }

  // Uso interno entre microservicios: service-request-ms marca ocupado/libre al tecnico.
  @PostMapping("/internal/technicians/{technicianId}/availability")
  public ResponseEntity<Void> cambiarDisponibilidadInterna(
      @PathVariable("technicianId") String technicianId, @RequestBody Map<String, String> payload) {
    EstadoDisponibilidad estado = EstadoDisponibilidad.valueOf(payload.get("estado"));
    technicianService.cambiarDisponibilidad(technicianId, estado);
    return ResponseEntity.ok().build();
  }

  // Tecnico actualiza su GPS
  @PostMapping("/me/technician/location")
  public ResponseEntity<Void> actualizarUbicacion(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UbicacionDTO dto) {
    technicianService.actualizarUbicacion(jwt.getSubject(), dto);
    return ResponseEntity.ok().build();
  }

  // Tecnico obtiene su propio perfil
  @GetMapping("/me/technician/profile")
  public ResponseEntity<TecnicoProfile> miPerfil(@AuthenticationPrincipal Jwt jwt) {
    return ResponseEntity.ok(technicianService.obtenerPerfil(jwt.getSubject()));
  }

  // Buscar tecnicos online por categoria (para assignment-ms)
  @GetMapping("/technicians/online")
  public ResponseEntity<java.util.List<com.serviya.technician.dto.TechnicianBasicDTO>>
      obtenerTecnicosOnline(
          @RequestParam("categoria") String categoria,
          @RequestParam(value = "lat", required = false) Double lat,
          @RequestParam(value = "lng", required = false) Double lng) {
    return ResponseEntity.ok(technicianService.obtenerTecnicosOnline(categoria, lat, lng));
  }
}
