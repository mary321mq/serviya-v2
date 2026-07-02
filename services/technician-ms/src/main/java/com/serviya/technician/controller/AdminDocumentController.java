package com.serviya.technician.controller;

import com.serviya.technician.entity.TechnicianDocument;
import com.serviya.technician.service.DocumentService;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/technician-documents")
@RequiredArgsConstructor
public class AdminDocumentController {

  private final DocumentService documentService;

  @GetMapping("/{clienteId}")
  public ResponseEntity<List<TechnicianDocument>> getDocumentsByClienteId(
      @PathVariable("clienteId") String clienteId) {
    return ResponseEntity.ok(documentService.getDocuments(clienteId));
  }

  @GetMapping("/{documentId}/file")
  public ResponseEntity<Resource> getDocumentFile(@PathVariable("documentId") String documentId) {
    Resource file = documentService.getDocumentFile(documentId);
    if (file == null || !file.exists()) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
        .contentType(resolveMediaType(file))
        .body(file);
  }

  private MediaType resolveMediaType(Resource file) {
    try {
      String contentType =
          file.getFile().toPath().toFile().exists()
              ? java.nio.file.Files.probeContentType(file.getFile().toPath())
              : null;
      if (contentType != null) {
        return MediaType.parseMediaType(contentType);
      }
    } catch (IOException ignored) {
      // Fall back to filename-based detection below.
    }

    String filename = file.getFilename() != null ? file.getFilename().toLowerCase() : "";
    if (filename.endsWith(".pdf")) {
      return MediaType.APPLICATION_PDF;
    }
    if (filename.endsWith(".png")) {
      return MediaType.IMAGE_PNG;
    }
    if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
      return MediaType.IMAGE_JPEG;
    }
    return MediaType.APPLICATION_OCTET_STREAM;
  }
}
