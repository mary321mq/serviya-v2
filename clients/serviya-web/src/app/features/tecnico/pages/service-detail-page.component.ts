import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { EstadoTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { TechnicianNotificationService } from '../services/technician-notification.service';
import { TechnicianServiceRequestService } from '../services/technician-service-request.service';

@Component({
  selector: 'app-service-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, EstadoTextoPipe],
  template: `
    <section class="page-header">
      <div>
        <a routerLink="/tecnico/servicios" class="eyebrow">&larr; Volver a servicios</a>
        <h1>Detalle del servicio</h1>
      </div>
    </section>

    <div *ngIf="serviceId" class="detail-container">
      <div class="status-banner" [ngClass]="status.toLowerCase()">
        Estado: <strong>{{ status | estadoTexto }}</strong>
      </div>

      <div class="info-section">
        <h3>Informacion del servicio</h3>
        <p>Revisa el estado de la atencion y registra el avance del servicio desde este panel.</p>
      </div>

      <div class="actions">
        <button *ngIf="status === 'ASSIGNED'" (click)="startService()" [disabled]="processing" class="action-button primary">Iniciar servicio</button>
        <button *ngIf="status === 'IN_PROGRESS'" (click)="completeService()" [disabled]="processing" class="action-button success">Completar servicio</button>
        <button *ngIf="status === 'COMPLETED'" (click)="downloadLiquidacion()" class="action-button primary">Descargar liquidacion (PDF)</button>
      </div>
    </div>
  `,
  styles: [`
    .detail-container { max-width: 600px; }
    .status-banner { padding: 1rem; margin-bottom: 1.5rem; border-radius: 4px; font-size: 1.1rem; }
    .assigned { background-color: #dbeafe; color: #1e3a8a; }
    .in_progress { background-color: #fef3c7; color: #92400e; }
    .completed { background-color: #d1fae5; color: #065f46; }
    .info-section { background: #f9fafb; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; }
    .info-section h3 { margin-top: 0; }
    .actions { display: flex; gap: 1rem; }
    .primary { background-color: #2563eb; }
    .primary:hover { background-color: #1d4ed8; }
    .success { background-color: #10b981; }
    .success:hover { background-color: #059669; }
  `]
})
export class ServiceDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(TechnicianNotificationService);
  private readonly serviceRequestService = inject(TechnicianServiceRequestService);

  serviceId: string | null = null;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' = 'ASSIGNED';
  processing = false;

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id');
    if (this.serviceId) {
      this.rebuildStatus();
    }
  }

  private rebuildStatus(): void {
    if (!this.serviceId) return;

    this.notificationService.getTimeline().subscribe({
      next: (notifications) => {
        const sorted = [...notifications].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        for (const notif of sorted) {
          if (notif.correlationId === this.serviceId) {
            if (notif.type === 'service-request.started.v1') {
              this.status = 'IN_PROGRESS';
            } else if (notif.type === 'service-request.completed.v1') {
              this.status = 'COMPLETED';
            }
          }
        }
      },
      error: () => console.error('Error al cargar el historial')
    });
  }

  startService(): void {
    if (!this.serviceId || !confirm('Deseas iniciar este servicio ahora?')) return;
    this.processing = true;
    this.serviceRequestService.startService(this.serviceId).subscribe({
      next: () => {
        alert('Servicio iniciado correctamente');
        this.status = 'IN_PROGRESS';
        this.processing = false;
      },
      error: () => {
        alert('Error al iniciar el servicio');
        this.processing = false;
      }
    });
  }

  completeService(): void {
    if (!this.serviceId || !confirm('Confirmas que el servicio fue completado?')) return;
    this.processing = true;
    this.serviceRequestService.completeService(this.serviceId).subscribe({
      next: () => {
        alert('Servicio completado correctamente');
        this.status = 'COMPLETED';
        this.router.navigate(['/tecnico/servicios']);
      },
      error: () => {
        alert('Error al completar el servicio');
        this.processing = false;
      }
    });
  }

  downloadLiquidacion(): void {
    if (!this.serviceId) return;
    const url = `/payment-ms/api/v1/pagos/${this.serviceId}/liquidacion`;
    window.open(url, '_blank');
  }
}
