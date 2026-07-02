package com.serviya.servicerequest.controller;

import com.serviya.servicerequest.dto.ServiceRequestResponseDTO;
import com.serviya.servicerequest.service.ServiceRequestService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/solicitudes")
@RequiredArgsConstructor
public class AdminServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    @GetMapping
    public ResponseEntity<List<ServiceRequestResponseDTO>> listarSolicitudes() {
        return ResponseEntity.ok(serviceRequestService.listarSolicitudesAdmin());
    }
}
