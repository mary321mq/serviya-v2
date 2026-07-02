package com.serviya.infra.apigateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class GatewayContractTest {

  @Autowired private WebTestClient webClient;

  @Test
  void healthEndpointIsPublicAndReturns200() {
    webClient.get().uri("/actuator/health").exchange().expectStatus().isOk();
  }

  @Test
  void apiRoutesRequireAuthentication() {
    // Without token, it should redirect or return 401 Unauthorized
    webClient.get().uri("/api/v1/users/123").exchange().expectStatus().isUnauthorized();
  }
}
