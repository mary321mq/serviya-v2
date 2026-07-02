package com.serviya.user.controller;

import com.serviya.user.dto.UserProfileDTO;
import com.serviya.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/me/profile")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping
  public ResponseEntity<UserProfileDTO> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
    String keycloakId = jwt.getSubject();
    String email = jwt.getClaimAsString("email");
    String firstName = jwt.getClaimAsString("given_name");
    String lastName = jwt.getClaimAsString("family_name");

    if (firstName == null && lastName == null) {
      String name = jwt.getClaimAsString("name");
      if (name != null && !name.trim().isEmpty()) {
        String[] parts = name.split(" ", 2);
        firstName = parts[0];
        if (parts.length > 1) {
          lastName = parts[1];
        }
      }
    }

    UserProfileDTO profile = userService.syncAndGetProfile(keycloakId, email, firstName, lastName);
    return ResponseEntity.ok(profile);
  }

  @PutMapping
  public ResponseEntity<UserProfileDTO> updateMyProfile(
      @AuthenticationPrincipal Jwt jwt, @RequestBody UserProfileDTO updateDTO) {
    String keycloakId = jwt.getSubject();
    UserProfileDTO updatedProfile = userService.updateProfile(keycloakId, updateDTO);
    return ResponseEntity.ok(updatedProfile);
  }

  @PostMapping(value = "/avatar", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<UserProfileDTO> uploadAvatar(
      @AuthenticationPrincipal Jwt jwt,
      @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
    
    if (file.isEmpty()) {
      return ResponseEntity.badRequest().build();
    }

    try {
      java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads", "user-ms", "avatars");
      if (!java.nio.file.Files.exists(uploadDir)) {
        java.nio.file.Files.createDirectories(uploadDir);
      }

      String filename = java.util.UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
      java.nio.file.Path target = uploadDir.resolve(filename).normalize();
      
      file.transferTo(target);

      UserProfileDTO updateDTO = new UserProfileDTO();
      updateDTO.setAvatarUrl("/api/v1/me/profile/avatar/" + filename);

      String keycloakId = jwt.getSubject();
      UserProfileDTO updatedProfile = userService.updateProfile(keycloakId, updateDTO);
      return ResponseEntity.ok(updatedProfile);

    } catch (java.io.IOException e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @GetMapping("/avatar/{filename:.+}")
  public ResponseEntity<org.springframework.core.io.Resource> getAvatar(@PathVariable String filename) {
    try {
      java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads", "user-ms", "avatars");
      java.nio.file.Path file = uploadDir.resolve(filename).normalize();
      
      org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(file.toUri());
      
      if (resource.exists() || resource.isReadable()) {
        String contentType = java.nio.file.Files.probeContentType(file);
        if (contentType == null) {
          contentType = "application/octet-stream";
        }
        return ResponseEntity.ok()
            .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
            .body(resource);
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }
}
