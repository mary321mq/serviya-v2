package com.serviya.technician.service;

import com.serviya.technician.dto.PostulacionRequestDTO;
import com.serviya.technician.dto.UbicacionDTO;
import com.serviya.technician.entity.Postulacion;
import com.serviya.technician.entity.TecnicoProfile;
import com.serviya.technician.enums.EstadoDisponibilidad;
import java.util.List;

public interface TechnicianService {
  Postulacion obtenerPostulacion(String clienteId);

  Postulacion obtenerPostulacionPorId(Long id);

  Postulacion guardarPostulacion(String clienteId, PostulacionRequestDTO dto);

  void enviarPostulacion(String clienteId);

  List<Postulacion> listarPostulacionesPendientes();

  List<Postulacion> listarTodasLasPostulaciones();

  void aprobarPostulacion(Long postulacionId, String evaluadorName, String notas);

  void rechazarPostulacion(Long postulacionId, String evaluadorName, String notas);

  void eliminarPostulacion(Long postulacionId);

  void cambiarDisponibilidad(String clienteId, EstadoDisponibilidad estado);

  void actualizarUbicacion(String clienteId, UbicacionDTO ubicacion);

  TecnicoProfile obtenerPerfil(String clienteId);

  List<com.serviya.technician.dto.TechnicianBasicDTO> obtenerTecnicosOnline(
      String categoria, Double lat, Double lng);
}
