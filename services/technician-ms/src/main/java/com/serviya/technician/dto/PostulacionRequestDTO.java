package com.serviya.technician.dto;

import lombok.Data;

@Data
public class PostulacionRequestDTO {
  private String fullName;
  private String phone;

  private String department;
  private String province;
  private String district;
  private String addressLine;
  private String reference;
  private Double lat;
  private Double lng;
  private Boolean hasStore;
  private String storeName;

  private String aboutMe;
  private String identityDocumentType;
  private String identityDocumentNumber;
  private String ruc;
  private String categorias;

  private String requestedService;
  private String experience;
  private String availability;
  private String preferredSchedule;
}
