package com.serviya.servicerequest.controller;

import com.serviya.servicerequest.dto.CatalogServiceDTO;
import com.serviya.servicerequest.dto.CategoryDTO;
import com.serviya.servicerequest.service.CatalogManagementService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/catalogs")
public class PublicCatalogController {

  private final CatalogManagementService catalogService;

  public PublicCatalogController(CatalogManagementService catalogService) {
    this.catalogService = catalogService;
  }

  @GetMapping("/categories")
  public ResponseEntity<List<CategoryDTO>> getCategories() {
    return ResponseEntity.ok(catalogService.getAllCategories());
  }

  @GetMapping("/categories/{id}/services")
  public ResponseEntity<List<CatalogServiceDTO>> getServicesByCategory(@PathVariable("id") Long id) {
    return ResponseEntity.ok(catalogService.getServicesByCategory(id));
  }

  @GetMapping("/services")
  public ResponseEntity<List<CatalogServiceDTO>> getAllServices() {
    return ResponseEntity.ok(catalogService.getAllServices());
  }

  @GetMapping("/services/{code}")
  public ResponseEntity<CatalogServiceDTO> getServiceByCodigo(@PathVariable("code") String code) {
    return ResponseEntity.ok(catalogService.getServiceByCodigo(code));
  }
}
