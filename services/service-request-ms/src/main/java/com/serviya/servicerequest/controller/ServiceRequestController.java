package com.serviya.servicerequest.controller;

import com.serviya.servicerequest.dto.CreateServiceRequestDTO;
import com.serviya.servicerequest.dto.QuoteServiceRequestDTO;
import com.serviya.servicerequest.dto.ServiceRequestResponseDTO;
import com.serviya.servicerequest.service.ServiceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/solicitudes")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    @PostMapping
    public ResponseEntity<ServiceRequestResponseDTO> crearSolicitud(
            @Valid @RequestBody CreateServiceRequestDTO dto,
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String clienteIdHeader) {
        
        ServiceRequestResponseDTO response = serviceRequestService.crearSolicitud(dto, resolveUserId(jwt, clienteIdHeader, "user-test-1234"));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<java.util.List<ServiceRequestResponseDTO>> listarMisSolicitudes(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String clienteIdHeader) {
        return ResponseEntity.ok(serviceRequestService.listarSolicitudesCliente(resolveUserId(jwt, clienteIdHeader, "user-test-1234")));
    }

    @GetMapping("/tecnico/solicitudes")
    public ResponseEntity<java.util.List<ServiceRequestResponseDTO>> listarMisSolicitudesTecnico(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String tecnicoIdHeader) {
        return ResponseEntity.ok(serviceRequestService.listarSolicitudesTecnico(resolveUserId(jwt, tecnicoIdHeader, "user-test-1234")));
    }

    @GetMapping("/tecnico/solicitudes/{id}")
    public ResponseEntity<ServiceRequestResponseDTO> obtenerMiSolicitudTecnico(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String tecnicoIdHeader) {
        return ResponseEntity.ok(serviceRequestService.obtenerSolicitudTecnico(id, resolveUserId(jwt, tecnicoIdHeader, "user-test-1234")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestResponseDTO> obtenerMiSolicitud(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String clienteIdHeader) {
        return ResponseEntity.ok(serviceRequestService.obtenerSolicitudCliente(id, resolveUserId(jwt, clienteIdHeader, "user-test-1234")));
    }

    @GetMapping("/{id}/tracking")
    public ResponseEntity<ServiceRequestResponseDTO> trackingMiSolicitud(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String clienteIdHeader) {
        return ResponseEntity.ok(serviceRequestService.obtenerSolicitudCliente(id, resolveUserId(jwt, clienteIdHeader, "user-test-1234")));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ServiceRequestResponseDTO> cancelarMiSolicitud(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String clienteIdHeader) {
        return ResponseEntity.ok(serviceRequestService.cancelarSolicitudCliente(id, resolveUserId(jwt, clienteIdHeader, "user-test-1234")));
    }

    @PostMapping("/{id}/marcar-pagado")
    public ResponseEntity<ServiceRequestResponseDTO> marcarPagado(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String clienteIdHeader) {
        return ResponseEntity.ok(serviceRequestService.marcarComoPagado(id, resolveUserId(jwt, clienteIdHeader, "user-test-1234")));
    }

    @GetMapping("/{id}/matches")
    public ResponseEntity<java.util.List<com.serviya.servicerequest.dto.TechnicianMatchDTO>> getMatches(@PathVariable("id") Long id) {
        return ResponseEntity.ok(serviceRequestService.getMatches(id));
    }

    @PostMapping("/{id}/asignar")
    public ResponseEntity<Void> asignarTecnico(@PathVariable("id") Long id, @RequestParam("tecnicoId") String tecnicoId) {
        serviceRequestService.asignarTecnico(id, tecnicoId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/tecnico/solicitudes/{id}/aceptar")
    public ResponseEntity<Void> aceptarTrabajo(
            @PathVariable("id") Long id, 
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String tecnicoIdHeader) {
        String tecnicoId = resolveUserId(jwt, tecnicoIdHeader, "user-test-1234");
        serviceRequestService.aceptarTrabajo(id, tecnicoId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cliente/solicitudes/{id}/terminar")
    public ResponseEntity<Void> terminarTrabajoCliente(
            @PathVariable("id") Long id, 
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String clienteIdHeader) {
        String clienteId = resolveUserId(jwt, clienteIdHeader, "user-test-1234");
        serviceRequestService.terminarTrabajoCliente(id, clienteId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/terminar")
    public ResponseEntity<Void> terminarTrabajo(
            @PathVariable("id") Long id, 
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String tecnicoIdHeader) {
        String tecnicoId = resolveUserId(jwt, tecnicoIdHeader, "user-test-1234");
        serviceRequestService.terminarTrabajo(id, tecnicoId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/tecnico/solicitudes/{id}/rechazar")
    public ResponseEntity<Void> rechazarTrabajo(
            @PathVariable("id") Long id, 
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String tecnicoIdHeader) {
        String tecnicoId = resolveUserId(jwt, tecnicoIdHeader, "user-test-1234");
        serviceRequestService.rechazarTrabajoTecnico(id, tecnicoId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/trabajador/pendientes-cotizacion")
    public ResponseEntity<java.util.List<ServiceRequestResponseDTO>> listarPendientesCotizacion() {
        return ResponseEntity.ok(serviceRequestService.listarPendientesCotizacion());
    }

    @PostMapping("/trabajador/{id}/cotizar")
    public ResponseEntity<ServiceRequestResponseDTO> cotizarSolicitud(
            @PathVariable("id") Long id,
            @Valid @RequestBody QuoteServiceRequestDTO dto,
            @RequestHeader(value = "X-User-Id", defaultValue = "trabajador-local") String trabajadorId) {
        return ResponseEntity.ok(serviceRequestService.cotizarSolicitud(id, dto, trabajadorId));
    }

    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<java.util.Map<String, Object>> uploadEvidencia(
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "files", required = false) org.springframework.web.multipart.MultipartFile[] files) {
        java.util.List<org.springframework.web.multipart.MultipartFile> incomingFiles = new java.util.ArrayList<>();
        if (file != null && !file.isEmpty()) {
            incomingFiles.add(file);
        }
        if (files != null) {
            for (org.springframework.web.multipart.MultipartFile incomingFile : files) {
                if (incomingFile != null && !incomingFile.isEmpty()) {
                    incomingFiles.add(incomingFile);
                }
            }
        }
        if (incomingFiles.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            java.nio.file.Path uploadDir = java.nio.file.Paths
                    .get("uploads", "service-request-ms", "evidencias")
                    .toAbsolutePath()
                    .normalize();
            java.nio.file.Files.createDirectories(uploadDir);

            java.util.List<String> urls = new java.util.ArrayList<>();
            for (org.springframework.web.multipart.MultipartFile incomingFile : incomingFiles) {
                String contentType = incomingFile.getContentType();
                if (contentType != null && !contentType.toLowerCase().startsWith("image/")) {
                    return ResponseEntity.badRequest().build();
                }

                String originalFilename = incomingFile.getOriginalFilename();
                String safeName = originalFilename == null || originalFilename.isBlank()
                        ? "evidencia"
                        : originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
                String filename = java.util.UUID.randomUUID() + "_" + safeName;
                java.nio.file.Path target = uploadDir.resolve(filename).normalize();
                if (!target.startsWith(uploadDir)) {
                    return ResponseEntity.badRequest().build();
                }
                java.nio.file.Files.copy(
                        incomingFile.getInputStream(),
                        target,
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                urls.add("/api/v1/solicitudes/evidencia/" + filename);
            }

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("url", urls.get(0));
            response.put("urls", urls);
            return ResponseEntity.ok(response);
        } catch (java.io.IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/evidencias")
    public ResponseEntity<ServiceRequestResponseDTO> agregarEvidencias(
            @PathVariable("id") Long id,
            @RequestBody java.util.Map<String, java.util.List<String>> payload,
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String clienteIdHeader) {
        String clienteId = resolveUserId(jwt, clienteIdHeader, "user-test-1234");
        java.util.List<String> urls = payload.get("urls");
        return ResponseEntity.ok(serviceRequestService.agregarEvidencias(id, clienteId, urls));
    }

    @GetMapping("/evidencia/{filename:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getEvidencia(@PathVariable("filename") String filename) {
        try {
            String safeFilename = java.nio.file.Paths.get(filename).getFileName().toString();
            java.nio.file.Path uploadDir = java.nio.file.Paths
                    .get("uploads", "service-request-ms", "evidencias")
                    .toAbsolutePath()
                    .normalize();
            java.nio.file.Path file = uploadDir.resolve(safeFilename).normalize();
            if (!file.startsWith(uploadDir)) {
                return ResponseEntity.badRequest().build();
            }
            if (!java.nio.file.Files.exists(file)) {
                java.nio.file.Path legacyDir = java.nio.file.Paths
                        .get("uploads", "service-request-ms")
                        .toAbsolutePath()
                        .normalize();
                java.nio.file.Path legacyFile = legacyDir.resolve(safeFilename).normalize();
                if (legacyFile.startsWith(legacyDir) && java.nio.file.Files.exists(legacyFile)) {
                    file = legacyFile;
                }
            }
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                String contentType = java.nio.file.Files.probeContentType(file);
                if (contentType == null) contentType = "application/octet-stream";
                return ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, contentType)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String resolveUserId(Jwt jwt, String headerValue, String fallback) {
        if (jwt != null && jwt.getSubject() != null && !jwt.getSubject().isBlank()) {
            return jwt.getSubject();
        }
        if (headerValue != null && !headerValue.isBlank()) {
            return headerValue;
        }
        return fallback;
    }
}
