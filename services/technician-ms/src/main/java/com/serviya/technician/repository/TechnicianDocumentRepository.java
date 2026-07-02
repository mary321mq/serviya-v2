package com.serviya.technician.repository;

import com.serviya.technician.entity.TechnicianDocument;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TechnicianDocumentRepository extends JpaRepository<TechnicianDocument, String> {
  List<TechnicianDocument> findByClienteId(String clienteId);

  Optional<TechnicianDocument> findByIdAndClienteId(String id, String clienteId);
}
