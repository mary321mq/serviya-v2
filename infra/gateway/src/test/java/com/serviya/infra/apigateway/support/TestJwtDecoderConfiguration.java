package com.serviya.infra.apigateway.support;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import reactor.core.publisher.Mono;

@TestConfiguration(proxyBeanMethods = false)
public class TestJwtDecoderConfiguration {

  @Bean
  @Primary
  ReactiveJwtDecoder reactiveJwtDecoder() {
    return token ->
        Mono.just(
            Jwt.withTokenValue(token)
                .header("alg", "none")
                .subject("test-subject")
                .claim("realm_access", Map.of("roles", rolesForToken(token)))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300))
                .build());
  }

  private static List<String> rolesForToken(String token) {
    return switch (token) {
      case "cliente-token" -> List.of("CLIENTE");
      case "tecnico-token" -> List.of("TECNICO");
      case "admin-token" -> List.of("ADMIN");
      default -> List.of();
    };
  }
}
