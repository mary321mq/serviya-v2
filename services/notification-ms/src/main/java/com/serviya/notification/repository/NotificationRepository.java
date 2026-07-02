package com.serviya.notification.repository;

import com.serviya.notification.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByReceiverIdOrderByCreatedAtDesc(String receiverId);
    long countByReceiverIdAndIsReadFalse(String receiverId);
    boolean existsByReceiverIdAndTypeAndCorrelationId(String receiverId, String type, String correlationId);
}
