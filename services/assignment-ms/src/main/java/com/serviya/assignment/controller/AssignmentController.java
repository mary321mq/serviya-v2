package com.serviya.assignment.controller;

import com.serviya.assignment.dto.TechnicianMatchDTO;
import com.serviya.assignment.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping("/matches")
    public ResponseEntity<List<TechnicianMatchDTO>> getMatches(
            @RequestParam("lat") Double lat,
            @RequestParam("lng") Double lng,
            @RequestParam("categoria") String categoria) {
        
        return ResponseEntity.ok(assignmentService.getMatches(lat, lng, categoria));
    }
}
