package com.serviya.technician;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class TechnicianMsApplication {

  public static void main(String[] args) {
    SpringApplication.run(TechnicianMsApplication.class, args);
  }
}
