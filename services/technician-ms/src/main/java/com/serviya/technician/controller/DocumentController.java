package com.serviya.technician.controller;

import com.serviya.technician.entity.TechnicianDocument;
import com.serviya.technician.service.DocumentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/me/technician/documents")
@RequiredArgsConstructor
public class DocumentController {

  private final DocumentService documentService;

  @GetMapping
  public ResponseEntity<List<TechnicianDocument>> getDocuments(@AuthenticationPrincipal Jwt jwt) {
    return ResponseEntity.ok(documentService.getDocuments(jwt.getSubject()));
  }

  @PostMapping
  public ResponseEntity<TechnicianDocument> uploadDocument(
      @AuthenticationPrincipal Jwt jwt,
      @RequestParam("file") MultipartFile file,
      @RequestParam("documentType") String documentType) {

    return ResponseEntity.ok(documentService.uploadDocument(jwt.getSubject(), documentType, file));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteDocument(
      @AuthenticationPrincipal Jwt jwt, @PathVariable("id") String id) {
    documentService.deleteDocument(jwt.getSubject(), id);
    return ResponseEntity.ok().build();
  }
}
