import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import { CreateServiceRequestDTO, ServiceRequestResponseDTO } from './public-catalog.service';

@Injectable({ providedIn: 'root' })
export class ServiceRequestService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/service-request-ms/api/v1/solicitudes';

  getRequests(): Observable<ServiceRequestResponseDTO[]> {
    return this.api.get<ServiceRequestResponseDTO[]>(this.basePath);
  }

  getRequest(requestId: string): Observable<ServiceRequestResponseDTO> {
    return this.api.get<ServiceRequestResponseDTO>(`${this.basePath}/${requestId}`);
  }

  tracking(requestId: string): Observable<ServiceRequestResponseDTO> {
    return this.api.get<ServiceRequestResponseDTO>(`${this.basePath}/${requestId}/tracking`);
  }

  createRequest(payload: CreateServiceRequestDTO): Observable<ServiceRequestResponseDTO> {
    return this.api.post<ServiceRequestResponseDTO, CreateServiceRequestDTO>(
      this.basePath,
      payload
    );
  }

  cancelRequest(requestId: string): Observable<ServiceRequestResponseDTO> {
    return this.api.post<ServiceRequestResponseDTO, Record<string, never>>(
      `${this.basePath}/${requestId}/cancel`,
      {}
    );
  }

  markPaid(requestId: string): Observable<ServiceRequestResponseDTO> {
    return this.api.post<ServiceRequestResponseDTO, Record<string, never>>(
      `${this.basePath}/${requestId}/marcar-pagado`,
      {}
    );
  }

  getMatches(requestId: string): Observable<import('../models/service-request.model').TechnicianMatch[]> {
    return this.api.get<import('../models/service-request.model').TechnicianMatch[]>(
      `/service-request-ms/api/v1/solicitudes/${requestId}/matches`
    );
  }

  asignarTecnico(requestId: string, tecnicoId: string): Observable<void> {
    return this.api.post<void, null>(
      `/service-request-ms/api/v1/solicitudes/${requestId}/asignar?tecnicoId=${tecnicoId}`,
      null
    );
  }

  completarTrabajo(requestId: string): Observable<void> {
    return this.api.post<void, null>(
      `/service-request-ms/api/v1/solicitudes/cliente/solicitudes/${requestId}/terminar`,
      null
    );
  }

  agregarEvidencias(requestId: string, urls: string[]): Observable<ServiceRequestResponseDTO> {
    return this.api.post<ServiceRequestResponseDTO, { urls: string[] }>(
      `${this.basePath}/${requestId}/evidencias`,
      { urls }
    );
  }
}
