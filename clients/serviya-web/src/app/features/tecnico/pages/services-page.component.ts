import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EstadoTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { TechnicianNotification } from '../models/notification.model';
import { TechnicianNotificationService } from '../services/technician-notification.service';

interface ActiveService {
  serviceRequestId: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  assignedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [CommonModule, RouterLink, EstadoTextoPipe],
  template: `
    <section class="page-header">
      <div>
        <a routerLink="/tecnico" class="eyebrow">&larr; Volver</a>
        <h1>Mis servicios asignados</h1>
      </div>
    </section>

    <div class="list-container">
      <div *ngIf="activeServices.length === 0" class="empty-state">
        <p>No tienes servicios asignados actualmente.</p>
      </div>

      <a *ngFor="let svc of activeServices" [routerLink]="['/tecnico/servicios', svc.serviceRequestId]" class="offer-card">
        <div class="offer-header">
          <h3>Servicio asignado</h3>
          <span class="badge" [ngClass]="svc.status.toLowerCase()">{{ svc.status | estadoTexto }}</span>
        </div>
        <div class="offer-body">
          <p><strong>Asignado el:</strong> {{ svc.assignedAt | date:'medium' }}</p>
          <p *ngIf="svc.startedAt"><strong>Iniciado el:</strong> {{ svc.startedAt | date:'medium' }}</p>
        </div>
      </a>
    </div>
  `,
  styles: [`
    .list-container { display: flex; flex-direction: column; gap: 1rem; }
    .offer-card { display: block; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; text-decoration: none; color: inherit; transition: box-shadow 0.2s; }
    .offer-card:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .offer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .offer-header h3 { margin: 0; font-size: 1.1rem; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.8rem; font-weight: bold; }
    .assigned { background: #dbeafe; color: #1e3a8a; }
    .in_progress { background: #fef3c7; color: #92400e; }
    .completed { background: #d1fae5; color: #065f46; }
    .empty-state { padding: 2rem; text-align: center; color: #6b7280; background: #f9fafb; border-radius: 8px; }
  `]
})
export class ServicesPageComponent implements OnInit {
  private readonly notificationService = inject(TechnicianNotificationService);

  activeServices: ActiveService[] = [];

  ngOnInit(): void {
    this.notificationService.getTimeline().subscribe({
      next: (notifications) => this.buildServicesFromTimeline(notifications),
      error: () => console.error('Error al cargar servicios')
    });
  }

  private buildServicesFromTimeline(notifications: TechnicianNotification[]): void {
    const servicesMap = new Map<string, ActiveService>();
    const sorted = [...notifications].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    for (const notif of sorted) {
      if (!notif.correlationId) continue;
      const srvId = notif.correlationId;

      if (notif.type === 'service-request.assigned.v1') {
        servicesMap.set(srvId, {
          serviceRequestId: srvId,
          status: 'ASSIGNED',
          assignedAt: new Date(notif.createdAt)
        });
      } else if (notif.type === 'service-request.started.v1') {
        const srv = servicesMap.get(srvId);
        if (srv) {
          srv.status = 'IN_PROGRESS';
          srv.startedAt = new Date(notif.createdAt);
        } else {
          servicesMap.set(srvId, {
            serviceRequestId: srvId,
            status: 'IN_PROGRESS',
            assignedAt: new Date(notif.createdAt),
            startedAt: new Date(notif.createdAt)
          });
        }
      } else if (notif.type === 'service-request.completed.v1') {
        const srv = servicesMap.get(srvId);
        if (srv) {
          srv.status = 'COMPLETED';
          srv.completedAt = new Date(notif.createdAt);
        }
      }
    }

    this.activeServices = Array.from(servicesMap.values())
      .filter(s => s.status !== 'COMPLETED')
      .sort((a, b) => b.assignedAt.getTime() - a.assignedAt.getTime());
  }
}
