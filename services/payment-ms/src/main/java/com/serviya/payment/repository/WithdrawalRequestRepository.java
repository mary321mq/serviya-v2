package com.serviya.payment.repository;

import com.serviya.payment.entity.WithdrawalRequest;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, Long> {
  List<WithdrawalRequest> findByTechnicianIdOrderByCreatedAtDesc(String technicianId);
}
