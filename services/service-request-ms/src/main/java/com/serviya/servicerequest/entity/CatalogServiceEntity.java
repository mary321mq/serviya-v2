package com.serviya.servicerequest.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.serviya.servicerequest.enums.TipoCobro;
import com.serviya.servicerequest.enums.ModalidadEvaluacion;

@Entity
@Table(name = "servicios_catalogo")
public class CatalogServiceEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "categoria_id", nullable = false)
  private ServiceCategory categoria;

  @Column(unique = true, nullable = false, length = 50)
  private String codigo;

  @Column(nullable = false, length = 150)
  private String nombre;

  @Column(length = 500)
  private String descripcion;

  @Column(name = "precio_base_referencial", precision = 12, scale = 2)
  private BigDecimal precioBaseReferencial;

  @Column(name = "requiere_foto")
  private Boolean requiereFoto = false;

  @Column(nullable = false)
  private Boolean activo = true;

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_cobro", length = 20)
  private TipoCobro tipoCobro;

  @Enumerated(EnumType.STRING)
  @Column(name = "modalidad_evaluacion", length = 20)
  private ModalidadEvaluacion modalidadEvaluacion;

  @Column(name = "image_url", length = 500)
  private String imageUrl;

  @Column(name = "duracion_estimada", length = 50)
  private String duracionEstimada;

  @Column(name = "created_at")
  private LocalDateTime createdAt = LocalDateTime.now();

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public ServiceCategory getCategoria() {
    return categoria;
  }

  public void setCategoria(ServiceCategory categoria) {
    this.categoria = categoria;
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
}
