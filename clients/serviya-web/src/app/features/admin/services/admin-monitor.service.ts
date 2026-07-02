import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { AdminServiceRequest, AdminEvent, AdminPayment, MonitorDashboardStats } from '../models/monitor.model';
import { ApiClientService } from '../../../core/http/api-client.service';

@Injectable({
  providedIn: 'root'
})
export class AdminMonitorService {
  private readonly api = inject(ApiClientService);

  // MOCKS for requests and events since backend doesn't provide global endpoints yet
  private mockRequests: AdminServiceRequest[] = [
    {
      publicId: 'REQ-1001',
      clientIdentitySubject: 'client-1',
      serviceCode: 'PLUMBING_BASIC',
      status: 'COMPLETED',
      technicianIdentitySubject: 'tech-1',
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      publicId: 'REQ-1002',
      clientIdentitySubject: 'client-2',
      serviceCode: 'ELECTRICAL_BASIC',
      status: 'IN_PROGRESS',
      technicianIdentitySubject: 'tech-2',
      startedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  private mockEvents: AdminEvent[] = [
    {
      id: 1,
      eventId: 'EVT-101',
      userId: 'client-1',
      type: 'service-request.completed.v1',
      title: 'Servicio Completado',
      message: 'El técnico finalizó el servicio.',
      status: 'READ',
      correlationId: 'REQ-1001',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      eventId: 'EVT-102',
      userId: 'tech-1',
      type: 'payment.captured.v1',
      title: 'Pago Capturado',
      message: 'Pago de 50.00 procesado.',
      status: 'UNREAD',
      correlationId: 'REQ-1001',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      eventId: 'EVT-103',
      userId: 'client-2',
      type: 'service-request.started.v1',
      title: 'Servicio Iniciado',
      message: 'El servicio está en progreso.',
      status: 'READ',
      correlationId: 'REQ-1002',
      createdAt: new Date().toISOString()
    }
  ];

  getRecentRequests(): Observable<AdminServiceRequest[]> {
    return this.api.get<any[]>('/service-request-ms/api/v1/admin/solicitudes').pipe(
      map((requests) => requests.map((req) => ({
        publicId: String(req.id),
        clientIdentitySubject: req.clienteId,
        serviceCode: req.catalogoServicio?.codigo || req.catalogoServicio?.nombre || 'SIN_CODIGO',
        status: req.estadoSolicitud,
        technicianIdentitySubject: req.tecnicoId,
        urlEvidencia: req.urlEvidencia,
        evidenciaUrls: req.evidenciaUrls || [],
        createdAt: req.createdAt
      })))
    );
  }

  getEventsByCorrelationId(correlationId?: string): Observable<AdminEvent[]> {
    if (correlationId) {
      return of(this.mockEvents.filter(e => e.correlationId.includes(correlationId))).pipe(delay(500));
    }
    return of(this.mockEvents).pipe(delay(500));
  }

  getFailedEvents(): Observable<AdminEvent[]> {
    // Mocking failed events logic
    return of(this.mockEvents.filter(e => e.status === 'FAILED')).pipe(delay(500));
  }

  // Real endpoint for payments
  getCapturedPayments(): Observable<AdminPayment[]> {
    return this.api.get<AdminPayment[]>('/payment-ms/api/v1/admin/payments');
  }

  downloadPaymentReceipt(paymentId: number): Observable<Blob> {
    return this.api.getBlob(`/payment-ms/api/v1/admin/payments/${paymentId}/comprobante`);
  }

  getDashboardStats(): Observable<MonitorDashboardStats> {
    return of({
      activeRequests: this.mockRequests.filter(r => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length,
      completedRequests: this.mockRequests.filter(r => r.status === 'COMPLETED').length,
      failedEvents: 0,
      totalPayments: 1 // Simulated
    }).pipe(delay(500));
  }
}
