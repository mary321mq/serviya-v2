package com.serviya.technician.service;

import com.serviya.technician.entity.TechnicianDocument;
import com.serviya.technician.repository.TechnicianDocumentRepository;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

  private final TechnicianDocumentRepository documentRepository;
  private final String UPLOAD_DIR = "uploads/technician-ms/";

  @Override
  @Transactional(readOnly = true)
  public List<TechnicianDocument> getDocuments(String clienteId) {
    return documentRepository.findByClienteId(clienteId);
  }

  @Override
  @Transactional
  public TechnicianDocument uploadDocument(
      String clienteId, String documentType, MultipartFile file) {
    if (file.isEmpty()) {
      throw new IllegalArgumentException("File is empty");
    }

    try {
      File dir = new File(UPLOAD_DIR);
      if (!dir.exists()) {
        dir.mkdirs();
      }

      String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
      Path path = Paths.get(UPLOAD_DIR + filename);
      Files.write(path, file.getBytes());

      TechnicianDocument doc =
          TechnicianDocument.builder()
              .clienteId(clienteId)
              .documentType(documentType)
              .originalFilename(file.getOriginalFilename())
              .fileUrl(path.toString())
              .status("PENDING_VERIFICATION")
              .build();

      return documentRepository.save(doc);

    } catch (IOException e) {
      throw new IllegalStateException("Failed to store file: " + e.getMessage());
    }
  }

  @Override
  @Transactional
  public void deleteDocument(String clienteId, String documentId) {
    TechnicianDocument doc =
        documentRepository
            .findByIdAndClienteId(documentId, clienteId)
            .orElseThrow(() -> new IllegalArgumentException("Document not found"));

    try {
      Files.deleteIfExists(Paths.get(doc.getFileUrl()));
    } catch (IOException e) {
      // Ignorar si el archivo fisico no existe
    }

    documentRepository.delete(doc);
  }

  @Override
  @Transactional(readOnly = true)
  public Resource getDocumentFile(String documentId) {
    TechnicianDocument doc =
        documentRepository
            .findById(documentId)
            .orElseThrow(() -> new IllegalArgumentException("Document not found"));
    try {
      Path file = Paths.get(doc.getFileUrl());
      Resource resource = new UrlResource(file.toUri());
      if (resource.exists() || resource.isReadable()) {
        return resource;
      } else {
        throw new IllegalStateException("Could not read file: " + doc.getFileUrl());
      }
    } catch (MalformedURLException e) {
      throw new IllegalStateException("Error reading file: " + e.getMessage());
    }
  }
}
