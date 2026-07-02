package com.serviya.servicerequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceRequestDTO {

    @NotNull(message = "El servicio del catálogo es obligatorio")
    private Long catalogServiceId;

    private String urlEvidencia;
    private java.util.List<String> evidenciaUrls;

    @NotBlank(message = "La dirección física es obligatoria")
    private String direccionFisica;

    @NotNull(message = "La latitud es obligatoria")
    private Double latitud;

    @NotNull(message = "La longitud es obligatoria")
    private Double longitud;

    private Integer cantidad;
}
