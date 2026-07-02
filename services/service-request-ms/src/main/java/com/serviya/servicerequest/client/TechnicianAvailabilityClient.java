package com.serviya.servicerequest.client;

import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "technician-ms", path = "/api/v1/internal/technicians")
public interface TechnicianAvailabilityClient {

    @PostMapping("/{technicianId}/availability")
    void updateAvailability(
            @PathVariable("technicianId") String technicianId,
            @RequestBody Map<String, String> payload);
}
