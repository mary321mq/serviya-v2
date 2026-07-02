package com.serviya.assignment.client;

import com.serviya.assignment.dto.TechnicianBasicDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "technician-ms", path = "/api/v1")
public interface TechnicianClient {

    @GetMapping("/technicians/online")
    List<TechnicianBasicDTO> obtenerTecnicosOnline(
            @RequestParam("categoria") String categoria,
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lng", required = false) Double lng);
}
