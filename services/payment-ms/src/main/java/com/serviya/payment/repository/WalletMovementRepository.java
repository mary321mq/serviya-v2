package com.serviya.payment.repository;

import com.serviya.payment.entity.WalletMovement;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WalletMovementRepository extends JpaRepository<WalletMovement, Long> {
  List<WalletMovement> findByTechnicianIdOrderByCreatedAtDesc(String technicianId);
}
