package com.serviya.technician.repository;

import com.serviya.technician.entity.PortfolioPhoto;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PortfolioPhotoRepository extends JpaRepository<PortfolioPhoto, Long> {
  List<PortfolioPhoto> findByClienteIdOrderByCreatedAtDesc(String clienteId);

  Optional<PortfolioPhoto> findByIdAndClienteId(Long id, String clienteId);
}
