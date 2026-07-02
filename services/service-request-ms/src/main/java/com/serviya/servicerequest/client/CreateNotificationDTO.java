package com.serviya.servicerequest.client;

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
