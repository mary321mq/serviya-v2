package com.serviya.servicerequest.client;

import com.serviya.servicerequest.dto.TechnicianMatchDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "assignment-ms", path = "/api/v1")
public interface AssignmentClient {

    @GetMapping("/assignments/matches")
    List<TechnicianMatchDTO> buscarTecnicos(
            @RequestParam("lat") Double lat,
            @RequestParam("lng") Double lng,
            @RequestParam("categoria") String categoria
    );
}
