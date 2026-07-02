import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { SERVIYA_APP_CONFIG } from '../../../core/config/app-config';
import { EstadoTextoPipe, ServicioTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { AdminServiceRequest } from '../models/monitor.model';
import { AdminMonitorService } from '../services/admin-monitor.service';

@Component({
  selector: 'app-monitor-requests-page',
  standalone: true,
  imports: [CommonModule, DatePipe, EstadoTextoPipe, ServicioTextoPipe],
  template: `
    <div class="page-container">
      <h2>Historial global de solicitudes</h2>
      <p class="subtitle">Lista reciente de las solicitudes creadas por clientes.</p>

      <div class="table-container" *ngIf="requests.length > 0; else noData">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Evidencias</th>
              <th>Estado</th>
              <th>Tecnico</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let req of requests">
              <td>Cliente registrado</td>
              <td>{{ req.serviceCode | servicioTexto }}</td>
              <td>
                <div class="evidence-list" *ngIf="getEvidenciaUrls(req).length > 0; else noEvidence">
                  <a *ngFor="let url of getEvidenciaUrls(req); let i = index" [href]="getEvidenciaUrl(url)" target="_blank">
                    <img [src]="getEvidenciaUrl(url)" [alt]="'Evidencia ' + (i + 1)" class="evidence-thumb">
                  </a>
                </div>
                <ng-template #noEvidence>
                  <span class="muted">Sin fotos</span>
                </ng-template>
              </td>
              <td><span class="badge" [ngClass]="req.status.toLowerCase()">{{ req.status | estadoTexto }}</span></td>
              <td>{{ req.technicianIdentitySubject ? 'Tecnico asignado' : 'No asignado' }}</td>
              <td>{{ req.createdAt | date:'short' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #noData>
        <div class="empty-state">
          <p>No se encontraron solicitudes recientes.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1rem; }
    h2 { margin: 0; }
    .subtitle { color: #6b7280; margin-top: 0; }
    .table-container {
      overflow-x: auto;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th, .data-table td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .data-table th { background: #f9fafb; font-weight: 500; color: #374151; }
    .data-table tr:last-child td { border-bottom: none; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.8rem; font-weight: bold; }
    .evidence-list { display: flex; gap: 0.5rem; align-items: center; max-width: 220px; overflow-x: auto; }
    .evidence-thumb { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; border: 1px solid #e5e7eb; display: block; }
    .muted { color: #9ca3af; font-size: 0.85rem; }
    .created, .assigned { background: #dbeafe; color: #1e3a8a; }
    .searching_technician { background: #e0e7ff; color: #3730a3; }
    .in_progress { background: #fef3c7; color: #92400e; }
    .completed { background: #d1fae5; color: #065f46; }
    .cancelled { background: #fef2f2; color: #991b1b; }
    .empty-state { padding: 2rem; text-align: center; color: #6b7280; background: #f9fafb; border-radius: 8px; }
  `]
})
export class MonitorRequestsPageComponent implements OnInit {
  private readonly adminMonitorService = inject(AdminMonitorService);
  private readonly config = inject(SERVIYA_APP_CONFIG);

  requests: AdminServiceRequest[] = [];

  ngOnInit(): void {
    this.adminMonitorService.getRecentRequests().subscribe({
      next: (data) => this.requests = data,
      error: (err) => console.error('Error al cargar solicitudes', err?.message)
    });
  }

  protected getEvidenciaUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('/api')) {
      return `${this.config.apiBaseUrl}/service-request-ms${url}`;
    }
    return url;
  }

  protected getEvidenciaUrls(request: AdminServiceRequest): string[] {
    const urls = request.evidenciaUrls?.filter(Boolean) ?? [];
    if (urls.length > 0) {
      return urls;
    }
    return request.urlEvidencia ? [request.urlEvidencia] : [];
  }
}
