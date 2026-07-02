package com.serviya.technician.controller;

import com.serviya.technician.entity.PortfolioPhoto;
import com.serviya.technician.service.PortfolioService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PortfolioController {

  private final PortfolioService portfolioService;

  // ----- TECHNICIAN PRIVATE ROUTES -----

  @PostMapping(value = "/me/technician/portfolio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<PortfolioPhoto> uploadPhoto(
      @AuthenticationPrincipal Jwt jwt,
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "description", required = false) String description) {
    return ResponseEntity.ok(portfolioService.uploadPhoto(jwt.getSubject(), file, description));
  }

  @DeleteMapping("/me/technician/portfolio/{id}")
  public ResponseEntity<Void> deletePhoto(
      @AuthenticationPrincipal Jwt jwt, @PathVariable("id") Long id) {
    portfolioService.deletePhoto(jwt.getSubject(), id);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/me/technician/portfolio")
  public ResponseEntity<List<PortfolioPhoto>> getMyPortfolio(@AuthenticationPrincipal Jwt jwt) {
    return ResponseEntity.ok(portfolioService.getPhotos(jwt.getSubject()));
  }

  // ----- PUBLIC / CLIENT ROUTES -----

  @GetMapping("/public/technicians/{clienteId}/portfolio")
  public ResponseEntity<List<PortfolioPhoto>> getTechnicianPortfolio(
      @PathVariable("clienteId") String clienteId) {
    return ResponseEntity.ok(portfolioService.getPhotos(clienteId));
  }

  @GetMapping("/public/portfolio/photo/{id}")
  public ResponseEntity<Resource> getPhotoFile(@PathVariable("id") Long id) {
    Resource file = portfolioService.getPhotoFile(id);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
        .body(file);
  }
}
