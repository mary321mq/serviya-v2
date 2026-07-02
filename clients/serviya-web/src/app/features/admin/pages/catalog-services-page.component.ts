import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AdminCatalogService, ServiceCatalogItem, ServiceCategory } from '../services/admin-catalog.service';
import { LucideAngularModule } from 'lucide-angular';
import { SERVIYA_APP_CONFIG } from '../../../core/config/app-config';

@Component({
  selector: 'app-catalog-services-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LucideAngularModule],
  template: `
    <div class="page-panel catalog-container">
      
      <div class="header-section">
        <div>
          <h1>Catálogo de Servicios</h1>
          <p>Gestiona y organiza todos los servicios disponibles en la plataforma.</p>
        </div>
        <button class="primary-button add-button" (click)="openModal()">
          <lucide-icon name="plus" [size]="18"></lucide-icon> Nuevo Servicio
        </button>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <lucide-icon name="search" [size]="18" color="var(--text-secondary)"></lucide-icon>
          <input type="text" placeholder="Buscar servicio..." [(ngModel)]="searchTerm">
        </div>
        <div class="filter-box">
          <lucide-icon name="folder" [size]="18" color="var(--accent-600)"></lucide-icon>
          <select [(ngModel)]="categoryFilter" class="dark-select">
            <option value="ALL">Filtrar por categoría</option>
            <option *ngFor="let cat of categories" [value]="cat.codigo">{{ cat.nombre }}</option>
          </select>
        </div>
        <div class="filter-box">
          <lucide-icon name="filter" [size]="18" color="var(--accent-600)"></lucide-icon>
          <select [(ngModel)]="statusFilter" class="dark-select">
            <option value="ALL">Filtrar por estado</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
        <button class="btn-outline clear-btn" (click)="clearFilters()">
          <lucide-icon name="power" [size]="16" style="transform: rotate(180deg)"></lucide-icon> Limpiar
        </button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="color: var(--primary-neon); border-color: var(--primary-600);"><lucide-icon name="folder" [size]="20"></lucide-icon></div>
          <div class="stat-info">
            <span class="stat-label" style="color: var(--primary-neon);">Total Servicios</span>
            <span class="stat-value">{{ totalServices }}</span>
            <span class="stat-sub">En el catálogo</span>
          </div>
        </div>
        <div class="stat-card" style="border-color: rgba(34,197,94,0.3);">
          <div class="stat-icon" style="color: var(--success); border-color: rgba(34,197,94,0.3);"><lucide-icon name="check" [size]="20"></lucide-icon></div>
          <div class="stat-info">
            <span class="stat-label" style="color: var(--success);">Activos</span>
            <span class="stat-value">{{ activeServices }}</span>
            <span class="stat-sub">{{ totalServices > 0 ? (activeServices / totalServices * 100).toFixed(0) : 0 }}% del total</span>
          </div>
        </div>
        <div class="stat-card" style="border-color: rgba(255,138,0,0.3);">
          <div class="stat-icon" style="color: var(--accent-neon); border-color: rgba(255,138,0,0.3);"><lucide-icon name="pause" [size]="20"></lucide-icon></div>
          <div class="stat-info">
            <span class="stat-label" style="color: var(--accent-neon);">Inactivos</span>
            <span class="stat-value">{{ inactiveServices }}</span>
            <span class="stat-sub">{{ totalServices > 0 ? (inactiveServices / totalServices * 100).toFixed(0) : 0 }}% del total</span>
          </div>
        </div>
        <div class="stat-card" style="border-color: rgba(168,85,247,0.3);">
          <div class="stat-icon" style="color: #a855f7; border-color: rgba(168,85,247,0.3);"><lucide-icon name="layout-grid" [size]="20"></lucide-icon></div>
          <div class="stat-info">
            <span class="stat-label" style="color: #a855f7;">Categorías</span>
            <span class="stat-value">{{ totalCategories }}</span>
            <span class="stat-sub">Disponibles</span>
          </div>
        </div>
      </div>

      <div class="table-header">
        <div style="flex: 2">SERVICIO</div>
        <div style="flex: 1">CATEGORÍA</div>
        <div style="flex: 1; text-align: center;">ESTADO</div>
        <div style="flex: 1; text-align: right;">ACCIONES</div>
      </div>

      <div class="list" *ngIf="filteredServices.length > 0">
        <div class="card-item" *ngFor="let srv of filteredServices; let i = index">
          
          <div class="card-col" style="flex: 2; display: flex; align-items: center; gap: 16px;">
            <div class="icon-circle" [class.inactive-icon]="!srv.activo">
              <span style="font-size: 1.1rem; font-weight: bold; font-family: monospace;">{{ i + 1 }}</span>
            </div>
            <div class="card-info">
              <h2>{{ srv.nombre }}</h2>
              <div style="display: flex; gap: 8px;">
                <span class="code-badge">{{ srv.codigo }}</span>
                <span class="cat-code">Cat: {{ srv.categoryCode }}</span>
              </div>
            </div>
          </div>

          <div class="card-col" style="flex: 1;">
            <span class="cat-badge">
              <lucide-icon name="folder" [size]="14"></lucide-icon> {{ getCategoryName(srv.categoryCode) || srv.categoryCode }}
            </span>
          </div>

          <div class="card-col" style="flex: 1; display: flex; justify-content: center;">
            <span class="status-chip" [class.active]="srv.activo" [class.inactive]="!srv.activo">
              <span class="dot"></span> {{ srv.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div class="card-col" style="flex: 1; display: flex; justify-content: flex-end; gap: 8px;">
            <button class="icon-action-btn btn-edit" (click)="openModal(srv)" title="Editar">
              <lucide-icon name="edit-2" [size]="16"></lucide-icon>
            </button>
            <button *ngIf="!srv.activo" class="icon-action-btn btn-activate" (click)="toggleActive(srv, true)" title="Activar">
              <lucide-icon name="power" [size]="16"></lucide-icon>
            </button>
            <button *ngIf="srv.activo" class="icon-action-btn btn-deactivate" (click)="toggleActive(srv, false)" title="Desactivar">
              <lucide-icon name="power" [size]="16"></lucide-icon>
            </button>
            <button class="icon-action-btn btn-delete" (click)="deleteService(srv)" title="Eliminar">
              <lucide-icon name="trash-2" [size]="16"></lucide-icon>
            </button>
          </div>
          
        </div>
      </div>

      <div class="empty-state" *ngIf="filteredServices.length === 0">
        <lucide-icon name="briefcase" [size]="48" color="var(--text-secondary)"></lucide-icon>
        <p *ngIf="services.length === 0">No hay servicios registrados.</p>
        <p *ngIf="services.length > 0">No se encontraron servicios con los filtros actuales.</p>
        <button *ngIf="services.length === 0" class="primary-button" style="margin-top: 16px;" (click)="openModal()">Crea el primer servicio</button>
        <button *ngIf="services.length > 0" class="btn-outline clear-btn" style="margin: 16px auto 0;" (click)="clearFilters()">Limpiar filtros</button>
      </div>

    </div>

    <!-- MODAL -->
    <div *ngIf="isModalOpen" class="modal-overlay">
      <div class="modal-panel-split">
        <!-- Left Side: Form -->
        <div class="modal-form-side">
          <div class="modal-header">
            <div class="header-title">
              <div class="title-icon">
                <lucide-icon name="wrench" [size]="20" color="var(--primary-neon)"></lucide-icon>
              </div>
              <div>
                <h2>{{ editingService ? 'Editar Servicio' : 'Nuevo Servicio' }}</h2>
                <p>{{ editingService ? 'Actualiza los datos del servicio.' : 'Registra un nuevo servicio en el catálogo.' }}</p>
              </div>
            </div>
            <button type="button" class="close-btn" (click)="closeModal()"><lucide-icon name="x" [size]="20"></lucide-icon></button>
          </div>
          
          <form [formGroup]="form" (ngSubmit)="saveService()" class="form-content">
            <div class="form-row">
              <div class="form-field">
                <label>Código del Servicio <span class="req">*</span> <lucide-icon name="info" [size]="14"></lucide-icon></label>
                <div class="input-with-icon">
                  <span class="input-icon"><lucide-icon name="code" [size]="16"></lucide-icon></span>
                  <input type="text" formControlName="codigo" [readonly]="editingService" [class.readonly]="editingService" placeholder="Ej. GASF-01" maxlength="20">
                </div>
                <div class="field-hint">Código único que identifica al servicio. Ej: GASF-01 <span class="char-count">{{ form.get('codigo')?.value?.length || 0 }} / 20</span></div>
              </div>
              <div class="form-field">
                <label>Categoría <span class="req">*</span> <lucide-icon name="info" [size]="14"></lucide-icon></label>
                <div class="input-with-icon">
                  <span class="input-icon"><lucide-icon name="layout-grid" [size]="16"></lucide-icon></span>
                  <select formControlName="categoryCode" class="dark-select">
                    <option value="" disabled>Seleccione una categoría</option>
                    <option *ngFor="let cat of categories" [value]="cat.codigo">{{ cat.nombre }}</option>
                  </select>
                </div>
                <div class="field-hint">Seleccione la categoría a la que pertenece el servicio.</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-field full-width">
                <label>Nombre del Servicio <span class="req">*</span> <lucide-icon name="info" [size]="14"></lucide-icon></label>
                <div class="input-with-icon">
                  <span class="input-icon"><lucide-icon name="type" [size]="16"></lucide-icon></span>
                  <input type="text" formControlName="nombre" placeholder="Ej. Reparación de tuberías" maxlength="100">
                </div>
                <div class="field-hint">Nombre descriptivo del servicio. <span class="char-count">{{ form.get('nombre')?.value?.length || 0 }} / 100</span></div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-field full-width">
                <label>Descripción del Servicio</label>
                <div class="input-with-icon textarea-icon-wrapper">
                  <span class="input-icon align-top"><lucide-icon name="file-text" [size]="16"></lucide-icon></span>
                  <textarea formControlName="descripcion" placeholder="Describe detalladamente el servicio que se ofrece..." maxlength="500"></textarea>
                </div>
                <div class="field-hint">Incluye alcances, materiales, condiciones, etc. <span class="char-count">{{ form.get('descripcion')?.value?.length || 0 }} / 500</span></div>
              </div>
            </div>

            <div class="section-title">
              <lucide-icon name="info" [size]="18" color="#1E90FF"></lucide-icon> Información Comercial
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Precio Base Referencial (S/) <span class="req">*</span> <lucide-icon name="info" [size]="14"></lucide-icon></label>
                <div class="input-with-icon">
                  <span class="input-icon"><lucide-icon name="dollar-sign" [size]="16"></lucide-icon></span>
                  <input type="number" formControlName="precioBaseReferencial" placeholder="0.00" step="0.01" min="0">
                </div>
                <div class="field-hint">Precio base sugerido del servicio.</div>
              </div>
              <div class="form-field">
                <label>Tipo de Cobro <span class="req">*</span> <lucide-icon name="info" [size]="14"></lucide-icon></label>
                <div class="input-with-icon">
                  <span class="input-icon"><lucide-icon name="tag" [size]="16"></lucide-icon></span>
                  <select formControlName="tipoCobro" class="dark-select">
                    <option value="" disabled>Seleccione...</option>
                    <option value="FIJO">Fijo</option>
                    <option value="COTIZACION">Cotización</option>
                    <option value="POR_UNIDAD">Por Unidad</option>
                    <option value="POR_METRO">Por Metro</option>
                  </select>
                </div>
                <div class="field-hint">Forma en que se cobrará el servicio.</div>
              </div>
            </div>

            <div class="section-title">
              <lucide-icon name="star" [size]="18" color="#9D4EDD"></lucide-icon> Evaluación y Requisitos
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Modalidad de Evaluación <span class="req">*</span> <lucide-icon name="info" [size]="14"></lucide-icon></label>
                <div class="input-with-icon">
                  <span class="input-icon"><lucide-icon name="clipboard" [size]="16"></lucide-icon></span>
                  <select formControlName="modalidadEvaluacion" class="dark-select">
                    <option value="" disabled>Seleccione...</option>
                    <option value="REMOTA">Remota (Virtual)</option>
                    <option value="PRESENCIAL">Presencial</option>
                  </select>
                </div>
                <div class="field-hint">Cómo se evaluará la ejecución del servicio.</div>
              </div>
              
              <div class="form-field">
                <div class="checkbox-box-field" style="margin-top: 24px;">
                  <div class="icon-box"><lucide-icon name="camera" [size]="18"></lucide-icon></div>
                  <div class="check-text">
                    <label (click)="toggleFoto()">¿Requiere foto del cliente?</label>
                    <div class="field-hint">Solicitar foto del cliente al finalizar el servicio.</div>
                  </div>
                  <div class="toggle-switch-wrapper" (click)="toggleFoto()">
                    <div class="toggle-switch" [class.active]="form.get('requiereFoto')?.value">
                      <div class="toggle-knob"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="section-title">
              <lucide-icon name="image" [size]="18" color="#38bdf8"></lucide-icon> Imagen y Duración
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>URL de Imagen <lucide-icon name="info" [size]="14"></lucide-icon></label>
                <div class="input-with-icon">
                  <span class="input-icon"><lucide-icon name="image" [size]="16"></lucide-icon></span>
                  <input type="text" formControlName="imageUrl" placeholder="https://ejemplo.com/foto.jpg">
                </div>
                <div class="field-hint">URL de la foto representativa del servicio.</div>
                <img *ngIf="form.get('imageUrl')?.value" [src]="getImagePreviewUrl(form.get('imageUrl')?.value)" style="max-width: 120px; max-height: 80px; border-radius: 8px; margin-top: 8px; border: 1px solid #334155; object-fit: cover;" alt="Vista previa">
              </div>
              <div class="form-field">
                <label>Duración Estimada <lucide-icon name="info" [size]="14"></lucide-icon></label>
                <div class="input-with-icon">
                  <span class="input-icon"><lucide-icon name="clock" [size]="16"></lucide-icon></span>
                  <input type="text" formControlName="duracionEstimada" placeholder="Ej: 2 - 3 horas">
                </div>
                <div class="field-hint">Tiempo estimado para completar el servicio.</div>
              </div>
            </div>

            <div class="section-title">
              <lucide-icon name="shield-check" [size]="18" color="#22C55E"></lucide-icon> Estado del Servicio
            </div>
            <div class="form-row">
              <div class="form-field" style="margin-bottom: 20px;">
                <div class="checkbox-box-field no-border">
                  <div class="toggle-switch-wrapper" (click)="toggleFormActive()">
                    <div class="toggle-switch large-toggle" [class.active]="form.get('activo')?.value">
                      <div class="toggle-knob"></div>
                    </div>
                  </div>
                  <div class="check-text">
                    <label (click)="toggleFormActive()">Servicio {{ form.get('activo')?.value ? 'Activo' : 'Inactivo' }}</label>
                    <div class="field-hint">El servicio estará disponible para asignaciones y cotizaciones.</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-actions-sticky">
              <button type="button" class="btn-cancel" (click)="closeModal()">
                <lucide-icon name="x" [size]="16"></lucide-icon> Cancelar
              </button>
              <button type="submit" class="btn-save" [disabled]="form.invalid">
                <lucide-icon name="save" [size]="16"></lucide-icon> Guardar Servicio
              </button>
            </div>
          </form>
        </div>

        <!-- Right Side: Preview -->
        <div class="modal-preview-side">
          <div class="preview-header">
            <lucide-icon name="eye" [size]="16"></lucide-icon> Vista previa
          </div>
          <div class="preview-card">
            <div class="preview-icon-circle">
              <lucide-icon name="briefcase" [size]="32" color="#1E90FF"></lucide-icon>
            </div>
            
            <div class="preview-label">Código</div>
            <div class="preview-value badge-blue">{{ form.get('codigo')?.value || 'GASF-01' }}</div>
            
            <div class="preview-label">Nombre</div>
            <div class="preview-value-large">{{ form.get('nombre')?.value || 'Reparación de tuberías' }}</div>

            <div class="preview-label">Categoría</div>
            <div class="preview-value badge-orange">{{ getCategoryName(form.get('categoryCode')?.value) || 'Gasfiterías' }}</div>

            <div class="preview-label">Estado</div>
            <div class="preview-value badge-green" *ngIf="form.get('activo')?.value">
              <span class="dot"></span> Activo
            </div>
            <div class="preview-value badge-red" *ngIf="!form.get('activo')?.value">
              <span class="dot"></span> Inactivo
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalog-container {
      margin: 20px auto; 
      max-width: 1100px;
      background: transparent;
      border: none;
      box-shadow: none;
      padding: 0;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-section h1 {
      font-size: 1.8rem;
      margin: 0 0 4px 0;
      color: var(--text-primary);
    }
    .header-section p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .add-button {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--accent-600);
      color: white;
      box-shadow: 0 4px 15px rgba(249,115,22, 0.3);
    }
    .add-button:hover {
      background: var(--accent-neon);
      box-shadow: var(--glow-orange);
    }

    .filters-section {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      align-items: center;
    }

    .search-box, .filter-box {
      display: flex;
      align-items: center;
      background: var(--surface-1);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0 16px;
      height: 44px;
      flex: 1;
      gap: 12px;
      transition: all 0.3s;
    }
    
    .search-box:focus-within {
      border-color: var(--primary-neon);
      box-shadow: var(--glow-blue);
    }

    .filter-box {
      flex: 0 0 250px;
    }

    .filter-box select, .search-box input {
      background: transparent;
      border: none;
      color: var(--text-primary);
      outline: none;
      width: 100%;
      font-size: 0.95rem;
    }
    .filter-box select { cursor: pointer; }
    .dark-select option { background: var(--surface-1); color: var(--text-primary); }

    .clear-btn {
      height: 44px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--primary-neon);
      border-color: var(--primary-700);
    }
    .clear-btn:hover {
      background: rgba(30,144,255, 0.1);
      box-shadow: 0 0 15px rgba(30,144,255, 0.1);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: var(--surface-1);
      border: 1px solid var(--primary-700);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--bg-color);
      border: 1px solid;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-label { font-size: 0.8rem; font-weight: 600; margin-bottom: 4px; }
    .stat-value { font-size: 1.5rem; font-weight: bold; color: var(--text-primary); margin-bottom: 2px; }
    .stat-sub { font-size: 0.75rem; color: var(--text-secondary); }

    .table-header {
      display: flex;
      padding: 12px 24px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--primary-neon);
      letter-spacing: 1px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 12px;
    }

    .list { display: flex; flex-direction: column; gap: 12px; }

    .card-item {
      display: flex;
      align-items: center;
      background: var(--surface-1);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px 24px;
      transition: all 0.3s ease;
    }
    .card-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(30,144,255,0.15);
      border-color: var(--primary-600);
    }

    .icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(30,144,255,0.05);
      border: 1px solid var(--primary-600);
      color: var(--primary-neon);
      box-shadow: inset 0 0 10px rgba(30,144,255,0.2);
    }
    .icon-circle.inactive-icon {
      border-color: var(--border-color);
      color: var(--text-secondary);
      background: var(--surface-2);
      box-shadow: none;
    }

    .card-info h2 {
      margin: 0 0 6px 0;
      font-size: 1rem;
      color: var(--text-primary);
      font-weight: 600;
    }

    .code-badge {
      font-size: 0.75rem;
      font-family: monospace;
      color: var(--text-secondary);
      background: var(--surface-2);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
    }

    .cat-code {
      font-size: 0.75rem;
      font-family: monospace;
      color: var(--primary-neon);
      background: rgba(30,144,255, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .cat-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #a855f7;
      border: 1px solid rgba(168,85,247,0.3);
      background: rgba(168,85,247,0.1);
      padding: 6px 12px;
      border-radius: 20px;
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .status-chip .dot { width: 6px; height: 6px; border-radius: 50%; }
    .status-chip.active { color: var(--success); border: 1px solid var(--success); background: rgba(34, 197, 94, 0.1); }
    .status-chip.active .dot { background: var(--success); box-shadow: 0 0 5px var(--success); }
    .status-chip.inactive { color: var(--error); border: 1px solid var(--error); background: rgba(239, 68, 68, 0.1); }
    .status-chip.inactive .dot { background: var(--error); }

    .icon-action-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: transparent;
      border: 1px solid;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-edit { color: var(--primary-neon); border-color: var(--primary-700); }
    .btn-edit:hover { background: rgba(30,144,255,0.1); box-shadow: 0 0 10px rgba(30,144,255,0.2); }
    .btn-deactivate { color: var(--accent-neon); border-color: var(--accent-900); }
    .btn-deactivate:hover { background: rgba(255,138,0,0.1); box-shadow: 0 0 10px rgba(255,138,0,0.2); }
    .btn-activate { color: var(--success); border-color: rgba(34,197,94,0.3); }
    .btn-activate:hover { background: rgba(34,197,94,0.1); }
    .btn-delete { color: var(--error); border-color: rgba(239,68,68,0.3); }
    .btn-delete:hover { background: rgba(239,68,68,0.1); box-shadow: 0 0 10px rgba(239,68,68,0.2); }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: var(--surface-1);
      border-radius: 12px;
      border: 1px dashed var(--border-color);
    }

    /* Modal Split Form CSS */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(5, 11, 24, 0.85); z-index: 1000; 
      display: flex; align-items: center; justify-content: center; 
      backdrop-filter: blur(8px);
    }
    
    .modal-panel-split {
      display: flex; width: 100%; max-width: 1050px; height: 85vh; max-height: 800px;
      margin: 0 20px; background: var(--surface-1);
      border: 1px solid var(--border-color); box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      border-radius: 12px; overflow: hidden;
    }
    
    .modal-form-side { flex: 2.2; display: flex; flex-direction: column; background: var(--surface-1); border-right: 1px solid var(--border-color); overflow: hidden; }
    
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; background: var(--surface-1);
    }
    .header-title { display: flex; align-items: center; gap: 16px; }
    .title-icon {
      width: 44px; height: 44px; border-radius: 10px; border: 1px solid var(--primary-600);
      background: rgba(30,144,255, 0.1); display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 15px rgba(30,144,255,0.2);
    }
    .modal-header h2 { margin: 0 0 4px 0; font-size: 1.3rem; color: var(--text-primary); }
    .modal-header p { margin: 0; font-size: 0.85rem; color: var(--text-secondary); }
    .close-btn {
      background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-secondary);
      cursor: pointer; padding: 8px; border-radius: 8px; display: flex; transition: 0.2s;
    }
    .close-btn:hover { background: rgba(239,68,68,0.2); color: var(--error); border-color: rgba(239,68,68,0.4); }
    
    .form-content { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
    .section-title {
      font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin: 8px 0 0; padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 8px;
    }
    .form-row { display: flex; gap: 20px; }
    .form-field { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .full-width { width: 100%; }
    .form-field > label { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
    .req { color: var(--error); }
    
    .input-with-icon { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 14px; color: var(--text-secondary); pointer-events: none; display: flex; }
    .input-icon.align-top { top: 14px; }
    .input-with-icon input, .input-with-icon select, .input-with-icon textarea {
      width: 100%; background: var(--surface-2); border: 1px solid var(--border-color);
      color: var(--text-primary); padding: 12px 14px 12px 42px; border-radius: 8px;
      font-size: 0.9rem; font-family: inherit; outline: none; transition: all 0.2s; box-sizing: border-box;
    }
    .input-with-icon select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px; }
    .input-with-icon textarea { height: 90px; resize: vertical; padding-top: 12px; }
    .input-with-icon input:focus, .input-with-icon select:focus, .input-with-icon textarea:focus { border-color: var(--primary-neon); box-shadow: 0 0 10px rgba(30,144,255,0.15); }
    .input-with-icon input.readonly { background: var(--bg-color); color: var(--text-secondary); cursor: not-allowed; opacity: 0.7; }
    
    .field-hint { font-size: 0.75rem; color: var(--text-secondary); display: flex; justify-content: space-between; }
    .char-count { color: var(--text-secondary); }
    
    .checkbox-box-field {
      display: flex; align-items: center; gap: 16px; background: var(--surface-2); border: 1px solid var(--border-color);
      padding: 16px; border-radius: 8px;
    }
    .checkbox-box-field.no-border { background: transparent; border: none; padding: 0; gap: 12px; }
    .icon-box {
      width: 36px; height: 36px; background: var(--surface-1); border-radius: 8px; border: 1px solid var(--border-color);
      display: flex; align-items: center; justify-content: center; color: var(--text-secondary); flex-shrink: 0;
    }
    .check-text { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .check-text label { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); cursor: pointer; margin: 0; }
    
    .toggle-switch-wrapper { cursor: pointer; flex-shrink: 0; }
    .toggle-switch {
      width: 44px; height: 24px; background: var(--surface-1); border: 1px solid var(--border-color);
      border-radius: 12px; position: relative; transition: 0.3s;
    }
    .toggle-knob {
      width: 18px; height: 18px; background: var(--text-secondary); border-radius: 50%;
      position: absolute; top: 2px; left: 2px; transition: 0.3s;
    }
    .toggle-switch.active { background: rgba(30,144,255,0.2); border-color: var(--primary-neon); }
    .toggle-switch.active .toggle-knob { background: var(--primary-neon); transform: translateX(20px); box-shadow: 0 0 8px var(--primary-neon); }
    
    .large-toggle.toggle-switch { width: 56px; height: 32px; border-radius: 16px; }
    .large-toggle .toggle-knob { width: 24px; height: 24px; top: 3px; left: 4px; }
    .large-toggle.active .toggle-knob { transform: translateX(22px); }

    .modal-actions-sticky {
      position: sticky; bottom: -24px; padding: 20px 24px; border-top: 1px solid var(--border-color);
      display: flex; justify-content: flex-end; gap: 16px; background: var(--surface-1); margin: 0 -24px -24px -24px;
      z-index: 10;
    }
    .btn-cancel {
      display: flex; align-items: center; gap: 8px; background: transparent; border: 1px solid var(--border-color);
      color: var(--text-secondary); padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: 0.2s;
    }
    .btn-cancel:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
    .btn-save {
      display: flex; align-items: center; gap: 8px; background: var(--accent-600); border: none;
      color: white; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s;
      box-shadow: 0 4px 15px rgba(249,115,22, 0.3);
    }
    .btn-save:hover:not([disabled]) { background: var(--accent-neon); box-shadow: var(--glow-orange); }
    .btn-save[disabled] { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
    
    .modal-preview-side {
      flex: 1; background: var(--bg-color); display: flex; flex-direction: column; padding: 24px;
    }
    .preview-header {
      display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.95rem;
      color: var(--text-primary); margin-bottom: 24px;
    }
    .preview-card {
      background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 16px;
      padding: 32px 24px; display: flex; flex-direction: column; align-items: center; text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin: auto 0;
    }
    .preview-icon-circle {
      width: 80px; height: 80px; border-radius: 50%; border: 1px dashed var(--primary-600);
      display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
      background: rgba(30,144,255,0.05); box-shadow: 0 0 20px rgba(30,144,255,0.1) inset;
    }
    .preview-label { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .preview-value { font-size: 0.9rem; color: var(--text-primary); font-weight: 500; margin-bottom: 16px; }
    .preview-value-large { font-size: 1.1rem; color: var(--text-primary); font-weight: 600; margin-bottom: 16px; line-height: 1.3; }
    
    .badge-blue { background: rgba(30,144,255,0.15); color: var(--primary-neon); padding: 4px 12px; border-radius: 12px; font-weight: 600; }
    .badge-orange { background: rgba(249,115,22,0.15); color: var(--accent-600); padding: 4px 12px; border-radius: 12px; font-weight: 600; border: 1px solid rgba(249,115,22,0.3); }
    .badge-green { background: rgba(34,197,94,0.15); color: var(--success); padding: 4px 16px; border-radius: 16px; font-weight: 600; border: 1px solid rgba(34,197,94,0.3); display: flex; align-items: center; gap: 6px; }
    .badge-red { background: rgba(239,68,68,0.15); color: var(--error); padding: 4px 16px; border-radius: 16px; font-weight: 600; border: 1px solid rgba(239,68,68,0.3); display: flex; align-items: center; gap: 6px; }
  `]
})
export class CatalogServicesPageComponent implements OnInit {
  services: ServiceCatalogItem[] = [];
  categories: ServiceCategory[] = [];
  
  isModalOpen = false;
  editingService: ServiceCatalogItem | null = null;
  
  form: FormGroup;
  
  private api = inject(AdminCatalogService);
  private fb = inject(FormBuilder);
  private readonly config = inject(SERVIYA_APP_CONFIG);

  constructor() {
    this.form = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(2)]],
      categoryCode: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      precioBaseReferencial: [0, [Validators.min(0)]],
      tipoCobro: ['', Validators.required],
      modalidadEvaluacion: ['', Validators.required],
      requiereFoto: [false],
      imageUrl: [''],
      duracionEstimada: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.load();
    this.api.getCategories().subscribe({
      next: (res) => this.categories = res.filter(c => c.activo),
      error: (err) => console.error('Error cargando categorías', err)
    });
  }

  searchTerm = '';
  categoryFilter = 'ALL';
  statusFilter = 'ALL';

  get totalServices() { return this.services.length; }
  get activeServices() { return this.services.filter(s => s.activo).length; }
  get inactiveServices() { return this.services.filter(s => !s.activo).length; }
  get totalCategories() { return this.categories.length; }

  get filteredServices(): ServiceCatalogItem[] {
    let result = this.services;
    
    if (this.statusFilter === 'ACTIVE') {
      result = result.filter(c => c.activo === true);
    } else if (this.statusFilter === 'INACTIVE') {
      result = result.filter(c => c.activo === false);
    }

    if (this.categoryFilter !== 'ALL') {
      result = result.filter(c => c.categoryCode === this.categoryFilter);
    }
    
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(c => 
        c.nombre.toLowerCase().includes(term) || 
        c.codigo.toLowerCase().includes(term)
      );
    }
    
    return result;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.categoryFilter = 'ALL';
  }

  getCategoryName(code: string): string {
    const cat = this.categories.find(c => c.codigo === code);
    return cat ? cat.nombre : '';
  }

  getImagePreviewUrl(url: string | null | undefined): string {
    if (!url) {
      return '';
    }

    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }

    if (url.startsWith('/assets')) {
      return url;
    }

    if (url.startsWith('/service-request-ms')) {
      return `${this.config.apiBaseUrl}${url}`;
    }

    if (url.startsWith('/api')) {
      return `${this.config.apiBaseUrl}/service-request-ms${url}`;
    }

    return url.startsWith('/') ? `${this.config.apiBaseUrl}${url}` : url;
  }

  load(): void {
    this.api.getServices().subscribe({
      next: (res) => this.services = res,
      error: (err) => console.error('Error cargando servicios', err)
    });
  }

  openModal(service?: ServiceCatalogItem): void {
    if (service) {
      this.editingService = service;
      this.form.patchValue({
        codigo: service.codigo,
        categoryCode: service.categoryCode,
        nombre: service.nombre,
        descripcion: service.descripcion,
        precioBaseReferencial: service.precioBaseReferencial || 0,
        tipoCobro: service.tipoCobro || '',
        modalidadEvaluacion: service.modalidadEvaluacion || '',
        requiereFoto: service.requiereFoto || false,
        imageUrl: service.imageUrl || '',
        duracionEstimada: service.duracionEstimada || '',
        activo: service.activo !== undefined ? service.activo : true
      });
      this.form.get('codigo')?.disable();
    } else {
      this.editingService = null;
      this.form.reset({
        codigo: '',
        categoryCode: '',
        nombre: '',
        descripcion: '',
        precioBaseReferencial: 0,
        tipoCobro: '',
        modalidadEvaluacion: '',
        requiereFoto: false,
        imageUrl: '',
        duracionEstimada: '',
        activo: true
      });
      this.form.get('codigo')?.enable();
    }
    this.isModalOpen = true;
  }

  toggleFoto(): void {
    const ctrl = this.form.get('requiereFoto');
    ctrl?.setValue(!ctrl.value);
  }

  toggleFormActive(): void {
    const ctrl = this.form.get('activo');
    ctrl?.setValue(!ctrl.value);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingService = null;
    this.form.reset();
  }

  saveService(): void {
    if (this.form.invalid) return;
    
    const payload = this.form.getRawValue();

    if (this.editingService) {
      this.api.updateService(payload.codigo, payload).subscribe({
        next: () => {
          this.load();
          this.closeModal();
        },
        error: (err) => alert('Error al actualizar: ' + err.message)
      });
    } else {
      this.api.createService({ ...payload, activo: true }).subscribe({
        next: () => {
          this.load();
          this.closeModal();
        },
        error: (err) => alert('Error al crear: ' + err.message)
      });
    }
  }

  toggleActive(srv: ServiceCatalogItem, active: boolean): void {
    const req = active ? this.api.activateService(srv.codigo) : this.api.deactivateService(srv.codigo);
    req.subscribe(() => this.load());
  }

  deleteService(srv: ServiceCatalogItem): void {
    if (confirm(`¿Está seguro de eliminar el servicio ${srv.nombre}?`)) {
      this.api.deleteService(srv.codigo).subscribe(() => this.load());
    }
  }
}
