import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type TipoCobro = 'FIJO' | 'COTIZACION' | 'POR_UNIDAD' | 'POR_METRO';
export type ModalidadEvaluacion = 'REMOTA' | 'PRESENCIAL';

export interface ServiceCategory {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface CatalogServiceDTO {
  id: number;
  codigo: string;
  categoryCode: string;
  nombre: string;
  descripcion: string;
  precioBaseReferencial: number;
  requiereFoto: boolean;
  activo: boolean;
  tipoCobro: TipoCobro;
  modalidadEvaluacion: ModalidadEvaluacion;
  imageUrl?: string;
  duracionEstimada?: string;
}

export interface CreateServiceRequestDTO {
  catalogServiceId: number;
  urlEvidencia?: string;
  evidenciaUrls?: string[];
  direccionFisica: string;
  latitud: number;
  longitud: number;
  cantidad?: number;
}

export interface ServiceRequestResponseDTO {
  id: number;
  clienteId: string;
  tecnicoId: string;
  catalogoServicio: CatalogServiceDTO;
  urlEvidencia: string;
  evidenciaUrls?: string[];
  direccionFisica: string;
  latitud: number;
  longitud: number;
  costoVisita: number;
  costoManoObra: number;
  costoMateriales: number;
  items?: { descripcion: string; cantidad: number; precioUnitario: number; subtotal: number }[];
  costoTotal: number;
  estadoSolicitud: string;
  createdAt: string;
  updatedAt: string;
  clienteConfirmoFin?: boolean;
  tecnicoConfirmoFin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PublicCatalogService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/service-request-ms/api/v1/public/catalogs';

  getServicioById(id: string): Observable<CatalogServiceDTO> {
    return this.api.get<CatalogServiceDTO>(`${this.basePath}/services/${id}`);
  }

  getAllServices(): Observable<CatalogServiceDTO[]> {
    return this.api.get<CatalogServiceDTO[]>(`${this.basePath}/services`);
  }

  getCategories(): Observable<ServiceCategory[]> {
    return this.api.get<ServiceCategory[]>(`${this.basePath}/categories`);
  }

  crearSolicitud(dto: CreateServiceRequestDTO): Observable<ServiceRequestResponseDTO> {
    return this.api.post<ServiceRequestResponseDTO, CreateServiceRequestDTO>('/service-request-ms/api/v1/solicitudes', dto);
  }

  uploadEvidencia(file: File): Observable<{url: string}> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<{url: string}, FormData>('/service-request-ms/api/v1/solicitudes/upload', formData);
  }

  uploadEvidencias(files: File[]): Observable<{url: string; urls: string[]}> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.api.post<{url: string; urls: string[]}, FormData>('/service-request-ms/api/v1/solicitudes/upload', formData);
  }
}
