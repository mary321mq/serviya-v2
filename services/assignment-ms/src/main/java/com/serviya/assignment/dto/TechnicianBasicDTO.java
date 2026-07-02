package com.serviya.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianBasicDTO {
    private String tecnicoId;
    private String nombreCompleto;
    private String categorias;
    private Double lat;
    private Double lng;
    private BigDecimal ranking;
}
