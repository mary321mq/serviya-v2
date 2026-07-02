package com.serviya.notification.controller;

import com.serviya.notification.dto.CreateNotificationDTO;
import com.serviya.notification.entity.NotificationEntity;
import com.serviya.notification.repository.NotificationRepository;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @PostMapping
    public ResponseEntity<NotificationEntity> createNotification(@RequestBody CreateNotificationDTO dto) {
        NotificationEntity notification = NotificationEntity.builder()
                .receiverId(dto.getReceiverId())
                .title(dto.getTitle())
                .message(dto.getMessage())
                .actionUrl(dto.getActionUrl())
                .type(dto.getType())
                .channel(dto.getChannel() != null ? dto.getChannel() : "IN_APP")
                .correlationId(dto.getCorrelationId())
                .isRead(false)
                .build();
        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    @GetMapping("/me")
    public ResponseEntity<List<NotificationEntity>> getMyNotifications(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String receiverIdHeader) {
        String receiverId = resolveReceiverId(jwt, receiverIdHeader);
        return ResponseEntity.ok(notificationRepository.findByReceiverIdOrderByCreatedAtDesc(receiverId));
    }

    @GetMapping("/me/unread-count")
    public ResponseEntity<Map<String, Long>> countMyUnreadNotifications(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String receiverIdHeader) {
        String receiverId = resolveReceiverId(jwt, receiverIdHeader);
        long count = notificationRepository.countByReceiverIdAndIsReadFalse(receiverId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String receiverIdHeader) {
        String receiverId = resolveReceiverId(jwt, receiverIdHeader);
        notificationRepository.findById(id)
                .filter(notification -> receiverId.equals(notification.getReceiverId()))
                .ifPresent(notification -> {
                    notification.setRead(true);
                    notificationRepository.save(notification);
                });
        return ResponseEntity.ok().build();
    }

    @PutMapping("/me/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String receiverIdHeader) {
        String receiverId = resolveReceiverId(jwt, receiverIdHeader);
        notificationRepository.findByReceiverIdOrderByCreatedAtDesc(receiverId).forEach(notification -> {
            if (!notification.isRead()) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        });
        return ResponseEntity.ok().build();
    }

    @PostMapping("/me/welcome")
    public ResponseEntity<Void> ensureWelcomeNotification(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String receiverIdHeader) {
        String receiverId = resolveReceiverId(jwt, receiverIdHeader);
        if (!notificationRepository.existsByReceiverIdAndTypeAndCorrelationId(receiverId, "WELCOME", receiverId)) {
            NotificationEntity notification = NotificationEntity.builder()
                    .receiverId(receiverId)
                    .title("Bienvenido a ServiYa")
                    .message("Tu cuenta esta lista. Ya puedes crear solicitudes, revisar cotizaciones y recibir avisos.")
                    .type("WELCOME")
                    .channel("IN_APP")
                    .correlationId(receiverId)
                    .actionUrl("/cliente/solicitudes")
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }
        return ResponseEntity.ok().build();
    }

    private String resolveReceiverId(Jwt jwt, String receiverIdHeader) {
        if (jwt != null && jwt.getSubject() != null && !jwt.getSubject().isBlank()) {
            return jwt.getSubject();
        }
        if (receiverIdHeader != null && !receiverIdHeader.isBlank()) {
            return receiverIdHeader;
        }
        throw new IllegalArgumentException("receiverId is required");
    }
}
