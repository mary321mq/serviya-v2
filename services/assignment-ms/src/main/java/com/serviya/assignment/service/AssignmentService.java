package com.serviya.assignment.service;

import com.serviya.assignment.client.TechnicianClient;
import com.serviya.assignment.dto.TechnicianBasicDTO;
import com.serviya.assignment.dto.TechnicianMatchDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final TechnicianClient technicianClient;

    public List<TechnicianMatchDTO> getMatches(Double lat, Double lng, String categoria) {
        List<TechnicianBasicDTO> onlineTecnicos = technicianClient.obtenerTecnicosOnline(categoria, lat, lng);

        // Detect invalid coordinates (0,0 means not set)
        boolean hasValidCoords = lat != null && lng != null
                && !(lat == 0.0 && lng == 0.0);

        return onlineTecnicos.stream()
            .map(t -> {
                double dist = hasValidCoords
                        ? calculateDistance(lat, lng, t.getLat(), t.getLng())
                        : 0.0;
                int eta = (int) Math.round(dist * 6); // 10 km/h avg speed in city = 6 mins per km
                return TechnicianMatchDTO.builder()
                    .tecnicoId(t.getTecnicoId())
                    .nombre(t.getNombreCompleto() != null ? t.getNombreCompleto() : "Tecnico ServiYa")
                    .categorias(t.getCategorias())
                    .distanciaKm(Math.round(dist * 10.0) / 10.0)
                    .etaMinutos(eta < 1 ? 1 : eta)
                    .ranking(t.getRanking())
                    .totalResenas((int)(Math.random() * 50) + 1)
                    .build();
            })
            // Only filter by distance when we have valid coordinates
            .filter(dto -> !hasValidCoords || dto.getDistanciaKm() <= 20.0)
            // Sort by ranking (desc) when no coords, otherwise by distance (asc)
            .sorted(hasValidCoords
                    ? Comparator.comparing(TechnicianMatchDTO::getDistanciaKm)
                    : Comparator.comparing(TechnicianMatchDTO::getRanking, Comparator.reverseOrder()))
            .collect(Collectors.toList());
    }

    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return 0.0;
        }
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // in km
    }
}
