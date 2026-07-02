package com.serviya.technician.service;

import com.serviya.technician.entity.PortfolioPhoto;
import com.serviya.technician.repository.PortfolioPhotoRepository;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class PortfolioServiceImpl implements PortfolioService {

  private final PortfolioPhotoRepository portfolioRepository;
  private final String UPLOAD_DIR = "uploads/portfolio/";

  @Override
  @Transactional
  public PortfolioPhoto uploadPhoto(String clienteId, MultipartFile file, String description) {
    if (file.isEmpty()) {
      throw new IllegalArgumentException("File is empty");
    }

    try {
      File dir = new File(UPLOAD_DIR);
      if (!dir.exists()) {
        dir.mkdirs();
      }

      String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
      Path path = Paths.get(UPLOAD_DIR + filename);
      Files.write(path, file.getBytes());

      PortfolioPhoto photo =
          PortfolioPhoto.builder()
              .clienteId(clienteId)
              .fileUrl(path.toString())
              .originalFilename(file.getOriginalFilename())
              .description(description)
              .build();

      return portfolioRepository.save(photo);

    } catch (IOException e) {
      throw new IllegalStateException("Failed to store file: " + e.getMessage());
    }
  }

  @Override
  @Transactional
  public void deletePhoto(String clienteId, Long photoId) {
    PortfolioPhoto photo =
        portfolioRepository
            .findByIdAndClienteId(photoId, clienteId)
            .orElseThrow(
                () -> new IllegalArgumentException("Photo not found or does not belong to you"));

    try {
      Files.deleteIfExists(Paths.get(photo.getFileUrl()));
    } catch (IOException e) {
      // Ignore if physical file does not exist
    }

    portfolioRepository.delete(photo);
  }

  @Override
  @Transactional(readOnly = true)
  public List<PortfolioPhoto> getPhotos(String clienteId) {
    return portfolioRepository.findByClienteIdOrderByCreatedAtDesc(clienteId);
  }

  @Override
  @Transactional(readOnly = true)
  public Resource getPhotoFile(Long photoId) {
    PortfolioPhoto photo =
        portfolioRepository
            .findById(photoId)
            .orElseThrow(() -> new IllegalArgumentException("Photo not found"));
    try {
      Path file = Paths.get(photo.getFileUrl());
      Resource resource = new UrlResource(file.toUri());
      if (resource.exists() || resource.isReadable()) {
        return resource;
      } else {
        throw new IllegalStateException("Could not read file: " + photo.getFileUrl());
      }
    } catch (MalformedURLException e) {
      throw new IllegalStateException("Error reading file: " + e.getMessage());
    }
  }
}
