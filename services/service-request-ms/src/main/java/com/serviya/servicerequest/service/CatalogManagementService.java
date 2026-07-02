package com.serviya.servicerequest.service;

import com.serviya.servicerequest.dto.CatalogServiceDTO;
import com.serviya.servicerequest.dto.CategoryDTO;
import com.serviya.servicerequest.entity.CatalogServiceEntity;
import com.serviya.servicerequest.entity.ServiceCategory;
import com.serviya.servicerequest.repository.CatalogServiceRepository;
import com.serviya.servicerequest.repository.ServiceCategoryRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogManagementService {

  private final ServiceCategoryRepository categoryRepository;
  private final CatalogServiceRepository serviceRepository;

  public CatalogManagementService(
      ServiceCategoryRepository categoryRepository, CatalogServiceRepository serviceRepository) {
    this.categoryRepository = categoryRepository;
    this.serviceRepository = serviceRepository;
  }

  @Transactional(readOnly = true)
  public List<CategoryDTO> getAllCategories() {
    return categoryRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
  }

  @Transactional
  public CategoryDTO createCategory(CategoryDTO dto) {
    if (categoryRepository.existsByCodigo(dto.getCodigo())) {
      throw new IllegalArgumentException("Ya existe una categoría con ese código.");
    }
    ServiceCategory category = new ServiceCategory();
    category.setCodigo(dto.getCodigo());
    category.setNombre(dto.getNombre());
    category.setDescripcion(dto.getDescripcion());
    if (dto.getActivo() != null) category.setActivo(dto.getActivo());

    category = categoryRepository.save(category);
    return mapToDTO(category);
  }

  @Transactional
  public CategoryDTO updateCategory(String code, CategoryDTO dto) {
    ServiceCategory category =
        categoryRepository
            .findByCodigo(code)
            .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada."));
    if (dto.getNombre() != null) category.setNombre(dto.getNombre());
    if (dto.getDescripcion() != null) category.setDescripcion(dto.getDescripcion());
    category = categoryRepository.save(category);
    return mapToDTO(category);
  }

  @Transactional
  public void deleteCategory(String code) {
    ServiceCategory category =
        categoryRepository
            .findByCodigo(code)
            .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada."));
    categoryRepository.delete(category);
  }

  @Transactional
  public void toggleCategoryStatus(String code, boolean active) {
    ServiceCategory category =
        categoryRepository
            .findByCodigo(code)
            .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada."));
    category.setActivo(active);
    categoryRepository.save(category);
  }

  @Transactional(readOnly = true)
  public List<CatalogServiceDTO> getServicesByCategory(Long categoryId) {
    return serviceRepository.findByCategoriaId(categoryId).stream()
        .filter(CatalogServiceEntity::getActivo)
        .map(this::mapToDTO)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public List<CatalogServiceDTO> getAllServices() {
    return serviceRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public CatalogServiceDTO getServiceByCodigo(String code) {
    CatalogServiceEntity entity =
        serviceRepository
            .findByCodigo(code)
            .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado."));
    return mapToDTO(entity);
  }

  @Transactional
  public CatalogServiceDTO createService(CatalogServiceDTO dto) {
    if (serviceRepository.existsByCodigo(dto.getCodigo())) {
      throw new IllegalArgumentException("Ya existe un servicio con ese código.");
    }
    ServiceCategory category;
    if (dto.getCategoriaId() != null) {
      category =
          categoryRepository
              .findById(dto.getCategoriaId())
              .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada."));
    } else if (dto.getCategoryCode() != null) {
      category =
          categoryRepository
              .findByCodigo(dto.getCategoryCode())
              .orElseThrow(
                  () -> new IllegalArgumentException("Categoría no encontrada por código."));
    } else {
      throw new IllegalArgumentException("Debe proveer categoriaId o categoryCode.");
    }

    CatalogServiceEntity entity = new CatalogServiceEntity();
    entity.setCategoria(category);
    entity.setCodigo(dto.getCodigo());
    entity.setNombre(dto.getNombre());
    entity.setDescripcion(dto.getDescripcion());
    entity.setPrecioBaseReferencial(dto.getPrecioBaseReferencial());
    if (dto.getRequiereFoto() != null) entity.setRequiereFoto(dto.getRequiereFoto());
    if (dto.getActivo() != null) entity.setActivo(dto.getActivo());
    if (dto.getTipoCobro() != null) entity.setTipoCobro(dto.getTipoCobro());
    if (dto.getModalidadEvaluacion() != null) entity.setModalidadEvaluacion(dto.getModalidadEvaluacion());
    if (dto.getImageUrl() != null) entity.setImageUrl(dto.getImageUrl());
    if (dto.getDuracionEstimada() != null) entity.setDuracionEstimada(dto.getDuracionEstimada());

    entity = serviceRepository.save(entity);
    return mapToDTO(entity);
  }

  @Transactional
  public CatalogServiceDTO updateService(String code, CatalogServiceDTO dto) {
    CatalogServiceEntity entity =
        serviceRepository
            .findByCodigo(code)
            .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado."));
    if (dto.getNombre() != null) entity.setNombre(dto.getNombre());
    if (dto.getDescripcion() != null) entity.setDescripcion(dto.getDescripcion());
    if (dto.getPrecioBaseReferencial() != null)
      entity.setPrecioBaseReferencial(dto.getPrecioBaseReferencial());
    if (dto.getTipoCobro() != null) entity.setTipoCobro(dto.getTipoCobro());
    if (dto.getModalidadEvaluacion() != null) entity.setModalidadEvaluacion(dto.getModalidadEvaluacion());
    if (dto.getImageUrl() != null) entity.setImageUrl(dto.getImageUrl());
    if (dto.getDuracionEstimada() != null) entity.setDuracionEstimada(dto.getDuracionEstimada());

    if (dto.getCategoriaId() != null || dto.getCategoryCode() != null) {
      ServiceCategory category;
      if (dto.getCategoriaId() != null) {
        category =
            categoryRepository
                .findById(dto.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada."));
      } else {
        category =
            categoryRepository
                .findByCodigo(dto.getCategoryCode())
                .orElseThrow(
                    () -> new IllegalArgumentException("Categoría no encontrada por código."));
      }
      entity.setCategoria(category);
    }

    entity = serviceRepository.save(entity);
    return mapToDTO(entity);
  }

  @Transactional
  public void deleteService(String code) {
    CatalogServiceEntity entity =
        serviceRepository
            .findByCodigo(code)
            .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado."));
    serviceRepository.delete(entity);
  }

  @Transactional
  public void toggleServiceStatus(String code, boolean active) {
    CatalogServiceEntity entity =
        serviceRepository
            .findByCodigo(code)
            .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado."));
    entity.setActivo(active);
    serviceRepository.save(entity);
  }

  private CategoryDTO mapToDTO(ServiceCategory entity) {
    CategoryDTO dto = new CategoryDTO();
    dto.setId(entity.getId());
    dto.setCodigo(entity.getCodigo());
    dto.setNombre(entity.getNombre());
    dto.setDescripcion(entity.getDescripcion());
    dto.setActivo(entity.getActivo());
    dto.setCreatedAt(entity.getCreatedAt());
    return dto;
  }

  private CatalogServiceDTO mapToDTO(CatalogServiceEntity entity) {
    CatalogServiceDTO dto = new CatalogServiceDTO();
    dto.setId(entity.getId());
    if (entity.getCategoria() != null) {
      dto.setCategoriaId(entity.getCategoria().getId());
      dto.setCategoryCode(entity.getCategoria().getCodigo());
    }
    dto.setCodigo(entity.getCodigo());
    dto.setNombre(entity.getNombre());
    dto.setDescripcion(entity.getDescripcion());
    dto.setPrecioBaseReferencial(entity.getPrecioBaseReferencial());
    dto.setRequiereFoto(entity.getRequiereFoto());
    dto.setActivo(entity.getActivo());
    dto.setCreatedAt(entity.getCreatedAt());
    dto.setTipoCobro(entity.getTipoCobro());
    dto.setModalidadEvaluacion(entity.getModalidadEvaluacion());
    dto.setImageUrl(entity.getImageUrl());
    dto.setDuracionEstimada(entity.getDuracionEstimada());
    return dto;
  }
}
