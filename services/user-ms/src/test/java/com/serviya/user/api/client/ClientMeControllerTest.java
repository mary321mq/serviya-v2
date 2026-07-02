package com.serviya.user.api.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class ClientMeControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private JdbcTemplate jdbcTemplate;

  @Test
  void profileUsesJwtSubjectAndWritesOutboxEvent() throws Exception {
    mockMvc
        .perform(
            put("/api/v1/me/profile")
                .with(clienteJwt("kc-client-profile"))
                .header("X-Correlation-Id", "corr-profile")
                .contentType("application/json")
                .content(
                    """
                    {
                      "firstName": "Ana",
                      "lastName": "Cliente",
                      "emailContact": "ana@example.test",
                      "phone": "+51999999999"
                    }
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.identitySubject").value("kc-client-profile"))
        .andExpect(jsonPath("$.firstName").value("Ana"));

    mockMvc
        .perform(get("/api/v1/me/profile").with(clienteJwt("kc-client-profile")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.emailContact").value("ana@example.test"));

    Integer events =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM outbox_events WHERE event_type = 'user.profile.updated.v1'",
            Integer.class);
    assertThat(events).isNotNull().isPositive();
  }

  @Test
  void addressesKeepOnlyOnePrimaryAndDeleteIsSoft() throws Exception {
    saveProfile("kc-client-address");

    MvcResult first =
        mockMvc
            .perform(
                post("/api/v1/me/addresses")
                    .with(clienteJwt("kc-client-address"))
                    .contentType("application/json")
                    .content(addressJson("Casa", true, -12.045, -77.03)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.primary").value(true))
            .andReturn();
    String firstId = publicId(first);

    MvcResult second =
        mockMvc
            .perform(
                post("/api/v1/me/addresses")
                    .with(clienteJwt("kc-client-address"))
                    .contentType("application/json")
                    .content(addressJson("Trabajo", true, -12.05, -77.04)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.primary").value(true))
            .andReturn();
    String secondId = publicId(second);

    mockMvc
        .perform(get("/api/v1/me/addresses").with(clienteJwt("kc-client-address")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.publicId == '" + secondId + "')].primary").value(true))
        .andExpect(jsonPath("$[?(@.publicId == '" + firstId + "')].primary").value(false));

    mockMvc
        .perform(
            delete("/api/v1/me/addresses/{addressId}", firstId)
                .with(clienteJwt("kc-client-address")))
        .andExpect(status().isNoContent());

    Integer active =
        jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM client_addresses
            WHERE public_id = ? AND active = TRUE
            """,
            Integer.class,
            firstId);
    assertThat(active).isZero();
  }

  private void saveProfile(String subject) throws Exception {
    mockMvc
        .perform(
            put("/api/v1/me/profile")
                .with(clienteJwt(subject))
                .contentType("application/json")
                .content(
                    """
                    {
                      "firstName": "Cliente",
                      "lastName": "Prueba",
                      "emailContact": "cliente@example.test",
                      "phone": "+511111111"
                    }
                    """))
        .andExpect(status().isOk());
  }

  private String addressJson(String alias, boolean primary, double lat, double lng) {
    return """
        {
          "department": "Lima",
          "province": "Lima",
          "district": "Miraflores",
          "addressLine": "Av. Principal 123",
          "reference": "Frente al parque",
          "primary": %s
        }
        """
        .formatted(primary);
  }

  private String publicId(MvcResult result) throws Exception {
    JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
    return json.get("publicId").asText();
  }

  private org.springframework.test.web.servlet.request.RequestPostProcessor clienteJwt(
      String subject) {
    return jwt()
        .jwt(
            jwt ->
                jwt.subject(subject)
                    .claim("realm_access", java.util.Map.of("roles", java.util.List.of("CLIENTE"))))
        .authorities(new SimpleGrantedAuthority("ROLE_CLIENTE"));
  }
}
