import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AdminReportsService, DashboardStats } from '../services/admin-reports.service';

@Component({
  selector: 'app-admin-reports-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="catalog-container">
      <div class="header-section">
        <div>
          <h1 class="page-title">Reportes</h1>
          <p class="page-subtitle">Visualiza estadísticas y métricas clave del sistema.</p>
        </div>
        <div class="header-actions">
          <div class="date-picker-mock">
            <lucide-icon name="calendar" [size]="16"></lucide-icon>
            13 may. 2024 - 19 may. 2024
            <lucide-icon name="chevron-down" [size]="16"></lucide-icon>
          </div>
          <button class="btn-outline-action">
            <lucide-icon name="download" [size]="16"></lucide-icon> Exportar
          </button>
        </div>
      </div>

      <!-- Tabs mock -->
      <div class="tabs-nav">
        <a href="javascript:void(0)" class="tab active">Resumen</a>
        <a href="javascript:void(0)" class="tab">Usuarios</a>
        <a href="javascript:void(0)" class="tab">Trabajadores</a>
        <a href="javascript:void(0)" class="tab">Servicios</a>
        <a href="javascript:void(0)" class="tab">Postulaciones</a>
        <a href="javascript:void(0)" class="tab">Actividades</a>
      </div>

      <ng-container *ngIf="stats; else loading">
        
        <!-- Top Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="icon-box blue"><lucide-icon name="users" [size]="20"></lucide-icon></div>
            <div class="stat-info">
              <span class="stat-label">Usuarios Totales</span>
              <div class="stat-value-row">
                <strong class="stat-number">{{ stats.usuariosTotales }}</strong>
                <span class="stat-trend positive">↑ 12.5% vs semana anterior</span>
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="icon-box green"><lucide-icon name="user-check" [size]="20"></lucide-icon></div>
            <div class="stat-info">
              <span class="stat-label">Trabajadores Activos</span>
              <div class="stat-value-row">
                <strong class="stat-number">{{ stats.trabajadoresActivos }}</strong>
                <span class="stat-trend positive">↑ 9.1% vs semana anterior</span>
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="icon-box purple"><lucide-icon name="clipboard" [size]="20"></lucide-icon></div>
            <div class="stat-info">
              <span class="stat-label">Servicios Publicados</span>
              <div class="stat-value-row">
                <strong class="stat-number">{{ stats.serviciosPublicados }}</strong>
                <span class="stat-trend positive">↑ 15.3% vs semana anterior</span>
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="icon-box orange"><lucide-icon name="clipboard-check" [size]="20"></lucide-icon></div>
            <div class="stat-info">
              <span class="stat-label">Postulaciones</span>
              <div class="stat-value-row">
                <strong class="stat-number">{{ stats.postulacionesTotales }}</strong>
                <span class="stat-trend positive">↑ 18.8% vs semana anterior</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters mock -->
        <div class="filters-row">
          <div class="filter-group">
            <label>Rango de fechas</label>
            <div class="select-mock">
              <lucide-icon name="calendar" [size]="14"></lucide-icon> 13 may. 2024 - 19 may. 2024 <lucide-icon name="chevron-down" [size]="14" class="ml-auto"></lucide-icon>
            </div>
          </div>
          <div class="filter-group">
            <label>Categoría</label>
            <div class="select-mock">Todas <lucide-icon name="chevron-down" [size]="14" class="ml-auto"></lucide-icon></div>
          </div>
          <div class="filter-group">
            <label>Servicio</label>
            <div class="select-mock">Todos <lucide-icon name="chevron-down" [size]="14" class="ml-auto"></lucide-icon></div>
          </div>
          <div class="filter-group">
            <label>Técnico</label>
            <div class="select-mock">Todos <lucide-icon name="chevron-down" [size]="14" class="ml-auto"></lucide-icon></div>
          </div>
          <button class="btn-clear"><lucide-icon name="rotate-ccw" [size]="14"></lucide-icon> Limpiar filtros</button>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <!-- Line Chart -->
          <div class="chart-card line-chart-card">
            <div class="chart-header">
              <h3>Postulaciones por día <lucide-icon name="info" [size]="14" class="text-muted"></lucide-icon></h3>
            </div>
            <div class="chart-body">
              <svg viewBox="0 0 500 200" class="svg-line-chart">
                <!-- Grid Lines -->
                <line x1="0" y1="20" x2="500" y2="20" class="grid-line" />
                <line x1="0" y1="60" x2="500" y2="60" class="grid-line" />
                <line x1="0" y1="100" x2="500" y2="100" class="grid-line" />
                <line x1="0" y1="140" x2="500" y2="140" class="grid-line" />
                <line x1="0" y1="180" x2="500" y2="180" class="grid-line" />
                
                <!-- Y Axis Labels -->
                <text x="0" y="24" class="axis-label">10</text>
                <text x="0" y="64" class="axis-label">8</text>
                <text x="0" y="104" class="axis-label">6</text>
                <text x="0" y="144" class="axis-label">4</text>
                <text x="0" y="184" class="axis-label">2</text>
                <text x="0" y="195" class="axis-label" style="transform: translateY(10px)">0</text>
                
                <!-- Polyline Data -->
                <polyline [attr.points]="generateLinePoints()" fill="none" stroke="#3B82F6" stroke-width="3" />
                
                <!-- Data Points and X-Axis Labels -->
                <g *ngFor="let p of stats.postulacionesPorDia; let i = index">
                  <circle [attr.cx]="getX(i)" [attr.cy]="getY(p.count)" r="4" fill="#3B82F6" stroke="var(--surface-1)" stroke-width="2" />
                  <text [attr.x]="getX(i)" y="195" class="axis-label x-label" text-anchor="middle" style="transform: translateY(15px)">{{ getShortDate(p.date) }}</text>
                </g>
              </svg>
            </div>
          </div>
          
          <!-- Donut Chart -->
          <div class="chart-card pie-chart-card">
            <div class="chart-header">
              <h3>Postulaciones por estado <lucide-icon name="info" [size]="14" class="text-muted"></lucide-icon></h3>
            </div>
            <div class="chart-body flex-row">
              <div class="pie-container">
                <svg viewBox="0 0 100 100" class="svg-pie">
                  <!-- Simplified representation with stroke-dasharray (CSS Conic would be better but this is pure SVG) -->
                  <!-- Pending (Blue) -->
                  <circle cx="50" cy="50" r="30" fill="transparent" stroke="#3B82F6" stroke-width="20" [attr.stroke-dasharray]="getDash(stats.postulacionesPorEstado.pendientes)" [attr.stroke-dashoffset]="0" />
                  <!-- Approved (Green) -->
                  <circle cx="50" cy="50" r="30" fill="transparent" stroke="#22C55E" stroke-width="20" [attr.stroke-dasharray]="getDash(stats.postulacionesPorEstado.aprobadas)" [attr.stroke-dashoffset]="getOffset(stats.postulacionesPorEstado.pendientes)" />
                  <!-- Rejected (Red) -->
                  <circle cx="50" cy="50" r="30" fill="transparent" stroke="#EF4444" stroke-width="20" [attr.stroke-dasharray]="getDash(stats.postulacionesPorEstado.rechazadas)" [attr.stroke-dashoffset]="getOffset(stats.postulacionesPorEstado.pendientes + stats.postulacionesPorEstado.aprobadas)" />
                  <!-- Inner hole -->
                  <circle cx="50" cy="50" r="20" fill="var(--surface-1)" />
                </svg>
              </div>
              <div class="legend-container">
                <div class="legend-item">
                  <div class="legend-dot bg-blue"></div>
                  <span class="legend-text">Pendientes</span>
                  <strong class="legend-val">{{ stats.postulacionesPorEstado.pendientes }} ({{ getPerc(stats.postulacionesPorEstado.pendientes) }}%)</strong>
                </div>
                <div class="legend-item">
                  <div class="legend-dot bg-green"></div>
                  <span class="legend-text">Aprobadas</span>
                  <strong class="legend-val">{{ stats.postulacionesPorEstado.aprobadas }} ({{ getPerc(stats.postulacionesPorEstado.aprobadas) }}%)</strong>
                </div>
                <div class="legend-item">
                  <div class="legend-dot bg-red"></div>
                  <span class="legend-text">Rechazadas</span>
                  <strong class="legend-val">{{ stats.postulacionesPorEstado.rechazadas }} ({{ getPerc(stats.postulacionesPorEstado.rechazadas) }}%)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="charts-row bottom-row">
          <!-- Top Services -->
          <div class="chart-card flex-1">
            <div class="chart-header">
              <h3>Servicios más solicitados <lucide-icon name="info" [size]="14" class="text-muted"></lucide-icon></h3>
            </div>
            <div class="chart-body p-0">
              <div class="service-bar-item" *ngFor="let s of stats.serviciosMasSolicitados; let i = index">
                <span class="s-index">{{ i + 1 }}</span>
                <div class="s-icon-box"><lucide-icon name="wrench" [size]="14"></lucide-icon></div>
                <span class="s-name">{{ s.name }}</span>
                <div class="s-bar-container">
                  <div class="s-bar-fill" [style.width.%]="(s.count / stats.serviciosMasSolicitados[0].count) * 100"></div>
                </div>
                <strong class="s-val">{{ s.count }}</strong>
              </div>
              
              <div class="center-btn">
                <button class="btn-outline">Ver todos los servicios</button>
              </div>
            </div>
          </div>
          
          <!-- Recent Activity -->
          <div class="chart-card flex-1">
            <div class="chart-header">
              <h3>Actividad reciente <lucide-icon name="info" [size]="14" class="text-muted"></lucide-icon></h3>
            </div>
            <div class="chart-body p-0">
              <div class="activity-header">
                <span>Actividad</span>
                <span>Usuario</span>
                <span>Fecha y hora</span>
              </div>
              <div class="activity-item" *ngFor="let act of stats.actividadReciente">
                <div class="act-col-1">
                  <lucide-icon [name]="getActIcon(act.type)" [size]="16" [class]="getActColor(act.type)"></lucide-icon>
                  <span [class]="getActColor(act.type)">{{ act.text }}</span>
                </div>
                <div class="act-col-2">{{ act.user }}</div>
                <div class="act-col-3">{{ act.date | date:'dd MMM yyyy, hh:mm a' }}</div>
              </div>
              
              <div class="center-btn" style="margin-top: auto;">
                <button class="btn-outline">Ver todas las actividades</button>
              </div>
            </div>
          </div>
        </div>

      </ng-container>
      
      <ng-template #loading>
        <div class="loading-state">
          <lucide-icon name="loader" class="spinner" [size]="32" color="#3B82F6"></lucide-icon>
          <p>Cargando métricas...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .catalog-container { width: 100%; display: flex; flex-direction: column; gap: 24px; padding-bottom: 40px; }
    
    .header-section { display: flex; justify-content: space-between; align-items: flex-end; }
    .page-title { margin: 0 0 6px 0; font-size: 1.8rem; font-weight: 700; color: var(--text-primary); }
    .page-subtitle { margin: 0; color: var(--text-secondary); font-size: 0.95rem; }
    
    .header-actions { display: flex; gap: 16px; align-items: center; }
    .date-picker-mock { display: flex; align-items: center; gap: 10px; background: var(--surface-1); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 8px; color: var(--text-primary); font-size: 0.9rem; }
    .btn-outline-action { background: transparent; border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 8px; color: #3B82F6; display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn-outline-action:hover { background: rgba(59,130,246,0.1); }
    
    /* Tabs */
    .tabs-nav { display: flex; gap: 32px; border-bottom: 1px solid var(--border-color); margin-bottom: 8px; }
    .tab { color: var(--text-secondary); text-decoration: none; padding: 12px 0; font-size: 0.95rem; font-weight: 500; border-bottom: 2px solid transparent; transition: 0.2s; }
    .tab:hover { color: var(--text-primary); }
    .tab.active { color: #3B82F6; border-bottom-color: #3B82F6; }
    
    /* Stats Grid */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .stat-card { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; gap: 16px; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .icon-box.blue { background: rgba(59,130,246,0.15); color: #3B82F6; }
    .icon-box.green { background: rgba(34,197,94,0.15); color: #22C55E; }
    .icon-box.purple { background: rgba(168,85,247,0.15); color: #A855F7; }
    .icon-box.orange { background: rgba(249,115,22,0.15); color: #F97316; }
    
    .stat-info { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .stat-label { color: var(--text-secondary); font-size: 0.85rem; font-weight: 500; }
    .stat-value-row { display: flex; flex-direction: column; gap: 4px; }
    .stat-number { font-size: 1.6rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
    .stat-trend { font-size: 0.75rem; font-weight: 600; }
    .stat-trend.positive { color: #22C55E; }
    
    /* Filters */
    .filters-row { display: flex; gap: 16px; align-items: flex-end; margin-top: 8px; }
    .filter-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .filter-group label { color: var(--text-secondary); font-size: 0.8rem; font-weight: 500; }
    .select-mock { display: flex; align-items: center; gap: 8px; background: var(--surface-1); border: 1px solid var(--border-color); padding: 10px 14px; border-radius: 8px; color: var(--text-primary); font-size: 0.9rem; cursor: pointer; }
    .ml-auto { margin-left: auto; }
    .btn-clear { background: transparent; border: 1px solid var(--border-color); padding: 10px 16px; border-radius: 8px; color: var(--text-primary); display: flex; align-items: center; gap: 8px; font-weight: 500; cursor: pointer; transition: 0.2s; white-space: nowrap; height: 42px; }
    .btn-clear:hover { background: var(--surface-2); }
    
    /* Charts */
    .charts-row { display: flex; gap: 24px; margin-top: 12px; }
    .chart-card { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 4px 12px rgba(0,0,0,0.2); overflow: hidden; }
    .line-chart-card { flex: 2; }
    .pie-chart-card { flex: 1; }
    .flex-1 { flex: 1; display: flex; flex-direction: column; }
    
    .chart-header { padding: 20px; border-bottom: 1px solid var(--border-color); }
    .chart-header h3 { margin: 0; font-size: 1.05rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
    .chart-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
    .chart-body.flex-row { flex-direction: row; align-items: center; gap: 24px; }
    .chart-body.p-0 { padding: 0; }
    
    /* Line Chart SVG */
    .svg-line-chart { width: 100%; height: auto; display: block; overflow: visible; }
    .grid-line { stroke: var(--border-color); stroke-width: 1; stroke-dasharray: 4 4; }
    .axis-label { fill: var(--text-secondary); font-size: 12px; }
    
    /* Pie Chart SVG */
    .pie-container { flex: 1; display: flex; justify-content: center; position: relative; }
    .svg-pie { width: 140px; height: 140px; transform: rotate(-90deg); }
    
    .legend-container { display: flex; flex-direction: column; gap: 16px; flex: 1; }
    .legend-item { display: flex; align-items: center; gap: 12px; }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; }
    .bg-blue { background: #3B82F6; }
    .bg-green { background: #22C55E; }
    .bg-red { background: #EF4444; }
    .legend-text { color: var(--text-primary); font-size: 0.9rem; flex: 1; }
    .legend-val { color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; }
    
    /* Top Services */
    .service-bar-item { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border-color); }
    .s-index { color: var(--text-secondary); font-size: 0.9rem; width: 12px; text-align: center; }
    .s-icon-box { background: rgba(59,130,246,0.1); color: #3B82F6; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .s-name { color: var(--text-primary); font-size: 0.95rem; width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .s-bar-container { flex: 1; height: 6px; background: var(--surface-3); border-radius: 3px; overflow: hidden; }
    .s-bar-fill { height: 100%; background: #3B82F6; border-radius: 3px; }
    .s-val { color: var(--text-primary); font-weight: 600; font-size: 0.95rem; width: 24px; text-align: right; }
    
    .center-btn { padding: 20px; display: flex; justify-content: center; border-top: 1px solid var(--border-color); }
    .btn-outline { background: transparent; border: 1px solid var(--border-color); color: #3B82F6; padding: 8px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn-outline:hover { background: rgba(59,130,246,0.1); }
    
    /* Recent Activity */
    .activity-header { display: flex; padding: 12px 20px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.8rem; font-weight: 500; }
    .activity-header span:nth-child(1) { flex: 2; }
    .activity-header span:nth-child(2) { flex: 1.5; }
    .activity-header span:nth-child(3) { flex: 1; text-align: right; }
    
    .activity-item { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; }
    .act-col-1 { flex: 2; display: flex; align-items: center; gap: 10px; font-weight: 500; }
    .act-col-2 { flex: 1.5; color: var(--text-primary); }
    .act-col-3 { flex: 1; color: var(--text-secondary); text-align: right; font-size: 0.85rem; }
    
    .text-green { color: #22C55E; }
    .text-blue { color: #3B82F6; }
    .text-orange { color: #F97316; }
    .text-red { color: #EF4444; }
    .text-muted { color: var(--text-secondary); }
    
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px; gap: 16px; color: var(--text-secondary); }
    .spinner { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class AdminReportsPageComponent implements OnInit {
  private reportsService = inject(AdminReportsService);
  stats: DashboardStats | null = null;

  ngOnInit(): void {
    this.reportsService.getDashboardStats().subscribe({
      next: (data) => this.stats = data,
      error: (e) => console.error('Error fetching dashboard stats', e)
    });
  }

  // Chart Helpers
  getX(index: number): number {
    return 30 + (index * (460 / 6)); // evenly space 7 points
  }

  getY(count: number): number {
    // max Y = 10 -> height = 0 to 180 (inverted)
    // 10 -> 20, 0 -> 180
    const maxY = 10;
    const clamped = Math.min(Math.max(count, 0), maxY);
    return 180 - (clamped / maxY) * 160;
  }

  generateLinePoints(): string {
    if (!this.stats || !this.stats.postulacionesPorDia) return '';
    return this.stats.postulacionesPorDia.map((p, i) => `${this.getX(i)},${this.getY(p.count)}`).join(' ');
  }

  getShortDate(dateStr: string): string {
    return dateStr;
  }

  // Pie helpers (Total circumference = 2 * PI * r = 2 * 3.14159 * 30 = ~188.5)
  private readonly CIRCUMFERENCE = 188.5;

  getTotalPie(): number {
    if (!this.stats) return 1;
    const s = this.stats.postulacionesPorEstado;
    return (s.pendientes + s.aprobadas + s.rechazadas) || 1;
  }

  getDash(val: number): string {
    const perc = val / this.getTotalPie();
    return `${perc * this.CIRCUMFERENCE} ${this.CIRCUMFERENCE}`;
  }

  getOffset(previousSum: number): string {
    const perc = previousSum / this.getTotalPie();
    // Negative offset to move clockwise (since stroke-dashoffset pushes stroke backwards)
    return `-${perc * this.CIRCUMFERENCE}`;
  }

  getPerc(val: number): string {
    return ((val / this.getTotalPie()) * 100).toFixed(1);
  }

  // Activity helpers
  getActIcon(type: string): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'info': return 'file-text';
      case 'warning': return 'user-check';
      case 'danger': return 'x-circle';
      default: return 'bell';
    }
  }

  getActColor(type: string): string {
    switch (type) {
      case 'success': return 'text-green';
      case 'info': return 'text-blue';
      case 'warning': return 'text-orange';
      case 'danger': return 'text-red';
      default: return 'text-muted';
    }
  }
}
