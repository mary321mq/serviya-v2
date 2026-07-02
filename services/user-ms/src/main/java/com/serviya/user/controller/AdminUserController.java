package com.serviya.user.controller;

import com.serviya.user.dto.UserProfileDTO;
import com.serviya.user.service.UserService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/clients")
public class AdminUserController {

  private final UserService userService;

  public AdminUserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping
  public ResponseEntity<List<UserProfileDTO>> getAllClients() {
    return ResponseEntity.ok(userService.getAllUsers());
  }

  @PostMapping
  public ResponseEntity<UserProfileDTO> createClient(@RequestBody UserProfileDTO createDTO) {
    UserProfileDTO createdProfile = userService.createClient(createDTO);
    return ResponseEntity.status(201).body(createdProfile);
  }

  @PutMapping("/{id}")
  public ResponseEntity<UserProfileDTO> updateClient(
      @PathVariable("id") String id, @RequestBody UserProfileDTO updateDTO) {
    UserProfileDTO updatedProfile = userService.updateProfile(id, updateDTO);
    return ResponseEntity.ok(updatedProfile);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteClient(@PathVariable("id") String id) {
    userService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }
}
