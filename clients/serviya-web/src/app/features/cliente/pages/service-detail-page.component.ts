import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicCatalogService, CatalogServiceDTO, CreateServiceRequestDTO } from '../services/public-catalog.service';
import { AddressSelectorComponent } from '../../../shared/components/address-selector/address-selector.component';
import { FormsModule } from '@angular/forms';
import { ClienteAddressService } from '../services/cliente-address.service';

@Component({
  selector: 'app-service-detail-page',
  standalone: true,
  imports: [CommonModule, AddressSelectorComponent, FormsModule],
  template: `
    <div class="service-detail-wrapper">
      
      <!-- Top Nav Bar -->
      <div class="top-nav-bar">
        <div class="nav-left">
          <button class="btn-back-nav" (click)="volverAlCatalogo()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div class="nav-titles">
            <span class="nav-title">Nueva solicitud</span>
            <span class="nav-step">Paso 1 de 3</span>
          </div>
        </div>
        <div class="nav-right">
          <a href="#" class="help-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            ¿Necesitas ayuda?
          </a>
          <button class="btn-bell">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="bell-badge">8</span>
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <p>Cargando detalles del servicio...</p>
      </div>

      <div *ngIf="error" class="error-state">
        <p>Error al cargar el servicio: {{ error }}</p>
      </div>

      <!-- Main Columns Grid -->
      <div class="main-grid" *ngIf="!loading && !error && servicio">
        
        <!-- Left Column: Form Details -->
        <div class="left-column">
          
          <!-- Service Card Header -->
          <div class="service-card">
            <div class="service-avatar-box">
              <img *ngIf="servicio.imageUrl; else defaultAvatar" [src]="servicio.imageUrl" class="service-img" />
              <ng-template #defaultAvatar>
                <div class="service-avatar-fallback">💧</div>
              </ng-template>
            </div>
            
            <div class="service-card-info">
              <h2>{{ servicio.nombre }}</h2>
              <p>{{ servicio.descripcion }}</p>
              
              <div class="badges-row">
                <span class="badge-tag">{{ getEvaluationBadge() }}</span>
                <span class="badge-tag">{{ getEvaluationModeBadge() }}</span>
                <span class="badge-tag">🛡️ Técnicos verificados</span>
                <span class="badge-tag">📄 Cotización posterior</span>
              </div>
            </div>
          </div>

          <!-- Evaluation Cost Card -->
          <div class="cost-card" *ngIf="servicio.tipoCobro === 'COTIZACION'">
            <div class="cost-info">
              <span class="cost-label">{{ getEvaluationCostLabel() }}</span>
              <strong class="cost-value">S/ {{ getEvaluationCost() | number:'1.2-2' }}</strong>
              <p class="cost-desc">{{ getEvaluationDescription() }}</p>
            </div>
            
            <div class="cost-right">
              <div class="checklist-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span class="checklist-price">S/</span>
              </div>
              <div class="payment-methods-row">
                <span>{{ getEvaluationPaymentText() }}</span>
                <div class="payment-logos">
                  <span class="logo-yape" *ngIf="servicio.modalidadEvaluacion === 'PRESENCIAL'">yape</span>
                  <span class="logo-card" *ngIf="servicio.modalidadEvaluacion === 'PRESENCIAL'">💳</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Cost Fixed Card / Cost per Unit -->
          <div class="cost-card" *ngIf="servicio.tipoCobro === 'FIJO' || servicio.tipoCobro === 'POR_UNIDAD' || servicio.tipoCobro === 'POR_METRO'">
            <div class="cost-info">
              <span class="cost-label">{{ servicio.tipoCobro === 'FIJO' ? 'Precio Final' : 'Precio por ' + (servicio.tipoCobro === 'POR_UNIDAD' ? 'Unidad' : 'Metro') }}</span>
              <strong class="cost-value">S/ {{ servicio.precioBaseReferencial | number:'1.2-2' }}</strong>
              <p class="cost-desc">Servicio con tarifa establecida. Garantía directa de ServiYa.</p>
            </div>
            
            <!-- Quantity counter if needed -->
            <div class="cost-right quantity-section" *ngIf="servicio.tipoCobro === 'POR_UNIDAD' || servicio.tipoCobro === 'POR_METRO'">
              <span class="qty-label">Cantidad</span>
              <div class="qty-selector">
                <button type="button" class="qty-btn" (click)="disminuirCantidad()">-</button>
                <input type="number" [(ngModel)]="cantidad" min="1" class="qty-input" />
                <button type="button" class="qty-btn" (click)="aumentarCantidad()">+</button>
              </div>
            </div>
          </div>

          <!-- Request Details -->
          <div class="form-section-card">
            <h3 class="section-title">Detalles de la solicitud</h3>
            
            <!-- Drag and drop zone -->
            <div class="upload-container" *ngIf="servicio.requiereFoto">
              <label class="input-title">Sube una o más fotos del problema</label>
              
              <div class="upload-dropzone" (click)="fileInput.click()">
                <input #fileInput type="file" accept="image/*" multiple (change)="onFileSelected($event)" style="display: none;" />
                <div class="cloud-icon-box">☁️</div>
                <p class="dropzone-text">Arrastra tus archivos aquí o <strong>haz clic para seleccionar</strong></p>
                <span class="dropzone-sub">Formatos: JPG, PNG • Máx. 10 MB por archivo</span>
              </div>
              
              <!-- Selected photos previews -->
              <div class="previews-grid" *ngIf="archivoUrls.length > 0">
                <div class="preview-card" *ngFor="let url of archivoUrls; let idx = index">
                  <img [src]="url" />
                  <button type="button" class="btn-delete-photo" (click)="removePhoto(idx)">×</button>
                </div>
              </div>
              <span class="photos-count-label" *ngIf="archivosSeleccionados.length > 0">
                {{ archivosSeleccionados.length }} fotos cargadas
              </span>

              <p style="color: #f87171; font-size: 0.85rem; margin-top: 8px;" *ngIf="errorFoto">
                ⚠️ Debes subir una foto para solicitar este servicio.
              </p>
            </div>

            <!-- Describe the problem (Mockup element to match image, doesn't affect payload) -->
            <div class="form-group">
              <label class="input-title">Describe el problema</label>
              <div class="textarea-wrapper">
                <textarea rows="3" maxlength="500" [(ngModel)]="descripcionProblema" placeholder="Ejemplo: El tanque tiene filtraciones en la base y el agua sale con mal olor."></textarea>
                <span class="char-counter">{{ descripcionProblema.length }}/500</span>
              </div>
            </div>
          </div>

          <!-- Attention Address -->
          <div class="form-section-card">
            <h3 class="section-title">Dirección de atención</h3>
            
            <app-address-selector (addressSelected)="onAddressSelected($event)"></app-address-selector>
            
            <p style="color: #f87171; font-size: 0.9rem; font-weight: bold; margin-top: 12px;" *ngIf="errorAddress">
              ⚠️ {{ errorAddressMessage }}
            </p>

            <div class="address-preview-box" *ngIf="addressData">
              <span class="addr-icon">📍</span>
              <div class="addr-info">
                <strong>{{ getFormattedAddress() }}</strong>
                <span>{{ addressData.mode === 'new' ? 'Nueva dirección' : 'Dirección guardada' }}</span>
              </div>
              <button type="button" class="btn-ver-mapa-box">Ver en mapa</button>
            </div>
          </div>
        </div>

        <!-- Right Column: Payment summary -->
        <div class="right-column">
          <div class="summary-card">
            <h3 class="summary-title">Resumen de solicitud</h3>
            
            <div class="summary-row">
              <div class="summary-icon-box blue">🔧</div>
              <div class="summary-info">
                <span class="summary-label">Servicio</span>
                <strong class="summary-value">{{ servicio.nombre }}</strong>
              </div>
            </div>

            <div class="summary-row" *ngIf="servicio.tipoCobro === 'COTIZACION'">
              <div class="summary-icon-box orange">📋</div>
              <div class="summary-info">
                <span class="summary-label">Evaluación</span>
                <strong class="summary-value">{{ getEvaluationTitle() }}</strong>
              </div>
              <span class="summary-price">S/ {{ getEvaluationCost() | number:'1.2-2' }}</span>
            </div>

            <div class="summary-row" *ngIf="servicio.tipoCobro === 'FIJO' || servicio.tipoCobro === 'POR_UNIDAD' || servicio.tipoCobro === 'POR_METRO'">
              <div class="summary-icon-box orange">💰</div>
              <div class="summary-info">
                <span class="summary-label">Servicio</span>
                <strong class="summary-value">Costo total</strong>
              </div>
              <span class="summary-price">S/ {{ (servicio.precioBaseReferencial * (servicio.tipoCobro === 'FIJO' ? 1 : cantidad)) | number:'1.2-2' }}</span>
            </div>

            <div class="summary-row" *ngIf="addressData">
              <div class="summary-icon-box purple">📍</div>
              <div class="summary-info">
                <span class="summary-label">Dirección</span>
                <strong class="summary-value truncate">{{ getFormattedAddress() }}</strong>
                <a class="map-link">Ver en mapa</a>
              </div>
            </div>

            <div class="summary-row" *ngIf="servicio.requiereFoto">
              <div class="summary-icon-box green">🖼️</div>
              <div class="summary-info">
                <span class="summary-label">Fotos cargadas</span>
                <strong class="summary-value">Imágenes del problema</strong>
              </div>
              <span class="summary-count">{{ archivosSeleccionados.length }}</span>
            </div>

            <div class="summary-row">
              <div class="summary-icon-box gray">💳</div>
              <div class="summary-info">
                <span class="summary-label">Método de pago</span>
                <strong class="summary-value">{{ getPaymentSummaryText() }}</strong>
              </div>
            </div>

            <!-- Action Button Orange Gradient -->
            <button class="btn-summary-pay" (click)="procesarSolicitud()" [disabled]="procesando">
              <span>{{ getButtonText() }}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>

            <!-- Back to catalog button -->
            <button class="btn-summary-back" (click)="volverAlCatalogo()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; vertical-align: middle;"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Volver al catálogo
            </button>

            <!-- Footer Security -->
            <div class="summary-footer">
              <span>🛡️</span>
              <div class="footer-text">
                <p>Tu información está protegida</p>
                <span>Usamos conexiones seguras (SSL)</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    .service-detail-wrapper {
      color: #f8fafc;
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    /* Top Nav Bar */
    .top-nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 16px 24px;
    }
    .nav-left { display: flex; align-items: center; gap: 16px; }
    .btn-back-nav {
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border-radius: 50%;
      transition: background 0.2s;
    }
    .btn-back-nav:hover { background: #1e293b; color: #cbd5e1; }
    
    .nav-titles { display: flex; flex-direction: column; }
    .nav-title { font-size: 1.15rem; font-weight: 700; color: #f8fafc; }
    .nav-step { font-size: 0.8rem; color: #3b82f6; font-weight: 600; }
    
    .nav-right { display: flex; align-items: center; gap: 20px; }
    .help-link { color: #94a3b8; font-size: 0.88rem; text-decoration: none; display: flex; align-items: center; }
    .help-link:hover { color: #f8fafc; }
    
    .btn-bell {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      position: relative;
      padding: 6px;
    }
    .btn-bell:hover { color: #f8fafc; }
    .bell-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: white;
      font-size: 0.65rem;
      font-weight: bold;
      border-radius: 50%;
      width: 15px;
      height: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .loading-state, .error-state {
      text-align: center;
      padding: 64px 20px;
      color: #94a3b8;
    }
    
    /* Main Grid */
    .main-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 28px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .main-grid { grid-template-columns: 1fr; }
    }
    
    .left-column { display: flex; flex-direction: column; gap: 24px; }
    
    /* Service Card */
    .service-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 28px;
      display: flex;
      gap: 24px;
      align-items: center;
    }
    .service-avatar-box {
      width: 96px;
      height: 96px;
      background: #0f172a;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .service-img { width: 100%; height: 100%; object-fit: cover; }
    .service-avatar-fallback { font-size: 2.8rem; }
    
    .service-card-info { flex: 1; }
    .service-card-info h2 { margin: 0 0 6px 0; font-size: 1.5rem; font-weight: 700; color: #f8fafc; }
    .service-card-info p { margin: 0 0 16px 0; color: #94a3b8; font-size: 0.92rem; line-height: 1.5; }
    
    .badges-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .badge-tag {
      background: rgba(255,255,255,0.03);
      border: 1px solid #1e293b;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.78rem;
      color: #94a3b8;
      font-weight: 500;
    }
    
    /* Cost Card */
    .cost-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 24px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }
    .cost-info { flex: 1; display: flex; flex-direction: column; }
    .cost-label { color: #94a3b8; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .cost-value { color: #f59e0b; font-size: 2rem; font-weight: 800; line-height: 1.2; }
    .cost-desc { margin: 10px 0 0 0; color: #64748b; font-size: 0.85rem; line-height: 1.45; }
    
    .cost-right { display: flex; flex-direction: column; align-items: flex-end; gap: 16px; text-align: right; }
    .checklist-badge {
      width: 52px;
      height: 52px;
      background: rgba(59, 130, 246, 0.08);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .checklist-price {
      position: absolute;
      bottom: 12px;
      right: 14px;
      color: #3b82f6;
      font-size: 0.65rem;
      font-weight: bold;
    }
    .payment-methods-row { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .payment-methods-row span { font-size: 0.75rem; color: #64748b; font-weight: 500; }
    .payment-logos { display: flex; gap: 6px; align-items: center; }
    .logo-yape { font-size: 0.72rem; font-weight: 900; background: #782f87; color: white; padding: 2px 6px; border-radius: 4px; font-style: italic; }
    .logo-card { font-size: 1rem; }
    
    /* Quantity selectors */
    .quantity-section { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .qty-label { font-size: 0.8rem; color: #64748b; font-weight: 600; }
    .qty-selector {
      display: flex;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 10px;
      overflow: hidden;
      align-items: center;
      height: 38px;
    }
    .qty-btn {
      background: transparent;
      border: none;
      color: #f8fafc;
      width: 38px;
      height: 100%;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: bold;
      transition: background 0.2s;
    }
    .qty-btn:hover { background: #1e293b; }
    .qty-input {
      background: transparent;
      border: none;
      border-left: 1px solid #1e293b;
      border-right: 1px solid #1e293b;
      color: #f8fafc;
      width: 50px;
      text-align: center;
      font-size: 0.95rem;
      font-weight: 600;
      height: 100%;
      outline: none;
    }
    
    /* Form Sections */
    .form-section-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 28px;
    }
    .section-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 20px 0;
      position: relative;
      padding-left: 10px;
      display: flex;
      align-items: center;
    }
    .section-title::before {
      content: '';
      position: absolute;
      left: 0;
      width: 3px;
      height: 14px;
      background: #f59e0b;
      border-radius: 2px;
    }
    
    /* Upload zone */
    .upload-container { margin-bottom: 24px; }
    .input-title { display: block; margin-bottom: 8px; color: #cbd5e1; font-weight: 600; font-size: 0.9rem; }
    
    .upload-dropzone {
      background: #0f172a;
      border: 1.5px dashed #1e293b;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .upload-dropzone:hover { border-color: #334155; }
    .cloud-icon-box { font-size: 1.8rem; margin-bottom: 8px; }
    .dropzone-text { margin: 0 0 4px 0; font-size: 0.92rem; color: #cbd5e1; }
    .dropzone-text strong { color: #3b82f6; }
    .dropzone-sub { font-size: 0.78rem; color: #64748b; }
    
    .previews-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px; }
    .preview-card {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      border: 1px solid #1e293b;
    }
    .preview-card img { width: 100%; height: 100%; object-fit: cover; }
    .btn-delete-photo {
      position: absolute;
      top: 4px;
      right: 4px;
      background: rgba(0,0,0,0.6);
      border: none;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.8rem;
    }
    .photos-count-label { display: block; margin-top: 8px; font-size: 0.8rem; color: #3b82f6; font-weight: 600; }

    /* Textarea */
    .textarea-wrapper { position: relative; display: flex; flex-direction: column; }
    .textarea-wrapper textarea {
      width: 100%;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      color: #f8fafc;
      padding: 14px 16px 36px 16px;
      font-size: 0.92rem;
      font-family: inherit;
      outline: none;
      box-sizing: border-box;
      resize: vertical;
      line-height: 1.5;
    }
    .textarea-wrapper textarea:focus { border-color: #3b82f6; }
    .char-counter {
      position: absolute;
      bottom: 12px;
      right: 16px;
      font-size: 0.75rem;
      color: #475569;
      font-weight: 500;
    }

    /* Address Preview Box */
    .address-preview-box {
      margin-top: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: #0f172a;
      border: 1px solid #1e293b;
      padding: 16px;
      border-radius: 12px;
    }
    .addr-icon { font-size: 1.3rem; }
    .addr-info { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .addr-info strong { font-size: 0.9rem; color: #f8fafc; word-break: break-word; }
    .addr-info span { font-size: 0.75rem; color: #64748b; font-weight: 500; }
    .btn-ver-mapa-box {
      background: transparent;
      border: 1px solid #1e293b;
      color: #cbd5e1;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-ver-mapa-box:hover { background: #1e293b; color: #f8fafc; }
    
    /* Right Column Summary */
    .right-column { position: sticky; top: 24px; }
    .summary-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .summary-title { font-size: 1.15rem; font-weight: 700; color: #f8fafc; margin: 0; }
    
    .summary-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      position: relative;
    }
    .summary-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .summary-icon-box.blue { background: rgba(59,130,246,0.1); }
    .summary-icon-box.orange { background: rgba(245,158,11,0.1); }
    .summary-icon-box.purple { background: rgba(168,85,247,0.1); }
    .summary-icon-box.green { background: rgba(34,197,94,0.1); }
    .summary-icon-box.gray { background: rgba(100,116,139,0.1); }
    
    .summary-info { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .summary-label { font-size: 0.78rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .summary-value { font-size: 0.9rem; color: #cbd5e1; font-weight: 600; }
    .summary-value.truncate {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .summary-price { font-size: 1rem; font-weight: 700; color: #f59e0b; margin-top: 4px; }
    .summary-count { font-size: 1rem; font-weight: 700; color: #3b82f6; margin-top: 4px; }
    
    .map-link { font-size: 0.75rem; color: #3b82f6; text-decoration: none; cursor: pointer; display: inline-block; margin-top: 2px; }
    .map-link:hover { text-decoration: underline; }
    
    /* Pay Button Orange Gradient */
    .btn-summary-pay {
      background: linear-gradient(135deg, #f97316 0%, #eab308 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 16px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: opacity 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 16px rgba(249, 115, 22, 0.25);
    }
    .btn-summary-pay:hover:not([disabled]) {
      opacity: 0.95;
      box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4);
    }
    .btn-summary-pay:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }
    
    .btn-summary-back {
      background: transparent;
      border: 1px solid #1e293b;
      color: #94a3b8;
      border-radius: 12px;
      padding: 14px;
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-summary-back:hover { background: #1e293b; color: #f8fafc; }
    
    .summary-footer {
      display: flex;
      gap: 12px;
      align-items: center;
      border-top: 1px solid #1e293b;
      padding-top: 16px;
      margin-top: 8px;
    }
    .summary-footer span { font-size: 1.3rem; }
    .footer-text { display: flex; flex-direction: column; gap: 1px; }
    .footer-text p { margin: 0; font-size: 0.78rem; color: #cbd5e1; font-weight: 600; }
    .footer-text span { font-size: 0.7rem; color: #64748b; }
  `]
})
export class ServiceDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogService = inject(PublicCatalogService);
  private readonly clienteAddressService = inject(ClienteAddressService);

  servicio: CatalogServiceDTO | null = null;
  loading = true;
  error: string | null = null;
  
  archivosSeleccionados: File[] = [];
  archivoUrls: string[] = []; // Preview URLs for uploaded files
  errorFoto = false;
  
  errorAddress = false;
  errorAddressMessage = '';
  
  procesando = false;
  addressData: any = null;
  cantidad = 1;
  descripcionProblema = ''; // Mockup model, doesn't affect payload

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.catalogService.getServicioById(id).subscribe({
        next: (data) => {
          this.servicio = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'No se pudo cargar el servicio.';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.error = 'ID de servicio no proporcionado.';
      this.loading = false;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivosSeleccionados = Array.from(input.files);
      this.archivoUrls = this.archivosSeleccionados.map(file => URL.createObjectURL(file));
      this.errorFoto = false;
    } else {
      this.archivosSeleccionados = [];
      this.archivoUrls = [];
    }
  }

  removePhoto(index: number): void {
    this.archivosSeleccionados.splice(index, 1);
    this.archivoUrls.splice(index, 1);
  }

  onAddressSelected(data: any): void {
    this.addressData = data;
    this.errorAddress = false;
  }

  aumentarCantidad() {
    this.cantidad++;
  }

  disminuirCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  getFormattedAddress(): string {
    if (!this.addressData) return 'No seleccionada';
    let addr = '';
    if (this.addressData.mode === 'new') {
      const { department, province, district, addressLine, reference } = this.addressData.newAddress;
      addr = `${department || ''} - ${province || ''} - ${district || ''}: ${addressLine || ''}`;
      if (reference) addr += ` (Ref: ${reference})`;
    } else {
      addr = this.addressData.savedAddressString || 'Dirección guardada';
    }
    return addr.replace(/,\s*/g, ' - ');
  }

  getButtonText(): string {
    if (this.procesando) return 'Procesando Solicitud...';
    if (!this.servicio) return 'Continuar al pago';
    
    if (this.servicio.tipoCobro === 'FIJO') {
      return `Pagar S/ ${this.servicio.precioBaseReferencial.toFixed(2)}`;
    } else if (this.servicio.tipoCobro === 'COTIZACION') {
      if (this.servicio.modalidadEvaluacion === 'PRESENCIAL') {
        return 'Continuar al pago';
      }
      return 'Solicitar cotización gratis';
    } else if (this.servicio.tipoCobro === 'POR_UNIDAD' || this.servicio.tipoCobro === 'POR_METRO') {
      return `Pagar S/ ${(this.servicio.precioBaseReferencial * this.cantidad).toFixed(2)}`;
    }
    return 'Continuar y Solicitar';
  }

  getEvaluationCost(): number {
    if (!this.servicio || this.servicio.tipoCobro !== 'COTIZACION') return 0;
    return this.servicio.modalidadEvaluacion === 'PRESENCIAL' ? this.servicio.precioBaseReferencial : 0;
  }

  getEvaluationTitle(): string {
    return this.servicio?.modalidadEvaluacion === 'PRESENCIAL'
      ? 'Visita técnica presencial'
      : 'Cotización remota';
  }

  getEvaluationBadge(): string {
    return this.servicio?.modalidadEvaluacion === 'PRESENCIAL'
      ? '👤 Visita técnica'
      : '🖼️ Revisión remota';
  }

  getEvaluationModeBadge(): string {
    return this.servicio?.modalidadEvaluacion === 'PRESENCIAL'
      ? '📋 Evaluación presencial'
      : '📋 Evaluación por fotos';
  }

  getEvaluationCostLabel(): string {
    return this.servicio?.modalidadEvaluacion === 'PRESENCIAL'
      ? 'Costo de evaluación'
      : 'Costo de evaluación remota';
  }

  getEvaluationDescription(): string {
    return this.servicio?.modalidadEvaluacion === 'PRESENCIAL'
      ? 'Un supervisor técnico acudirá a tu domicilio para la evaluación presencial antes de emitir la cotización final.'
      : 'El trabajador revisará las fotos y la descripción del problema para emitir una cotización sin cobrar visita.';
  }

  getEvaluationPaymentText(): string {
    return this.servicio?.modalidadEvaluacion === 'PRESENCIAL'
      ? 'Pago con Yape o tarjeta'
      : 'Sin pago inicial';
  }

  getPaymentSummaryText(): string {
    if (this.servicio?.tipoCobro === 'COTIZACION' && this.servicio.modalidadEvaluacion === 'REMOTA') {
      return 'Cotización remota gratis';
    }
    return 'Pago con Yape o tarjeta';
  }

  volverAlCatalogo() {
    this.router.navigate(['/cliente/servicios']);
  }

  procesarSolicitud(): void {
    if (!this.servicio) return;

    this.errorFoto = false;
    this.errorAddress = false;

    // Validación de foto universal (si el servicio lo marca como true en DB)
    if (this.servicio.requiereFoto && this.archivosSeleccionados.length === 0) {
      this.errorFoto = true;
      return;
    }

    // Validación estricta de dirección
    if (!this.addressData) {
      this.errorAddress = true;
      this.errorAddressMessage = 'Por favor, selecciona o completa una dirección de atención.';
      return;
    }

    if (this.addressData.mode === 'saved' && !this.addressData.savedAddressId) {
      this.errorAddress = true;
      this.errorAddressMessage = 'Debes elegir una de tus direcciones guardadas.';
      return;
    }

    if (this.addressData.mode === 'new') {
      const { department, province, district, addressLine, lat, lng } = this.addressData.newAddress;
      
      if (!department || !province || !district || !addressLine) {
        this.errorAddress = true;
        this.errorAddressMessage = 'Debes completar el Departamento, Provincia, Distrito y tu Dirección Exacta.';
        return;
      }
      
      // Validación estricta del mapa
      if (!lat || !lng || (lat === 0 && lng === 0)) {
        this.errorAddress = true;
        this.errorAddressMessage = 'Es obligatorio marcar la ubicación en el mapa interactivo para asegurar que el técnico llegue al lugar correcto.';
        return;
      }
    }

    // Construir Payload
    let finalAddressString = '';
    let lat = 0;
    let lng = 0;

    if (this.addressData.mode === 'new') {
      const { department, province, district, addressLine, reference, lat: latN, lng: lngN } = this.addressData.newAddress;
      finalAddressString = `${department}, ${province}, ${district}: ${addressLine}`;
      if (reference) finalAddressString += ` (Ref: ${reference})`;
      lat = latN;
      lng = lngN;
    } else {
      finalAddressString = this.addressData.savedAddressString || `ID de dirección guardada: ${this.addressData.savedAddressId}`;
    }

    const saveAddressAction = () => {
      if (this.addressData.mode === 'new' && this.addressData.saveAddress) {
        const { department, province, district, addressLine, reference } = this.addressData.newAddress;
        return this.clienteAddressService.createAddress({
          department,
          province,
          district,
          addressLine,
          reference: reference || null,
          primary: false
        });
      }
      return null;
    };

    const enviarSolicitud = (fotoKeys: string[] = []) => {
      const payload: CreateServiceRequestDTO = {
        catalogServiceId: this.servicio!.id,
        direccionFisica: finalAddressString,
        latitud: lat,
        longitud: lng,
        cantidad: this.cantidad,
        urlEvidencia: fotoKeys[0],
        evidenciaUrls: fotoKeys
      };

      this.procesando = true;
      this.catalogService.crearSolicitud(payload).subscribe({
        next: (response) => {
          this.procesando = false;
          
          // Redirigir al checkout
          if (this.servicio?.tipoCobro === 'FIJO' || this.servicio?.tipoCobro === 'POR_UNIDAD' || this.servicio?.tipoCobro === 'POR_METRO') {
            this.router.navigate(['/cliente/checkout'], { queryParams: { solicitudId: response.id, monto: response.costoTotal }});
          } else if (this.servicio?.tipoCobro === 'COTIZACION' && this.servicio?.modalidadEvaluacion === 'PRESENCIAL') {
            this.router.navigate(['/cliente/checkout'], { queryParams: { solicitudId: response.id, montoVisita: response.costoVisita }});
          } else if (this.servicio?.tipoCobro === 'COTIZACION') {
            this.router.navigate(['/cliente/solicitudes', response.id]);
          } else {
            this.router.navigate(['/cliente/checkout'], { queryParams: { solicitudId: response.id, montoVisita: response.costoVisita }});
          }
        },
        error: (err) => {
          this.procesando = false;
          alert('Ocurrió un error al crear la solicitud en la base de datos.');
          console.error(err);
        }
      });
    };

    const prepararYEnviarSolicitud = () => {
      if (this.archivosSeleccionados.length > 0) {
        this.procesando = true;
        this.catalogService.uploadEvidencias(this.archivosSeleccionados).subscribe({
          next: (res) => {
            enviarSolicitud(res.urls && res.urls.length > 0 ? res.urls : [res.url]);
          },
          error: (err) => {
            console.error('Error al subir imagen', err);
            enviarSolicitud();
          }
        });
      } else {
        enviarSolicitud();
      }
    };

    const request$ = saveAddressAction();
    if (request$) {
      this.procesando = true;
      request$.subscribe({
        next: () => {
          prepararYEnviarSolicitud();
        },
        error: (err) => {
          console.error('Error guardando la dirección:', err);
          prepararYEnviarSolicitud();
        }
      });
    } else {
      prepararYEnviarSolicitud();
    }
  }
}
