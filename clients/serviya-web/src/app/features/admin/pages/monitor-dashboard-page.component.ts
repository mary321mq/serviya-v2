import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AdminMonitorService } from '../services/admin-monitor.service';
import { MonitorDashboardStats } from '../models/monitor.model';

@Component({
  selector: 'app-monitor-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="dashboard-wrapper">
      <div class="header-section">
        <div>
          <h1 class="page-title">Dashboard Principal</h1>
          <p class="page-subtitle">Visión general del flujo End-to-End y rendimiento financiero.</p>
        </div>
        <button class="btn-primary" (click)="loadData()">
          <lucide-icon name="refresh-cw" [size]="16" [class.spinning]="loading"></lucide-icon> Actualizar
        </button>
      </div>

      <!-- Financial Metrics -->
      <h2 class="section-title">Finanzas</h2>
      <div class="metrics-grid">
        <div class="metric-card finance">
          <div class="mc-icon sales"><lucide-icon name="trending-up" [size]="24"></lucide-icon></div>
          <div class="mc-info">
            <span class="mc-label">Ventas Totales (Suma Total)</span>
            <span class="mc-value">S/ {{ totalRevenue | number:'1.2-2' }}</span>
          </div>
        </div>
        <div class="metric-card finance">
          <div class="mc-icon profit"><lucide-icon name="wallet" [size]="24"></lucide-icon></div>
          <div class="mc-info">
            <span class="mc-label">Ganancias por Comisiones</span>
            <span class="mc-value text-green">S/ {{ totalCommissions | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Operational Metrics -->
      <h2 class="section-title mt-6">Operaciones</h2>
      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card primary">
          <div class="stat-header">
            <h3>Solicitudes Activas</h3>
            <lucide-icon name="activity" [size]="18"></lucide-icon>
          </div>
          <div class="value">{{ stats.activeRequests }}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-header">
            <h3>Solicitudes Completadas</h3>
            <lucide-icon name="check-circle" [size]="18"></lucide-icon>
          </div>
          <div class="value">{{ stats.completedRequests }}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-header">
            <h3>Pagos Capturados</h3>
            <lucide-icon name="credit-card" [size]="18"></lucide-icon>
          </div>
          <div class="value">{{ stats.totalPayments }}</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-header">
            <h3>Eventos Fallidos</h3>
            <lucide-icon name="alert-triangle" [size]="18"></lucide-icon>
          </div>
          <div class="value">{{ stats.failedEvents }}</div>
        </div>
      </div>

      <div class="quick-links">
        <h2 class="section-title">Accesos Rápidos</h2>
        <div class="links-grid">
          <a routerLink="/admin/solicitudes" class="quick-link-card">
            <lucide-icon name="list" [size]="20"></lucide-icon> Ver Todas las Solicitudes
          </a>
          <a routerLink="/admin/eventos" class="quick-link-card">
            <lucide-icon name="activity" [size]="20"></lucide-icon> Buscar Eventos por Traza
          </a>
          <a routerLink="/admin/pagos" class="quick-link-card">
            <lucide-icon name="credit-card" [size]="20"></lucide-icon> Ver Pagos y Transacciones
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { display: flex; flex-direction: column; gap: 24px; width: 100%; height: 100%; padding-bottom: 40px; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-end; }
    .page-title { margin: 0 0 6px 0; font-size: 1.8rem; font-weight: 700; color: var(--text-primary); }
    .page-subtitle { margin: 0; color: var(--text-secondary); font-size: 0.95rem; }
    .section-title { font-size: 1.2rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0; margin-top: 10px; }
    .mt-6 { margin-top: 24px; }
    
    .btn-primary { background: #3B82F6; border: none; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
    .btn-primary:hover { background: #2563EB; }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Financial Metrics */
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .metric-card.finance { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .mc-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .mc-icon.sales { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
    .mc-icon.profit { background: rgba(34, 197, 94, 0.1); color: #22C55E; }
    .mc-info { display: flex; flex-direction: column; gap: 4px; }
    .mc-label { color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; }
    .mc-value { color: var(--text-primary); font-size: 1.8rem; font-weight: 700; line-height: 1.1; }
    .text-green { color: #22C55E; }

    /* Operational Metrics */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
    .stat-card { padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); background: var(--surface-1); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; color: var(--text-secondary); }
    .stat-header h3 { font-size: 0.95rem; font-weight: 600; margin: 0; }
    .stat-card .value { font-size: 2.2rem; font-weight: 700; color: var(--text-primary); }
    
    .primary .stat-header { color: #3B82F6; }
    .success .stat-header { color: #22C55E; }
    .warning .stat-header { color: #F59E0B; }
    .danger .stat-header { color: #EF4444; }

    /* Quick Links */
    .quick-links { margin-top: 10px; }
    .links-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-top: 16px; }
    .quick-link-card { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--surface-2); border: 1px solid var(--border-color); border-radius: 8px; text-decoration: none; color: var(--text-primary); font-weight: 500; transition: 0.2s; }
    .quick-link-card:hover { background: var(--surface-3); border-color: #3B82F6; color: #3B82F6; transform: translateY(-2px); }
  `]
})
export class MonitorDashboardPageComponent implements OnInit {
  private service = inject(AdminMonitorService);

  stats: MonitorDashboardStats | null = null;
  totalRevenue = 0;
  totalCommissions = 0;
  loading = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getDashboardStats().subscribe({
      next: (res) => this.stats = res,
      error: (err) => console.error(err)
    });

    this.service.getCapturedPayments().subscribe({
      next: (payments) => {
        this.totalRevenue = payments.reduce((sum, p) => sum + p.montoTotal, 0);
        this.totalCommissions = payments.reduce((sum, p) => sum + p.comisionServiya, 0);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
