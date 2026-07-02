package com.serviya.technician.service;

import com.serviya.technician.entity.TechnicianDocument;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentService {
  List<TechnicianDocument> getDocuments(String clienteId);

  TechnicianDocument uploadDocument(String clienteId, String documentType, MultipartFile file);

  void deleteDocument(String clienteId, String documentId);

  org.springframework.core.io.Resource getDocumentFile(String documentId);
}
