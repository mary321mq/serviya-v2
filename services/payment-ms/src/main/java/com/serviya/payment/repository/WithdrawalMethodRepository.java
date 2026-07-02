package com.serviya.payment.repository;

import com.serviya.payment.entity.WithdrawalMethod;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WithdrawalMethodRepository extends JpaRepository<WithdrawalMethod, Long> {
  List<WithdrawalMethod> findByTechnicianIdOrderByCreatedAtDesc(String technicianId);

  Optional<WithdrawalMethod> findByIdAndTechnicianId(Long id, String technicianId);
}
