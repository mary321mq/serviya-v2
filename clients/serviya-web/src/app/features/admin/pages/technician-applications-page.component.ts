import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import { EstadoTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { AdminTechnicianService, TechnicianApplication } from '../services/admin-technician.service';

@Component({
  selector: 'app-technician-applications-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="catalog-container">
      <div class="header-section">
        <div>
          <h1>Postulaciones de Técnicos</h1>
          <p>Gestiona y revisa las solicitudes para trabajar como técnico.</p>
        </div>
        <button class="primary-button add-button" (click)="openCreateModal()">
          <lucide-icon name="plus" [size]="18"></lucide-icon> Nueva Postulación
        </button>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon orange"><lucide-icon name="clock" [size]="24"></lucide-icon></div>
          <div class="stat-content">
            <span class="stat-label">Pendientes</span>
            <span class="stat-value">{{ pendingCount }}</span>
            <span class="stat-desc">Por revisar</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><lucide-icon name="check" [size]="24"></lucide-icon></div>
          <div class="stat-content">
            <span class="stat-label">Aprobadas</span>
            <span class="stat-value">{{ approvedCount }}</span>
            <span class="stat-desc">Contratadas</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><lucide-icon name="x" [size]="24"></lucide-icon></div>
          <div class="stat-content">
            <span class="stat-label">Rechazadas</span>
            <span class="stat-value">{{ rejectedCount }}</span>
            <span class="stat-desc">No cumplen requisitos</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><lucide-icon name="users" [size]="24"></lucide-icon></div>
          <div class="stat-content">
            <span class="stat-label">Total</span>
            <span class="stat-value">{{ totalCount }}</span>
            <span class="stat-desc">Postulaciones</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-box">
          <lucide-icon name="search" [size]="18" class="search-icon"></lucide-icon>
          <input type="text" placeholder="Buscar por nombre, correo o DNI..." [(ngModel)]="searchTerm">
        </div>
        
        <div class="filter-group">
          <label>Filtrar por estado</label>
          <select class="dark-select" [(ngModel)]="statusFilter">
            <option value="ALL">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="APPROVED">Aprobada</option>
            <option value="REJECTED">Rechazada</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Filtrar por especialidad</label>
          <select class="dark-select" [(ngModel)]="specialtyFilter">
            <option value="ALL">Todas</option>
            <option *ngFor="let cat of specialties" [value]="cat">{{ cat }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Ordenar por</label>
          <select class="dark-select" [(ngModel)]="sortBy">
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguas</option>
          </select>
        </div>

        <button class="btn-outline clear-btn" (click)="clearFilters()">
          <lucide-icon name="rotate-ccw" [size]="16"></lucide-icon> Limpiar filtros
        </button>
      </div>

      <!-- Table -->
      <div class="list-panel">
        <div class="table-responsive">
          <table class="dark-table">
            <thead>
              <tr>
                <th>POSTULANTE</th>
                <th>ESPECIALIDAD</th>
                <th>CONTACTO</th>
                <th>ESTADO</th>
                <th>FECHA POSTULACIÓN</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading">
                <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-secondary);">Cargando postulaciones...</td>
              </tr>
              <tr *ngIf="!loading && paginatedApps.length === 0">
                <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-secondary);">No se encontraron postulaciones.</td>
              </tr>
              <tr *ngFor="let app of paginatedApps">
                <td>
                  <div class="user-cell">
                     <div class="user-avatar">
                       <img src="https://ui-avatars.com/api/?name={{app.fullName}}&background=1E90FF&color=fff&size=80" />
                     </div>
                     <div class="user-info">
                       <span class="user-name">{{ app.fullName }}</span>
                       <span class="user-dni">DNI: {{ getMockDni(app) }}</span>
                     </div>
                  </div>
                </td>
                <td>
                   <div class="specialty-cell">
                     <lucide-icon [name]="getSpecialtyIcon(app.categorias)" [size]="16" [color]="getSpecialtyColor(app.categorias)"></lucide-icon>
                     <span>{{ getPrimaryCategory(app.categorias) }}</span>
                   </div>
                </td>
                <td>
                   <div class="contact-info">
                     <span class="email-text">{{ getMockEmail(app) }}</span>
                     <span class="phone-text">{{ app.phone || 'No registrado' }}</span>
                   </div>
                </td>
                <td>
                   <span class="status-badge" 
                     [class.active]="app.estado === 'APPROVED'" 
                     [class.inactive]="app.estado === 'REJECTED'"
                     [class.warning]="canReview(app.estado)">
                     <span class="dot"></span> 
                     {{ app.estado === 'APPROVED' ? 'Aprobada' : (app.estado === 'REJECTED' ? 'Rechazada' : 'Pendiente') }}
                   </span>
                </td>
                <td>
                   <div class="date-cell">
                     <span>{{ getMockDate(app) }}</span>
                     <span class="time-text">{{ getMockTime(app) }}</span>
                   </div>
                </td>
                <td>
                   <div class="actions-cell">
                     <button class="icon-btn btn-view" (click)="viewDetails(app.id)" title="Revisar">
                       <lucide-icon name="eye" [size]="16"></lucide-icon>
                     </button>
                     <button class="icon-btn btn-approve" *ngIf="canReview(app.estado)" (click)="approve(app.id)" title="Aprobar">
                       <lucide-icon name="check" [size]="16"></lucide-icon>
                     </button>
                     <button class="icon-btn btn-reject" *ngIf="canReview(app.estado)" (click)="reject(app.id)" title="Rechazar">
                       <lucide-icon name="x" [size]="16"></lucide-icon>
                     </button>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" *ngIf="!loading && filteredApps.length > 0">
           <span class="page-info">Mostrando {{ startItem }} a {{ endItem }} de {{ filteredApps.length }} postulaciones</span>
           <div class="pagination-controls">
             <button class="page-btn" (click)="prevPage()" [disabled]="currentPage === 1"><lucide-icon name="chevron-left" [size]="16"></lucide-icon></button>
             <button class="page-btn" *ngFor="let p of pages" [class.active]="currentPage === p" (click)="goToPage(p)">{{ p }}</button>
             <button class="page-btn" (click)="nextPage()" [disabled]="currentPage === totalPages"><lucide-icon name="chevron-right" [size]="16"></lucide-icon></button>
           </div>
           <div class="items-per-page">
             <select class="dark-select small-select" [(ngModel)]="itemsPerPage" (change)="currentPage = 1">
               <option [value]="6">6 por página</option>
               <option [value]="10">10 por página</option>
               <option [value]="20">20 por página</option>
             </select>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalog-container { padding: 24px; width: 100%; box-sizing: border-box; }
    
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header-section h1 { font-size: 1.8rem; margin: 0 0 4px 0; color: var(--text-primary); }
    .header-section p { margin: 0; color: var(--text-secondary); font-size: 0.95rem; }
    
    .add-button { display: flex; align-items: center; gap: 8px; background: var(--accent-600); color: white; box-shadow: 0 4px 15px rgba(249,115,22, 0.3); border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .add-button:hover { background: var(--accent-neon); box-shadow: var(--glow-orange); transform: translateY(-2px); }

    /* Stats Row */
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: 0.2s; }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.1); }
    .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-icon.orange { background: rgba(249,115,22,0.1); color: #F97316; border: 1px solid rgba(249,115,22,0.3); box-shadow: 0 0 15px rgba(249,115,22,0.1) inset; }
    .stat-icon.green { background: rgba(34,197,94,0.1); color: #22C55E; border: 1px solid rgba(34,197,94,0.3); box-shadow: 0 0 15px rgba(34,197,94,0.1) inset; }
    .stat-icon.red { background: rgba(239,68,68,0.1); color: #EF4444; border: 1px solid rgba(239,68,68,0.3); box-shadow: 0 0 15px rgba(239,68,68,0.1) inset; }
    .stat-icon.blue { background: rgba(30,144,255,0.1); color: #1E90FF; border: 1px solid rgba(30,144,255,0.3); box-shadow: 0 0 15px rgba(30,144,255,0.1) inset; }
    .stat-content { display: flex; flex-direction: column; overflow: hidden; }
    .stat-label { font-size: 0.8rem; color: #F97316; font-weight: 600; margin-bottom: 2px; }
    .stat-card:nth-child(2) .stat-label { color: #22C55E; }
    .stat-card:nth-child(3) .stat-label { color: #EF4444; }
    .stat-card:nth-child(4) .stat-label { color: #1E90FF; }
    .stat-value { font-size: 1.6rem; font-weight: 700; color: var(--text-primary); margin: 0; line-height: 1.1; }
    .stat-desc { font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }

    /* Filters Section */
    .filters-section { display: flex; gap: 12px; margin-bottom: 20px; align-items: flex-end; }
    .search-box { flex: 2; position: relative; display: flex; align-items: center; margin-bottom: 1px; }
    .search-icon { position: absolute; left: 16px; color: var(--text-secondary); }
    .search-box input { width: 100%; background: var(--surface-1); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 16px 10px 42px; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; transition: 0.2s; }
    .search-box input:focus { border-color: var(--primary-neon); box-shadow: 0 0 10px rgba(30,144,255,0.2); }
    
    .filter-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .filter-group label { font-size: 0.75rem; color: var(--text-secondary); padding-left: 4px; }
    .dark-select { background: var(--surface-1); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 40px 10px 16px; border-radius: 8px; outline: none; font-family: inherit; font-size: 0.9rem; appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px; transition: 0.2s; cursor: pointer; }
    .dark-select:focus { border-color: var(--primary-neon); box-shadow: 0 0 10px rgba(30,144,255,0.2); }
    
    .clear-btn { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 10px 16px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: 500; display: flex; align-items: center; gap: 8px; margin-bottom: 1px; }
    .clear-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); border-color: rgba(255,255,255,0.2); }

    /* Table Styles */
    .list-panel { background: var(--surface-1); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 25px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .dark-table { width: 100%; border-collapse: collapse; text-align: left; }
    .dark-table th { background: rgba(255,255,255,0.02); padding: 16px 20px; font-weight: 600; color: #38BDF8; border-bottom: 1px solid var(--border-color); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
    .dark-table td { padding: 16px 20px; vertical-align: middle; border-bottom: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.9rem; }
    .dark-table tbody tr { transition: background 0.2s; }
    .dark-table tbody tr:hover { background: rgba(255,255,255,0.02); }
    .dark-table tbody tr:last-child td { border-bottom: none; }
    
    .user-cell { display: flex; align-items: center; gap: 12px; }
    .user-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: var(--surface-2); display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); flex-shrink: 0; }
    .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-weight: 600; letter-spacing: 0.2px; white-space: nowrap; }
    .user-dni { font-size: 0.75rem; color: #60A5FA; }
    
    .specialty-cell { display: flex; align-items: center; gap: 8px; font-weight: 500; }
    
    .contact-info { display: flex; flex-direction: column; gap: 2px; }
    .email-text { color: var(--text-primary); }
    .phone-text { font-size: 0.8rem; color: var(--text-secondary); }
    
    .date-cell { display: flex; flex-direction: column; gap: 2px; }
    .time-text { font-size: 0.8rem; color: var(--text-secondary); }

    /* Status Badge */
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
    .status-badge .dot { width: 6px; height: 6px; border-radius: 50%; }
    .status-badge.active { color: var(--success); border: 1px solid var(--success); background: rgba(34, 197, 94, 0.1); }
    .status-badge.active .dot { background: var(--success); box-shadow: 0 0 5px var(--success); }
    .status-badge.inactive { color: var(--error); border: 1px solid var(--error); background: rgba(239, 68, 68, 0.1); }
    .status-badge.inactive .dot { background: var(--error); box-shadow: 0 0 5px var(--error); }
    .status-badge.warning { color: #F59E0B; border: 1px solid #F59E0B; background: rgba(245, 158, 11, 0.1); }
    .status-badge.warning .dot { background: #F59E0B; box-shadow: 0 0 5px #F59E0B; }

    /* Actions */
    .actions-cell { display: flex; gap: 8px; }
    .icon-btn { width: 36px; height: 36px; border-radius: 8px; background: transparent; border: 1px solid; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .btn-view { color: #3B82F6; border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.05); }
    .btn-view:hover { background: rgba(59,130,246,0.15); box-shadow: 0 0 10px rgba(59,130,246,0.2); }
    .btn-approve { color: #22C55E; border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.05); }
    .btn-approve:hover { background: rgba(34,197,94,0.15); box-shadow: 0 0 10px rgba(34,197,94,0.2); }
    .btn-reject { color: #EF4444; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }
    .btn-reject:hover { background: rgba(239,68,68,0.15); box-shadow: 0 0 10px rgba(239,68,68,0.2); }

    /* Pagination */
    .pagination-container { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-top: 1px solid var(--border-color); background: var(--surface-1); }
    .page-info { color: var(--text-secondary); font-size: 0.85rem; }
    .pagination-controls { display: flex; gap: 4px; }
    .page-btn { background: var(--surface-2); border: 1px solid var(--border-color); color: var(--text-primary); width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.9rem; transition: 0.2s; }
    .page-btn:hover:not([disabled]) { background: var(--surface-3); border-color: var(--primary-600); }
    .page-btn.active { background: var(--primary-600); color: white; border-color: var(--primary-neon); box-shadow: 0 0 10px rgba(30,144,255,0.3); }
    .page-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .small-select { padding: 6px 36px 6px 12px; font-size: 0.85rem; }
  `]
})
export class TechnicianApplicationsPageComponent implements OnInit {
  applications: TechnicianApplication[] = [];
  loading = true;
  
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;
  
  searchTerm = '';
  statusFilter = 'ALL';
  specialtyFilter = 'ALL';
  sortBy = 'recent';
  
  currentPage = 1;
  itemsPerPage = 6;
  
  specialties: string[] = [];

  private service = inject(AdminTechnicianService);
  private router = inject(Router);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAllApplications().subscribe({
      next: (data) => {
        this.applications = data.filter(app => app.estado !== 'DRAFT');

        this.pendingCount = this.applications.filter(a => this.canReview(a.estado)).length;
        this.approvedCount = this.applications.filter(a => a.estado === 'APPROVED').length;
        this.rejectedCount = this.applications.filter(a => a.estado === 'REJECTED').length;
        
        const specs = new Set<string>();
        this.applications.forEach(a => {
          if (a.categorias) {
            a.categorias.split(',').forEach(c => specs.add(c.trim()));
          }
        });
        this.specialties = Array.from(specs).filter(s => !!s);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading applications:', err);
        this.loading = false;
      }
    });
  }
  
  get totalCount() { return this.applications.length; }

  get filteredApps() {
    let result = this.applications;
    
    if (this.statusFilter !== 'ALL') {
      if (this.statusFilter === 'PENDING') {
        result = result.filter(a => this.canReview(a.estado));
      } else {
        result = result.filter(a => a.estado === this.statusFilter);
      }
    }
    
    if (this.specialtyFilter !== 'ALL') {
      result = result.filter(a => (a.categorias || '').includes(this.specialtyFilter));
    }
    
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(a => 
        (a.fullName || '').toLowerCase().includes(term) ||
        (this.getMockEmail(a).toLowerCase().includes(term)) ||
        (this.getMockDni(a).includes(term))
      );
    }
    
    result = [...result].sort((a, b) => {
      if (this.sortBy === 'recent') {
        return b.id - a.id;
      } else {
        return a.id - b.id;
      }
    });
    
    return result;
  }

  get paginatedApps() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredApps.slice(start, start + this.itemsPerPage);
  }

  get totalPages() { return Math.ceil(this.filteredApps.length / this.itemsPerPage) || 1; }
  get pages() { return Array.from({length: this.totalPages}, (_, i) => i + 1); }
  get startItem() { return this.filteredApps.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1; }
  get endItem() { return Math.min(this.currentPage * this.itemsPerPage, this.filteredApps.length); }

  goToPage(p: number) { this.currentPage = p; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.specialtyFilter = 'ALL';
    this.sortBy = 'recent';
    this.currentPage = 1;
  }

  getMockDni(app: TechnicianApplication): string {
    let num = (app.id * 1234567).toString();
    while (num.length < 8) num = '7' + num;
    return num.substring(0, 8);
  }
  
  getMockEmail(app: TechnicianApplication): string {
    const firstName = app.fullName.split(' ')[0]?.toLowerCase() || 'usuario';
    const lastName = app.fullName.split(' ')[1]?.toLowerCase() || 'test';
    return `${firstName}.${lastName}@gmail.com`;
  }
  
  getMockDate(app: TechnicianApplication): string {
    const d = new Date();
    d.setDate(d.getDate() - (app.id % 15));
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  
  getMockTime(app: TechnicianApplication): string {
    const d = new Date();
    d.setHours(9 + (app.id % 8), (app.id * 15) % 60);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  
  getPrimaryCategory(cats: string): string {
    if (!cats) return 'General';
    return cats.split(',')[0].trim();
  }
  
  getSpecialtyIcon(cats: string): string {
    const cat = this.getPrimaryCategory(cats).toLowerCase();
    if (cat.includes('gasf')) return 'droplet';
    if (cat.includes('elect')) return 'zap';
    if (cat.includes('const')) return 'home';
    if (cat.includes('pint')) return 'code'; 
    if (cat.includes('carp')) return 'wrench'; 
    if (cat.includes('sold')) return 'zap'; 
    return 'wrench';
  }
  
  getSpecialtyColor(cats: string): string {
    const cat = this.getPrimaryCategory(cats).toLowerCase();
    if (cat.includes('gasf')) return '#3B82F6'; 
    if (cat.includes('elect')) return '#F59E0B'; 
    if (cat.includes('const')) return '#8B5CF6'; 
    if (cat.includes('pint')) return '#10B981'; 
    if (cat.includes('carp')) return '#F59E0B'; 
    if (cat.includes('sold')) return '#3B82F6'; 
    return '#94A3B8'; 
  }

  protected canReview(status: string): boolean {
    return status === 'PENDING' || status === 'SUBMITTED' || status === 'UNDER_REVIEW';
  }

  viewDetails(id: number): void {
    this.router.navigate(['/admin/tecnicos/postulaciones', id]);
  }

  approve(id: number): void {
    if (confirm('Seguro que deseas aprobar esta postulacion?')) {
      this.service.approveApplication(id.toString()).subscribe(() => this.load());
    }
  }

  reject(id: number): void {
    const reason = prompt('Motivo de rechazo:');
    if (reason) {
      this.service.rejectApplication(id.toString(), reason).subscribe(() => this.load());
    }
  }

  openCreateModal() {
    alert('Esta funcionalidad está en desarrollo. Los técnicos deben postularse desde la aplicación de técnicos.');
  }
}
