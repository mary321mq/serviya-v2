import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AdminMonitorService } from '../services/admin-monitor.service';
import { AdminPayment } from '../models/monitor.model';

@Component({
  selector: 'app-monitor-payments-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DatePipe],
  template: `
    <div class="payments-container" [class.panel-open]="selectedPayment">
      
      <div class="main-content">
        <div class="header-section">
          <div>
            <h1 class="page-title">Historial de Pagos</h1>
            <p class="page-subtitle">Registro completo de todas las transacciones realizadas en la plataforma.</p>
          </div>
          <button class="btn-outline-action">
            <lucide-icon name="download" [size]="16"></lucide-icon> Exportar Excel
          </button>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon-box green"><lucide-icon name="dollar-sign" [size]="20"></lucide-icon></div>
            <div class="metric-info">
              <span class="metric-label">Total pagado</span>
              <div class="metric-val-row">
                <strong class="metric-value">S/ {{ stats.totalPagado | number:'1.2-2' }}</strong>
                <span class="metric-trend positive">↑ 18.5% vs mes anterior</span>
              </div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon-box blue"><lucide-icon name="calendar" [size]="20"></lucide-icon></div>
            <div class="metric-info">
              <span class="metric-label">Pagos este mes</span>
              <div class="metric-val-row">
                <strong class="metric-value">S/ {{ stats.pagosEsteMes | number:'1.2-2' }}</strong>
                <span class="metric-trend positive">↑ 12.4% vs mes anterior</span>
              </div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box orange"><lucide-icon name="clock" [size]="20"></lucide-icon></div>
            <div class="metric-info">
              <span class="metric-label">Pendientes</span>
              <div class="metric-val-row">
                <strong class="metric-value">S/ {{ stats.totalPendiente | number:'1.2-2' }}</strong>
                <span class="metric-desc">{{ stats.countPendiente }} pagos pendientes</span>
              </div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box purple"><lucide-icon name="rotate-ccw" [size]="20"></lucide-icon></div>
            <div class="metric-info">
              <span class="metric-label">Reembolsos</span>
              <div class="metric-val-row">
                <strong class="metric-value">S/ {{ stats.totalReembolsado | number:'1.2-2' }}</strong>
                <span class="metric-desc">{{ stats.countReembolso }} reembolsos</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
          <div class="filter-group flex-1">
            <label>Buscar</label>
            <div class="search-box">
              <input type="text" placeholder="Buscar por cliente, ID o servicio..." [(ngModel)]="searchQuery" (input)="applyFilters()" />
              <lucide-icon name="search" [size]="16" class="text-muted"></lucide-icon>
            </div>
          </div>
          
          <div class="filter-group">
            <label>Estado</label>
            <select class="dark-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
              <option value="ALL">Todos</option>
              <option value="PAGADO">Pagado</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="FALLIDO">Fallido</option>
              <option value="REEMBOLSADO">Reembolsado</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Método de pago</label>
            <select class="dark-select" [(ngModel)]="methodFilter" (change)="applyFilters()">
              <option value="ALL">Todos</option>
              <option value="YAPE">Yape</option>
              <option value="TARJETA">Tarjeta</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Fecha desde</label>
            <div class="date-mock">
              01/05/2024 <lucide-icon name="calendar" [size]="14"></lucide-icon>
            </div>
          </div>
          
          <div class="filter-group">
            <label>Fecha hasta</label>
            <div class="date-mock">
              19/05/2024 <lucide-icon name="calendar" [size]="14"></lucide-icon>
            </div>
          </div>
          
          <button class="btn-clear mt-auto" (click)="clearFilters()">
            <lucide-icon name="rotate-ccw" [size]="14"></lucide-icon> Limpiar filtros
          </button>
        </div>

        <!-- Table -->
        <div class="table-container">
          <table class="dark-table">
            <thead>
              <tr>
                <th>ID PAGO</th>
                <th>CLIENTE</th>
                <th>SERVICIO</th>
                <th>MONTO</th>
                <th>COMISIÓN SERVIYA</th>
                <th>TOTAL NETO</th>
                <th>MÉTODO</th>
                <th>ESTADO</th>
                <th>FECHA</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of paginatedPayments" (click)="openDetail(p)" [class.active-row]="selectedPayment?.id === p.id">
                <td class="font-mono">PAY-{{ p.id.toString().padStart(6, '0') }}</td>
                <td>
                  <div class="client-cell">
                    <div class="c-avatar"><lucide-icon name="user" [size]="14"></lucide-icon></div>
                    <div class="c-info">
                      <span class="c-name">{{ p.nombreCliente }}</span>
                      <span class="c-email">{{ p.clienteId | slice:0:8 }}@cliente.com</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="service-cell">
                    <div class="s-icon"><lucide-icon name="wrench" [size]="14"></lucide-icon></div>
                    <span>Servicio #{{ p.solicitudId }}</span>
                  </div>
                </td>
                <td class="font-semibold">S/ {{ p.montoTotal | number:'1.2-2' }}</td>
                <td>
                  <div class="comm-cell">
                    <span>S/ {{ p.comisionServiya | number:'1.2-2' }}</span>
                    <span class="text-xs text-muted">(10%)</span>
                  </div>
                </td>
                <td class="font-semibold">S/ {{ p.gananciaTecnico | number:'1.2-2' }}</td>
                <td>
                  <span class="method-badge" [ngClass]="p.pasarela.toLowerCase()">
                    <lucide-icon [name]="p.pasarela === 'YAPE' ? 'zap' : 'monitor'" [size]="12"></lucide-icon> {{ p.pasarela | titlecase }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [ngClass]="p.estadoPago.toLowerCase()">
                    <div class="s-dot"></div> {{ p.estadoPago | titlecase }}
                  </span>
                </td>
                <td>
                  <div class="date-cell">
                    <span>{{ p.createdAt | date:'dd/MM/yyyy' }}</span>
                    <span class="text-xs text-muted">{{ p.createdAt | date:'hh:mm a' }}</span>
                  </div>
                </td>
                <td>
                  <div class="actions-cell">
                    <button class="btn-icon" (click)="openDetail(p); $event.stopPropagation()"><lucide-icon name="eye" [size]="16"></lucide-icon></button>
                    <button class="btn-icon text-blue" (click)="descargarComprobante(p); $event.stopPropagation()" [disabled]="downloading" title="Descargar Comprobante"><lucide-icon name="download" [size]="16"></lucide-icon></button>
                  </div>
                </td>
              </tr>
              
              <tr *ngIf="paginatedPayments.length === 0">
                <td colspan="10" class="text-center py-8 text-muted">No se encontraron pagos con los filtros actuales.</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="pagination-footer mt-4" *ngIf="filteredPayments.length > 0">
          <span class="page-info">Mostrando {{ startIndex + 1 }} a {{ endIndex }} de {{ filteredPayments.length }} pagos</span>
          <div class="page-controls">
            <button class="page-btn" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)"><lucide-icon name="chevrons-left" [size]="16"></lucide-icon></button>
            <button class="page-btn" *ngFor="let p of pages" [class.active]="p === currentPage" (click)="goToPage(p)">{{ p }}</button>
            <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)"><lucide-icon name="chevrons-right" [size]="16"></lucide-icon></button>
          </div>
          <select class="dark-select page-size-select" [(ngModel)]="pageSize" (change)="goToPage(1)">
            <option [value]="10">10 por página</option>
            <option [value]="20">20 por página</option>
            <option [value]="50">50 por página</option>
          </select>
        </div>
      </div>
      
      <!-- Right Panel -->
      <div class="detail-panel" *ngIf="selectedPayment">
        <div class="dp-header">
          <h2>Detalle del Pago</h2>
          <button class="btn-icon" (click)="closeDetail()"><lucide-icon name="x" [size]="20"></lucide-icon></button>
        </div>
        
        <div class="dp-body">
          <div class="dp-row space-between mb-4">
            <div class="dp-col">
              <span class="dp-label">ID Pago</span>
              <span class="dp-value badge-blue">PAY-{{ selectedPayment.id.toString().padStart(6, '0') }}</span>
            </div>
            <div class="dp-col items-end">
              <span class="dp-label">Estado</span>
              <span class="status-badge" [ngClass]="selectedPayment.estadoPago.toLowerCase()">
                <div class="s-dot"></div> {{ selectedPayment.estadoPago | titlecase }}
              </span>
            </div>
          </div>
          
          <hr class="dp-divider" />
          
          <h3 class="dp-section-title">Información del Cliente</h3>
          <div class="client-detail-card mb-4">
            <div class="c-avatar lg"><lucide-icon name="user" [size]="20"></lucide-icon></div>
            <div class="c-info">
              <strong class="c-name">{{ selectedPayment.nombreCliente }}</strong>
              <span class="c-email">{{ selectedPayment.clienteId | slice:0:8 }}@cliente.com</span>
              <span class="c-phone">123 456 789</span>
            </div>
          </div>
          
          <h3 class="dp-section-title">Servicio</h3>
          <div class="service-detail-card mb-4">
            <div class="s-icon lg"><lucide-icon name="wrench" [size]="16"></lucide-icon></div>
            <div class="s-info">
              <strong class="s-name">Servicio #{{ selectedPayment.solicitudId }}</strong>
              <span class="s-desc">Servicio realizado para el cliente.</span>
            </div>
          </div>
          
          <h3 class="dp-section-title">Información del Pago</h3>
          <div class="info-grid mb-4">
            <span class="ig-label">Fecha y hora:</span>
            <span class="ig-value">{{ selectedPayment.createdAt | date:'dd/MM/yyyy - hh:mm a' }}</span>
            
            <span class="ig-label">Método de pago:</span>
            <span class="ig-value">
              <span class="method-badge" [ngClass]="selectedPayment.pasarela.toLowerCase()">
                <lucide-icon [name]="selectedPayment.pasarela === 'YAPE' ? 'zap' : 'monitor'" [size]="12"></lucide-icon> {{ selectedPayment.pasarela | titlecase }}
              </span>
            </span>
            
            <span class="ig-label">Referencia / Código:</span>
            <span class="ig-value font-mono">{{ selectedPayment.codigoOperacionExterna || 'N/A' }}</span>
            
            <span class="ig-label">Estado de transacción:</span>
            <span class="ig-value">Aprobado</span>
            
            <span class="ig-label mt-2">Comprobante:</span>
            <button class="btn-outline-sm mt-2"><lucide-icon name="file-text" [size]="14"></lucide-icon> Ver comprobante</button>
          </div>
          
          <div class="commission-card mb-4">
            <h4 class="cc-title">Detalle de Comisión de ServiYa</h4>
            <div class="cc-row">
              <span>Monto del servicio:</span>
              <strong>S/ {{ selectedPayment.montoTotal | number:'1.2-2' }}</strong>
            </div>
            <div class="cc-row text-orange">
              <span>Comisión ServiYa (10%):</span>
              <strong>- S/ {{ selectedPayment.comisionServiya | number:'1.2-2' }}</strong>
            </div>
            <div class="cc-row text-orange">
              <span>IGV (18% sobre comisión):</span>
              <strong>- S/ {{ (selectedPayment.comisionServiya * 0.18) | number:'1.2-2' }}</strong>
            </div>
            <hr class="cc-divider" />
            <div class="cc-row text-green total-row">
              <span>Total neto para el técnico:</span>
              <strong>S/ {{ selectedPayment.gananciaTecnico | number:'1.2-2' }}</strong>
            </div>
          </div>
          
          <h3 class="dp-section-title">Historial del Pago</h3>
          <div class="timeline">
            <div class="tl-item">
              <div class="tl-dot success"><lucide-icon name="check" [size]="12"></lucide-icon></div>
              <div class="tl-content">
                <strong>Pago completado</strong>
                <span>{{ selectedPayment.createdAt | date:'dd/MM/yyyy - hh:mm a' }}</span>
              </div>
            </div>
            <div class="tl-item">
              <div class="tl-dot success"><lucide-icon name="check" [size]="12"></lucide-icon></div>
              <div class="tl-content">
                <strong>Pago confirmado por {{ selectedPayment.pasarela | titlecase }}</strong>
                <span>{{ selectedPayment.createdAt | date:'dd/MM/yyyy - hh:mm a' }}</span>
              </div>
            </div>
            <div class="tl-item">
              <div class="tl-dot success"><lucide-icon name="check" [size]="12"></lucide-icon></div>
              <div class="tl-content">
                <strong>Pago creado</strong>
                <span>{{ selectedPayment.createdAt | date:'dd/MM/yyyy - hh:mm a' }}</span>
              </div>
            </div>
          </div>
          
          <button class="btn-primary w-full mt-6" (click)="descargarComprobante(selectedPayment)" [disabled]="downloading">
            <lucide-icon name="download" [size]="16"></lucide-icon> {{ downloading ? 'Descargando...' : 'Descargar comprobante' }}
          </button>
        </div>
      </div>
      
    </div>
  `,
  styles: [`
    .payments-container { display: flex; gap: 24px; width: 100%; height: 100%; padding-bottom: 40px; position: relative; overflow-x: hidden; }
    .main-content { flex: 1; display: flex; flex-direction: column; gap: 24px; transition: margin-right 0.3s ease; }
    
    .panel-open .main-content { margin-right: 400px; } /* Create space for the panel */
    
    .header-section { display: flex; justify-content: space-between; align-items: flex-end; }
    .page-title { margin: 0 0 6px 0; font-size: 1.8rem; font-weight: 700; color: var(--text-primary); }
    .page-subtitle { margin: 0; color: var(--text-secondary); font-size: 0.95rem; }
    
    .btn-outline-action { background: transparent; border: 1px solid rgba(59,130,246,0.5); padding: 8px 16px; border-radius: 8px; color: #3B82F6; display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn-outline-action:hover { background: rgba(59,130,246,0.1); }
    
    /* Metrics */
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .metric-card { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; gap: 16px; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .metric-icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .metric-icon-box.green { background: rgba(34,197,94,0.15); color: #22C55E; }
    .metric-icon-box.blue { background: rgba(59,130,246,0.15); color: #3B82F6; }
    .metric-icon-box.orange { background: rgba(249,115,22,0.15); color: #F97316; }
    .metric-icon-box.purple { background: rgba(168,85,247,0.15); color: #A855F7; }
    
    .metric-info { display: flex; flex-direction: column; gap: 4px; }
    .metric-label { color: #3B82F6; font-size: 0.85rem; font-weight: 600; }
    .metric-card:nth-child(1) .metric-label { color: #22C55E; }
    .metric-card:nth-child(3) .metric-label { color: #F97316; }
    .metric-card:nth-child(4) .metric-label { color: #A855F7; }
    
    .metric-val-row { display: flex; flex-direction: column; gap: 4px; }
    .metric-value { font-size: 1.6rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
    .metric-trend { font-size: 0.75rem; font-weight: 600; }
    .metric-trend.positive { color: #22C55E; }
    .metric-desc { color: var(--text-secondary); font-size: 0.75rem; font-weight: 500; }
    
    /* Toolbar */
    .toolbar { display: flex; gap: 16px; background: var(--surface-1); border: 1px solid var(--border-color); padding: 16px; border-radius: 12px; align-items: flex-end; flex-wrap: wrap; }
    .filter-group { display: flex; flex-direction: column; gap: 6px; }
    .filter-group label { color: var(--text-secondary); font-size: 0.8rem; font-weight: 500; }
    .flex-1 { flex: 1; min-width: 200px; }
    
    .search-box { display: flex; align-items: center; justify-content: space-between; background: var(--surface-2); border: 1px solid var(--border-color); padding: 0 12px; border-radius: 8px; height: 38px; }
    .search-box input { background: transparent; border: none; color: var(--text-primary); outline: none; width: 100%; font-size: 0.9rem; }
    .dark-select, .date-mock { background: var(--surface-2); border: 1px solid var(--border-color); padding: 0 12px; border-radius: 8px; color: var(--text-primary); font-size: 0.9rem; height: 38px; cursor: pointer; outline: none; }
    .date-mock { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: var(--text-secondary); }
    .btn-clear { background: transparent; border: 1px solid var(--border-color); padding: 0 16px; border-radius: 8px; color: var(--text-primary); display: flex; align-items: center; gap: 8px; font-weight: 500; cursor: pointer; transition: 0.2s; height: 38px; }
    .btn-clear:hover { background: var(--surface-3); }
    .mt-auto { margin-top: auto; }
    
    /* Table */
    .table-container { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; overflow-x: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .dark-table { width: 100%; border-collapse: collapse; text-align: left; }
    .dark-table th { background: rgba(255,255,255,0.02); color: var(--text-secondary); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 16px; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
    .dark-table td { padding: 16px; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; color: var(--text-primary); vertical-align: middle; white-space: nowrap; transition: 0.2s; }
    .dark-table tr:hover td { background: var(--surface-2); }
    .dark-table tr.active-row td { background: rgba(59,130,246,0.1); }
    
    .font-mono { font-family: monospace; color: #3B82F6; font-weight: 500; }
    .font-semibold { font-weight: 600; }
    
    .client-cell { display: flex; align-items: center; gap: 10px; }
    .c-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--surface-3); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); flex-shrink: 0; }
    .c-info { display: flex; flex-direction: column; gap: 2px; }
    .c-name { font-weight: 500; }
    .c-email { font-size: 0.75rem; color: var(--text-secondary); }
    
    .service-cell { display: flex; align-items: center; gap: 8px; }
    .s-icon { color: #A855F7; }
    
    .comm-cell { display: flex; flex-direction: column; gap: 2px; }
    
    .method-badge { font-size: 0.75rem; padding: 4px 10px; border-radius: 6px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.05); color: var(--text-secondary); }
    .method-badge.yape { background: rgba(168,85,247,0.15); color: #A855F7; }
    .method-badge.tarjeta { background: rgba(59,130,246,0.15); color: #3B82F6; }
    
    .status-badge { font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.05); color: var(--text-secondary); }
    .s-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .status-badge.pagado { background: rgba(34,197,94,0.1); color: #22C55E; }
    .status-badge.pendiente { background: rgba(249,115,22,0.1); color: #F97316; }
    .status-badge.fallido { background: rgba(239,68,68,0.1); color: #EF4444; }
    .status-badge.reembolsado { background: rgba(59,130,246,0.1); color: #3B82F6; }
    
    .date-cell { display: flex; flex-direction: column; gap: 2px; }
    .actions-cell { display: flex; gap: 8px; }
    .btn-icon { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; border-radius: 4px; display: flex; transition: 0.2s; }
    .btn-icon:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }
    .text-blue { color: #3B82F6; }
    
    /* Pagination */
    .pagination-footer { display: flex; justify-content: space-between; align-items: center; padding: 0 8px; }
    .page-info { color: var(--text-secondary); font-size: 0.9rem; }
    .page-controls { display: flex; gap: 6px; }
    .page-btn { background: var(--surface-1); border: 1px solid var(--border-color); color: var(--text-secondary); width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: 0.2s; }
    .page-btn:hover:not(:disabled) { background: var(--surface-2); color: var(--text-primary); }
    .page-btn.active { background: #3B82F6; color: white; border-color: #3B82F6; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-size-select { height: 36px; padding: 0 10px; }
    
    /* Right Panel */
    .detail-panel { position: absolute; top: 0; right: 0; width: 380px; height: 100%; background: var(--surface-1); border-left: 1px solid var(--border-color); box-shadow: -4px 0 24px rgba(0,0,0,0.3); display: flex; flex-direction: column; animation: slideIn 0.3s ease forwards; z-index: 10; }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    
    .dp-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
    .dp-header h2 { margin: 0; font-size: 1.2rem; font-weight: 600; color: var(--text-primary); }
    
    .dp-body { padding: 24px; overflow-y: auto; flex: 1; }
    
    .dp-row { display: flex; gap: 16px; }
    .space-between { justify-content: space-between; }
    .items-end { align-items: flex-end; }
    .dp-col { display: flex; flex-direction: column; gap: 6px; }
    .dp-label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 500; }
    .badge-blue { background: rgba(59,130,246,0.15); color: #3B82F6; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-weight: 600; font-size: 0.9rem; }
    
    .dp-divider { border: none; border-top: 1px solid var(--border-color); margin: 20px 0; }
    .dp-section-title { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin: 0 0 12px 0; }
    
    .client-detail-card, .service-detail-card { display: flex; gap: 16px; align-items: center; }
    .c-avatar.lg, .s-icon.lg { width: 40px; height: 40px; }
    .s-icon.lg { background: rgba(168,85,247,0.1); color: #A855F7; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .c-info, .s-info { display: flex; flex-direction: column; gap: 2px; }
    .c-phone { font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px; }
    .s-desc { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; }
    
    .info-grid { display: grid; grid-template-columns: 140px 1fr; gap: y-12px; align-items: center; row-gap: 12px; }
    .ig-label { font-size: 0.85rem; color: var(--text-secondary); }
    .ig-value { font-size: 0.85rem; color: var(--text-primary); font-weight: 500; text-align: right; }
    .btn-outline-sm { background: transparent; border: 1px solid rgba(59,130,246,0.5); color: #3B82F6; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; justify-self: end; }
    
    .commission-card { background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
    .cc-title { margin: 0 0 4px 0; font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
    .cc-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); }
    .text-orange { color: #F97316; }
    .text-green { color: #22C55E; }
    .cc-divider { border: none; border-top: 1px dashed var(--border-color); margin: 6px 0; }
    .total-row { font-size: 0.95rem; font-weight: 600; }
    
    .timeline { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; position: relative; }
    .timeline::before { content: ''; position: absolute; left: 11px; top: 12px; bottom: 12px; width: 2px; background: var(--border-color); z-index: 0; }
    .tl-item { display: flex; gap: 16px; position: relative; z-index: 1; }
    .tl-dot { width: 24px; height: 24px; border-radius: 50%; background: var(--surface-2); border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .tl-dot.success { background: rgba(34,197,94,0.15); border-color: #22C55E; color: #22C55E; }
    .tl-content { display: flex; flex-direction: column; gap: 4px; padding-top: 2px; }
    .tl-content strong { font-size: 0.85rem; color: var(--text-primary); }
    .tl-content span { font-size: 0.75rem; color: var(--text-secondary); }
    
    .btn-primary { background: #3B82F6; border: none; color: white; padding: 12px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: 0.2s; }
    .btn-primary:hover { background: #2563EB; }
    .w-full { width: 100%; }
    .mt-6 { margin-top: 24px; }
    .mb-4 { margin-bottom: 16px; }
    .mt-4 { margin-top: 16px; }
    .mt-2 { margin-top: 8px; }
    .py-8 { padding-top: 32px; padding-bottom: 32px; }
    .text-center { text-align: center; }
    .text-muted { color: var(--text-secondary); }
    .text-xs { font-size: 0.7rem; }
  `]
})
export class MonitorPaymentsPageComponent implements OnInit {
  private readonly adminMonitorService = inject(AdminMonitorService);

  payments: AdminPayment[] = [];
  filteredPayments: AdminPayment[] = [];
  paginatedPayments: AdminPayment[] = [];
  
  selectedPayment: AdminPayment | null = null;
  
  // Stats
  stats = {
    totalPagado: 0,
    pagosEsteMes: 0,
    totalPendiente: 0,
    countPendiente: 0,
    totalReembolsado: 0,
    countReembolso: 0
  };
  
  // Filters
  searchQuery = '';
  statusFilter = 'ALL';
  methodFilter = 'ALL';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.adminMonitorService.getCapturedPayments().subscribe({
      next: (data) => {
        this.payments = data;
        this.calculateStats();
        this.applyFilters();
      },
      error: (err) => console.error('Error al cargar pagos', err)
    });
  }
  
  calculateStats(): void {
    const now = new Date();
    let total = 0, esteMes = 0, penM = 0, penC = 0, reemM = 0, reemC = 0;
    
    this.payments.forEach(p => {
      const amount = Number(p.montoTotal) || 0;
      
      if (p.estadoPago === 'PAGADO') {
        total += amount;
        
        if (p.createdAt) {
          const d = new Date(p.createdAt);
          if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
            esteMes += amount;
          }
        }
      } else if (p.estadoPago === 'PENDIENTE') {
        penM += amount;
        penC++;
      } else if (p.estadoPago === 'REEMBOLSADO') {
        reemM += amount;
        reemC++;
      }
    });
    
    this.stats = {
      totalPagado: total,
      pagosEsteMes: esteMes,
      totalPendiente: penM,
      countPendiente: penC,
      totalReembolsado: reemM,
      countReembolso: reemC
    };
  }
  
  applyFilters(): void {
    let filtered = [...this.payments];
    
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.estadoPago === this.statusFilter);
    }
    
    if (this.methodFilter !== 'ALL') {
      filtered = filtered.filter(p => p.pasarela === this.methodFilter);
    }
    
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.id.toString().includes(q) || 
        (p.nombreCliente && p.nombreCliente.toLowerCase().includes(q)) ||
        (p.clienteId && p.clienteId.toLowerCase().includes(q))
      );
    }
    
    this.filteredPayments = filtered;
    this.goToPage(1);
  }
  
  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.methodFilter = 'ALL';
    this.applyFilters();
  }
  
  // Pagination
  get totalPages(): number {
    return Math.ceil(this.filteredPayments.length / this.pageSize) || 1;
  }
  
  get pages(): number[] {
    const p = [];
    for (let i = 1; i <= this.totalPages; i++) p.push(i);
    return p;
  }
  
  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }
  
  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredPayments.length);
  }
  
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.paginatedPayments = this.filteredPayments.slice(this.startIndex, this.endIndex);
  }
  
  // Detail Panel
  openDetail(payment: AdminPayment): void {
    this.selectedPayment = payment;
  }
  
  closeDetail(): void {
    this.selectedPayment = null;
  }
  
  downloading = false;
  
  descargarComprobante(payment: AdminPayment): void {
    if (this.downloading || payment.estadoPago !== 'PAGADO_ESCROW') return;
    
    this.downloading = true;
    this.adminMonitorService.downloadPaymentReceipt(payment.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprobante-serviya-${payment.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.downloading = false;
      },
      error: (err) => {
        console.error('Error al descargar comprobante', err);
        this.downloading = false;
      }
    });
  }
}
