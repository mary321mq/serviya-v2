import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AdminCatalogService, ServiceCategory } from '../services/admin-catalog.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-catalog-categories-page',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    LucideAngularModule
  ],
  template: `
    <div class="page-panel catalog-container">
      <div class="header-section">
        <div>
          <h1>Categorías del Catálogo</h1>
          <p>Gestiona las categorías de servicios disponibles en la plataforma.</p>
        </div>
        <button class="primary-button add-button" (click)="openModal()">
          <lucide-icon name="plus" [size]="18"></lucide-icon>
          Nueva Categoría
        </button>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <lucide-icon name="search" [size]="18" color="var(--text-secondary)"></lucide-icon>
          <input type="text" placeholder="Buscar categoría..." [(ngModel)]="searchTerm">
        </div>
        <div class="filter-box">
          <lucide-icon name="filter" [size]="18" color="var(--accent-600)"></lucide-icon>
          <select [(ngModel)]="statusFilter" class="dark-select">
            <option value="ALL">Filtrar por estado (Todos)</option>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
          </select>
        </div>
        <button class="btn-outline clear-btn" (click)="clearFilters()">
          <lucide-icon name="power" [size]="16" style="transform: rotate(180deg)"></lucide-icon> Limpiar filtros
        </button>
      </div>
      
      <div class="list" *ngIf="filteredCategories.length > 0">
        <div class="card-item" *ngFor="let cat of filteredCategories">
          <div class="card-left">
            <div class="icon-circle" [class.inactive-icon]="!cat.activo">
              <lucide-icon [name]="getIconForCategory(cat.codigo)" [size]="24"></lucide-icon>
            </div>
            <div class="card-info">
              <h2>{{ cat.nombre }}</h2>
              <span class="code-badge">{{ cat.codigo }}</span>
            </div>
          </div>
          
          <div class="card-right">
            <span class="status-chip" [class.active]="cat.activo" [class.inactive]="!cat.activo">
              {{ cat.activo ? 'Activo' : 'Inactivo' }}
            </span>
            <div class="button-row">
              <button class="btn-outline btn-edit" (click)="openModal(cat)" title="Editar">
                <lucide-icon name="edit" [size]="14"></lucide-icon> Editar
              </button>
              <button *ngIf="!cat.activo" class="btn-outline btn-activate" (click)="toggleActive(cat, true)" title="Activar">
                <lucide-icon name="power" [size]="14"></lucide-icon> Activar
              </button>
              <button *ngIf="cat.activo" class="btn-outline btn-deactivate" (click)="toggleActive(cat, false)" title="Desactivar">
                <lucide-icon name="power" [size]="14"></lucide-icon> Desactivar
              </button>
              <button class="btn-outline btn-delete" (click)="deleteCategory(cat)" title="Eliminar">
                <lucide-icon name="trash-2" [size]="14"></lucide-icon> Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="filteredCategories.length === 0">
        <lucide-icon name="briefcase" [size]="48" color="var(--text-secondary)"></lucide-icon>
        <p *ngIf="categories.length === 0">No hay categorías registradas.</p>
        <p *ngIf="categories.length > 0">No se encontraron categorías con los filtros actuales.</p>
        <button *ngIf="categories.length === 0" class="primary-button" style="margin-top: 16px;" (click)="openModal()">Crea la primera categoría</button>
        <button *ngIf="categories.length > 0" class="btn-outline clear-btn" style="margin: 16px auto 0;" (click)="clearFilters()">Limpiar filtros</button>
      </div>
    </div>

    <!-- Modal Form overlay -->
    <div *ngIf="isModalOpen" class="modal-overlay">
      <div class="page-panel modal-panel">
        
        <div class="modal-header">
          <div class="header-title">
            <div class="title-icon">
              <lucide-icon name="layout-grid" [size]="24" color="var(--primary-neon)"></lucide-icon>
            </div>
            <div>
              <h2>{{ editingCategory ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
              <p>Crea una nueva categoría para organizar tus servicios.</p>
            </div>
          </div>
          <button class="close-btn" (click)="closeModal()">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>
        
        <form [formGroup]="form" (ngSubmit)="saveCategory()">
          <div class="modal-body-split">
            
            <div class="form-column">
              <!-- CÓDIGO -->
              <div class="form-row">
                <div class="row-icon"><lucide-icon name="code" [size]="20" color="var(--accent-neon)"></lucide-icon></div>
                <div class="row-content">
                  <label>Código</label>
                  <input type="text" formControlName="codigo" [readonly]="editingCategory" 
                         [class.readonly]="editingCategory" placeholder="Ej. GASF" maxlength="10">
                  <div class="input-helper">
                    <span>Código único de la categoría. Ej: GASF, ELEC, MANT</span>
                    <span>{{ form.get('codigo')?.value?.length || 0 }} / 10</span>
                  </div>
                  <span class="error-msg" *ngIf="form.get('codigo')?.touched && form.get('codigo')?.invalid">Requerido (min 2).</span>
                </div>
              </div>
              
              <!-- NOMBRE -->
              <div class="form-row">
                <div class="row-icon"><lucide-icon name="type" [size]="20" color="var(--accent-neon)"></lucide-icon></div>
                <div class="row-content">
                  <label>Nombre</label>
                  <input type="text" formControlName="nombre" placeholder="Ej. Gasfitería" maxlength="60">
                  <div class="input-helper">
                    <span>Nombre descriptivo de la categoría</span>
                    <span>{{ form.get('nombre')?.value?.length || 0 }} / 60</span>
                  </div>
                  <span class="error-msg" *ngIf="form.get('nombre')?.touched && form.get('nombre')?.invalid">Requerido.</span>
                </div>
              </div>

              <!-- ÍCONO -->
              <div class="form-row">
                <div class="row-icon"><lucide-icon name="image" [size]="20" color="var(--accent-neon)"></lucide-icon></div>
                <div class="row-content">
                  <label>Ícono</label>
                  <div class="icon-grid">
                    <button type="button" class="icon-btn add-custom-icon">
                      <lucide-icon name="plus" [size]="20" color="var(--primary-neon)"></lucide-icon>
                      <span>Elegir ícono</span>
                    </button>
                    <button type="button" class="icon-btn" *ngFor="let icon of iconsList" 
                            [class.selected]="form.get('icono')?.value === icon"
                            (click)="form.patchValue({icono: icon})">
                      <lucide-icon [name]="icon" [size]="20" [color]="form.get('icono')?.value === icon ? 'var(--accent-neon)' : 'var(--primary-neon)'"></lucide-icon>
                    </button>
                  </div>
                  <div class="input-helper">
                    <span>Selecciona un ícono que represente la categoría</span>
                  </div>
                </div>
              </div>

              <!-- DESCRIPCIÓN -->
              <div class="form-row">
                <div class="row-icon"><lucide-icon name="file-text" [size]="20" color="var(--accent-neon)"></lucide-icon></div>
                <div class="row-content">
                  <label>Descripción</label>
                  <textarea formControlName="descripcion" placeholder="Describe brevemente esta categoría..." maxlength="255"></textarea>
                  <div class="input-helper">
                    <span>Explica qué servicios incluye esta categoría (opcional)</span>
                    <span>{{ form.get('descripcion')?.value?.length || 0 }} / 255</span>
                  </div>
                </div>
              </div>

              <!-- ESTADO -->
              <div class="form-row">
                <div class="row-icon"><lucide-icon name="bar-chart-2" [size]="20" color="var(--accent-neon)"></lucide-icon></div>
                <div class="row-content" style="flex-direction: row; align-items: center; gap: 16px;">
                  <div class="toggle-switch" [class.active]="form.get('activo')?.value" (click)="toggleFormActive()">
                    <div class="toggle-knob"></div>
                  </div>
                  <div>
                    <label style="margin-bottom: 2px;">Estado</label>
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">
                      {{ form.get('activo')?.value ? 'La categoría estará disponible para su uso' : 'La categoría NO estará disponible' }}
                    </span>
                  </div>
                </div>
              </div>

            </div>
            
            <div class="preview-column">
              <div class="preview-header">
                <lucide-icon name="eye" [size]="16" color="var(--primary-neon)"></lucide-icon>
                <span>Vista previa</span>
              </div>
              <div class="preview-content">
                
                <div class="preview-icon">
                  <lucide-icon [name]="form.get('icono')?.value || 'wrench'" [size]="48" color="var(--primary-neon)"></lucide-icon>
                </div>
                
                <div class="preview-field">
                  <span class="preview-label">Código</span>
                  <span class="preview-code">{{ form.get('codigo')?.value || 'GASF' }}</span>
                </div>
                
                <div class="preview-field">
                  <span class="preview-label">Nombre</span>
                  <span class="preview-title">{{ form.get('nombre')?.value || 'Gasfitería' }}</span>
                </div>

                <div class="preview-field">
                  <span class="preview-label">Estado</span>
                  <span class="preview-status" [class.active]="form.get('activo')?.value" [class.inactive]="!form.get('activo')?.value">
                    <span class="dot"></span> {{ form.get('activo')?.value ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>

                <p class="preview-footer">Así se mostrará la categoría en el catálogo de servicios.</p>
              </div>
            </div>
            
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn-outline btn-cancel" (click)="closeModal()">
              <lucide-icon name="x" [size]="16"></lucide-icon> Cancelar
            </button>
            <button type="submit" class="primary-button btn-save" [disabled]="form.invalid">
              <lucide-icon name="save" [size]="16"></lucide-icon> Guardar Categoría
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .catalog-container {
      margin: 20px auto; 
      max-width: 1000px;
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
    
    .filter-box select {
      cursor: pointer;
    }

    .dark-select option {
      background: var(--surface-1);
      color: var(--text-primary);
    }

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

    .list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--surface-1);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px 24px;
      transition: all 0.3s ease;
    }

    .card-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(30,144,255,0.15);
      border-color: var(--primary-600);
    }

    .card-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-color);
      border: 2px solid var(--primary-neon);
      color: var(--primary-neon);
      box-shadow: inset 0 0 10px rgba(30,144,255,0.3), 0 0 15px rgba(30,144,255,0.2);
    }
    
    .icon-circle.inactive-icon {
      border-color: var(--text-secondary);
      color: var(--text-secondary);
      box-shadow: none;
    }

    .card-info h2 {
      margin: 0 0 6px 0;
      font-size: 1.15rem;
      color: var(--text-primary);
      font-weight: 600;
    }

    .code-badge {
      font-size: 0.8rem;
      font-family: monospace;
      color: var(--primary-neon);
      background: rgba(30,144,255, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
    }

    .card-right {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .status-chip {
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-chip.active {
      color: var(--success);
      border: 1px solid var(--success);
      background: rgba(34, 197, 94, 0.1);
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.15);
    }

    .status-chip.inactive {
      color: var(--error);
      border: 1px solid var(--error);
      background: rgba(239, 68, 68, 0.1);
    }

    .button-row {
      display: flex;
      gap: 12px;
    }

    .btn-outline {
      background: transparent;
      border: 1px solid;
      border-radius: 6px;
      padding: 6px 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-edit {
      color: var(--primary-neon);
      border-color: var(--primary-700);
    }
    .btn-edit:hover { background: rgba(30,144,255,0.1); box-shadow: 0 0 10px rgba(30,144,255,0.2); }

    .btn-deactivate {
      color: var(--accent-neon);
      border-color: var(--accent-900);
    }
    .btn-deactivate:hover { background: rgba(255,138,0,0.1); box-shadow: 0 0 10px rgba(255,138,0,0.2); }

    .btn-activate {
      color: var(--success);
      border-color: rgba(34,197,94,0.3);
    }
    .btn-activate:hover { background: rgba(34,197,94,0.1); }

    .btn-delete {
      color: var(--error);
      border-color: rgba(239,68,68,0.3);
    }
    .btn-delete:hover { background: rgba(239,68,68,0.1); box-shadow: 0 0 10px rgba(239,68,68,0.2); }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: var(--surface-1);
      border-radius: 12px;
      border: 1px dashed var(--border-color);
    }

    /* Modal Form */
    .modal-overlay {
      position: fixed; 
      top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(5, 11, 24, 0.85); 
      z-index: 1000; 
      display: flex; align-items: center; justify-content: center; 
      backdrop-filter: blur(8px);
    }
    
    .modal-panel {
      width: 100%; 
      max-width: 800px; 
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      margin: 0 20px;
      background: var(--surface-1);
      border: 1px solid var(--border-color);
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      padding: 0;
      border-radius: 12px;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--primary-600);
      background: rgba(30,144,255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 10px rgba(30,144,255,0.2), 0 0 15px rgba(30,144,255,0.1);
    }

    .modal-header h2 {
      margin: 0 0 2px 0;
      font-size: 1.2rem;
      color: var(--text-primary);
    }
    .modal-header p {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 6px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .close-btn:hover {
      background: var(--surface-2);
      color: var(--text-primary);
    }

    form {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .modal-body-split {
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 24px;
      padding: 20px 24px;
      overflow-y: auto;
    }

    .form-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 12px;
    }

    .row-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(255,138,0,0.05);
      border: 1px solid var(--accent-900);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .row-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .row-content label {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-primary);
    }

    .row-content input, .row-content textarea {
      background: var(--surface-2);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: all 0.2s;
      width: 100%;
    }

    .row-content textarea {
      height: 80px;
      resize: vertical;
    }

    .row-content input:focus, .row-content textarea:focus {
      border-color: var(--primary-neon);
      box-shadow: 0 0 10px rgba(30,144,255,0.2);
    }

    .input-helper {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .icon-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .icon-btn {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--surface-2);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      border-color: var(--primary-neon);
      background: rgba(30,144,255,0.1);
    }

    .icon-btn.selected {
      border-color: var(--accent-neon);
      background: rgba(255,138,0,0.1);
      box-shadow: 0 0 10px rgba(255,138,0,0.2);
    }

    .icon-btn.add-custom-icon {
      width: 80px;
      flex-direction: column;
      gap: 4px;
    }
    .add-custom-icon span {
      font-size: 0.65rem;
      color: var(--text-secondary);
    }

    /* Toggle Switch */
    .toggle-switch {
      width: 44px;
      height: 24px;
      background: var(--border-color);
      border-radius: 12px;
      position: relative;
      cursor: pointer;
      transition: all 0.3s;
    }
    .toggle-switch.active {
      background: var(--primary-600);
      box-shadow: 0 0 10px rgba(30,144,255,0.4);
    }
    .toggle-knob {
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: all 0.3s;
    }
    .toggle-switch.active .toggle-knob {
      left: 22px;
      box-shadow: 0 0 8px rgba(255,255,255,0.8);
    }

    /* Preview Column */
    .preview-column {
      background: var(--surface-2);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .preview-header {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 24px;
      align-self: flex-start;
    }

    .preview-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    .preview-icon {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: var(--bg-color);
      border: 2px solid var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      box-shadow: 0 0 20px rgba(30,144,255,0.15), inset 0 0 15px rgba(30,144,255,0.1);
    }

    .preview-field {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 16px;
      gap: 4px;
    }

    .preview-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .preview-code {
      font-size: 0.75rem;
      font-family: monospace;
      color: var(--primary-neon);
      background: rgba(30,144,255,0.1);
      padding: 4px 12px;
      border-radius: 4px;
      letter-spacing: 1px;
    }

    .preview-title {
      font-size: 1.1rem;
      color: var(--text-primary);
      font-weight: 600;
    }

    .preview-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 12px;
    }
    .preview-status .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .preview-status.active {
      color: var(--success);
      background: rgba(34,197,94,0.1);
    }
    .preview-status.active .dot {
      background: var(--success);
      box-shadow: 0 0 5px var(--success);
    }
    .preview-status.inactive {
      color: var(--error);
      background: rgba(239,68,68,0.1);
    }
    .preview-status.inactive .dot {
      background: var(--error);
    }

    .preview-footer {
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 20px;
      line-height: 1.4;
    }

    .modal-actions {
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background: var(--bg-color);
      flex-shrink: 0;
    }

    .btn-save {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-cancel {
      border-color: var(--border-color);
      color: var(--text-secondary);
    }
    .btn-cancel:hover {
      background: var(--surface-2);
      color: var(--text-primary);
    }
  `]
})
export class CatalogCategoriesPageComponent implements OnInit {
  categories: ServiceCategory[] = [];
  isModalOpen = false;
  editingCategory: ServiceCategory | null = null;
  
  searchTerm = '';
  statusFilter = 'ALL';

  iconsList = ['droplet', 'zap', 'wrench', 'home', 'paint-bucket', 'flame', 'briefcase', 'fan', 'snowflake', 'car', 'plug', 'more-horizontal'];

  form: FormGroup;
  
  private service = inject(AdminCatalogService);
  private fb = inject(FormBuilder);

  constructor() {
    this.form = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(2)]],
      nombre: ['', Validators.required],
      descripcion: [''],
      icono: ['wrench', Validators.required],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.getCategories().subscribe({
      next: (res) => this.categories = res,
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  get filteredCategories(): ServiceCategory[] {
    let result = this.categories;
    
    if (this.statusFilter === 'ACTIVE') {
      result = result.filter(c => c.activo === true);
    } else if (this.statusFilter === 'INACTIVE') {
      result = result.filter(c => c.activo === false);
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
  }

  getIconForCategory(code: string): string {
    const cat = this.categories.find(c => c.codigo === code);
    if (cat && cat.icono) {
      return cat.icono;
    }
    return 'wrench';
  }

  toggleFormActive(): void {
    const act = this.form.get('activo');
    if (act) act.setValue(!act.value);
  }

  openModal(category?: ServiceCategory): void {
    if (category) {
      this.editingCategory = category;
      this.form.patchValue({
        codigo: category.codigo,
        nombre: category.nombre,
        descripcion: category.descripcion,
        icono: category.icono || 'wrench',
        activo: category.activo
      });
    } else {
      this.editingCategory = null;
      this.form.reset({
        codigo: '',
        nombre: '',
        descripcion: '',
        icono: 'wrench',
        activo: true
      });
    }
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingCategory = null;
    this.form.reset();
  }

  saveCategory(): void {
    if (this.form.invalid) return;
    
    const payload = this.form.getRawValue();

    if (this.editingCategory) {
      this.service.updateCategory(payload.codigo, payload).subscribe({
        next: () => {
          this.load();
          this.closeModal();
        },
        error: (err) => alert('Error al actualizar: ' + err.message)
      });
    } else {
      this.service.createCategory({ ...payload, activo: true }).subscribe({
        next: () => {
          this.load();
          this.closeModal();
        },
        error: (err) => alert('Error al crear: ' + err.message)
      });
    }
  }

  deleteCategory(cat: ServiceCategory): void {
    if(confirm(`¿Estás seguro de eliminar la categoría ${cat.nombre}?`)) {
      this.service.deleteCategory(cat.codigo).subscribe({
        next: () => this.load(),
        error: (err) => alert('Error al eliminar: ' + err.message)
      });
    }
  }

  toggleActive(cat: ServiceCategory, active: boolean): void {
    const action = active ? 'activar' : 'desactivar';
    if(confirm(`¿Estás seguro de ${action} la categoría ${cat.nombre}?`)) {
      // In a real app, you'd have an endpoint for this.
      // For now we'll just update it fully with the flag changed
      const payload = { ...cat, activo: active };
      this.service.updateCategory(cat.codigo, payload).subscribe({
        next: () => this.load(),
        error: (err) => alert(`Error al ${action}: ` + err.message)
      });
    }
  }
}
