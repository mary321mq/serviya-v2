package com.serviya.infra.apigateway.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

class KeycloakRealmRoleConverterTest {

  private final KeycloakRealmRoleConverter converter = new KeycloakRealmRoleConverter();

  @Test
  void convertsRealmAccessRolesToSpringAuthorities() {
    Jwt jwt = jwtWithRoles("CLIENTE", "TECNICO");

    assertThat(converter.convert(jwt))
        .extracting(GrantedAuthority::getAuthority)
        .containsExactlyInAnyOrder("ROLE_CLIENTE", "ROLE_TECNICO");
  }

  @Test
  void returnsNoAuthoritiesWhenRealmAccessIsMissing() {
    Jwt jwt = jwtWithClaims(Map.of());

    assertThat(converter.convert(jwt)).isEmpty();
  }

  private static Jwt jwtWithRoles(String... roles) {
    return jwtWithClaims(Map.of("realm_access", Map.of("roles", List.of(roles))));
  }

  private static Jwt jwtWithClaims(Map<String, Object> claims) {
    Map<String, Object> jwtClaims = new HashMap<>(claims);
    jwtClaims.putIfAbsent("sub", "test-subject");
    return new Jwt(
        "token", Instant.now(), Instant.now().plusSeconds(300), Map.of("alg", "none"), jwtClaims);
  }
}
