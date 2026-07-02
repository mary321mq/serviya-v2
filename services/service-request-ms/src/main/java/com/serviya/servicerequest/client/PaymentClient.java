package com.serviya.servicerequest.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-ms", url = "http://localhost:8083", path = "/api/v1/internal/wallets")
public interface PaymentClient {

    @PostMapping("/{technicianId}/credit")
    void creditWallet(
            @PathVariable("technicianId") String technicianId, 
            @RequestBody CreditWalletRequestDTO request);
}
