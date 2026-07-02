import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getDepartments, getProvinces, getDistricts } from 'ubigeo-fns';
import { AdminUserService, AdminUserProfile } from '../services/admin-user.service';
import { AddressSelectorComponent } from '../../../shared/components/address-selector/address-selector.component';
import { EstadoTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';
import { SERVIYA_APP_CONFIG } from '../../../core/config/app-config';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressSelectorComponent, LucideAngularModule],
  template: `
    <div class="catalog-container">
      <div class="header-section">
        <div>
          <h1>{{ isTrabajadoresView ? 'Gestión de Trabajadores' : (isTecnicosView ? 'Gestión de Técnicos' : 'Gestión de Usuarios') }}</h1>
          <p>Administra los accesos y perfiles del sistema</p>
        </div>
        <button class="primary-button add-button" (click)="openCreateModal()">
          <lucide-icon name="plus" [size]="18"></lucide-icon> Nuevo Usuario
        </button>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon blue"><lucide-icon name="users" [size]="24"></lucide-icon></div>
          <div class="stat-content">
            <span class="stat-label">Total Usuarios</span>
            <span class="stat-value">{{ totalUsers }}</span>
            <span class="stat-desc">En el sistema</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><lucide-icon name="check-circle" [size]="24"></lucide-icon></div>
          <div class="stat-content">
            <span class="stat-label">Activos</span>
            <span class="stat-value">{{ activeUsers }}</span>
            <span class="stat-desc">{{ getPercentage(activeUsers) }}% del total</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><lucide-icon name="user-x" [size]="24"></lucide-icon></div>
          <div class="stat-content">
            <span class="stat-label">Inactivos</span>
            <span class="stat-value">{{ inactiveUsers }}</span>
            <span class="stat-desc">{{ getPercentage(inactiveUsers) }}% del total</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple"><lucide-icon name="shield" [size]="24"></lucide-icon></div>
          <div class="stat-content">
            <span class="stat-label">Roles</span>
            <span class="stat-value">{{ totalRoles }}</span>
            <span class="stat-desc">Roles registrados</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-box">
          <lucide-icon name="search" [size]="18" class="search-icon"></lucide-icon>
          <input type="text" placeholder="Buscar usuario..." [(ngModel)]="searchTerm">
        </div>
        
        <select class="dark-select" [(ngModel)]="roleFilter">
          <option value="ALL">Filtrar por rol</option>
          <option value="SUPERADMIN">Super Admin</option>
          <option value="ADMIN">Administrador</option>
          <option value="EDITOR">Editor</option>
          <option value="TECNICO">Técnico</option>
          <option value="CLIENTE">Cliente</option>
          <option value="TRABAJADOR">Trabajador</option>
        </select>
        
        <select class="dark-select" [(ngModel)]="statusFilter">
          <option value="ALL">Filtrar por estado</option>
          <option value="ACTIVE">Activos</option>
          <option value="INACTIVE">Inactivos</option>
        </select>

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
              <th>USUARIO</th>
              <th>CORREO ELECTRÓNICO</th>
              <th>TELÉFONO</th>
              <th>ROL</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="loading">
              <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-secondary);">Cargando usuarios...</td>
            </tr>
            <tr *ngIf="!loading && paginatedUsers.length === 0">
              <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-secondary);">No se encontraron usuarios.</td>
            </tr>
            <tr *ngFor="let user of paginatedUsers">
              <td>
                <div class="user-cell">
                   <div class="user-avatar">
                     <img *ngIf="user.avatarUrl; else noAvatar" [src]="getAvatarUrl(user.avatarUrl)" />
                     <ng-template #noAvatar>
                       <img src="https://ui-avatars.com/api/?name={{user.firstName}}+{{user.lastName}}&background=1E90FF&color=fff&size=80" />
                     </ng-template>
                   </div>
                   <span class="user-name">{{ (user.firstName + ' ' + user.lastName) | uppercase }}</span>
                   <span class="badge-tu" *ngIf="isCurrentUser(user)">Tú</span>
                </div>
              </td>
              <td class="email-cell">{{ (user.emailContact || user.email) | lowercase }}</td>
              <td>{{ user.phone || user.telefono || '-' }}</td>
              <td>
                 <span class="role-badge" [ngClass]="getRoleClass(user.role)">{{ formatRole(user.role) }}</span>
              </td>
              <td>
                 <span class="status-badge" [class.active]="user.status === 'ACTIVE'" [class.inactive]="user.status !== 'ACTIVE'">
                   <span class="dot"></span> {{ user.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
                 </span>
              </td>
              <td>
                 <div class="actions-cell">
                   <button class="icon-btn btn-edit" (click)="openEditModal(user)" title="Editar">
                     <lucide-icon name="edit-2" [size]="16"></lucide-icon>
                   </button>
                   <button class="icon-btn btn-lock" (click)="toggleLock(user)" [title]="user.status === 'ACTIVE' ? 'Bloquear' : 'Desbloquear'">
                     <lucide-icon [name]="user.status === 'ACTIVE' ? 'lock' : 'unlock'" [size]="16"></lucide-icon>
                   </button>
                   <button class="icon-btn btn-delete" (click)="deleteUser(user)" title="Eliminar">
                     <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                   </button>
                 </div>
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" *ngIf="!loading && filteredUsers.length > 0">
           <span class="page-info">Mostrando {{ startItem }} a {{ endItem }} de {{ filteredUsers.length }} usuarios</span>
           <div class="pagination-controls">
             <button class="page-btn" (click)="prevPage()" [disabled]="currentPage === 1"><lucide-icon name="chevron-left" [size]="16"></lucide-icon></button>
             <button class="page-btn" *ngFor="let p of pages" [class.active]="currentPage === p" (click)="goToPage(p)">{{ p }}</button>
             <button class="page-btn" (click)="nextPage()" [disabled]="currentPage === totalPages"><lucide-icon name="chevron-right" [size]="16"></lucide-icon></button>
           </div>
           <div class="items-per-page">
             <select class="dark-select small-select" [(ngModel)]="itemsPerPage" (change)="currentPage = 1">
               <option [value]="8">8 por página</option>
               <option [value]="10">10 por página</option>
               <option [value]="20">20 por página</option>
               <option [value]="50">50 por página</option>
             </select>
           </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div class="modal-overlay" *ngIf="editingUser">
        <div class="modal-panel-split" style="max-width: 600px;">
          <!-- Since the users mockup doesn't specify a split view for edits, I'll use a clean dark modal -->
          <div class="modal-form-side" style="flex: 1; border: none;">
            <div class="modal-header">
              <div class="header-title">
                <div class="title-icon">
                  <lucide-icon name="user" [size]="20" color="var(--primary-neon)"></lucide-icon>
                </div>
                <div>
                  <h2>{{ editingUser.id ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
                  <p>{{ editingUser.id ? 'Actualiza la información del usuario.' : 'Completa los datos para crear una cuenta.' }}</p>
                </div>
              </div>
              <button class="close-btn" (click)="closeEditModal()"><lucide-icon name="x" [size]="20"></lucide-icon></button>
            </div>
            
            <form (ngSubmit)="saveUser()" class="form-content">
              <!-- CREATING A NEW USER -->
              <div class="form-grid" *ngIf="!editingUser.id">
                <div class="form-field full-width text-center" style="margin-bottom: 8px;">
                   <p style="color: var(--text-secondary); margin: 0;">Detalles de la cuenta</p>
                </div>
                <div class="form-field">
                  <label>Nombre</label>
                  <div class="input-with-icon">
                    <span class="input-icon"><lucide-icon name="user" [size]="16"></lucide-icon></span>
                    <input type="text" name="firstName" [(ngModel)]="editingUser.firstName" required placeholder="Nombres" />
                  </div>
                </div>
                <div class="form-field">
                  <label>Apellidos</label>
                  <div class="input-with-icon">
                    <span class="input-icon"><lucide-icon name="user" [size]="16"></lucide-icon></span>
                    <input type="text" name="lastName" [(ngModel)]="editingUser.lastName" required placeholder="Apellidos" />
                  </div>
                </div>
                <div class="form-field full-width">
                  <label>Correo electrónico</label>
                  <div class="input-with-icon">
                    <span class="input-icon"><lucide-icon name="info" [size]="16"></lucide-icon></span>
                    <input type="email" name="email" [(ngModel)]="editingUser.email" required placeholder="correo@ejemplo.com" />
                  </div>
                </div>
                <div class="form-field">
                  <label>Usuario</label>
                  <div class="input-with-icon">
                    <span class="input-icon" style="font-weight: bold;">@</span>
                    <input type="text" name="username" [(ngModel)]="editingUser.username" required placeholder="username" />
                  </div>
                </div>
                <div class="form-field">
                  <label>Rol Inicial</label>
                  <div class="input-with-icon">
                    <span class="input-icon"><lucide-icon name="shield" [size]="16"></lucide-icon></span>
                    <select name="role" [(ngModel)]="editingUser.role" class="dark-select" style="padding-left: 42px;">
                      <option value="CLIENTE">Cliente</option>
                      <option value="TECNICO">Técnico</option>
                      <option value="TRABAJADOR">Trabajador</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                </div>
                <div class="form-field">
                  <label>Contraseña</label>
                  <div class="input-with-icon">
                    <span class="input-icon"><lucide-icon name="lock" [size]="16"></lucide-icon></span>
                    <input type="password" name="password" [(ngModel)]="editingUser.password" required placeholder="****" />
                  </div>
                </div>
                <div class="form-field">
                  <label>Confirmar Contraseña</label>
                  <div class="input-with-icon">
                    <span class="input-icon"><lucide-icon name="lock" [size]="16"></lucide-icon></span>
                    <input type="password" name="confirmPassword" [(ngModel)]="editingUser.confirmPassword" required placeholder="****" />
                  </div>
                  <small *ngIf="editingUser.password && editingUser.confirmPassword && editingUser.password !== editingUser.confirmPassword" style="color: var(--error);">Las contraseñas no coinciden</small>
                </div>
              </div>

              <!-- EDITING AN EXISTING USER -->
              <div class="form-grid" *ngIf="editingUser.id">
                <div class="form-field">
                  <label>Nombre</label>
                  <input type="text" name="firstName" [(ngModel)]="editingUser.firstName" required class="dark-input" />
                </div>
                <div class="form-field">
                  <label>Apellido</label>
                  <input type="text" name="lastName" [(ngModel)]="editingUser.lastName" required class="dark-input" />
                </div>
                <div class="form-field">
                  <label>Correo Electrónico</label>
                  <input type="email" name="email" [(ngModel)]="editingUser.email" required class="dark-input" />
                </div>
                <div class="form-field">
                  <label>Teléfono</label>
                  <input type="text" name="phone" [(ngModel)]="editingUser.telefono" class="dark-input" />
                </div>
                <div class="form-field">
                  <label>Contraseña (Opcional)</label>
                  <input type="password" name="password" [(ngModel)]="editingUser.password" class="dark-input" placeholder="****" />
                </div>
                <div class="form-field">
                  <label>Rol</label>
                  <select name="role" [(ngModel)]="editingUser.role" class="dark-select">
                    <option value="CLIENTE">Cliente</option>
                    <option value="TECNICO">Técnico</option>
                    <option value="TRABAJADOR">Trabajador</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div class="form-field full-width">
                  <label>Datos Adicionales</label>
                  <textarea name="datos" [(ngModel)]="editingUser.datos" class="dark-input" style="height: 60px;"></textarea>
                </div>
                <div class="form-field full-width">
                  <app-address-selector
                    *ngIf="editingUser"
                    [isProfileMode]="true"
                    [initialData]="editingUser"
                    (addressSelected)="onLocationSelected($event)">
                  </app-address-selector>
                </div>
              </div>

              <div class="modal-actions-sticky" style="margin: auto -24px -24px -24px; bottom: 0;">
                <button type="button" class="btn-cancel" (click)="closeEditModal()">
                  <lucide-icon name="x" [size]="16"></lucide-icon> Cancelar
                </button>
                <button type="submit" class="btn-save" [disabled]="isSaving">
                  <lucide-icon name="save" [size]="16"></lucide-icon> {{ isSaving ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
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
    .stat-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-icon.blue { background: rgba(30,144,255,0.1); color: #1E90FF; border: 1px dashed rgba(30,144,255,0.5); box-shadow: 0 0 15px rgba(30,144,255,0.1) inset; }
    .stat-icon.green { background: rgba(34,197,94,0.1); color: #22C55E; border: 1px dashed rgba(34,197,94,0.5); box-shadow: 0 0 15px rgba(34,197,94,0.1) inset; }
    .stat-icon.red { background: rgba(239,68,68,0.1); color: #EF4444; border: 1px dashed rgba(239,68,68,0.5); box-shadow: 0 0 15px rgba(239,68,68,0.1) inset; }
    .stat-icon.purple { background: rgba(157,78,221,0.1); color: #9D4EDD; border: 1px dashed rgba(157,78,221,0.5); box-shadow: 0 0 15px rgba(157,78,221,0.1) inset; }
    .stat-content { display: flex; flex-direction: column; overflow: hidden; }
    .stat-label { font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 1.6rem; font-weight: 700; color: var(--text-primary); margin: 2px 0; }
    .stat-desc { font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Filters Section */
    .filters-section { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }
    .search-box { flex: 1; position: relative; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 16px; color: var(--text-secondary); }
    .search-box input { width: 100%; background: var(--surface-1); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 16px 10px 42px; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; transition: 0.2s; }
    .search-box input:focus { border-color: var(--primary-neon); box-shadow: 0 0 10px rgba(30,144,255,0.2); }
    .dark-select { background: var(--surface-1); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 40px 10px 16px; border-radius: 8px; outline: none; font-family: inherit; font-size: 0.95rem; appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px; transition: 0.2s; cursor: pointer; }
    .dark-select:focus { border-color: var(--primary-neon); box-shadow: 0 0 10px rgba(30,144,255,0.2); }
    .small-select { padding: 6px 36px 6px 12px; font-size: 0.85rem; }
    .btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 10px 16px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: 500; display: flex; align-items: center; gap: 8px; }
    .btn-outline:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); border-color: rgba(255,255,255,0.2); }

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
    .user-avatar { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; background: var(--surface-2); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); border: 1px solid var(--border-color); flex-shrink: 0; }
    .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .user-name { font-weight: 600; letter-spacing: 0.2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
    .badge-tu { background: #1E90FF; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }
    .email-cell { color: var(--text-secondary); }

    /* Role Badges */
    .role-badge { padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; border: 1px solid; display: inline-block; text-align: center; white-space: nowrap; }
    .badge-purple { color: #9D4EDD; border-color: rgba(157,78,221,0.3); background: rgba(157,78,221,0.1); }
    .badge-blue { color: #1E90FF; border-color: rgba(30,144,255,0.3); background: rgba(30,144,255,0.1); }
    .badge-orange { color: #F97316; border-color: rgba(249,115,22,0.3); background: rgba(249,115,22,0.1); }
    .badge-teal { color: #14B8A6; border-color: rgba(20,184,166,0.3); background: rgba(20,184,166,0.1); }
    .badge-gray { color: #94A3B8; border-color: rgba(148,163,184,0.3); background: rgba(148,163,184,0.1); }

    /* Status Badge */
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
    .status-badge .dot { width: 6px; height: 6px; border-radius: 50%; }
    .status-badge.active { color: var(--success); border: 1px solid var(--success); background: rgba(34, 197, 94, 0.1); }
    .status-badge.active .dot { background: var(--success); box-shadow: 0 0 5px var(--success); }
    .status-badge.inactive { color: var(--error); border: 1px solid var(--error); background: rgba(239, 68, 68, 0.1); }
    .status-badge.inactive .dot { background: var(--error); box-shadow: 0 0 5px var(--error); }

    /* Actions */
    .actions-cell { display: flex; gap: 8px; }
    .icon-btn { width: 36px; height: 36px; border-radius: 8px; background: transparent; border: 1px solid; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .btn-edit { color: var(--primary-neon); border-color: var(--primary-700); }
    .btn-edit:hover { background: rgba(30,144,255,0.1); box-shadow: 0 0 10px rgba(30,144,255,0.2); }
    .btn-lock { color: var(--accent-600); border-color: var(--accent-900); }
    .btn-lock:hover { background: rgba(249,115,22,0.1); box-shadow: 0 0 10px rgba(249,115,22,0.2); }
    .btn-delete { color: var(--error); border-color: rgba(239,68,68,0.3); }
    .btn-delete:hover { background: rgba(239,68,68,0.1); box-shadow: 0 0 10px rgba(239,68,68,0.2); }

    /* Pagination */
    .pagination-container { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-top: 1px solid var(--border-color); background: var(--surface-1); }
    .page-info { color: var(--text-secondary); font-size: 0.85rem; }
    .pagination-controls { display: flex; gap: 4px; }
    .page-btn { background: var(--surface-2); border: 1px solid var(--border-color); color: var(--text-primary); width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.9rem; transition: 0.2s; }
    .page-btn:hover:not([disabled]) { background: var(--surface-3); border-color: var(--primary-600); }
    .page-btn.active { background: var(--primary-600); color: white; border-color: var(--primary-neon); box-shadow: 0 0 10px rgba(30,144,255,0.3); }
    .page-btn[disabled] { opacity: 0.5; cursor: not-allowed; }

    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5, 11, 24, 0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; backdrop-filter: blur(8px); }
    .modal-panel-split { display: flex; width: 100%; max-height: 85vh; background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    .modal-form-side { display: flex; flex-direction: column; width: 100%; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; background: var(--surface-1); }
    .header-title { display: flex; align-items: center; gap: 16px; }
    .title-icon { width: 44px; height: 44px; border-radius: 10px; border: 1px solid var(--primary-600); background: rgba(30,144,255, 0.1); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(30,144,255,0.2); }
    .modal-header h2 { margin: 0 0 4px 0; font-size: 1.3rem; color: var(--text-primary); }
    .modal-header p { margin: 0; font-size: 0.85rem; color: var(--text-secondary); }
    .close-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-secondary); cursor: pointer; padding: 8px; border-radius: 8px; display: flex; transition: 0.2s; }
    .close-btn:hover { background: rgba(239,68,68,0.2); color: var(--error); border-color: rgba(239,68,68,0.4); }
    .form-content { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-field { display: flex; flex-direction: column; gap: 6px; }
    .full-width { grid-column: 1 / -1; }
    .form-field > label { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
    .dark-input, .dark-select { width: 100%; background: var(--surface-2); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 14px; border-radius: 8px; font-size: 0.9rem; font-family: inherit; outline: none; transition: 0.2s; box-sizing: border-box; }
    .dark-input:focus, .dark-select:focus { border-color: var(--primary-neon); box-shadow: 0 0 10px rgba(30,144,255,0.15); }
    .input-with-icon { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 14px; color: var(--text-secondary); pointer-events: none; display: flex; }
    .input-with-icon input, .input-with-icon select { width: 100%; background: var(--surface-2); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 14px 10px 42px; border-radius: 8px; font-size: 0.9rem; font-family: inherit; outline: none; transition: 0.2s; box-sizing: border-box; }
    .input-with-icon input:focus, .input-with-icon select:focus { border-color: var(--primary-neon); box-shadow: 0 0 10px rgba(30,144,255,0.15); }
    .modal-actions-sticky { position: sticky; padding: 20px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 16px; background: var(--surface-1); z-index: 10; }
    .btn-cancel { display: flex; align-items: center; gap: 8px; background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: 0.2s; }
    .btn-cancel:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
    .btn-save { display: flex; align-items: center; gap: 8px; background: var(--accent-600); border: none; color: white; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(249,115,22, 0.3); }
    .btn-save:hover:not([disabled]) { background: var(--accent-neon); box-shadow: var(--glow-orange); }
    .btn-save[disabled] { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
  `]
})
export class AdminUsersPageComponent implements OnInit {
  private userService = inject(AdminUserService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private readonly config = inject(SERVIYA_APP_CONFIG);
  
  users: any[] = [];
  loading = true;
  editingUser: any = null;
  isSaving = false;
  isTrabajadoresView = false;
  isTecnicosView = false;

  searchTerm = '';
  roleFilter = 'ALL';
  statusFilter = 'ALL';
  currentPage = 1;
  itemsPerPage = 8;

  regions = getDepartments();
  provinces: { code: string; name: string }[] = [];
  districts: { code: string; name: string }[] = [];

  ngOnInit() {
    this.isTrabajadoresView = this.router.url.includes('/admin/trabajadores');
    this.isTecnicosView = this.router.url.includes('/admin/tecnicos') && !this.router.url.includes('postulaciones');
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllClients().subscribe({
      next: (data) => {
        if (this.isTrabajadoresView) {
          this.users = data.filter((u: any) => u.role === 'TRABAJADOR');
        } else if (this.isTecnicosView) {
          this.users = data.filter((u: any) => u.role === 'TECNICO');
        } else {
          this.users = data;
        }
        this.users.forEach(u => {
          if (!u.status) u.status = 'ACTIVE';
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.loading = false;
      }
    });
  }

  get totalUsers() { return this.users.length; }
  get activeUsers() { return this.users.filter(u => u.status === 'ACTIVE').length; }
  get inactiveUsers() { return this.users.filter(u => u.status !== 'ACTIVE').length; }
  get totalRoles() { return new Set(this.users.map(u => u.role)).size; }

  getPercentage(count: number): string {
    if (this.totalUsers === 0) return '0';
    return ((count / this.totalUsers) * 100).toFixed(1);
  }

  get filteredUsers() {
    let result = this.users;
    if (this.roleFilter !== 'ALL') {
      result = result.filter(u => {
        if (this.roleFilter === 'ADMIN') return u.role === 'ADMIN' || u.role === 'SUPERADMIN';
        return u.role === this.roleFilter;
      });
    }
    if (this.statusFilter !== 'ALL') {
      if (this.statusFilter === 'ACTIVE') result = result.filter(u => u.status === 'ACTIVE');
      else result = result.filter(u => u.status !== 'ACTIVE');
    }
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(u => 
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(term) ||
        (u.emailContact || u.email || '').toLowerCase().includes(term) ||
        (u.phone || u.telefono || '').includes(term)
      );
    }
    return result;
  }

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  get totalPages() { return Math.ceil(this.filteredUsers.length / this.itemsPerPage) || 1; }
  get pages() { return Array.from({length: this.totalPages}, (_, i) => i + 1); }
  get startItem() { return this.filteredUsers.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1; }
  get endItem() { return Math.min(this.currentPage * this.itemsPerPage, this.filteredUsers.length); }

  goToPage(p: number) { this.currentPage = p; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }

  clearFilters() {
    this.searchTerm = '';
    this.roleFilter = 'ALL';
    this.statusFilter = 'ALL';
    this.currentPage = 1;
  }

  formatRole(role: string): string {
    if (!role) return 'Desconocido';
    switch (role.toUpperCase()) {
      case 'SUPERADMIN': return 'Super Admin';
      case 'ADMIN': return 'Administrador';
      case 'EDITOR': return 'Editor';
      case 'TECNICO': return 'Técnico';
      case 'CLIENTE': return 'Cliente';
      case 'TRABAJADOR': return 'Trabajador';
      default: return role;
    }
  }

  getRoleClass(role: string): string {
    if (!role) return 'badge-gray';
    switch (role.toUpperCase()) {
      case 'SUPERADMIN': return 'badge-purple';
      case 'ADMIN': return 'badge-blue';
      case 'EDITOR': return 'badge-orange';
      case 'TECNICO': return 'badge-teal';
      case 'CLIENTE': return 'badge-gray';
      default: return 'badge-gray';
    }
  }

  isCurrentUser(user: any): boolean {
    const email = this.authService.email();
    return email ? email === (user.emailContact || user.email) : false;
  }

  getAvatarUrl(url: string | null | undefined): string {
    if (!url) {
      return '';
    }

    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }

    if (url.startsWith('/user-ms')) {
      return `${this.config.apiBaseUrl}${url}`;
    }

    if (url.startsWith('/api')) {
      return `${this.config.apiBaseUrl}/user-ms${url}`;
    }

    return `${this.config.apiBaseUrl}/user-ms${url.startsWith('/') ? url : `/${url}`}`;
  }

  toggleLock(user: any) {
    if (confirm(`¿Estás seguro de que deseas ${user.status === 'ACTIVE' ? 'bloquear' : 'desbloquear'} a este usuario?`)) {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      this.userService.updateClient(user.id, { ...user, status: newStatus }).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error toggling user status', err);
          alert('Hubo un error al actualizar el estado del usuario.');
        }
      });
    }
  }

  openCreateModal() {
    this.editingUser = {
      role: this.isTrabajadoresView ? 'TRABAJADOR' : (this.isTecnicosView ? 'TECNICO' : 'CLIENTE'),
      username: '',
      password: '',
      confirmPassword: ''
    };
  }

  openEditModal(user: any) {
    this.editingUser = { ...user, role: user.role || 'CLIENTE' };
    if (this.editingUser.region) {
      this.onRegionChange();
    }
    if (this.editingUser.provincia) {
      this.onProvinciaChange();
    }
  }

  closeEditModal() {
    this.editingUser = null;
  }

  onLocationSelected(event: any) {
    if (this.editingUser) {
      this.editingUser.region = event.region;
      this.editingUser.provincia = event.provincia;
      this.editingUser.distrito = event.distrito;
      this.editingUser.direccion = event.direccion;
      this.editingUser.referencia = event.referencia;
      this.editingUser.lat = event.lat;
      this.editingUser.lng = event.lng;
    }
  }

  onRegionChange() {
    if (this.editingUser?.region) {
      this.provinces = getProvinces(this.editingUser.region);
      this.districts = [];
      this.editingUser.provincia = '';
      this.editingUser.distrito = '';
    } else {
      this.provinces = [];
      this.districts = [];
      this.editingUser.provincia = '';
      this.editingUser.distrito = '';
    }
  }

  onProvinciaChange() {
    if (this.editingUser?.provincia) {
      this.districts = getDistricts(this.editingUser.provincia);
      this.editingUser.distrito = '';
    } else {
      this.districts = [];
      this.editingUser.distrito = '';
    }
  }

  saveUser() {
    if (!this.editingUser) return;
    
    if (!this.editingUser.id) {
      if (this.editingUser.password !== this.editingUser.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
    }

    this.isSaving = true;
    
    if (!this.editingUser.id) {
      this.userService.createClient(this.editingUser).subscribe({
        next: (newUser) => {
          this.isSaving = false;
          this.closeEditModal();
          this.loadUsers();
          alert('Usuario creado exitosamente.');
        },
        error: (err) => {
          console.error('Error creating user', err);
          this.isSaving = false;
          alert('Hubo un error al crear el usuario. ' + (err.error?.message || ''));
        }
      });
      return;
    }

    this.userService.updateClient(this.editingUser.id, this.editingUser).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeEditModal();
        this.loadUsers(); 
      },
      error: (err) => {
        console.error('Error updating user', err);
        alert('Hubo un error al actualizar el usuario.');
        this.isSaving = false;
      }
    });
  }

  deleteUser(user: any) {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${user.firstName} ${user.lastName}?`)) {
      this.userService.deleteClient(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user', err);
          alert('Hubo un error al eliminar el usuario.');
        }
      });
    }
  }
}
