import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../core/http/api-client.service';

export interface WorkerServiceRequest {
  id: number;
  clienteId: string;
  catalogoServicio: {
    codigo: string;
    nombre: string;
    tipoCobro: string;
    precioBaseReferencial: number;
  };
  direccionFisica: string;
  urlEvidencia?: string;
  evidenciaUrls?: string[];
  costoVisita: number | null;
  costoManoObra?: number | null;
  costoMateriales?: number | null;
  items?: { descripcion: string; cantidad: number; precioUnitario: number; subtotal: number }[];
  costoTotal: number | null;
  estadoSolicitud: string;
  createdAt: string;
}

export interface QuoteItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface QuotePayload {
  items: QuoteItem[];
}

@Injectable({ providedIn: 'root' })
export class WorkerQuoteService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/service-request-ms/api/v1/solicitudes/trabajador';

  getPendingQuotes(): Observable<WorkerServiceRequest[]> {
    return this.api.get<WorkerServiceRequest[]>(`${this.basePath}/pendientes-cotizacion`);
  }

  quoteRequest(requestId: number, payload: QuotePayload): Observable<WorkerServiceRequest> {
    return this.api.post<WorkerServiceRequest, QuotePayload>(`${this.basePath}/${requestId}/cotizar`, payload);
  }
}
