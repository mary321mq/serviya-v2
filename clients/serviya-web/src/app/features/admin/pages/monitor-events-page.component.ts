import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminMonitorService } from '../services/admin-monitor.service';
import { AdminEvent } from '../models/monitor.model';

@Component({
  selector: 'app-monitor-events-page',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  template: `
    <div class="page-container">
      <h2>Traza de eventos</h2>
      <p class="subtitle">Busca eventos operativos de notificaciones o de dominio por referencia interna.</p>

      <div class="search-bar">
        <input type="text" [(ngModel)]="searchQuery" placeholder="Buscar por referencia de solicitud" class="form-input">
        <button (click)="search()" class="btn-primary">Buscar</button>
        <button (click)="loadFailed()" class="btn-danger">Ver eventos fallidos</button>
      </div>

      <div class="timeline-container" *ngIf="events.length > 0; else noData">
        <div class="timeline-item" *ngFor="let ev of events" [ngClass]="ev.status === 'FAILED' ? 'failed' : 'success'">
          <div class="timeline-icon">
            <span *ngIf="ev.status !== 'FAILED'">&#10003;</span>
            <span *ngIf="ev.status === 'FAILED'">&#10007;</span>
          </div>
          <div class="timeline-content">
            <h4>{{ formatEventType(ev.type) }}</h4>
            <p><strong>Estado:</strong> {{ ev.status === 'FAILED' ? 'Fallido' : 'Procesado' }}</p>
            <p><strong>Destino:</strong> {{ ev.userId ? 'Usuario registrado' : 'Sin destinatario' }}</p>
            <p><strong>Mensaje:</strong> {{ ev.message }}</p>
            <span class="eyebrow">{{ ev.createdAt | date:'medium' }}</span>
          </div>
        </div>
      </div>
      
      <ng-template #noData>
        <div class="empty-state">
          <p>No se encontraron eventos para esta búsqueda.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    h2 { margin: 0; }
    .subtitle { color: #6b7280; margin-top: 0; }
    .search-bar { display: flex; gap: 0.5rem; }
    .form-input { flex: 1; padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 4px; }
    .btn-primary { background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .btn-danger { background: #dc2626; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .timeline-container { display: flex; flex-direction: column; gap: 1rem; padding-left: 1rem; border-left: 2px solid #e5e7eb; margin-top: 1rem; }
    .timeline-item { position: relative; padding-left: 1.5rem; }
    .timeline-icon { position: absolute; left: -1.8rem; top: 0; width: 1.5rem; height: 1.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem; font-weight: bold; }
    .timeline-item.success .timeline-icon { background: #10b981; }
    .timeline-item.failed .timeline-icon { background: #ef4444; }
    .timeline-content { background: #f9fafb; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb; }
    .timeline-content h4 { margin: 0 0 0.5rem 0; color: #111827; }
    .timeline-content p { margin: 0 0 0.25rem 0; color: #4b5563; font-size: 0.9rem; }
    .empty-state { padding: 2rem; text-align: center; color: #6b7280; background: #f9fafb; border-radius: 8px; }
  `]
})
export class MonitorEventsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminMonitorService = inject(AdminMonitorService);

  searchQuery = '';
  events: AdminEvent[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const q = params['correlationId'];
      if (q) {
        this.searchQuery = q;
        this.search();
      } else {
        this.loadAll();
      }
    });
  }

  search(): void {
    if (!this.searchQuery) {
      this.loadAll();
      return;
    }
    // Update URL without reloading component
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { correlationId: this.searchQuery },
      queryParamsHandling: 'merge'
    });

    this.adminMonitorService.getEventsByCorrelationId(this.searchQuery).subscribe({
      next: (data) => this.events = data,
      error: (err) => console.error('Error al cargar eventos', err?.message)
    });
  }

  loadAll(): void {
    this.adminMonitorService.getEventsByCorrelationId().subscribe({
      next: (data) => this.events = data,
      error: (err) => console.error('Error al cargar eventos', err?.message)
    });
  }

  loadFailed(): void {
    this.searchQuery = '';
    this.adminMonitorService.getFailedEvents().subscribe({
      next: (data) => this.events = data,
      error: (err) => console.error('Error al cargar eventos fallidos', err?.message)
    });
  }

  protected formatEventType(type: string): string {
    const normalized = type?.toLowerCase?.() ?? '';
    if (normalized.includes('notification')) return 'Notificacion';
    if (normalized.includes('payment') || normalized.includes('pago')) return 'Pago';
    if (normalized.includes('quote') || normalized.includes('cotizacion')) return 'Cotizacion';
    if (normalized.includes('service-request')) return 'Solicitud de servicio';
    if (normalized.includes('review') || normalized.includes('resena')) return 'Resena';
    return 'Evento operativo';
  }
}
