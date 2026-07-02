package com.serviya.servicerequest.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class QuoteServiceRequestDTO {
    @NotNull
    private List<QuoteItemDTO> items;
}
