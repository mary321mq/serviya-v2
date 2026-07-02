import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationCenterService } from '../../../core/notifications/notification-center.service';
import { AppNotification, isNotificationUnread } from '../../../core/notifications/app-notification.model';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="notifications-page-wrapper">
      <div class="header-section">
        <h1 class="page-title">Notificaciones</h1>
        <p class="page-subtitle">Mantente al día con las actividades importantes de tu cuenta y servicios.</p>
      </div>

      <!-- Tarjetas de métricas estilizadas -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-box blue">
            <lucide-icon name="bell" [size]="20"></lucide-icon>
          </div>
          <div class="metric-info">
            <span class="metric-label blue-text">No leídas</span>
            <strong class="metric-value">{{ unreadCount }}</strong>
            <span class="metric-desc">Requieren tu atención</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box green">
            <lucide-icon name="check-circle" [size]="20"></lucide-icon>
          </div>
          <div class="metric-info">
            <span class="metric-label green-text">Leídas</span>
            <strong class="metric-value">{{ readCount }}</strong>
            <span class="metric-desc">Historial de alertas</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box orange">
            <lucide-icon name="megaphone" [size]="20"></lucide-icon>
          </div>
          <div class="metric-info">
            <span class="metric-label orange-text">Importantes</span>
            <strong class="metric-value">{{ importantCount }}</strong>
            <span class="metric-desc">De alta prioridad</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon-box purple">
            <lucide-icon name="calendar" [size]="20"></lucide-icon>
          </div>
          <div class="metric-info">
            <span class="metric-label purple-text">Este mes</span>
            <strong class="metric-value">{{ thisMonthCount }}</strong>
            <span class="metric-desc">Recibidas recientemente</span>
          </div>
        </div>
      </div>

      <!-- Barra de controles / Toolbar -->
      <div class="toolbar">
        <div class="search-box">
          <lucide-icon name="search" [size]="16" class="search-icon"></lucide-icon>
          <input type="text" placeholder="Buscar notificación por título o mensaje..." [(ngModel)]="searchQuery" (input)="applyFilters()" />
        </div>
        
        <select class="dark-select" [(ngModel)]="categoryFilter" (change)="applyFilters()">
          <option value="ALL">Todas las categorías</option>
          <option value="APPLICATION">Postulaciones</option>
          <option value="TECHNICIAN">Técnicos</option>
          <option value="SERVICE">Servicios</option>
          <option value="SYSTEM">Sistema</option>
          <option value="USER">Usuarios</option>
        </select>
        
        <select class="dark-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
          <option value="ALL">Todos los estados</option>
          <option value="UNREAD">No leídas</option>
          <option value="READ">Leídas</option>
        </select>
        
        <button class="btn-primary-mark-read ml-auto" (click)="markAllAsRead()" [disabled]="unreadCount === 0">
          <lucide-icon name="check-check" [size]="16"></lucide-icon> Marcar todas como leídas
        </button>
      </div>

      <!-- Listado principal de notificaciones -->
      <div class="notifications-list-card">
        <ng-container *ngIf="paginatedNotifications.length > 0; else emptyState">
          <div class="notification-item" *ngFor="let n of paginatedNotifications" [class.is-unread]="isUnread(n)">
            <!-- Unread Indicator (Punto brillante) -->
            <div class="unread-dot-container">
              <div class="unread-dot" [class.active]="isUnread(n)"></div>
            </div>
            
            <!-- Icono decorativo -->
            <div class="n-icon-box" [ngClass]="getIconColorClass(n.type)">
              <lucide-icon [name]="getIconName(n.type)" [size]="20"></lucide-icon>
            </div>
            
            <!-- Contenido del mensaje -->
            <div class="n-content">
              <div class="n-header-row">
                <h4 class="n-title">{{ n.title }}</h4>
                <span class="n-category-badge" [ngClass]="getBadgeColorClass(n.type)">
                  {{ getCategoryName(n.type) }}
                </span>
              </div>
              <p class="n-message">{{ n.message }}</p>
            </div>
            
            <!-- Metadatos de la notificación -->
            <div class="n-meta">
              <span class="n-time">📅 {{ getRelativeTime(n.createdAt) }}</span>
              <span class="n-status-text" [class.unread]="isUnread(n)">
                {{ isUnread(n) ? 'No leída' : 'Leída' }}
              </span>
            </div>
            
            <!-- Botón de acciones adicionales -->
            <button class="btn-item-more" (click)="showItemMenu(n)">
              <lucide-icon name="more-vertical" [size]="18" class="text-muted"></lucide-icon>
            </button>
          </div>
        </ng-container>
      </div>

      <!-- Paginación -->
      <div class="pagination-row" *ngIf="filteredNotifications.length > 0">
        <span class="page-info">Mostrando {{ startIndex + 1 }} a {{ endIndex }} de {{ filteredNotifications.length }} notificaciones</span>
        
        <div class="page-controls">
          <button class="page-btn" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">
            <lucide-icon name="chevron-left" [size]="16"></lucide-icon>
          </button>
          <button class="page-btn" *ngFor="let p of pages" [class.active]="p === currentPage" (click)="goToPage(p)">
            {{ p }}
          </button>
          <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">
            <lucide-icon name="chevron-right" [size]="16"></lucide-icon>
          </button>
        </div>
        
        <select class="dark-select page-size-select" [(ngModel)]="pageSize" (change)="goToPage(1)">
          <option [value]="5">5 por página</option>
          <option [value]="10">10 por página</option>
          <option [value]="20">20 por página</option>
        </select>
      </div>
      
      <!-- Template de estado vacío -->
      <ng-template #emptyState>
        <div class="empty-state-container">
          <div class="bell-ring-icon">🔔</div>
          <h3>No hay notificaciones</h3>
          <p>No tienes notificaciones pendientes o ninguna coincide con los filtros aplicados.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .notifications-page-wrapper {
      padding: 0;
      color: #f8fafc;
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .header-section { margin-bottom: 8px; }
    .page-title { margin: 0 0 6px 0; font-size: 1.8rem; font-weight: 700; color: #f8fafc; }
    .page-subtitle { margin: 0; color: #94a3b8; font-size: 0.95rem; }
    
    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .metric-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      gap: 16px;
      align-items: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transition: all 0.25s ease;
    }
    .metric-card:hover {
      transform: translateY(-2px);
      border-color: #334155;
    }
    
    .metric-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .metric-icon-box.blue { background: rgba(59,130,246,0.12); color: #3b82f6; }
    .metric-icon-box.green { background: rgba(34,197,94,0.12); color: #22c55e; }
    .metric-icon-box.orange { background: rgba(249,115,22,0.12); color: #f97316; }
    .metric-icon-box.purple { background: rgba(168,85,247,0.12); color: #a855f7; }
    
    .metric-info { display: flex; flex-direction: column; }
    .metric-label { font-size: 0.82rem; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .blue-text { color: #3b82f6; }
    .green-text { color: #22c55e; }
    .orange-text { color: #f97316; }
    .purple-text { color: #a855f7; }
    
    .metric-value { font-size: 1.8rem; font-weight: 700; color: #f8fafc; line-height: 1.2; }
    .metric-desc { color: #64748b; font-size: 0.75rem; font-weight: 500; margin-top: 2px; }
    
    /* Toolbar */
    .toolbar {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #0b0f19;
      border: 1px solid #1e293b;
      padding: 0 16px;
      border-radius: 12px;
      height: 44px;
      flex: 1;
      min-width: 260px;
    }
    .search-box input {
      background: transparent;
      border: none;
      color: #f8fafc;
      outline: none;
      width: 100%;
      font-size: 0.9rem;
    }
    .search-box input::placeholder { color: #64748b; }
    .search-icon { color: #64748b; }

    .dark-select {
      background: #0b0f19;
      border: 1px solid #1e293b;
      padding: 0 16px;
      border-radius: 12px;
      color: #cbd5e1;
      font-size: 0.9rem;
      height: 44px;
      cursor: pointer;
      outline: none;
    }
    .dark-select:focus { border-color: #3b82f6; }

    .btn-primary-mark-read {
      background: transparent;
      border: 1px solid rgba(59,130,246,0.3);
      color: #60a5fa;
      padding: 0 20px;
      height: 44px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary-mark-read:hover:not(:disabled) {
      background: rgba(59,130,246,0.08);
      border-color: #3b82f6;
      color: #3b82f6;
    }
    .btn-primary-mark-read:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .ml-auto { margin-left: auto; }
    
    /* Notifications List Card */
    .notifications-list-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    .notification-item {
      display: flex;
      padding: 20px;
      border-bottom: 1px solid #1e293b;
      gap: 16px;
      align-items: flex-start;
      transition: background 0.2s;
      position: relative;
    }
    .notification-item:hover { background: rgba(255, 255, 255, 0.01); }
    .notification-item:last-child { border-bottom: none; }
    .notification-item.is-unread { background: rgba(59, 130, 246, 0.02); }
    
    .unread-dot-container { width: 10px; display: flex; justify-content: center; margin-top: 14px; }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: transparent; }
    .unread-dot.active {
      background: #3b82f6;
      box-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f6;
    }
    
    .n-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .bg-c-blue { background: rgba(59,130,246,0.1); color: #3b82f6; }
    .bg-c-green { background: rgba(34,197,94,0.1); color: #22c55e; }
    .bg-c-orange { background: rgba(249,115,22,0.1); color: #f97316; }
    .bg-c-purple { background: rgba(168,85,247,0.1); color: #a855f7; }
    .bg-c-gray { background: rgba(156,163,175,0.1); color: #9ca3af; }
    
    .n-content { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .n-header-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .n-title { margin: 0; font-size: 1rem; font-weight: 600; color: #f8fafc; }
    .n-message { margin: 0; font-size: 0.88rem; color: #cbd5e1; line-height: 1.5; word-break: break-word; }
    
    .n-category-badge {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
    }
    .badge-blue { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .badge-green { background: rgba(34,197,94,0.15); color: #4ade80; }
    .badge-orange { background: rgba(249,115,22,0.15); color: #fb923c; }
    .badge-purple { background: rgba(168,85,247,0.15); color: #c084fc; }
    .badge-gray { background: rgba(156,163,175,0.15); color: #9ca3af; }
    
    .n-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; min-width: 130px; flex-shrink: 0; }
    .n-time { font-size: 0.78rem; color: #64748b; }
    .n-status-text { font-size: 0.75rem; font-weight: 500; color: #64748b; }
    .n-status-text.unread { color: #3b82f6; }
    
    .btn-item-more {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      color: #475569;
      transition: background 0.2s;
    }
    .btn-item-more:hover { background: #1e293b; color: #cbd5e1; }
    
    /* Pagination Row */
    .pagination-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-info { color: #64748b; font-size: 0.88rem; }
    .page-controls { display: flex; gap: 6px; }
    .page-btn {
      background: #0b0f19;
      border: 1px solid #1e293b;
      color: #94a3b8;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .page-btn:hover:not(:disabled) { border-color: #334155; color: #f8fafc; }
    .page-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-size-select { height: 38px; padding: 0 10px; border-radius: 10px; }
    
    /* Empty State */
    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 72px 20px;
      color: #64748b;
      text-align: center;
    }
    .bell-ring-icon { font-size: 2.8rem; margin-bottom: 16px; animation: ring 4s ease infinite; }
    @keyframes ring {
      0%, 100% { transform: rotate(0); }
      5%, 15% { transform: rotate(10deg); }
      10%, 20% { transform: rotate(-10deg); }
      25% { transform: rotate(0); }
    }
    .empty-state-container h3 { margin: 0 0 8px 0; color: #cbd5e1; font-size: 1.15rem; }
    .empty-state-container p { margin: 0; font-size: 0.9rem; }
  `]
})
export class NotificationsPageComponent implements OnInit {
  private readonly notificationCenter = inject(NotificationCenterService);
  
  notifications: AppNotification[] = [];
  filteredNotifications: AppNotification[] = [];
  paginatedNotifications: AppNotification[] = [];
  
  // Contadores
  unreadCount = 0;
  readCount = 0;
  importantCount = 0;
  thisMonthCount = 0;
  
  // Filtros
  searchQuery = '';
  categoryFilter = 'ALL';
  statusFilter = 'ALL';
  
  // Paginación
  currentPage = 1;
  pageSize = 5;
  
  ngOnInit(): void {
    this.loadNotifications();
  }
  
  loadNotifications(): void {
    this.notificationCenter.getNotifications().subscribe(data => {
      this.notifications = data;
      this.calculateStats();
      this.applyFilters();
    });
  }
  
  calculateStats(): void {
    const now = new Date();
    let unread = 0, read = 0, important = 0, thisMonth = 0;
    
    this.notifications.forEach(n => {
      const isUnread = this.isUnread(n);
      if (isUnread) unread++;
      else read++;
      
      if (n.type === 'URGENT' || n.type === 'WELCOME') important++;
      
      if (n.createdAt) {
        const d = new Date(n.createdAt);
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          thisMonth++;
        }
      }
    });
    
    this.unreadCount = unread;
    this.readCount = read;
    this.importantCount = important;
    this.thisMonthCount = thisMonth;
  }
  
  applyFilters(): void {
    let filtered = [...this.notifications];
    
    // Filtro por Estado
    if (this.statusFilter === 'UNREAD') {
      filtered = filtered.filter(n => this.isUnread(n));
    } else if (this.statusFilter === 'READ') {
      filtered = filtered.filter(n => !this.isUnread(n));
    }
    
    // Filtro por Categoría
    if (this.categoryFilter !== 'ALL') {
      filtered = filtered.filter(n => this.mapTypeToCategory(n.type) === this.categoryFilter);
    }
    
    // Filtro por Buscador
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.message.toLowerCase().includes(q)
      );
    }
    
    this.filteredNotifications = filtered;
    this.goToPage(1);
  }
  
  // Paginación
  get totalPages(): number {
    return Math.ceil(this.filteredNotifications.length / this.pageSize) || 1;
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
    return Math.min(this.startIndex + this.pageSize, this.filteredNotifications.length);
  }
  
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.paginatedNotifications = this.filteredNotifications.slice(this.startIndex, this.endIndex);
  }
  
  // Marcar todo como leído
  markAllAsRead(): void {
    this.notificationCenter.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => {
        n.read = true;
        n.isRead = true;
        n.status = 'READ';
      });
      this.calculateStats();
      this.applyFilters();
    });
  }
  
  // Helper de estado leído/no leído
  isUnread(n: AppNotification): boolean {
    return isNotificationUnread(n);
  }
  
  mapTypeToCategory(type?: string): string {
    if (!type) return 'SYSTEM';
    const t = type.toUpperCase();
    if (t.includes('APPLICATION') || t.includes('POSTULACION')) return 'APPLICATION';
    if (t.includes('TECHNICIAN') || t.includes('TECNICO')) return 'TECHNICIAN';
    if (t.includes('SERVICE') || t.includes('SERVICIO')) return 'SERVICE';
    if (t.includes('USER') || t.includes('USUARIO')) return 'USER';
    return 'SYSTEM';
  }
  
  getCategoryName(type?: string): string {
    const cat = this.mapTypeToCategory(type);
    switch(cat) {
      case 'APPLICATION': return 'Postulaciones';
      case 'TECHNICIAN': return 'Técnicos';
      case 'SERVICE': return 'Servicios';
      case 'USER': return 'Usuarios';
      default: return 'Sistema';
    }
  }
  
  getIconName(type?: string): string {
    const cat = this.mapTypeToCategory(type);
    switch(cat) {
      case 'APPLICATION': return 'user-plus';
      case 'TECHNICIAN': return 'check-circle';
      case 'SERVICE': return 'file-text';
      case 'USER': return 'users';
      default: return 'bell';
    }
  }
  
  getIconColorClass(type?: string): string {
    const cat = this.mapTypeToCategory(type);
    switch(cat) {
      case 'APPLICATION': return 'bg-c-blue';
      case 'TECHNICIAN': return 'bg-c-green';
      case 'SERVICE': return 'bg-c-orange';
      case 'SYSTEM': return 'bg-c-purple';
      case 'USER': return 'bg-c-gray';
      default: return 'bg-c-gray';
    }
  }
  
  getBadgeColorClass(type?: string): string {
    const cat = this.mapTypeToCategory(type);
    switch(cat) {
      case 'APPLICATION': return 'badge-blue';
      case 'TECHNICIAN': return 'badge-green';
      case 'SERVICE': return 'badge-orange';
      case 'SYSTEM': return 'badge-purple';
      case 'USER': return 'badge-gray';
      default: return 'badge-gray';
    }
  }
  
  getRelativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `Hace ${diffMins || 1} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return `Ayer, ${date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  showItemMenu(n: AppNotification): void {
    alert(`Simulación: Menú de opciones para notificación "${n.title}"`);
  }
}
