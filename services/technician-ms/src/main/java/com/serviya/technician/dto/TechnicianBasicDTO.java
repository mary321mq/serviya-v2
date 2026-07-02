package com.serviya.technician.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
