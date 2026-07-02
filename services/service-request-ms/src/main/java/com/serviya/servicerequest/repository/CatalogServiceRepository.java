package com.serviya.servicerequest.repository;

import com.serviya.servicerequest.entity.CatalogServiceEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatalogServiceRepository extends JpaRepository<CatalogServiceEntity, Long> {
  List<CatalogServiceEntity> findByCategoriaId(Long categoriaId);

  boolean existsByCodigo(String codigo);

  java.util.Optional<CatalogServiceEntity> findByCodigo(String codigo);
}
