package com.serviya.servicerequest.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.serviya.servicerequest.enums.TipoCobro;
import com.serviya.servicerequest.enums.ModalidadEvaluacion;

public class CatalogServiceDTO {
  private Long id;
  private Long categoriaId;
  private String categoryCode;
  private String codigo;
  private String nombre;
  private String descripcion;
  private BigDecimal precioBaseReferencial;
  private Boolean requiereFoto;
  private Boolean activo;
  private LocalDateTime createdAt;
  private TipoCobro tipoCobro;
  private ModalidadEvaluacion modalidadEvaluacion;
  private String imageUrl;
  private String duracionEstimada;

  // Getters and Setters
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getCategoriaId() {
    return categoriaId;
  }

  public void setCategoriaId(Long categoriaId) {
    this.categoriaId = categoriaId;
  }

  public String getCategoryCode() {
    return categoryCode;
  }

  public void setCategoryCode(String categoryCode) {
    this.categoryCode = categoryCode;
  }

  public String getCodigo() {
    return codigo;
  }

  public void setCodigo(String codigo) {
    this.codigo = codigo;
  }

  public String getNombre() {
    return nombre;
  }

  public void setNombre(String nombre) {
    this.nombre = nombre;
  }

  public String getDescripcion() {
    return descripcion;
  }

  public void setDescripcion(String descripcion) {
    this.descripcion = descripcion;
  }

  public BigDecimal getPrecioBaseReferencial() {
    return precioBaseReferencial;
  }

  public void setPrecioBaseReferencial(BigDecimal precioBaseReferencial) {
    this.precioBaseReferencial = precioBaseReferencial;
  }

  public Boolean getRequiereFoto() {
    return requiereFoto;
  }

  public void setRequiereFoto(Boolean requiereFoto) {
    this.requiereFoto = requiereFoto;
  }

  public Boolean getActivo() {
    return activo;
  }

  public void setActivo(Boolean activo) {
    this.activo = activo;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public TipoCobro getTipoCobro() {
    return tipoCobro;
  }

  public void setTipoCobro(TipoCobro tipoCobro) {
    this.tipoCobro = tipoCobro;
  }

  public ModalidadEvaluacion getModalidadEvaluacion() {
    return modalidadEvaluacion;
  }

  public void setModalidadEvaluacion(ModalidadEvaluacion modalidadEvaluacion) {
    this.modalidadEvaluacion = modalidadEvaluacion;
  }

  public String getImageUrl() {
    return imageUrl;
  }

  public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
  }

  public String getDuracionEstimada() {
    return duracionEstimada;
  }

  public void setDuracionEstimada(String duracionEstimada) {
    this.duracionEstimada = duracionEstimada;
  }
}
