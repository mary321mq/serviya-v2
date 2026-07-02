package com.serviya.servicerequest.repository;

import com.serviya.servicerequest.entity.ServiceCategory;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
  boolean existsByCodigo(String codigo);

  Optional<ServiceCategory> findByCodigo(String codigo);
}
