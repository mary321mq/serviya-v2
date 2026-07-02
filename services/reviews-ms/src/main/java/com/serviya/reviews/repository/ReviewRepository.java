package com.serviya.reviews.repository;

import com.serviya.reviews.entity.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {
    List<ReviewEntity> findByTecnicoIdOrderByCreatedAtDesc(String tecnicoId);
    List<ReviewEntity> findByClienteIdOrderByCreatedAtDesc(String clienteId);
    boolean existsByClienteIdAndRequestId(String clienteId, Long requestId);
}
