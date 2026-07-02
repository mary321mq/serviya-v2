import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { Offer } from '../models/technician.model';
import { TechnicianOfferService } from '../services/technician-offer.service';

@Component({
  selector: 'app-offers-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LucideAngularModule, DatePipe],
  template: `
    <div class="offers-page-container">
      <div class="pane-header">
        <a routerLink="/tecnico" class="eyebrow-back">&larr; Volver al panel</a>
        <span class="eyebrow">TÉCNICO</span>
        <h1>{{ isOffersRoute ? 'Ofertas de Trabajo' : 'Mis asignaciones' }}</h1>
        <p class="subtitle">
          {{ isOffersRoute ? 'Aquí puedes ver y postular a las ofertas disponibles.' : 'Aquí puedes ver y gestionar los servicios que te han sido asignados.' }}
        </p>
      </div>

      <!-- Filter Tabs -->
      <div class="tabs-row">
        <button (click)="selectTab('TODAS')" [class.active]="selectedTab === 'TODAS'" class="tab-btn">
          Todas <span class="badge">{{ getCount('TODAS') }}</span>
        </button>
        <button (click)="selectTab('PENDIENTE')" [class.active]="selectedTab === 'PENDIENTE'" class="tab-btn">
          Pendientes <span class="badge">{{ getCount('PENDIENTE') }}</span>
        </button>
        <button (click)="selectTab('PROCESO')" [class.active]="selectedTab === 'PROCESO'" class="tab-btn">
          En proceso <span class="badge">{{ getCount('PROCESO') }}</span>
        </button>
        <button (click)="selectTab('COMPLETADA')" [class.active]="selectedTab === 'COMPLETADA'" class="tab-btn">
          Completadas <span class="badge">{{ getCount('COMPLETADA') }}</span>
        </button>
        <button (click)="selectTab('CANCELADA')" [class.active]="selectedTab === 'CANCELADA'" class="tab-btn">
          Canceladas <span class="badge">{{ getCount('CANCELADA') }}</span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="search-bar-wrapper">
        <lucide-icon name="search" class="search-icon" [size]="18"></lucide-icon>
        <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar por servicio, código..." class="search-input" />
      </div>

      <!-- List of Offers -->
      <div class="offers-list-wrapper">
        <div *ngIf="filteredOffers.length === 0" class="empty-state">
          <p>No se encontraron asignaciones con estos filtros.</p>
        </div>

        <div class="offers-grid">
          <div *ngFor="let offer of filteredOffers" 
               (click)="navigateToDetail(offer)" 
               class="offer-card-item">
            
            <div class="card-icon-box" [ngClass]="getCategoryColorClass(offer)">
              <span>{{ getCategoryIcon(offer) }}</span>
            </div>
            
            <div class="card-info">
              <div class="card-title-row">
                <h3>{{ offer.serviceName || 'Servicio asignado' }}</h3>
                <span class="card-status-badge" [ngClass]="offer.estadoSolicitud?.toLowerCase() || ''">
                  {{ estadoLegible(offer.estadoSolicitud) }}
                </span>
              </div>
              <p class="location-label">📍 {{ parseAddress(offer.direccionFisica).ubigeo }}</p>
              <p class="date-label">⏱ Recibida: {{ offer.createdAt | date:'M/d/yy, h:mm a' }}</p>
            </div>
            
            <div class="card-arrow">
              <lucide-icon name="chevron-right" [size]="18"></lucide-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div class="list-pagination">
        <span>Mostrando 1 a {{ filteredOffers.length }} de {{ filteredOffers.length }} asignaciones</span>
        <div class="pagination-buttons">
          <button class="pag-btn" disabled>&lt;</button>
          <button class="pag-btn active">1</button>
          <button class="pag-btn" disabled>&gt;</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .offers-page-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0px 20px;
      background: #070a13;
      min-height: calc(100vh - 70px);
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
      color: #f8fafc;
    }
    .eyebrow-back {
      color: #3b82f6;
      font-size: 0.9rem;
      text-decoration: none;
      display: inline-block;
      margin-bottom: 16px;
      font-weight: 600;
    }
    .eyebrow-back:hover {
      text-decoration: underline;
    }
    .pane-header {
      margin-bottom: 24px;
    }
    .pane-header .eyebrow {
      color: #818cf8;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      display: block;
      margin-bottom: 8px;
    }
    .pane-header h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 6px 0;
    }
    .pane-header .subtitle {
      color: #94a3b8;
      font-size: 0.95rem;
      margin: 0;
    }

    /* Tabs Filter */
    .tabs-row {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: #0f172a;
      border: 1px solid #1e293b;
      color: #cbd5e1;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .tab-btn:hover {
      border-color: #3b82f6;
      color: #ffffff;
    }
    .tab-btn.active {
      background: rgba(59, 130, 246, 0.1);
      border-color: #3b82f6;
      color: #3b82f6;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.15);
    }
    .tab-btn .badge {
      background: #1e293b;
      color: #94a3b8;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .tab-btn.active .badge {
      background: #3b82f6;
      color: #ffffff;
    }

    /* Search input */
    .search-bar-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      margin-bottom: 24px;
    }
    .search-icon {
      position: absolute;
      left: 16px;
      color: #64748b;
    }
    .search-input {
      width: 100%;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 12px 16px 12px 48px;
      color: #f8fafc;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .search-input:focus {
      border-color: #3b82f6;
    }

    /* Offers list */
    .offers-list-wrapper {
      flex: 1;
    }
    .offers-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .offer-card-item {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      position: relative;
      transition: all 0.25s ease;
    }
    .offer-card-item:hover {
      border-color: #334155;
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    .card-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }
    
    /* Category specific box colors */
    .card-icon-box.blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .card-icon-box.yellow { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .card-icon-box.orange { background: rgba(249, 115, 22, 0.15); color: #ffedd5; }
    .card-icon-box.purple { background: rgba(139, 92, 246, 0.15); color: #c084fc; }
    .card-icon-box.red { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }

    .card-info {
      flex: 1;
      min-width: 0;
    }
    .card-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      gap: 12px;
    }
    .card-title-row h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-status-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: capitalize;
    }
    
    /* Badges status style */
    .card-status-badge.tecnico_asignado { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
    .card-status-badge.en_proceso { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
    .card-status-badge.completado { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
    .card-status-badge.cancelado { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }

    .location-label {
      color: #cbd5e1;
      font-size: 0.82rem;
      margin: 0 0 6px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .date-label {
      color: #64748b;
      font-size: 0.78rem;
      margin: 0;
    }
    .card-arrow {
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* List view Pagination */
    .list-pagination {
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.82rem;
      color: #64748b;
      padding-bottom: 24px;
    }
    .pagination-buttons {
      display: flex;
      gap: 6px;
    }
    .pag-btn {
      width: 32px;
      height: 32px;
      background: #0f172a;
      border: 1px solid #1e293b;
      color: #94a3b8;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .pag-btn.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: #ffffff;
    }
    .pag-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .empty-state {
      padding: 40px;
      background: #0b0f19;
      border: 1px dashed #1e293b;
      border-radius: 16px;
      text-align: center;
      color: #64748b;
    }
  `]
})
export class OffersPageComponent implements OnInit {
  private readonly offerService = inject(TechnicianOfferService);
  private readonly router = inject(Router);

  offers: Offer[] = [];
  selectedTab: string = 'TODAS';
  searchTerm: string = '';

  get isOffersRoute(): boolean {
    return this.router.url.includes('ofertas');
  }

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.offerService.getOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
      },
      error: () => console.error('Error al cargar asignaciones')
    });
  }

  navigateToDetail(offer: Offer): void {
    const routePrefix = this.isOffersRoute ? '/tecnico/ofertas' : '/tecnico/asignaciones';
    this.router.navigate([routePrefix, offer.id]);
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  get filteredOffers(): Offer[] {
    return this.offers.filter(o => {
      // Filter by tab
      const matchesTab = this.selectedTab === 'TODAS' ||
        (this.selectedTab === 'PENDIENTE' && o.estadoSolicitud === 'TECNICO_ASIGNADO') ||
        (this.selectedTab === 'PROCESO' && o.estadoSolicitud === 'EN_PROCESO') ||
        (this.selectedTab === 'COMPLETADA' && o.estadoSolicitud === 'COMPLETADO') ||
        (this.selectedTab === 'CANCELADA' && (o.estadoSolicitud === 'CANCELADO' || o.estadoSolicitud === 'REEMBOLSADO'));

      // Filter by search query
      const matchesSearch = !this.searchTerm ||
        o.serviceName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        o.description?.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }

  getCount(tab: string): number {
    return this.offers.filter(o => {
      if (tab === 'TODAS') return true;
      if (tab === 'PENDIENTE') return o.estadoSolicitud === 'TECNICO_ASIGNADO';
      if (tab === 'PROCESO') return o.estadoSolicitud === 'EN_PROCESO';
      if (tab === 'COMPLETADA') return o.estadoSolicitud === 'COMPLETADO';
      if (tab === 'CANCELADA') return o.estadoSolicitud === 'CANCELADO' || o.estadoSolicitud === 'REEMBOLSADO';
      return false;
    }).length;
  }

  parseAddress(addressString: string | undefined): { ubigeo: string, main: string } {
    if (!addressString) {
      return { ubigeo: 'Sin ubicación', main: 'Sin dirección' };
    }
    const parts = addressString.split(':');
    if (parts.length > 1) {
      return {
        ubigeo: parts[0].trim(),
        main: parts.slice(1).join(':').trim()
      };
    }
    return { ubigeo: '', main: addressString.trim() };
  }

  getCategoryIcon(offer: Offer): string {
    const name = offer.serviceName?.toLowerCase() || '';
    const cat = offer.catalogoServicio?.categoryCode?.toUpperCase() || '';
    
    if (name.includes('grifer') || name.includes('caño') || name.includes('grifo') || name.includes('faucet')) return '🚰';
    if (cat === 'GASFITERIA' || name.includes('fuga') || name.includes('agua') || name.includes('tuber') || name.includes('leak')) return '💧';
    if (cat === 'ELECTRICIDAD' || name.includes('tomacorriente') || name.includes('eléctr') || name.includes('caja') || name.includes('cable')) return '⚡';
    if (cat === 'PINTURA' || name.includes('pint') || name.includes('pared') || name.includes('paint')) return '🖌️';
    if (name.includes('repisa') || name.includes('mueble') || name.includes('madera')) return '🔨';
    return '🔧';
  }

  getCategoryColorClass(offer: Offer): string {
    const name = offer.serviceName?.toLowerCase() || '';
    const cat = offer.catalogoServicio?.categoryCode?.toUpperCase() || '';
    
    if (name.includes('grifer') || name.includes('caño') || name.includes('grifo') || name.includes('faucet')) return 'orange';
    if (cat === 'GASFITERIA' || name.includes('fuga') || name.includes('agua') || name.includes('tuber') || name.includes('leak')) return 'blue';
    if (cat === 'ELECTRICIDAD' || name.includes('tomacorriente') || name.includes('eléctr') || name.includes('caja') || name.includes('cable')) return 'yellow';
    if (cat === 'PINTURA' || name.includes('pint') || name.includes('pared') || name.includes('paint')) return 'purple';
    return 'red';
  }

  estadoLegible(status: string | undefined): string {
    if (!status) return 'Desconocido';
    const labels: Record<string, string> = {
      TECNICO_ASIGNADO: 'Pendiente',
      EN_PROCESO: 'En proceso',
      COMPLETADO: 'Completada',
      CANCELADO: 'Cancelada',
      REEMBOLSADO: 'Reembolsada'
    };
    return labels[status] ?? status;
  }
}
