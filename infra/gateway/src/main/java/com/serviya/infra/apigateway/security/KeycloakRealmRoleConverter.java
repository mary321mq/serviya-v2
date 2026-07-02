package com.serviya.infra.apigateway.security;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class KeycloakRealmRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

  private static final String REALM_ACCESS_CLAIM = "realm_access";
  private static final String ROLES_CLAIM = "roles";
  private static final String ROLE_PREFIX = "ROLE_";

  @Override
  public Collection<GrantedAuthority> convert(Jwt jwt) {
    Object realmAccess = jwt.getClaim(REALM_ACCESS_CLAIM);
    if (!(realmAccess instanceof Map<?, ?> realmAccessClaims)) {
      return Set.of();
    }

    Object roles = realmAccessClaims.get(ROLES_CLAIM);
    if (!(roles instanceof Collection<?> roleValues)) {
      return Set.of();
    }

    return roleValues.stream()
        .filter(String.class::isInstance)
        .map(String.class::cast)
        .map(String::trim)
        .filter(role -> !role.isBlank())
        .map(role -> role.startsWith(ROLE_PREFIX) ? role : ROLE_PREFIX + role)
        .map(SimpleGrantedAuthority::new)
        .collect(Collectors.toUnmodifiableSet());
  }
}
