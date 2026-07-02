import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { SERVIYA_APP_CONFIG } from '../../../core/config/app-config';
import { ApiClientService } from '../../../core/http/api-client.service';

export type TipoComprobante = 'BOLETA' | 'FACTURA';
export type TipoDocumento = 'DNI' | 'RUC';

export interface IntencionPagoRequest {
  solicitudId: number;
  montoTotal: number;
  pasarela?: string;
  codigoOperacionExterna?: string;
  tipoComprobante: TipoComprobante;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombreCliente: string;
}

export interface IntencionPagoResponse {
  id: number;
  estadoPago: string;
  codigoOperacionExterna: string;
}

export interface PagoCliente {
  id: number;
  solicitudId: number;
  montoTotal: number;
  comisionServiya: number;
  gananciaTecnico: number;
  pasarela: string;
  codigoOperacionExterna: string;
  tipoComprobante: TipoComprobante;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombreCliente: string;
  estadoPago: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookNotificacion {
  codigoOperacionExterna: string;
  estadoExterno: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly api = inject(ApiClientService);
  private readonly config = inject(SERVIYA_APP_CONFIG);
  private readonly apiPath = '/payment-ms/api/v1/pagos';

  crearIntencionPago(request: IntencionPagoRequest): Observable<IntencionPagoResponse> {
    return this.api.post<IntencionPagoResponse, IntencionPagoRequest>(`${this.apiPath}/intencion`, request);
  }

  simularWebhook(notificacion: WebhookNotificacion): Observable<void> {
    return this.api.post<void, WebhookNotificacion>(`${this.apiPath}/webhook`, notificacion);
  }

  listarMisPagos(): Observable<PagoCliente[]> {
    return this.api.get<PagoCliente[]>(`${this.apiPath}/mis-pagos`);
  }

  descargarComprobante(transaccionId: number): Observable<Blob> {
    return this.api.getBlob(`${this.apiPath}/${transaccionId}/comprobante`);
  }
}
