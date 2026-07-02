package com.serviya.technician.service;

import com.serviya.technician.entity.PortfolioPhoto;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface PortfolioService {
  PortfolioPhoto uploadPhoto(String clienteId, MultipartFile file, String description);

  void deletePhoto(String clienteId, Long photoId);

  List<PortfolioPhoto> getPhotos(String clienteId);

  Resource getPhotoFile(Long photoId);
}
