import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { WorkerQuoteService, WorkerServiceRequest } from './worker-quote.service';
import { SERVIYA_APP_CONFIG } from '../../core/config/app-config';

interface QuoteDraft {
  items: { descripcion: string; cantidad: number; precioUnitario: number }[];
}

type TabType = 'TODOS' | 'PENDIENTES' | 'ENVIADAS';

@Component({
  selector: 'app-worker-quotes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="worker-page">
      <header class="page-header">
        <div class="header-titles">
          <h1>Cotizaciones</h1>
          <p class="subtitle">Revisa y envía tus cotizaciones pendientes.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn-outline-gray" (click)="load()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            Actualizar
          </button>
          <button type="button" class="btn-primary" *ngIf="viewMode === 'LIST'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filtrar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <button type="button" class="btn-outline-gray" (click)="goBack()" *ngIf="viewMode === 'DETAIL'">
            ← Volver a la lista
          </button>
        </div>
      </header>

      <div *ngIf="loading" class="state-box">Cargando solicitudes...</div>
      <div *ngIf="!loading && message" class="state-box success">{{ message }}</div>
      <div *ngIf="!loading && errorMessage" class="state-box error">{{ errorMessage }}</div>

      <!-- VISTA DE LISTA (MAESTRO) -->
      <ng-container *ngIf="viewMode === 'LIST' && !loading">
        <!-- Tarjetas Resumen -->
        <div class="summary-cards">
          <div class="summary-card pending-card">
            <div class="icon-box pending-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            </div>
            <div class="summary-info">
              <span class="summary-label">PENDIENTES</span>
              <span class="summary-value">{{ countPending }}</span>
              <span class="summary-desc pending-desc">Requieren tu cotización</span>
            </div>
          </div>
          <div class="summary-card sent-card">
            <div class="icon-box sent-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="summary-info">
              <span class="summary-label">ENVIADAS</span>
              <span class="summary-value">{{ countSent }}</span>
              <span class="summary-desc sent-desc">Cotizaciones enviadas</span>
            </div>
          </div>
        </div>

        <!-- Filtros y Búsqueda -->
        <div class="toolbar">
          <div class="tabs">
            <button class="tab" [class.active]="activeTab === 'TODOS'" (click)="activeTab = 'TODOS'">Todos</button>
            <button class="tab" [class.active]="activeTab === 'PENDIENTES'" (click)="activeTab = 'PENDIENTES'">Pendientes</button>
            <button class="tab" [class.active]="activeTab === 'ENVIADAS'" (click)="activeTab = 'ENVIADAS'">Enviadas</button>
          </div>
          <div class="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Buscar cotización..." [(ngModel)]="searchTerm" />
          </div>
        </div>

        <div *ngIf="filteredRequests.length === 0" class="state-box" style="margin-top: 24px;">
          No hay solicitudes en esta vista.
        </div>

        <div class="quote-grid" *ngIf="filteredRequests.length > 0">
          <article class="quote-card" *ngFor="let request of filteredRequests">
            <div class="card-header">
              <span class="pill" [ngClass]="{'pending-pill': request.estadoSolicitud === 'PENDIENTE_EVALUACION', 'sent-pill': request.estadoSolicitud !== 'PENDIENTE_EVALUACION'}">
                {{ formatState(request.estadoSolicitud) }}
              </span>
              <span class="req-id">Solicitud disponible</span>
            </div>
            <h3 class="card-title">{{ request.catalogoServicio.nombre }}</h3>
            <p class="address">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ request.direccionFisica || 'Sin dirección' }}
            </p>
            
            <div class="card-details">
              <div class="detail-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span class="label">Solicitado el</span>
                <span class="value">{{ request.createdAt | date:'dd MMM. yyyy' }}</span>
              </div>
              <div class="detail-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                <span class="label">Categoría</span>
                <span class="value">{{ request.catalogoServicio.nombre }}</span>
              </div>
              <div class="detail-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span class="label">Presupuesto estimado</span>
                <span class="value">S/ {{ (request.costoVisita || request.catalogoServicio.precioBaseReferencial) | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button class="btn-primary full-width" *ngIf="request.estadoSolicitud === 'PENDIENTE_EVALUACION'" (click)="review(request)">
                Revisar y cotizar
              </button>
              <button class="btn-primary full-width" style="background-color: #10b981;" *ngIf="request.estadoSolicitud !== 'PENDIENTE_EVALUACION'" (click)="review(request)">
                Ver Cotización Enviada
              </button>
              <button class="btn-outline-gray full-width mt-2" (click)="review(request)">
                Ver detalles
              </button>
            </div>
          </article>
        </div>
        
        <div class="footer-stats" *ngIf="filteredRequests.length > 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          Mostrando {{ filteredRequests.length }} cotizaciones {{ activeTab.toLowerCase() }}
        </div>
      </ng-container>

      <!-- VISTA DE DETALLE -->
      <ng-container *ngIf="viewMode === 'DETAIL' && selectedRequest && !loading">
        <!-- Header Alternativo para el Detalle -->
        <div class="breadcrumb" style="margin-top: -16px; margin-bottom: 24px; color: #64748b; font-size: 0.9rem;">
           <span style="color: #94a3b8;">🏠 / Cotizaciones /</span> Elaborar cotización
        </div>
        
        <!-- Dos Columnas -->
        <div class="detail-layout">
          <!-- Columna Izquierda: Resumen -->
          <article class="detail-card">
            <h3 class="card-section-title">Resumen de solicitud</h3>
            
            <div class="card-header" style="margin-bottom: 20px;">
              <span class="pill" [ngClass]="{'pending-pill': selectedRequest.estadoSolicitud === 'PENDIENTE_EVALUACION', 'sent-pill': selectedRequest.estadoSolicitud !== 'PENDIENTE_EVALUACION'}">
                <svg *ngIf="selectedRequest.estadoSolicitud === 'PENDIENTE_EVALUACION'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ formatState(selectedRequest.estadoSolicitud) }}
              </span>
              <span class="pill-gray">Solicitud seleccionada</span>
            </div>
            
            <h2 class="detail-title">{{ selectedRequest.catalogoServicio.nombre }}</h2>
            <p class="address">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ selectedRequest.direccionFisica || 'Sin dirección registrada' }}
            </p>
            
            <div class="stats-grid">
              <div class="stat-box">
                <span class="stat-label">ESTADO</span>
                <span class="stat-value dark">{{ formatState(selectedRequest.estadoSolicitud) }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">EVALUACIÓN PRESENCIAL/REMOTA</span>
                <span class="stat-value blue">S/ {{ (selectedRequest.costoVisita || selectedRequest.catalogoServicio.precioBaseReferencial) | number:'1.2-2' }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">CATEGORÍA</span>
                <span class="stat-value dark">{{ selectedRequest.catalogoServicio.nombre }}</span>
              </div>
            </div>
            
            <div *ngIf="getEvidenciaUrls(selectedRequest).length > 0" class="photo-section">
              <h4 class="photo-title">Fotos adjuntas del problema</h4>
              <div class="photo-grid">
                <a *ngFor="let url of getEvidenciaUrls(selectedRequest); let i = index" [href]="getEvidenciaUrl(url)" target="_blank" class="photo-link">
                  <img [src]="getEvidenciaUrl(url)" [alt]="'Evidencia del servicio ' + (i + 1)" />
                </a>
              </div>
              <p class="photo-caption">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Evidencia del servicio
              </p>
            </div>
          </article>

          <!-- Columna Derecha: Cotización -->
          <div class="detail-card">
            <h3 class="card-section-title">{{ selectedRequest.estadoSolicitud === 'PENDIENTE_EVALUACION' ? 'Elaborar cotización' : 'Cotización Enviada' }}</h3>
            
            <!-- Formulario si está PENDIENTE -->
            <form class="quote-form" *ngIf="selectedRequest.estadoSolicitud === 'PENDIENTE_EVALUACION'" (ngSubmit)="quote(selectedRequest)">
              <h4 class="items-title">Ítems de servicio</h4>
              
              <div class="items-header">
                <div class="col-desc">Descripción del trabajo</div>
                <div class="col-qty">Cant.</div>
                <div class="col-price">Monto (S/)</div>
                <div class="col-action"></div>
              </div>

              <div class="items-list">
                <div class="item-row" *ngFor="let item of drafts[selectedRequest.id]?.items; let i = index">
                  <input type="text" class="input-desc" placeholder="Ej. Lavado y desinfección general" [(ngModel)]="item.descripcion" name="desc-{{i}}" required />
                  <input type="number" class="input-qty" min="1" step="1" [(ngModel)]="item.cantidad" name="cant-{{i}}" required />
                  <input type="number" class="input-price" min="0" step="0.01" [(ngModel)]="item.precioUnitario" name="monto-{{i}}" required />
                  <button type="button" class="icon-button-red" (click)="removeItem(selectedRequest.id, i)" title="Eliminar ítem">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </div>
              
              <button type="button" class="btn-dashed" (click)="addItem(selectedRequest.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Agregar otro ítem
              </button>

              <div class="summary-box">
                <div class="summary-line">
                  <span>Subtotal</span>
                  <span>S/ {{ totalItems(selectedRequest) | number:'1.2-2' }}</span>
                </div>
                <div class="summary-line">
                  <span>Evaluación presencial/remota</span>
                  <span>S/ {{ (selectedRequest.costoVisita || selectedRequest.catalogoServicio.precioBaseReferencial) | number:'1.2-2' }}</span>
                </div>
                <hr class="summary-divider" />
                <div class="summary-line total">
                  <span>Total estimado a cobrar</span>
                  <span class="total-amount">S/ {{ total(selectedRequest) | number:'1.2-2' }}</span>
                </div>
              </div>
              
              <button type="submit" class="btn-primary full-width" style="height: 48px; font-size: 1rem; margin-top: 16px;" [disabled]="saving[selectedRequest.id] || !drafts[selectedRequest.id]?.items?.length">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                {{ saving[selectedRequest.id] ? 'Enviando...' : 'Guardar y enviar al cliente' }}
              </button>
              <!-- Botón visual, sin acción real por ahora -->
              <button type="button" class="btn-outline-gray full-width mt-2" style="height: 48px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                Guardar borrador
              </button>
            </form>

            <!-- Resumen si YA FUE ENVIADA -->
            <div *ngIf="selectedRequest.estadoSolicitud !== 'PENDIENTE_EVALUACION'" style="margin-top: 12px;">
              <div class="eval-type-row">
                <span class="label"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M21.5 2v6h-6M2.5 22v-6h6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.94-5.94"/></svg> Evaluación</span>
                <span class="value">Presencial</span>
              </div>
              
              <table class="quote-table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th class="text-center">Cant.</th>
                    <th class="text-right">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of selectedRequest.items">
                    <td>{{ item.descripcion }}</td>
                    <td class="text-center">{{ item.cantidad }}</td>
                    <td class="text-right">S/ {{ (item.cantidad * item.precioUnitario) | number:'1.2-2' }}</td>
                  </tr>
                  <tr *ngIf="selectedRequest.costoVisita">
                    <td>Evaluación / Visita</td>
                    <td class="text-center">1</td>
                    <td class="text-right">S/ {{ selectedRequest.costoVisita | number:'1.2-2' }}</td>
                  </tr>
                </tbody>
              </table>
              
              <div class="subtotal-row">
                <span class="label-bold">Subtotal</span>
                <span class="value-bold">S/ {{ (selectedRequest.costoTotal || selectedRequest.costoVisita || 0) | number:'1.2-2' }}</span>
              </div>
              
              <div class="total-box-alt">
                <span class="total-label-alt">Total a cobrar</span>
                <span class="total-amount-alt">S/ {{ (selectedRequest.costoTotal || selectedRequest.costoVisita || 0) | number:'1.2-2' }}</span>
              </div>
              
              <p style="margin-top: 24px; font-size: 0.95rem; color: #475569; line-height: 1.5; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px dashed #cbd5e1;">
                El cliente ya recibió esta cotización y estamos a la espera de su pago para asignarte el trabajo.
              </p>
            </div>
          </div>
        </div>

        <!-- Tip footer -->
        <div class="tip-box">
          <div class="tip-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="tip-content">
            <strong>Consejo</strong>
            <p>Brinda una cotización clara y detallada para generar confianza en tu cliente y aumentar tus oportunidades.</p>
          </div>
        </div>
      </ng-container>
    </section>
  `,
  styles: [`
    .worker-page { max-width: 1200px; margin: 0 auto; padding: 40px; font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; min-height: 100vh; }
    
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .header-titles h1 { margin: 0 0 8px; font-size: 2rem; color: #1e293b; font-weight: 800; letter-spacing: -0.5px; }
    .header-titles .subtitle { margin: 0; color: #64748b; font-size: 1rem; }
    
    .header-actions { display: flex; gap: 12px; }
    
    .btn-primary { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; }
    .btn-primary:hover { background: #4338ca; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    
    .btn-outline-gray { background: white; color: #475569; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
    .btn-outline-gray:hover { background: #f8fafc; border-color: #94a3b8; color: #1e293b; }
    .btn-outline-blue { color: #4f46e5; border-color: #c7d2fe; }
    .btn-outline-blue:hover { border-color: #818cf8; background: #e0e7ff; }
    
    .full-width { width: 100%; }
    .mt-2 { margin-top: 12px; }

    /* Summary Cards */
    .summary-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .summary-card { display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 16px; border: 1px solid transparent; }
    .pending-card { background-color: #fffbeb; border-color: #fef3c7; }
    .sent-card { background-color: #f0fdf4; border-color: #dcfce3; }
    
    .icon-box { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .pending-icon { background: #fde68a; color: #d97706; }
    .sent-icon { background: #bbf7d0; color: #166534; }
    
    .summary-info { display: flex; flex-direction: column; }
    .summary-label { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
    .summary-value { font-size: 2rem; font-weight: 800; color: #0f172a; line-height: 1; margin-bottom: 8px; }
    .summary-desc { font-size: 0.9rem; font-weight: 500; }
    .pending-desc { color: #d97706; }
    .sent-desc { color: #166534; }

    /* Toolbar: Tabs & Search */
    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 1px; }
    .tabs { display: flex; gap: 32px; }
    .tab { background: transparent; border: none; padding: 12px 0; font-size: 0.95rem; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; margin-bottom: -1px; }
    .tab:hover { color: #1e293b; }
    .tab.active { color: #4f46e5; border-bottom-color: #4f46e5; }
    
    .search-box { position: relative; width: 300px; }
    .search-box svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }
    .search-box input { width: 100%; height: 42px; padding: 0 16px 0 40px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; color: #1e293b; box-sizing: border-box; }
    .search-box input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }

    /* Quote Cards (LIST) */
    .quote-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 24px; }
    .quote-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); display: flex; flex-direction: column; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .req-id { font-size: 0.95rem; color: #1e293b; font-weight: 700; }
    .card-title { margin: 0 0 8px; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
    .address { display: flex; align-items: flex-start; gap: 8px; margin: 0 0 24px; color: #64748b; font-size: 0.95rem; line-height: 1.4; }
    .address svg { flex-shrink: 0; margin-top: 2px; }
    .card-details { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .detail-row { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; }
    .detail-row svg { color: #94a3b8; }
    .detail-row .label { color: #64748b; width: 140px; }
    .detail-row .value { color: #1e293b; font-weight: 600; flex-grow: 1; text-align: right; }
    .card-footer { margin-top: auto; }
    .footer-stats { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 32px; color: #64748b; font-size: 0.9rem; }

    /* Pills */
    .pill { display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
    .pending-pill { background: #fef3c7; color: #d97706; }
    .sent-pill { background: #dcfce3; color: #166534; }
    .pill-gray { background: #f1f5f9; color: #475569; padding: 6px 16px; border-radius: 999px; font-size: 0.85rem; font-weight: 600; }

    /* DETAIL VIEW STYLES */
    .detail-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; margin-bottom: 32px; }
    .detail-card { background: #fff; padding: 32px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03); }
    .card-section-title { margin: 0 0 24px; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
    
    .detail-title { margin: 0 0 12px; font-size: 1.8rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1.2; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #f1f5f9; }
    .stat-box { display: flex; flex-direction: column; gap: 4px; }
    .stat-label { font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 1.1rem; font-weight: 700; }
    .stat-value.dark { color: #1e293b; }
    .stat-value.blue { color: #4f46e5; }
    
    .photo-section { margin-top: 24px; }
    .photo-title { margin: 0 0 12px; font-size: 1rem; color: #1e293b; font-weight: 600; }
    .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
    .photo-link { display: block; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .photo-link img { width: 100%; height: 160px; object-fit: cover; display: block; }
    .photo-caption { margin: 12px 0 0; display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.85rem; }

    /* Forms & Quotes */
    .items-title { margin: 0 0 16px; font-size: 1rem; color: #1e293b; font-weight: 600; }
    .items-header { display: flex; font-size: 0.75rem; color: #64748b; font-weight: 600; padding-bottom: 8px; }
    .col-desc { flex-grow: 1; padding-left: 8px; }
    .col-qty { width: 80px; text-align: center; }
    .col-price { width: 110px; text-align: center; }
    .col-action { width: 44px; }
    
    .items-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .item-row { display: flex; gap: 12px; align-items: center; }
    .item-row input { height: 48px; border: 1px solid #e2e8f0; border-radius: 12px; font: inherit; padding: 0 16px; color: #1e293b; }
    .item-row input:focus { outline: none; border-color: #4f46e5; }
    .input-desc { flex-grow: 1; }
    .input-qty { width: 80px; text-align: center; }
    .input-price { width: 110px; text-align: right; }
    
    .icon-button-red { background: #fee2e2; color: #dc2626; border: none; width: 44px; height: 44px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
    .icon-button-red:hover { background: #fecaca; }
    
    .btn-dashed { width: 100%; height: 48px; border: 2px dashed #cbd5e1; border-radius: 12px; background: transparent; color: #4f46e5; font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; margin-bottom: 32px; transition: all 0.2s; }
    .btn-dashed:hover { border-color: #818cf8; background: #eef2ff; }

    .summary-box { display: flex; flex-direction: column; gap: 16px; }
    .summary-line { display: flex; justify-content: space-between; font-size: 0.95rem; color: #475569; }
    .summary-divider { margin: 0; border: none; border-top: 1px solid #e2e8f0; }
    .summary-line.total { align-items: center; color: #0f172a; font-weight: 700; font-size: 1.1rem; }
    .total-amount { color: #4f46e5; font-size: 2rem; font-weight: 800; letter-spacing: -0.5px; }

    .tip-box { display: flex; gap: 16px; background: #f1f5f9; border-radius: 16px; padding: 24px; align-items: flex-start; }
    .tip-icon { flex-shrink: 0; width: 40px; height: 40px; background: #e0e7ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .tip-content strong { display: block; color: #1e293b; font-size: 1rem; margin-bottom: 4px; }
    .tip-content p { margin: 0; color: #64748b; font-size: 0.95rem; line-height: 1.5; }

    .state-box { padding: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; color: #374151; font-weight: 500; }
    .state-box.success { border-color: #86efac; color: #166534; background: #f0fdf4; }
    .state-box.error { border-color: #fecaca; color: #991b1b; background: #fef2f2; }

    @media (max-width: 1024px) {
      .detail-layout { grid-template-columns: 1fr; }
      .worker-page { padding: 24px; }
    }
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: 1fr; }
      .item-row { flex-wrap: wrap; }
      .input-desc { width: 100%; }
      .col-desc, .col-qty, .col-price { display: none; }
    }
    
    .eval-type-row {
      display: flex;
      justify-content: space-between;
      padding-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }
    .eval-type-row .label {
      color: #475569;
      font-weight: 600;
    }
    .eval-type-row .value {
      color: #0f172a;
      font-weight: 600;
    }
    .quote-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .quote-table th {
      text-align: left;
      padding-bottom: 16px;
      color: #0f172a;
      font-weight: 800;
      font-size: 0.95rem;
    }
    .quote-table td {
      padding-bottom: 16px;
      color: #475569;
      font-size: 0.95rem;
    }
    .text-right {
      text-align: right !important;
    }
    .text-center {
      text-align: center !important;
    }
    .subtotal-row {
      display: flex;
      justify-content: space-between;
      padding-bottom: 24px;
      margin-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;
    }
    .label-bold {
      color: #0f172a;
      font-weight: 800;
      font-size: 1.05rem;
    }
    .value-bold {
      color: #0f172a;
      font-weight: 800;
      font-size: 1.05rem;
    }
    .total-box-alt {
      background: #eff6ff;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .total-label-alt {
      color: #1e3a8a;
      font-weight: 600;
      font-size: 1.05rem;
    }
    .total-amount-alt {
      color: #1e40af;
      font-size: 1.8rem;
      font-weight: 800;
    }
  `]
})
export class WorkerQuotesPageComponent implements OnInit {
  private readonly service = inject(WorkerQuoteService);

  protected viewMode: 'LIST' | 'DETAIL' = 'LIST';
  protected selectedRequest: WorkerServiceRequest | null = null;
  
  protected requests: WorkerServiceRequest[] = [];
  protected drafts: Record<number, QuoteDraft> = {};
  protected saving: Record<number, boolean> = {};
  protected loading = false;
  protected message = '';
  protected errorMessage = '';

  protected activeTab: TabType = 'TODOS';
  protected searchTerm = '';

  get countPending(): number {
    return this.requests.filter(r => r.estadoSolicitud === 'PENDIENTE_EVALUACION').length;
  }
  get countSent(): number {
    return this.requests.filter(r => r.estadoSolicitud !== 'PENDIENTE_EVALUACION').length;
  }

  get filteredRequests(): WorkerServiceRequest[] {
    let list = this.requests;
    if (this.activeTab === 'PENDIENTES') {
      list = list.filter(r => r.estadoSolicitud === 'PENDIENTE_EVALUACION');
    } else if (this.activeTab === 'ENVIADAS') {
      list = list.filter(r => r.estadoSolicitud !== 'PENDIENTE_EVALUACION');
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(r => 
        r.catalogoServicio.nombre.toLowerCase().includes(term) || 
        r.id.toString().includes(term) ||
        (r.direccionFisica && r.direccionFisica.toLowerCase().includes(term))
      );
    }
    return list;
  }

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading = true;
    this.message = '';
    this.errorMessage = '';
    this.service.getPendingQuotes().subscribe({
      next: (requests) => {
        this.requests = requests;
        this.drafts = Object.fromEntries(
          requests.map((request) => [request.id, { items: [{ descripcion: '', cantidad: 1, precioUnitario: 0 }] }])
        );
        this.loading = false;
        
        if (this.selectedRequest) {
          const updated = requests.find(r => r.id === this.selectedRequest?.id);
          if (updated) {
            this.selectedRequest = updated;
          } else {
            this.viewMode = 'LIST';
          }
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.detail || 'No se pudieron cargar las solicitudes para cotizar.';
      }
    });
  }

  protected review(request: WorkerServiceRequest): void {
    this.selectedRequest = request;
    this.viewMode = 'DETAIL';
    this.message = '';
    this.errorMessage = '';
  }

  protected goBack(): void {
    this.viewMode = 'LIST';
    this.selectedRequest = null;
    this.message = '';
    this.errorMessage = '';
  }

  protected formatState(state: string): string {
    if (state === 'PENDIENTE_EVALUACION') return 'Pendiente';
    if (state === 'COTIZADO_ESPERANDO_PAGO') return 'Enviada';
    return state;
  }

  private readonly config = inject(SERVIYA_APP_CONFIG);

  protected getEvidenciaUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('foto_local_')) {
      return localStorage.getItem(url) || url;
    }
    if (url.startsWith('/api')) {
      return `${this.config.apiBaseUrl}/service-request-ms${url}`;
    }
    return url;
  }

  protected getEvidenciaUrls(request: WorkerServiceRequest | null | undefined): string[] {
    if (!request) {
      return [];
    }
    const urls = request.evidenciaUrls?.filter(Boolean) ?? [];
    if (urls.length > 0) {
      return urls;
    }
    return request.urlEvidencia ? [request.urlEvidencia] : [];
  }

  protected addItem(requestId: number): void {
    if (!this.drafts[requestId]) {
       this.drafts[requestId] = { items: [] };
    }
    this.drafts[requestId].items.push({ descripcion: '', cantidad: 1, precioUnitario: 0 });
  }

  protected removeItem(requestId: number, index: number): void {
    this.drafts[requestId].items.splice(index, 1);
  }

  protected totalItems(request: WorkerServiceRequest): number {
    const draft = this.drafts[request.id];
    let sum = 0;
    if (draft && draft.items) {
      sum = draft.items.reduce((acc, item) => acc + (Number(item.cantidad) * Number(item.precioUnitario)), 0);
    }
    return sum;
  }

  protected total(request: WorkerServiceRequest): number {
    return this.totalItems(request);
  }

  protected quote(request: WorkerServiceRequest): void {
    const draft = this.drafts[request.id];
    if (!draft || draft.items.length === 0) {
      this.errorMessage = 'Agrega al menos un ítem antes de enviar la cotización.';
      return;
    }

    this.saving[request.id] = true;
    this.message = '';
    this.errorMessage = '';
    this.service.quoteRequest(request.id, {
      items: draft.items.map(item => ({
        descripcion: item.descripcion,
        cantidad: Number(item.cantidad),
        precioUnitario: Number(item.precioUnitario)
      }))
    }).subscribe({
      next: () => {
        this.saving[request.id] = false;
        this.message = 'Cotización enviada exitosamente al cliente.';
        this.load();
      },
      error: (err) => {
        this.saving[request.id] = false;
        this.errorMessage = err?.error?.detail || 'No se pudo enviar la cotización.';
      }
    });
  }
}
