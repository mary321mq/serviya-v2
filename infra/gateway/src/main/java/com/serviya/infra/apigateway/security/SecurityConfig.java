package com.serviya.infra.apigateway.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;

@Configuration(proxyBeanMethods = false)
@EnableWebFluxSecurity
public class SecurityConfig {

  private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

  private static final String ROLE_CLIENTE = "CLIENTE";
  private static final String ROLE_TECNICO = "TECNICO";
  private static final String ROLE_TRABAJADOR = "TRABAJADOR";
  private static final String ROLE_ADMIN = "ADMIN";

  @Bean
  SecurityWebFilterChain springSecurityFilterChain(
      ServerHttpSecurity http,
      Converter<Jwt, Mono<AbstractAuthenticationToken>> jwtAuthenticationConverter) {
    return http.csrf(ServerHttpSecurity.CsrfSpec::disable)
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .headers(
            headers ->
                headers
                    .frameOptions(
                        frame ->
                            frame.mode(
                                org.springframework.security.web.server.header
                                    .XFrameOptionsServerHttpHeadersWriter.Mode.DENY))
                    .xssProtection(xss -> xss.disable())
                    .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'")))
        .authorizeExchange(
            exchanges ->
                exchanges
                    .pathMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .pathMatchers(
                        "/actuator/health",
                        "/actuator/info",
                        "/actuator/prometheus",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/webjars/**",
                        "/payment-ms/api/v1/pagos/webhook",
                        "/service-request-ms/api/v1/solicitudes/evidencia/**",
                        "/*/v3/api-docs/**")
                    .permitAll()

                    // ADMIN Routes
                    .pathMatchers(
                        "/actuator/**",
                        "/admin/**",
                        "/payment-ms/api/v1/admin/**",
                        "/review-ms/api/v1/admin/**",
                        "/service-request-ms/api/v1/admin/**",
                        "/technician-ms/api/v1/admin/**")
                    .hasRole(ROLE_ADMIN)

                    // TRABAJADOR Routes
                    .pathMatchers("/service-request-ms/api/v1/solicitudes/trabajador/**")
                    .hasRole(ROLE_TRABAJADOR)

                    // CLIENTE Routes
                    .pathMatchers(
                        "/user-ms/**",
                        "/service-request-ms/**",
                        "/review-ms/api/v1/reviews",
                        "/review-ms/api/v1/me/**",
                        "/payment-ms/api/v1/pagos/**",
                        "/technician-ms/api/v1/me/technician/application",
                        "/technician-ms/api/v1/me/technician/application/**",
                        "/technician-ms/api/v1/me/technician/documents",
                        "/technician-ms/api/v1/me/technician/documents/**",
                        "/technician-ms/api/v1/technicians/**")
                    .hasRole(ROLE_CLIENTE)

                    // TECNICO Routes
                    .pathMatchers(
                        "/technician-ms/**",
                        "/assignment-ms/api/v1/me/**",
                        "/payment-ms/api/v1/wallet/**",
                        "/review-ms/api/v1/me/technician/**",
                        "/service-request-ms/api/v1/solicitudes/tecnico/**")
                    .hasRole(ROLE_TECNICO)

                    // Shared Routes
                    .pathMatchers("/notification-ms/api/v1/notifications/**")
                    .hasAnyRole(ROLE_CLIENTE, ROLE_TECNICO, ROLE_TRABAJADOR)
                    .anyExchange()
                    .hasRole(ROLE_ADMIN))
        .oauth2ResourceServer(
            oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)))
        .build();
  }

  @Bean
  org.springframework.web.cors.reactive.CorsConfigurationSource corsConfigurationSource() {
    org.springframework.web.cors.CorsConfiguration configuration =
        new org.springframework.web.cors.CorsConfiguration();
    configuration.setAllowedOrigins(
        java.util.Arrays.asList("http://localhost:4200", "http://localhost:8080"));
    configuration.setAllowedMethods(
        java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource source =
        new org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  @Bean
  @ConditionalOnMissingBean(ReactiveJwtDecoder.class)
  ReactiveJwtDecoder reactiveJwtDecoder(
      @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String issuerUri,
      @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:}") String jwkSetUri) {
    String resolvedJwkSetUri =
        StringUtils.hasText(jwkSetUri) ? jwkSetUri : issuerUri + "/protocol/openid-connect/certs";
    log.info(
        "Configuring Keycloak JWT decoder issuerUri={} jwkSetUri={}", issuerUri, resolvedJwkSetUri);

    NimbusReactiveJwtDecoder jwtDecoder =
        NimbusReactiveJwtDecoder.withJwkSetUri(resolvedJwkSetUri)
            .jwsAlgorithm(SignatureAlgorithm.RS256)
            .build();

    org.springframework.security.oauth2.core.OAuth2TokenValidator<Jwt> issuerValidator =
        token -> {
          String iss = token.getIssuer() != null ? token.getIssuer().toString() : "";
          if (iss.equals(issuerUri) || iss.equals("http://localhost:8089/realms/serviya")) {
            return org.springframework.security.oauth2.core.OAuth2TokenValidatorResult.success();
          }
          return org.springframework.security.oauth2.core.OAuth2TokenValidatorResult.failure(
              new org.springframework.security.oauth2.core.OAuth2Error(
                  "invalid_token", "Invalid issuer: " + iss, null));
        };

    jwtDecoder.setJwtValidator(
        new org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator<>(
            new org.springframework.security.oauth2.jwt.JwtTimestampValidator(), issuerValidator));

    return jwtDecoder;
  }

  @Bean
  Converter<Jwt, Mono<AbstractAuthenticationToken>> jwtAuthenticationConverter(
      KeycloakRealmRoleConverter keycloakRealmRoleConverter) {
    JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
    jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(keycloakRealmRoleConverter);
    return new ReactiveJwtAuthenticationConverterAdapter(jwtAuthenticationConverter);
  }
}
