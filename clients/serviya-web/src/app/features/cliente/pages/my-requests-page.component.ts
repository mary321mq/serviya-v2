import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

import { ServiceRequestResponseDTO } from '../services/public-catalog.service';
import { ServiceRequestService } from '../services/service-request.service';
import { SERVIYA_APP_CONFIG } from '../../../core/config/app-config';

@Component({
  selector: 'app-my-requests-page',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink, FormsModule],
  template: `
    <div class="my-requests-page-wrapper">
      <div class="header-section">
        <h1 class="page-title">Mis solicitudes</h1>
        <p class="page-subtitle">Consulta el estado y detalle de todas tus solicitudes.</p>
      </div>

      <!-- Filtros superiores con contadores -->
      <div class="filter-tabs-container">
        <button class="filter-tab" [class.active]="currentFilter === 'TODAS'" (click)="setFilter('TODAS')">
          <span class="tab-label">Todas</span>
          <span class="tab-badge gray">{{ countTodas }}</span>
        </button>
        <button class="filter-tab" [class.active]="currentFilter === 'EN_PROCESO'" (click)="setFilter('EN_PROCESO')">
          <span class="tab-label">En proceso</span>
          <span class="tab-badge yellow">{{ countEnProceso }}</span>
        </button>
        <button class="filter-tab" [class.active]="currentFilter === 'COTIZADAS'" (click)="setFilter('COTIZADAS')">
          <span class="tab-label">Cotizadas</span>
          <span class="tab-badge blue">{{ countCotizadas }}</span>
        </button>
        <button class="filter-tab" [class.active]="currentFilter === 'COMPLETADAS'" (click)="setFilter('COMPLETADAS')">
          <span class="tab-label">Completadas</span>
          <span class="tab-badge green">{{ countCompletadas }}</span>
        </button>
        <button class="filter-tab" [class.active]="currentFilter === 'CANCELADAS'" (click)="setFilter('CANCELADAS')">
          <span class="tab-label">Canceladas</span>
          <span class="tab-badge red">{{ countCanceladas }}</span>
        </button>
      </div>

      <!-- Barra de controles: Buscador y Ordenamiento -->
      <div class="controls-row">
        <div class="search-box">
          <input type="text" placeholder="Buscar por servicio, código o técnico..." [(ngModel)]="searchQuery" (input)="currentPage = 1" />
          <span class="search-icon">🔍</span>
        </div>
        
        <div class="sort-box">
          <select [(ngModel)]="sortOrder" (change)="currentPage = 1">
            <option value="desc">Más recientes</option>
            <option value="asc">Más antiguas</option>
          </select>
        </div>

        <button class="btn-filters-toggle">
          <span class="icon">⚙️</span> Filtros
        </button>
      </div>

      <div class="split-layout">
        <!-- Panel Izquierdo: Listado de tarjetas -->
        <div class="left-list-pane">
          <div class="cards-stack">
            @for (request of paginatedRequests; track request.id) {
              <div class="request-card" [class.selected]="selectedRequest?.id === request.id" (click)="selectRequest(request)">
                <div class="card-icon-container">
                  <div class="category-icon" [style.background]="getCategoryBg(request.catalogoServicio.categoryCode)">
                    <span>{{ getServiceEmoji(request.catalogoServicio.categoryCode) }}</span>
                  </div>
                </div>
                <div class="card-main-content">
                  <div class="card-header-row">
                    <span class="sol-id">SOL-{{ padId(request.id) }}</span>
                    <span class="status-badge" [ngClass]="getStatusClass(request.estadoSolicitud)">{{ estadoLegible(request.estadoSolicitud) }}</span>
                  </div>
                  <h3 class="service-name">{{ request.catalogoServicio.nombre }}</h3>
                  
                  <div class="card-location">
                    <span class="location-icon">📍</span>
                    <p>{{ parseDireccion(request.direccionFisica).full }}</p>
                  </div>
                  
                  <div class="card-footer-row">
                    <p class="service-date">
                      <span class="date-icon">📅</span>
                      {{ request.createdAt | date:'dd/MM/yyyy - h:mm a' }}
                    </p>
                    <p class="service-price" *ngIf="request.costoTotal || request.costoVisita">
                      S/ {{ (request.costoTotal || request.costoVisita) | number:'1.2-2' }}
                    </p>
                  </div>
                </div>
                <span class="chevron-right">›</span>
              </div>
            } @empty {
              <div class="empty-state-card">
                <span class="icon">🔍</span>
                <p>No se encontraron solicitudes con estos filtros.</p>
              </div>
            }
          </div>

          <!-- Paginación -->
          <div class="pagination-row" *ngIf="filteredRequests.length > 0">
            <span class="page-info">Mostrando {{ startIndex + 1 }} a {{ endIndex }} de {{ filteredRequests.length }} solicitudes</span>
            <div class="page-buttons">
              <button class="page-btn" [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1">‹</button>
              @for (p of totalPagesArray; track p) {
                <button class="page-btn" [class.active]="currentPage === p" (click)="currentPage = p">{{ p }}</button>
              }
              <button class="page-btn" [disabled]="currentPage === totalPages" (click)="currentPage = currentPage + 1">›</button>
            </div>
            <select [(ngModel)]="pageSize" (change)="currentPage = 1" class="page-size-select">
              <option [value]="5">5 por página</option>
              <option [value]="10">10 por página</option>
              <option [value]="20">20 por página</option>
            </select>
          </div>
        </div>

        <!-- Panel Derecho: Detalle de solicitud -->
        <div class="right-detail-pane">
          @if (selectedRequest) {
            <div class="detail-container">
              <!-- Cabecera de detalle -->
              <div class="detail-header">
                <span class="detail-sol-id">ID: SOL-{{ padId(selectedRequest.id) }}</span>
                <button class="btn-close-detail" (click)="selectedRequest = null">✕</button>
              </div>

              <!-- Título del servicio y estado -->
              <div class="detail-title-section">
                <h2 class="detail-title">{{ selectedRequest.catalogoServicio.nombre }}</h2>
                <span class="status-badge large" [ngClass]="getStatusClass(selectedRequest.estadoSolicitud)">
                  {{ estadoLegible(selectedRequest.estadoSolicitud) }}
                </span>
              </div>

              <!-- Ubicación física y Ubigeo -->
              <div class="detail-location-block">
                <div class="location-item">
                  <span class="icon">📍</span>
                  <p class="address-line">{{ parseDireccion(selectedRequest.direccionFisica).full }}</p>
                </div>
                <div class="location-item secondary" *ngIf="parseDireccion(selectedRequest.direccionFisica).ubigeo">
                  <span class="icon">🗺️</span>
                  <p class="ubigeo-line">{{ parseDireccion(selectedRequest.direccionFisica).ubigeo }}</p>
                </div>
                <div class="location-item reference" *ngIf="parseDireccion(selectedRequest.direccionFisica).reference">
                  <p class="reference-line">Ref: {{ parseDireccion(selectedRequest.direccionFisica).reference }}</p>
                </div>
              </div>

              <!-- Próximo paso informativo -->
              <div class="next-step-card" [style.border-color]="getNextStepBorder(selectedRequest.estadoSolicitud)">
                <span class="next-step-label">Próximo paso</span>
                <div class="next-step-content">
                  <span class="icon">{{ getNextStepInfo(selectedRequest.estadoSolicitud).icon }}</span>
                  <div>
                    <strong>{{ getNextStepInfo(selectedRequest.estadoSolicitud).title }}</strong>
                    <p>{{ getNextStepInfo(selectedRequest.estadoSolicitud).desc }}</p>
                  </div>
                </div>
              </div>

              <!-- Fechas y Costos -->
              <div class="detail-meta-grid">
                <div class="meta-item">
                  <span class="label">Fecha de creación</span>
                  <p class="value date-val">
                    📅 {{ selectedRequest.createdAt | date:'dd/MM/yyyy' }} <br/>
                    <small>{{ selectedRequest.createdAt | date:'h:mm a' }}</small>
                  </p>
                </div>
                <div class="meta-item text-right" *ngIf="selectedRequest.costoTotal || selectedRequest.costoVisita">
                  <span class="label">Monto</span>
                  <p class="value price-val">S/ {{ (selectedRequest.costoTotal || selectedRequest.costoVisita) | number:'1.2-2' }}</p>
                </div>
              </div>

              <!-- Descripción del problema -->
              <div class="detail-section">
                <h3>Descripción del problema</h3>
                <p class="problem-desc">{{ selectedRequest.catalogoServicio.descripcion || 'No se detalló una descripción adicional.' }}</p>
              </div>

              <!-- Fotos adjuntas -->
              <div class="detail-section" *ngIf="getEvidenciaUrls(selectedRequest).length > 0">
                <h3>Fotos adjuntas</h3>
                <div class="photos-grid">
                  @for (url of getEvidenciaUrls(selectedRequest); track url; let i = $index) {
                    <a [href]="getEvidenciaUrl(url)" target="_blank" class="photo-preview-link">
                      <img [src]="getEvidenciaUrl(url)" [alt]="'Evidencia ' + (i + 1)" class="attached-img" />
                    </a>
                  }
                  <button class="btn-add-more-photos" (click)="addPhotoPlaceholder()">
                    <span class="plus-icon">+</span>
                  </button>
                </div>
              </div>

              <!-- Cotización actual y Técnico -->
              <div class="quote-card" *ngIf="selectedRequest.tecnicoId || selectedRequest.costoTotal">
                <h3>Cotización actual</h3>
                <div class="quote-grid">
                  <div class="tech-profile">
                    <div class="avatar-circle">
                      <span>👤</span>
                    </div>
                    <div class="tech-info">
                      <span class="role-lbl">Técnico asignado</span>
                      <strong>{{ selectedRequest.tecnicoId ? 'Técnico Asignado' : 'Buscando...' }}</strong>
                      <span class="tech-rating" *ngIf="selectedRequest.tecnicoId">⭐ 4.8</span>
                    </div>
                  </div>
                  <div class="quote-price text-right">
                    <span class="role-lbl">Monto</span>
                    <strong class="price-val">S/ {{ (selectedRequest.costoTotal || selectedRequest.costoVisita) | number:'1.2-2' }}</strong>
                  </div>
                </div>
                <div class="quote-footer">
                  <span class="quote-updated">Cotizado el {{ (selectedRequest.updatedAt || selectedRequest.createdAt) | date:'dd/MM/yyyy - h:mm a' }}</span>
                  <a [routerLink]="['/cliente/solicitudes', selectedRequest.id]" class="btn-quote-detail">Ver detalle de cotización</a>
                </div>
              </div>

              <!-- Estado de la solicitud (Stepper) -->
              <div class="detail-section stepper-section">
                <h3>Estado de la solicitud</h3>
                <div class="stepper-timeline">
                  <!-- Paso 1 -->
                  <div class="step-point" [class.completed]="isStepCompleted('SOLICITUD')">
                    <div class="indicator">✓</div>
                    <span class="label">En proceso</span>
                    <span class="step-date">{{ selectedRequest.createdAt | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="step-connector" [class.completed]="isStepCompleted('COTIZADA')"></div>

                  <!-- Paso 2 -->
                  <div class="step-point" [class.completed]="isStepCompleted('COTIZADA')" [class.active]="isStepActive('COTIZADA')">
                    <div class="indicator">
                      <span *ngIf="isStepCompleted('COTIZADA')">✓</span>
                      <span *ngIf="!isStepCompleted('COTIZADA')">2</span>
                    </div>
                    <span class="label">Cotizada</span>
                    <span class="step-date" *ngIf="isStepCompleted('COTIZADA')">{{ (selectedRequest.updatedAt || selectedRequest.createdAt) | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="step-connector" [class.completed]="isStepCompleted('ACEPTADA')"></div>

                  <!-- Paso 3 -->
                  <div class="step-point" [class.completed]="isStepCompleted('ACEPTADA')" [class.active]="isStepActive('ACEPTADA')">
                    <div class="indicator">
                      <span *ngIf="isStepCompleted('ACEPTADA')">✓</span>
                      <span *ngIf="!isStepCompleted('ACEPTADA')">3</span>
                    </div>
                    <span class="label">Aceptada</span>
                  </div>
                  <div class="step-connector" [class.completed]="isStepCompleted('COMPLETADA')"></div>

                  <!-- Paso 4 -->
                  <div class="step-point" [class.completed]="isStepCompleted('COMPLETADA')" [class.active]="isStepActive('COMPLETADA')">
                    <div class="indicator">
                      <span *ngIf="isStepCompleted('COMPLETADA')">✓</span>
                      <span *ngIf="!isStepCompleted('COMPLETADA')">4</span>
                    </div>
                    <span class="label">Completada</span>
                  </div>
                </div>
              </div>

              <!-- Acciones de detalle -->
              <div class="detail-actions-row">
                <button class="btn-primary-blue contact-btn" (click)="contactarTecnico()">
                  💬 Contactar técnico
                </button>
                
                <button *ngIf="selectedRequest.estadoSolicitud === 'COMPLETADA'" [routerLink]="['/cliente/resenas/nueva', selectedRequest.id]" [queryParams]="{tecnicoId: selectedRequest.tecnicoId}" class="btn-primary-green">
                  ⭐ Calificar técnico
                </button>

                <button *ngIf="selectedRequest.estadoSolicitud === 'EN_PROCESO' || selectedRequest.estadoSolicitud === 'TECNICO_ASIGNADO'" class="btn-primary-green" (click)="completarTrabajo()" [disabled]="selectedRequest.clienteConfirmoFin">
                  ✓ {{ selectedRequest.clienteConfirmoFin ? 'Esperando al técnico' : 'Trabajo Completado' }}
                </button>

                <button class="btn-outline-red cancel-btn" (click)="cancelarSolicitud()" [disabled]="!canCancel()">
                  ✕ Cancelar solicitud
                </button>
              </div>
            </div>
          } @else {
            <div class="empty-detail-pane">
              <span class="icon">🖱️</span>
              <p>Selecciona una solicitud de la lista para ver su detalle completo.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-requests-page-wrapper {
      padding: 0;
      color: #f8fafc;
      font-family: 'Inter', sans-serif;
    }

    .header-section { margin-bottom: 24px; }
    .page-title { font-size: 1.8rem; font-weight: 700; color: #f8fafc; margin: 0 0 6px 0; }
    .page-subtitle { color: #94a3b8; font-size: 0.95rem; margin: 0; }

    /* Filtros Superiores */
    .filter-tabs-container {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .filter-tabs-container::-webkit-scrollbar { height: 4px; }
    .filter-tabs-container::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }

    .filter-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #0b0f19;
      border: 1px solid #1e293b;
      padding: 10px 18px;
      border-radius: 12px;
      color: #94a3b8;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.25s;
    }
    .filter-tab:hover {
      border-color: #334155;
      color: #cbd5e1;
    }
    .filter-tab.active {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.08);
      color: #3b82f6;
      box-shadow: 0 0 16px rgba(59, 130, 246, 0.15);
    }
    
    .tab-badge {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 20px;
      font-weight: 700;
    }
    .tab-badge.gray { background: #1e293b; color: #94a3b8; }
    .tab-badge.yellow { background: rgba(234,179,8,0.15); color: #facc15; }
    .tab-badge.blue { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .tab-badge.green { background: rgba(34,197,94,0.15); color: #4ade80; }
    .tab-badge.red { background: rgba(239,68,68,0.15); color: #f87171; }

    /* Barra de controles */
    .controls-row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      align-items: center;
      flex-wrap: wrap;
    }
    .search-box {
      position: relative;
      flex: 1;
      min-width: 280px;
    }
    .search-box input {
      width: 100%;
      padding: 12px 40px 12px 16px;
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 12px;
      color: #f8fafc;
      font-size: 0.95rem;
      outline: none;
      box-sizing: border-box;
    }
    .search-box input:focus { border-color: #3b82f6; }
    .search-box .search-icon {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      color: #64748b;
    }

    .sort-box select {
      padding: 12px 16px;
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 12px;
      color: #f8fafc;
      font-size: 0.95rem;
      cursor: pointer;
      outline: none;
    }
    .sort-box select:focus { border-color: #3b82f6; }

    .btn-filters-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 12px;
      color: #cbd5e1;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-filters-toggle:hover { border-color: #334155; }

    /* Layout Split */
    .split-layout {
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }
    
    /* Panel Izquierdo (Tarjetas) */
    .left-list-pane {
      flex: 1;
      max-width: 520px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .cards-stack {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .request-card {
      display: flex;
      gap: 16px;
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
      align-items: center;
    }
    .request-card:hover {
      border-color: #334155;
      transform: translateY(-2px);
    }
    .request-card.selected {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.05);
      box-shadow: 0 0 16px rgba(59, 130, 246, 0.1);
    }

    .card-icon-container { flex-shrink: 0; }
    .category-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
    }

    .card-main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sol-id {
      color: #64748b;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .service-name {
      color: #f8fafc;
      font-size: 1.05rem;
      font-weight: 600;
      margin: 0;
    }
    .card-location {
      display: flex;
      gap: 6px;
      align-items: flex-start;
      color: #94a3b8;
      font-size: 0.85rem;
    }
    .card-location p { margin: 0; line-height: 1.4; }
    .card-location .location-icon { margin-top: 1px; }

    .card-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }
    .service-date {
      color: #64748b;
      font-size: 0.8rem;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .service-price {
      color: #cbd5e1;
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0;
    }
    .chevron-right {
      font-size: 1.5rem;
      color: #475569;
      margin-left: 8px;
    }

    /* Paginación */
    .pagination-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      padding: 16px 0;
      border-top: 1px solid #1e293b;
    }
    .page-info { color: #64748b; font-size: 0.85rem; }
    .page-buttons { display: flex; gap: 6px; }
    .page-btn {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px solid #1e293b;
      background: #0b0f19;
      color: #94a3b8;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .page-btn:hover:not(:disabled) { border-color: #334155; color: #f8fafc; }
    .page-btn.active { background: #3b82f6; border-color: #3b82f6; color: #f8fafc; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-size-select {
      padding: 6px 10px;
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 8px;
      color: #94a3b8;
      font-size: 0.85rem;
      cursor: pointer;
    }

    /* Panel Derecho (Detalle) */
    .right-detail-pane {
      flex: 1.3;
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 28px;
      position: sticky;
      top: 24px;
    }
    .empty-detail-pane {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748b;
      min-height: 480px;
      text-align: center;
      padding: 40px;
    }
    .empty-detail-pane .icon { font-size: 3rem; margin-bottom: 16px; }

    .detail-container { display: flex; flex-direction: column; gap: 24px; }
    
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 16px;
    }
    .detail-sol-id { color: #3b82f6; font-weight: 700; font-size: 0.95rem; }
    .btn-close-detail {
      background: none;
      border: none;
      color: #64748b;
      font-size: 1.2rem;
      cursor: pointer;
    }
    .btn-close-detail:hover { color: #f8fafc; }

    .detail-title-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .detail-title { font-size: 1.4rem; font-weight: 700; margin: 0; color: #f8fafc; line-height: 1.3; }

    .detail-location-block {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .location-item { display: flex; gap: 8px; align-items: flex-start; color: #cbd5e1; font-size: 0.9rem; }
    .location-item.secondary { color: #94a3b8; font-size: 0.85rem; }
    .location-item.reference { color: #facc15; font-size: 0.85rem; padding-left: 22px; }
    .location-item p { margin: 0; line-height: 1.4; }

    /* Próximo Paso Card */
    .next-step-card {
      border-left: 4px solid #3b82f6;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 0 12px 12px 0;
      padding: 16px;
    }
    .next-step-label {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
      display: block;
      margin-bottom: 8px;
    }
    .next-step-content { display: flex; gap: 12px; align-items: flex-start; }
    .next-step-content .icon { font-size: 1.3rem; }
    .next-step-content strong { color: #f8fafc; font-size: 0.9rem; display: block; margin-bottom: 2px; }
    .next-step-content p { color: #cbd5e1; font-size: 0.85rem; margin: 0; line-height: 1.4; }

    /* Meta Grid */
    .detail-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .meta-item .label { color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 6px; }
    .meta-item .value { font-size: 0.95rem; margin: 0; line-height: 1.4; }
    .meta-item .value.price-val { font-size: 1.3rem; font-weight: 700; color: #f8fafc; }
    .text-right { text-align: right; }

    /* Detail Sections */
    .detail-section h3 { font-size: 0.9rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin: 0 0 10px 0; }
    .problem-desc { color: #cbd5e1; font-size: 0.9rem; line-height: 1.5; margin: 0; }

    /* Photos */
    .photos-grid { display: flex; gap: 10px; flex-wrap: wrap; }
    .attached-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; border: 1px solid #1e293b; transition: border-color 0.2s; }
    .attached-img:hover { border-color: #3b82f6; }
    .btn-add-more-photos {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      border: 1px dashed #334155;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .btn-add-more-photos:hover { border-color: #3b82f6; }
    .btn-add-more-photos .plus-icon { font-size: 1.5rem; color: #475569; }

    /* Quote Card */
    .quote-card {
      background: rgba(234,179,8,0.03);
      border: 1px solid rgba(234,179,8,0.2);
      border-radius: 12px;
      padding: 16px;
    }
    .quote-card h3 { font-size: 0.9rem; color: #eab308; text-transform: uppercase; font-weight: 700; margin: 0 0 16px 0; }
    .quote-grid { display: flex; justify-content: space-between; align-items: center; }
    .tech-profile { display: flex; gap: 12px; align-items: center; }
    .avatar-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .tech-info { display: flex; flex-direction: column; }
    .role-lbl { color: #64748b; font-size: 0.75rem; }
    .tech-info strong { color: #f8fafc; font-size: 0.9rem; margin-top: 2px; }
    .tech-rating { color: #facc15; font-size: 0.8rem; font-weight: 600; margin-top: 2px; }
    .quote-price .price-val { font-size: 1.25rem; font-weight: 700; color: #facc15; display: block; margin-top: 2px; }
    
    .quote-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid rgba(234,179,8,0.1);
    }
    .quote-updated { color: #64748b; font-size: 0.8rem; }
    .btn-quote-detail { color: #3b82f6; font-size: 0.85rem; font-weight: 600; text-decoration: none; }
    .btn-quote-detail:hover { text-decoration: underline; }

    /* Stepper */
    .stepper-timeline {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      padding: 10px 0;
      margin-top: 12px;
    }
    .step-point {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      z-index: 2;
      width: 80px;
      text-align: center;
    }
    .step-point .indicator {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #1e293b;
      border: 2px solid #0b0f19;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: #475569;
      transition: all 0.2s;
    }
    .step-point.completed .indicator {
      background: #3b82f6;
      color: #ffffff;
    }
    .step-point.active .indicator {
      border-color: #3b82f6;
      color: #3b82f6;
      background: #0b0f19;
    }
    .step-point .label { font-size: 0.72rem; color: #64748b; font-weight: 600; }
    .step-point.completed .label { color: #3b82f6; }
    .step-point.active .label { color: #3b82f6; font-weight: 700; }
    .step-date { font-size: 0.65rem; color: #475569; }

    .step-connector {
      flex: 1;
      height: 2px;
      background: #1e293b;
      margin-bottom: 24px;
      z-index: 1;
    }
    .step-connector.completed { background: #3b82f6; }

    /* Acciones */
    .detail-actions-row {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 20px;
      border-top: 1px solid #1e293b;
      padding-top: 24px;
    }
    .btn-primary-blue {
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: background 0.2s;
      width: 100%;
    }
    .btn-primary-blue:hover { background: #1d4ed8; }

    .btn-primary-green {
      background: #16a34a;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: background 0.2s;
      width: 100%;
    }
    .btn-primary-green:hover:not(:disabled) { background: #15803d; }
    .btn-primary-green:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-outline-red {
      background: transparent;
      border: 1px solid rgba(239,68,68,0.4);
      color: #f87171;
      padding: 12px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
    }
    .btn-outline-red:hover:not(:disabled) {
      background: rgba(239,68,68,0.08);
      border-color: #ef4444;
      color: #ef4444;
    }
    .btn-outline-red:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Badges */
    .status-badge {
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .status-badge.large {
      padding: 6px 14px;
      font-size: 0.8rem;
    }
    .status-pending { background: rgba(234,179,8,0.1); color: #facc15; border: 1px solid rgba(234,179,8,0.2); }
    .status-process { background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); }
    .status-quoted { background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); }
    .status-completed { background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
    .status-canceled { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
    .status-default { background: #1e293b; color: #94a3b8; }

    @media (max-width: 992px) {
      .split-layout { flex-direction: column; }
      .left-list-pane { max-width: 100%; width: 100%; }
      .right-detail-pane { width: 100%; position: static; box-sizing: border-box; }
    }
  `]
})
export class MyRequestsPageComponent implements OnInit {
  private readonly serviceRequestService = inject(ServiceRequestService);
  private readonly router = inject(Router);
  private readonly config = inject(SERVIYA_APP_CONFIG);

  protected requests: ServiceRequestResponseDTO[] = [];
  protected selectedRequest: ServiceRequestResponseDTO | null = null;
  
  // Filtros y búsquedas
  protected currentFilter: string = 'TODAS';
  protected searchQuery: string = '';
  protected sortOrder: 'desc' | 'asc' = 'desc';

  // Paginación
  protected currentPage = 1;
  protected pageSize = 5;

  ngOnInit(): void {
    this.serviceRequestService.getRequests().subscribe((requests) => {
      this.requests = requests;
      if (this.requests.length > 0) {
        this.selectedRequest = this.requests[0];
      }
    });
  }

  // Getters para contadores dinámicos
  get countTodas(): number { return this.requests.length; }
  get countEnProceso(): number {
    return this.requests.filter(r => ['PENDIENTE_EVALUACION', 'EN_PROCESO', 'PAGADO_BUSCANDO_TECNICO', 'TECNICO_ASIGNADO'].includes(r.estadoSolicitud)).length;
  }
  get countCotizadas(): number {
    return this.requests.filter(r => ['COTIZADO_ESPERANDO_PAGO', 'ESPERANDO_PAGO_VISITA'].includes(r.estadoSolicitud)).length;
  }
  get countCompletadas(): number {
    return this.requests.filter(r => r.estadoSolicitud === 'COMPLETADO').length;
  }
  get countCanceladas(): number {
    return this.requests.filter(r => ['CANCELADO', 'REEMBOLSADO'].includes(r.estadoSolicitud)).length;
  }

  get filteredRequests(): ServiceRequestResponseDTO[] {
    let result = [...this.requests];

    // Filtros de categoría principal
    if (this.currentFilter !== 'TODAS') {
      result = result.filter(req => {
        if (this.currentFilter === 'EN_PROCESO') {
          return ['PENDIENTE_EVALUACION', 'EN_PROCESO', 'PAGADO_BUSCANDO_TECNICO', 'TECNICO_ASIGNADO'].includes(req.estadoSolicitud);
        }
        if (this.currentFilter === 'COTIZADAS') {
          return ['COTIZADO_ESPERANDO_PAGO', 'ESPERANDO_PAGO_VISITA'].includes(req.estadoSolicitud);
        }
        if (this.currentFilter === 'COMPLETADAS') {
          return req.estadoSolicitud === 'COMPLETADO';
        }
        if (this.currentFilter === 'CANCELADAS') {
          return ['CANCELADO', 'REEMBOLSADO'].includes(req.estadoSolicitud);
        }
        return true;
      });
    }

    // Buscador
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(req => 
        req.catalogoServicio.nombre.toLowerCase().includes(q) || 
        req.direccionFisica.toLowerCase().includes(q) ||
        (req.catalogoServicio.descripcion && req.catalogoServicio.descripcion.toLowerCase().includes(q))
      );
    }

    // Ordenar
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }

  // Getters de paginación
  get totalPages(): number {
    return Math.ceil(this.filteredRequests.length / this.pageSize) || 1;
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredRequests.length);
  }

  get paginatedRequests(): ServiceRequestResponseDTO[] {
    return this.filteredRequests.slice(this.startIndex, this.endIndex);
  }

  protected setFilter(filter: string) {
    this.currentFilter = filter;
    this.currentPage = 1;
    const first = this.filteredRequests[0];
    this.selectedRequest = first || null;
  }

  protected selectRequest(req: ServiceRequestResponseDTO) {
    this.selectedRequest = req;
  }

  protected canCancel(): boolean {
    return this.selectedRequest?.estadoSolicitud === 'PENDIENTE_EVALUACION';
  }

  protected cancelarSolicitud(): void {
    if (!this.selectedRequest || !this.canCancel()) return;
    
    if (confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
      this.serviceRequestService.cancelRequest(String(this.selectedRequest.id)).subscribe({
        next: (updated) => {
          const index = this.requests.findIndex(r => r.id === updated.id);
          if (index !== -1) {
            this.requests[index] = updated;
            this.selectedRequest = updated;
          }
        },
        error: () => alert('Hubo un error al cancelar la solicitud.')
      });
    }
  }

  protected completarTrabajo(): void {
    if (this.selectedRequest && confirm('¿Estás seguro de marcar el trabajo como completado? Esto liberará el pago al técnico.')) {
      this.serviceRequestService.completarTrabajo(this.selectedRequest.id.toString()).subscribe({
        next: () => {
          if (this.selectedRequest) {
            this.serviceRequestService.getRequest(this.selectedRequest.id.toString()).subscribe(req => {
              this.selectedRequest = req;
              const index = this.requests.findIndex(r => r.id === req.id);
              if (index !== -1) {
                this.requests[index] = req;
              }
            });
          }
        },
        error: () => alert('Hubo un error al marcar el trabajo como completado.')
      });
    }
  }

  protected contactarTecnico(): void {
    if (this.selectedRequest?.tecnicoId) {
      alert('Abriendo chat con el técnico: ' + this.selectedRequest.tecnicoId);
    } else {
      alert('Esta solicitud aún no tiene un técnico asignado.');
    }
  }

  protected padId(id: number | string | undefined): string {
    if (id === undefined) return '';
    return String(id).padStart(7, '0');
  }

  protected getServiceEmoji(categoryCode?: string): string {
    const map: Record<string, string> = {
      'PLOMERIA': '💧',
      'ELECTRICIDAD': '⚡',
      'CARPINTERIA': '🪚',
      'PINTURA': '🖌️',
      'CERRAJERIA': '🔐',
      'LIMPIEZA': '🧹',
      'GASFITERIA': '🚿',
      'ALBAÑILERIA': '🧱',
    };
    return map[categoryCode || ''] || '🛠️';
  }

  protected getCategoryBg(categoryCode?: string): string {
    const map: Record<string, string> = {
      'PLOMERIA': 'rgba(59,130,246,0.15)',
      'ELECTRICIDAD': 'rgba(234,179,8,0.15)',
      'CARPINTERIA': 'rgba(168,85,247,0.15)',
      'PINTURA': 'rgba(168,85,247,0.15)',
      'CERRAJERIA': 'rgba(249,115,22,0.15)',
      'LIMPIEZA': 'rgba(34,197,94,0.15)',
      'GASFITERIA': 'rgba(59,130,246,0.15)',
      'ALBAÑILERIA': 'rgba(249,115,22,0.15)',
    };
    return map[categoryCode || ''] || 'rgba(148,163,184,0.15)';
  }

  protected getStatusClass(status: string): string {
    if (status === 'PENDIENTE_EVALUACION') return 'status-pending';
    if (status === 'EN_PROCESO' || status === 'PAGADO_BUSCANDO_TECNICO' || status === 'TECNICO_ASIGNADO') return 'status-process';
    if (status === 'COTIZADO_ESPERANDO_PAGO' || status === 'ESPERANDO_PAGO_VISITA') return 'status-quoted';
    if (status === 'COMPLETADO') return 'status-completed';
    if (status === 'CANCELADO' || status === 'REEMBOLSADO') return 'status-canceled';
    return 'status-default';
  }

  protected isStepCompleted(step: string): boolean {
    const status = this.selectedRequest?.estadoSolicitud || '';
    if (step === 'SOLICITUD') return true;
    if (step === 'COTIZADA') {
      return ['COTIZADO_ESPERANDO_PAGO', 'TECNICO_ASIGNADO', 'EN_PROCESO', 'COMPLETADO'].includes(status);
    }
    if (step === 'ACEPTADA') {
      return ['PAGADO_BUSCANDO_TECNICO', 'TECNICO_ASIGNADO', 'EN_PROCESO', 'COMPLETADO'].includes(status);
    }
    if (step === 'COMPLETADA') {
      return status === 'COMPLETADO';
    }
    return false;
  }

  protected isStepActive(step: string): boolean {
    const status = this.selectedRequest?.estadoSolicitud || '';
    if (step === 'COTIZADA' && status === 'PENDIENTE_EVALUACION') return true;
    if (step === 'ACEPTADA' && status === 'COTIZADO_ESPERANDO_PAGO') return true;
    if (step === 'COMPLETADA' && (status === 'TECNICO_ASIGNADO' || status === 'EN_PROCESO')) return true;
    return false;
  }

  protected parseDireccion(direccion: string): { full: string; ubigeo: string; reference: string } {
    if (!direccion) return { full: '', ubigeo: '', reference: '' };
    
    const parts = direccion.split(':');
    if (parts.length < 2) {
      return { full: direccion, ubigeo: '', reference: '' };
    }
    
    const ubigeoPart = parts[0].trim().replace(/,/g, ' - ');
    let addressPart = parts.slice(1).join(':').trim();
    
    let reference = '';
    const refIndex = addressPart.toLowerCase().lastIndexOf('(ref:');
    if (refIndex !== -1) {
      reference = addressPart.substring(refIndex + 5, addressPart.length - 1).trim();
      addressPart = addressPart.substring(0, refIndex).trim();
    }
    
    return {
      full: addressPart,
      ubigeo: ubigeoPart,
      reference: reference
    };
  }

  protected getNextStepInfo(status: string): { icon: string; title: string; desc: string } {
    switch (status) {
      case 'PENDIENTE_EVALUACION':
        return {
          icon: '🔍',
          title: 'Asignando un técnico',
          desc: 'Estamos buscando un profesional idóneo cercano para evaluar tu caso.'
        };
      case 'ESPERANDO_PAGO_VISITA':
        return {
          icon: '💳',
          title: 'Pago de evaluación pendiente',
          desc: 'Realiza el pago de la visita para programar la inspección técnica.'
        };
      case 'COTIZADO_ESPERANDO_PAGO':
        return {
          icon: '📝',
          title: 'Cotización recibida',
          desc: 'Revisa y aprueba la cotización final del trabajo para iniciar.'
        };
      case 'PAGADO_BUSCANDO_TECNICO':
        return {
          icon: '🤝',
          title: 'Pago verificado',
          desc: 'Asignando el técnico idóneo para realizar las tareas cotizadas.'
        };
      case 'TECNICO_ASIGNADO':
      case 'EN_PROCESO':
        return {
          icon: '🚚',
          title: 'El técnico está en camino',
          desc: 'Hora estimada de llegada: 9:30 PM - 9:45 PM.'
        };
      case 'COMPLETADO':
        return {
          icon: '🎉',
          title: 'Servicio completado',
          desc: 'El trabajo fue finalizado exitosamente. ¡Gracias por tu preferencia!'
        };
      default:
        return {
          icon: '🛠️',
          title: 'Revisando solicitud',
          desc: 'Tu solicitud está siendo procesada en el sistema.'
        };
    }
  }

  protected getNextStepBorder(status: string): string {
    if (status === 'COMPLETADO') return 'rgba(34,197,94,0.3)';
    if (status === 'CANCELADO' || status === 'REEMBOLSADO') return 'rgba(239,68,68,0.3)';
    return 'rgba(59,130,246,0.3)';
  }

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

  protected getEvidenciaUrls(request: ServiceRequestResponseDTO | null | undefined): string[] {
    if (!request) return [];
    const urls = request.evidenciaUrls?.filter(Boolean) ?? [];
    if (urls.length > 0) return urls;
    return request.urlEvidencia ? [request.urlEvidencia] : [];
  }

  protected addPhotoPlaceholder(): void {
    alert('Simulación: Adjuntar fotos adicionales a la solicitud actual.');
  }

  protected estadoLegible(status: string): string {
    const labels: Record<string, string> = {
      ESPERANDO_PAGO_VISITA: 'Visita pendiente',
      PENDIENTE_EVALUACION: 'En proceso',
      COTIZADO_ESPERANDO_PAGO: 'Cotizada',
      PAGADO_BUSCANDO_TECNICO: 'Aceptada',
      TECNICO_ASIGNADO: 'Asignada',
      EN_PROCESO: 'En proceso',
      COMPLETADO: 'Completada',
      CANCELADO: 'Cancelada',
      REEMBOLSADO: 'Reembolsada'
    };
    return labels[status] ?? status;
  }
}
