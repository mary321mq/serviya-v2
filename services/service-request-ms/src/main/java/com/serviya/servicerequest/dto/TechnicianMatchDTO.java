package com.serviya.servicerequest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianMatchDTO {
    private String tecnicoId;
    private String nombre;
    private String categorias;
    private Double distanciaKm;
    private Integer etaMinutos;
    private BigDecimal ranking;
    private Integer totalResenas;
}
