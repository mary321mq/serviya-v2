package com.serviya.user.service;

import com.serviya.user.dto.UserProfileDTO;
import com.serviya.user.entity.User;
import com.serviya.user.repository.UserRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

  private final UserRepository userRepository;
  private final Keycloak keycloak;
  
  @Value("${keycloak.realm}")
  private String realm;

  public UserService(UserRepository userRepository, Keycloak keycloak) {
    this.userRepository = userRepository;
    this.keycloak = keycloak;
  }

  @Transactional
  public UserProfileDTO syncAndGetProfile(
      String keycloakId, String email, String firstName, String lastName) {
    Optional<User> optionalUser = userRepository.findById(keycloakId);
    User user;
    if (optionalUser.isPresent()) {
      user = optionalUser.get();
      boolean updated = false;
      if (email != null && !email.equals(user.getEmail())) {
        user.setEmail(email);
        updated = true;
      }
      if (firstName != null && !firstName.equals(user.getFirstName())) {
        user.setFirstName(firstName);
        updated = true;
      }
      if (lastName != null && !lastName.equals(user.getLastName())) {
        user.setLastName(lastName);
        updated = true;
      }
      if (updated) {
        user = userRepository.save(user);
      }
    } else {
      user = new User();
      user.setId(keycloakId);
      user.setEmail(email);
      user.setFirstName(firstName);
      user.setLastName(lastName);
      user = userRepository.save(user);
    }
    return mapToDTO(user, getRoleFromKeycloak(keycloakId), getUsernameFromKeycloak(keycloakId));
  }

  @Transactional
  public UserProfileDTO createClient(UserProfileDTO dto) {
    UsersResource usersResource = keycloak.realm(realm).users();

    UserRepresentation kcUser = new UserRepresentation();
    kcUser.setUsername(dto.getUsername());
    kcUser.setEmail(dto.getEmail());
    kcUser.setFirstName(dto.getFirstName());
    kcUser.setLastName(dto.getLastName());
    kcUser.setEnabled(true);

    if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
      CredentialRepresentation cred = new CredentialRepresentation();
      cred.setType(CredentialRepresentation.PASSWORD);
      cred.setValue(dto.getPassword());
      cred.setTemporary(false);
      kcUser.setCredentials(Collections.singletonList(cred));
    }

    Response response = usersResource.create(kcUser);
    if (response.getStatus() != 201) {
      throw new RuntimeException("Error creating user in Keycloak: " + response.getStatusInfo().getReasonPhrase());
    }

    String path = response.getLocation().getPath();
    String userId = path.substring(path.lastIndexOf('/') + 1);

    if (dto.getRole() != null) {
      RoleRepresentation roleRep = keycloak.realm(realm).roles().get(dto.getRole()).toRepresentation();
      usersResource.get(userId).roles().realmLevel().add(Collections.singletonList(roleRep));
    }

    User user = new User();
    user.setId(userId);
    user.setEmail(dto.getEmail());
    user.setFirstName(dto.getFirstName());
    user.setLastName(dto.getLastName());
    user = userRepository.save(user);

    return mapToDTO(user, dto.getRole(), dto.getUsername());
  }

  @Transactional
  public UserProfileDTO updateProfile(String keycloakId, UserProfileDTO updateDTO) {
    User user =
        userRepository
            .findById(keycloakId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    UserResource userResource = keycloak.realm(realm).users().get(keycloakId);
    UserRepresentation kcUser = userResource.toRepresentation();

    boolean kcUpdate = false;
    if (updateDTO.getFirstName() != null) {
      user.setFirstName(updateDTO.getFirstName());
      kcUser.setFirstName(updateDTO.getFirstName());
      kcUpdate = true;
    }
    if (updateDTO.getLastName() != null) {
      user.setLastName(updateDTO.getLastName());
      kcUser.setLastName(updateDTO.getLastName());
      kcUpdate = true;
    }
    if (updateDTO.getEmail() != null) {
      user.setEmail(updateDTO.getEmail());
      kcUser.setEmail(updateDTO.getEmail());
      kcUpdate = true;
    }

    if (kcUpdate) {
      userResource.update(kcUser);
    }

    if (updateDTO.getPassword() != null && !updateDTO.getPassword().isEmpty()) {
      CredentialRepresentation cred = new CredentialRepresentation();
      cred.setType(CredentialRepresentation.PASSWORD);
      cred.setValue(updateDTO.getPassword());
      cred.setTemporary(false);
      userResource.resetPassword(cred);
    }

    if (updateDTO.getRole() != null) {
      List<RoleRepresentation> currentRoles = userResource.roles().realmLevel().listAll();
      currentRoles.stream()
          .filter(r -> r.getName().equals("CLIENTE") || r.getName().equals("TECNICO") || r.getName().equals("ADMIN") || r.getName().equals("TRABAJADOR"))
          .forEach(r -> userResource.roles().realmLevel().remove(Collections.singletonList(r)));
      
      RoleRepresentation roleRep = keycloak.realm(realm).roles().get(updateDTO.getRole()).toRepresentation();
      userResource.roles().realmLevel().add(Collections.singletonList(roleRep));
    }

    if (updateDTO.getTelefono() != null) user.setTelefono(updateDTO.getTelefono());
    if (updateDTO.getDireccion() != null) user.setDireccion(updateDTO.getDireccion());
    if (updateDTO.getReferencia() != null) user.setReferencia(updateDTO.getReferencia());
    if (updateDTO.getRegion() != null) user.setRegion(updateDTO.getRegion());
    if (updateDTO.getProvincia() != null) user.setProvincia(updateDTO.getProvincia());
    if (updateDTO.getDistrito() != null) user.setDistrito(updateDTO.getDistrito());
    if (updateDTO.getDatos() != null) user.setDatos(updateDTO.getDatos());
    if (updateDTO.getLat() != null) user.setLat(updateDTO.getLat());
    if (updateDTO.getLng() != null) user.setLng(updateDTO.getLng());
    if (updateDTO.getAvatarUrl() != null) user.setAvatarUrl(updateDTO.getAvatarUrl());
    user = userRepository.save(user);

    return mapToDTO(user, getRoleFromKeycloak(keycloakId), kcUser.getUsername());
  }

  private String getRoleFromKeycloak(String userId) {
    try {
      List<RoleRepresentation> roles = keycloak.realm(realm).users().get(userId).roles().realmLevel().listAll();
      if (roles.stream().anyMatch(r -> r.getName().equals("ADMIN"))) return "ADMIN";
      if (roles.stream().anyMatch(r -> r.getName().equals("TRABAJADOR"))) return "TRABAJADOR";
      if (roles.stream().anyMatch(r -> r.getName().equals("TECNICO"))) return "TECNICO";
      return "CLIENTE";
    } catch (Exception e) {
      return "CLIENTE";
    }
  }

  private String getUsernameFromKeycloak(String userId) {
    try {
      return keycloak.realm(realm).users().get(userId).toRepresentation().getUsername();
    } catch (Exception e) {
      return null;
    }
  }

  private UserProfileDTO mapToDTO(User user, String role, String username) {
    UserProfileDTO dto = new UserProfileDTO();
    dto.setId(user.getId());
    dto.setEmail(user.getEmail());
    dto.setFirstName(user.getFirstName());
    dto.setLastName(user.getLastName());
    dto.setTelefono(user.getTelefono());
    dto.setDireccion(user.getDireccion());
    dto.setReferencia(user.getReferencia());
    dto.setRegion(user.getRegion());
    dto.setProvincia(user.getProvincia());
    dto.setDistrito(user.getDistrito());
    dto.setDatos(user.getDatos());
    dto.setLat(user.getLat());
    dto.setLng(user.getLng());
    dto.setAvatarUrl(user.getAvatarUrl());
    dto.setRole(role);
    dto.setUsername(username);
    return dto;
  }

  @Transactional(readOnly = true)
  public java.util.List<UserProfileDTO> getAllUsers() {
    List<UserRepresentation> kcUsers = keycloak.realm(realm).users().list();
    Map<String, User> localDbUsers = userRepository.findAll().stream()
        .collect(Collectors.toMap(User::getId, u -> u));

    List<UserProfileDTO> result = new ArrayList<>();
    for (UserRepresentation kcUser : kcUsers) {
      User localUser = localDbUsers.get(kcUser.getId());
      if (localUser == null) {
        // If not in DB, create a temporary local user object to hold data
        localUser = new User();
        localUser.setId(kcUser.getId());
        localUser.setEmail(kcUser.getEmail());
        localUser.setFirstName(kcUser.getFirstName());
        localUser.setLastName(kcUser.getLastName());
      }
      
      String role = getRoleFromKeycloak(kcUser.getId());
      result.add(mapToDTO(localUser, role, kcUser.getUsername()));
    }
    return result;
  }

  @Transactional
  public void deleteUser(String id) {
    try {
      keycloak.realm(realm).users().get(id).remove();
    } catch (Exception e) {
      // Ignore if not found in KC
    }
    userRepository.deleteById(id);
  }
}
