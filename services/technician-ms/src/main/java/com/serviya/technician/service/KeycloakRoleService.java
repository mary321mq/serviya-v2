package com.serviya.technician.service;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class KeycloakRoleService {

  private final RestTemplate restTemplate = new RestTemplate();

  @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
  private String issuerUri;

  public void assignTecnicoRole(String userId) {
    try {
      // 1. Get Keycloak base URL (e.g. http://localhost:8089)
      String baseUrl = issuerUri.substring(0, issuerUri.indexOf("/realms/"));
      String realm = issuerUri.substring(issuerUri.lastIndexOf("/") + 1);

      // 2. Get Admin Token
      String tokenUrl = baseUrl + "/realms/master/protocol/openid-connect/token";
      HttpHeaders tokenHeaders = new HttpHeaders();
      tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

      MultiValueMap<String, String> tokenBody = new LinkedMultiValueMap<>();
      tokenBody.add("client_id", "admin-cli");
      tokenBody.add("username", "admin");
      tokenBody.add("password", "admin");
      tokenBody.add("grant_type", "password");

      HttpEntity<MultiValueMap<String, String>> tokenRequest =
          new HttpEntity<>(tokenBody, tokenHeaders);
      ResponseEntity<Map> tokenResponse =
          restTemplate.postForEntity(tokenUrl, tokenRequest, Map.class);
      String token = (String) tokenResponse.getBody().get("access_token");

      // 3. Get Role ID for TECNICO
      String roleUrl = baseUrl + "/admin/realms/" + realm + "/roles/TECNICO";
      HttpHeaders authHeaders = new HttpHeaders();
      authHeaders.setBearerAuth(token);
      HttpEntity<Void> roleRequest = new HttpEntity<>(authHeaders);

      ResponseEntity<Map> roleResponse =
          restTemplate.exchange(roleUrl, HttpMethod.GET, roleRequest, Map.class);
      String roleId = (String) roleResponse.getBody().get("id");
      String roleName = (String) roleResponse.getBody().get("name");

      // 4. Assign Role to User
      String assignUrl =
          baseUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm";
      authHeaders.setContentType(MediaType.APPLICATION_JSON);

      List<Map<String, String>> roleBody = List.of(Map.of("id", roleId, "name", roleName));
      HttpEntity<List<Map<String, String>>> assignRequest = new HttpEntity<>(roleBody, authHeaders);

      restTemplate.postForEntity(assignUrl, assignRequest, Void.class);

      System.out.println("Role TECNICO assigned successfully to user " + userId);
    } catch (Exception e) {
      System.err.println("Failed to assign role to user " + userId + ": " + e.getMessage());
      e.printStackTrace();
    }
  }
}
