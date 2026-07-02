package com.serviya.technician.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UbicacionDTO {
  @NotNull(message = "La latitud es obligatoria")
  private Double latitud;

  @NotNull(message = "La longitud es obligatoria")
  private Double longitud;
}
