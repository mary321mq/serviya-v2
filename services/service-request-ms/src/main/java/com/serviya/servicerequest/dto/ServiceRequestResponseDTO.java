package com.serviya.servicerequest.dto;

import com.serviya.servicerequest.enums.EstadoSolicitud;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequestResponseDTO {
    private Long id;
    private String clienteId;
    private String tecnicoId;
    private CatalogServiceDTO catalogoServicio;
    private String urlEvidencia;
    private List<String> evidenciaUrls;
    private String direccionFisica;
    private Double latitud;
    private Double longitud;
    private BigDecimal costoVisita;
    private List<ServiceRequestItemDTO> items;
    private String clienteNombre;
    private BigDecimal costoTotal;
    private BigDecimal montoTecnico;
    private EstadoSolicitud estadoSolicitud;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean clienteConfirmoFin;
    private boolean tecnicoConfirmoFin;
}
