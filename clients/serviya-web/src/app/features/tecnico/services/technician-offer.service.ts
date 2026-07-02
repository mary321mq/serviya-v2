import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiClientService } from '../../../core/http/api-client.service';
import { Offer } from '../models/technician.model';

@Injectable({ providedIn: 'root' })
export class TechnicianOfferService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/service-request-ms/api/v1/solicitudes';

  getOffers(): Observable<Offer[]> {
    return this.api.get<any[]>(`${this.basePath}/tecnico/solicitudes`).pipe(
      map(reqs => reqs.map(req => ({
        id: req.id.toString(),
        serviceRequestId: req.id.toString(),
        technicianId: req.tecnicoId,
        status: req.estadoSolicitud === 'TECNICO_ASIGNADO' ? 'PENDING' : 
               (req.estadoSolicitud === 'EN_PROCESO' || req.estadoSolicitud === 'COMPLETADO' ? 'ACCEPTED' : 'PENDING'),
        batchId: '',
        attemptNumber: 1,
        createdAt: req.createdAt,
        expiresAt: req.updatedAt,
        serviceName: req.catalogoServicio?.nombre,
        description: req.direccionFisica,
        technicianPrice: req.montoTecnico,
        evidenciaUrls: req.evidenciaUrls,
        clienteConfirmoFin: req.clienteConfirmoFin,
        tecnicoConfirmoFin: req.tecnicoConfirmoFin,
        estadoSolicitud: req.estadoSolicitud,
        direccionFisica: req.direccionFisica,
        catalogoServicio: req.catalogoServicio,
        clienteNombre: req.clienteNombre || 'Cliente de ServiYa',
        clientePhone: '987 654 321',
        costoTotal: req.costoTotal,
        costoVisita: req.costoVisita
      })))
    );
  }

  getOffer(id: string): Observable<Offer> {
    return this.api.get<any>(`${this.basePath}/tecnico/solicitudes/${id}`).pipe(
      map(req => ({
        id: req.id.toString(),
        serviceRequestId: req.id.toString(),
        technicianId: req.tecnicoId,
        status: req.estadoSolicitud === 'TECNICO_ASIGNADO' ? 'PENDING' : 'ACCEPTED',
        createdAt: req.createdAt,
        expiresAt: req.createdAt,
        batchId: '0',
        attemptNumber: 0,
        serviceName: req.catalogoServicio?.nombre,
        description: req.items && req.items.length > 0 ? req.items[0].descripcion : '',
        technicianPrice: req.montoTecnico,
        evidenciaUrls: req.evidenciaUrls || (req.urlEvidencia ? [req.urlEvidencia] : []),
        clienteConfirmoFin: req.clienteConfirmoFin,
        tecnicoConfirmoFin: req.tecnicoConfirmoFin,
        estadoSolicitud: req.estadoSolicitud,
        direccionFisica: req.direccionFisica,
        catalogoServicio: req.catalogoServicio,
        clienteNombre: req.clienteNombre || 'Cliente de ServiYa',
        clientePhone: '987 654 321',
        costoTotal: req.costoTotal,
        costoVisita: req.costoVisita
      }))
    );
  }

  acceptOffer(id: string): Observable<void> {
    return this.api.post<void, any>(`${this.basePath}/tecnico/solicitudes/${id}/aceptar`, {});
  }

  rejectOffer(id: string): Observable<void> {
    return this.api.post<void, any>(`${this.basePath}/tecnico/solicitudes/${id}/rechazar`, {});
  }

  completeJob(id: string): Observable<void> {
    return this.api.post<void, any>(`${this.basePath}/${id}/terminar`, {});
  }
}
