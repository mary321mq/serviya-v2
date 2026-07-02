package com.serviya.notification.dto;

import lombok.Data;

@Data
public class CreateNotificationDTO {
    private String receiverId;
    private String title;
    private String message;
    private String actionUrl;
    private String type;
    private String channel;
    private String correlationId;
}
