package com.serviya.servicerequest.entity;

import com.serviya.servicerequest.enums.EstadoSolicitud;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "solicitudes_servicio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String clienteId;

    private String tecnicoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_service_id", nullable = false)
    private CatalogServiceEntity catalogoServicio;

    @Column(length = 500)
    private String urlEvidencia;

    @ElementCollection
    @CollectionTable(
            name = "solicitud_evidencias",
            joinColumns = @JoinColumn(name = "solicitud_id"))
    @Column(name = "url", length = 500, nullable = false)
    @Builder.Default
    private List<String> evidenciaUrls = new ArrayList<>();

    @ElementCollection
    @CollectionTable(
            name = "solicitud_tecnicos_rechazados",
            joinColumns = @JoinColumn(name = "solicitud_id"))
    @Column(name = "tecnico_id", length = 255, nullable = false)
    @Builder.Default
    private List<String> tecnicosRechazados = new ArrayList<>();

    @Column(nullable = false)
    private String direccionFisica;

    private Double latitud;
    private Double longitud;

    @Column(precision = 12, scale = 2)
    private BigDecimal costoVisita;

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ServiceRequestItem> items = new ArrayList<>();

    @Column(precision = 12, scale = 2)
    private BigDecimal costoTotal;

    @Column(precision = 12, scale = 2)
    private BigDecimal montoTecnico;

    private Integer cantidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoSolicitud estadoSolicitud;

    @Column(nullable = false)
    @Builder.Default
    private boolean clienteConfirmoFin = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean tecnicoConfirmoFin = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
