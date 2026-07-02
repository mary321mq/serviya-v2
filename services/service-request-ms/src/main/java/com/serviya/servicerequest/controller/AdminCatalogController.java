package com.serviya.servicerequest.controller;

import com.serviya.servicerequest.dto.CatalogServiceDTO;
import com.serviya.servicerequest.dto.CategoryDTO;
import com.serviya.servicerequest.service.CatalogManagementService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/catalogs")
public class AdminCatalogController {

  private final CatalogManagementService catalogService;

  public AdminCatalogController(CatalogManagementService catalogService) {
    this.catalogService = catalogService;
  }

  @GetMapping("/categories")
  public ResponseEntity<List<CategoryDTO>> getAllCategories() {
    return ResponseEntity.ok(catalogService.getAllCategories());
  }

  @PostMapping("/categories")
  public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(catalogService.createCategory(dto));
  }

  @PutMapping("/categories/{code}")
  public ResponseEntity<CategoryDTO> updateCategory(
      @PathVariable("code") String code, @RequestBody CategoryDTO dto) {
    return ResponseEntity.ok(catalogService.updateCategory(code, dto));
  }

  @DeleteMapping("/categories/{code}")
  public ResponseEntity<Void> deleteCategory(@PathVariable("code") String code) {
    catalogService.deleteCategory(code);
    return ResponseEntity.noContent().build();
  }

  @PatchMapping("/categories/{code}/activate")
  public ResponseEntity<Void> activateCategory(@PathVariable("code") String code) {
    catalogService.toggleCategoryStatus(code, true);
    return ResponseEntity.ok().build();
  }

  @PatchMapping("/categories/{code}/deactivate")
  public ResponseEntity<Void> deactivateCategory(@PathVariable("code") String code) {
    catalogService.toggleCategoryStatus(code, false);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/services")
  public ResponseEntity<List<CatalogServiceDTO>> getAllServices() {
    return ResponseEntity.ok(catalogService.getAllServices());
  }

  @PostMapping("/services")
  public ResponseEntity<CatalogServiceDTO> createService(@RequestBody CatalogServiceDTO dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(catalogService.createService(dto));
  }

  @PutMapping("/services/{code}")
  public ResponseEntity<CatalogServiceDTO> updateService(
      @PathVariable("code") String code, @RequestBody CatalogServiceDTO dto) {
    return ResponseEntity.ok(catalogService.updateService(code, dto));
  }

  @DeleteMapping("/services/{code}")
  public ResponseEntity<Void> deleteService(@PathVariable("code") String code) {
    catalogService.deleteService(code);
    return ResponseEntity.noContent().build();
  }

  @PatchMapping("/services/{code}/activate")
  public ResponseEntity<Void> activateService(@PathVariable("code") String code) {
    catalogService.toggleServiceStatus(code, true);
    return ResponseEntity.ok().build();
  }

  @PatchMapping("/services/{code}/deactivate")
  public ResponseEntity<Void> deactivateService(@PathVariable("code") String code) {
    catalogService.toggleServiceStatus(code, false);
    return ResponseEntity.ok().build();
  }
}
