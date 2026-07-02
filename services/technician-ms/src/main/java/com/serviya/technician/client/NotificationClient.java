package com.serviya.technician.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-ms", path = "/api/v1/notifications")
public interface NotificationClient {

  @PostMapping
  void sendNotification(@RequestBody CreateNotificationDTO dto);
}
