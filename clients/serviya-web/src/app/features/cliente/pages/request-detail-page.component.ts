import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { TechnicianMatch } from '../models/service-request.model';
import { NotificationService } from '../services/notification.service';
import { ServiceRequestResponseDTO } from '../services/public-catalog.service';
import { ServiceRequestService } from '../services/service-request.service';
import { PublicCatalogService } from '../services/public-catalog.service';
import { PaymentService, PagoCliente } from '../services/payment.service';
import { SERVIYA_APP_CONFIG } from '../../../core/config/app-config';

@Component({
  selector: 'app-request-detail-page',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink, FormsModule, LucideAngularModule],
  template: `
    <div class="detail-page-container" *ngIf="request">
      
      <!-- Left Pane -->
      <div class="left-pane">
        <a routerLink="/cliente/solicitudes" class="back-link">
          <lucide-icon name="chevron-left" [size]="18"></lucide-icon> Volver a solicitudes
        </a>
        
        <div class="header-flex-row">
          <div class="header-details">
            <h1 class="page-title">{{ request.catalogoServicio.nombre }}</h1>
            <div class="status-pill-wrapper">
              <span class="status-pill" [ngClass]="getStatusClass(request.estadoSolicitud)">
                <span class="status-dot"></span> {{ estadoLegible(request.estadoSolicitud) }}
              </span>
            </div>
            <p class="status-description">{{ getStatusDescription(request.estadoSolicitud) }}</p>
          </div>

          <!-- Neon Service Art -->
          <div class="service-art-card">
            <ng-container [ngSwitch]="request.catalogoServicio.categoryCode.toUpperCase()">
              <svg *ngSwitchCase="'ELECTRICIDAD'" class="art-svg" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="15" width="70" height="90" rx="16" stroke="#3b82f6" stroke-width="2" stroke-dasharray="3 3" />
                <path d="M50 30 L35 60 H50 L45 90 L65 50 H50 Z" stroke="#3b82f6" stroke-width="3" stroke-linejoin="round" fill="rgba(59, 130, 246, 0.2)" />
              </svg>
              <svg *ngSwitchCase="'GASFITERIA'" class="art-svg" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="25" y="15" width="50" height="85" rx="20" stroke="#3b82f6" stroke-width="3" fill="rgba(59, 130, 246, 0.1)" />
                <rect x="40" y="35" width="20" height="20" rx="4" stroke="#3b82f6" stroke-width="2" />
                <path d="M45 45 L50 40 L55 45" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" />
                <rect x="35" y="100" width="10" height="8" stroke="#3b82f6" stroke-width="2" />
                <rect x="55" y="100" width="10" height="8" stroke="#3b82f6" stroke-width="2" />
                <circle cx="50" cy="70" r="4" fill="#3b82f6" />
              </svg>
              <svg *ngSwitchCase="'CERRAJERIA'" class="art-svg" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="45" width="60" height="50" rx="12" stroke="#3b82f6" stroke-width="3" fill="rgba(59, 130, 246, 0.1)" />
                <path d="M32 45 V30 C32 20 40 12 50 12 C60 12 68 20 68 30 V45" stroke="#3b82f6" stroke-width="3" />
                <circle cx="50" cy="65" r="6" stroke="#3b82f6" stroke-width="2" />
                <path d="M50 71 V81" stroke="#3b82f6" stroke-width="2" />
              </svg>
              <svg *ngSwitchDefault class="art-svg" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="15" width="70" height="90" rx="16" stroke="#3b82f6" stroke-width="2" fill="rgba(59, 130, 246, 0.05)" />
                <circle cx="50" cy="50" r="22" stroke="#3b82f6" stroke-width="3" fill="rgba(59, 130, 246, 0.1)" />
                <path d="M50 32 V38 M50 62 V68 M32 50 H38 M62 50 H68" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" />
              </svg>
            </ng-container>
          </div>
        </div>
        
        <div class="info-cards-stack">
          <!-- Fotos -->
          <div class="info-card vertical">
            <div class="card-header-flex">
              <div class="flex-align">
                <div class="card-icon-circle blue">
                  <lucide-icon name="camera" [size]="20"></lucide-icon>
                </div>
                <h3>Fotos del problema</h3>
              </div>
              <a href="#" class="link-action" *ngIf="getEvidenciaUrls(request).length > 0">
                Ver todas ({{ getEvidenciaUrls(request).length }})
              </a>
            </div>
            
            <div class="photos-row">
              <input #fileInput type="file" accept="image/*" multiple (change)="onFileSelected($event)" style="display: none;">
              <div class="photos-grid" *ngIf="getEvidenciaUrls(request).length > 0">
                <a *ngFor="let url of getEvidenciaUrls(request); let i = index" [href]="getEvidenciaUrl(url)" target="_blank">
                  <img [src]="getEvidenciaUrl(url)" [alt]="'Evidencia ' + (i + 1)">
                </a>
              </div>
              <div *ngIf="getEvidenciaUrls(request).length === 0" class="no-photos">
                No se adjuntaron fotos.
              </div>
              
              <!-- Add More Card -->
              <div class="add-more-card" (click)="fileInput.click()">
                <span class="plus-icon">+</span>
                <span class="label">Agregar más</span>
              </div>
            </div>
          </div>

          <!-- Historial -->
          <div class="info-card vertical">
            <div class="flex-align mb-16">
              <div class="card-icon-circle blue">
                <lucide-icon name="history" [size]="20"></lucide-icon>
              </div>
              <h3>Historial / seguimiento</h3>
            </div>
            
            <div class="stepper-wrapper">
              <!-- Solicitud creada -->
              <div class="step completed">
                <div class="step-icon">
                  <lucide-icon name="clipboard-check" [size]="16"></lucide-icon>
                </div>
                <div class="step-label">Solicitud creada</div>
                <div class="step-date">{{ request.createdAt | date:'d MMM, yyyy h:mm a' }}</div>
              </div>
              <div class="step-line completed"></div>
              
              <!-- Cotizada -->
              <div class="step" [class.completed]="isStepCompleted('COTIZADA')" [class.active]="isStepActive('COTIZADA')">
                <div class="step-icon">
                  <lucide-icon *ngIf="isStepCompleted('COTIZADA')" name="check" [size]="16"></lucide-icon>
                  <lucide-icon *ngIf="!isStepCompleted('COTIZADA')" name="megaphone" [size]="16"></lucide-icon>
                </div>
                <div class="step-label">Cotización enviada</div>
                <div class="step-date" *ngIf="isStepCompleted('COTIZADA')">{{ request.updatedAt | date:'d MMM, yyyy h:mm a' }}</div>
                <div class="step-date" *ngIf="!isStepCompleted('COTIZADA')">Pendiente</div>
              </div>
              <div class="step-line" [class.completed]="isStepCompleted('COTIZADA')"></div>

              <!-- Esperando pago / Aceptada -->
              <div class="step" [class.completed]="isStepCompleted('ACEPTADA')" [class.active]="isStepActive('ACEPTADA')">
                <div class="step-icon">
                  <lucide-icon name="dollar-sign" [size]="16"></lucide-icon>
                </div>
                <div class="step-label">Pago / Aceptada</div>
                <div class="step-date" *ngIf="isStepCompleted('ACEPTADA')">Completado</div>
                <div class="step-date" *ngIf="!isStepCompleted('ACEPTADA')">Pendiente</div>
              </div>
              <div class="step-line" [class.completed]="isStepCompleted('ACEPTADA')"></div>
              
              <!-- Tecnico asignado -->
              <div class="step" [class.completed]="isStepCompleted('ASIGNADO')" [class.active]="isStepActive('ASIGNADO')">
                <div class="step-icon">
                  <lucide-icon name="user" [size]="16"></lucide-icon>
                </div>
                <div class="step-label">Técnico asignado</div>
                <div class="step-date" *ngIf="isStepCompleted('ASIGNADO')">Asignado</div>
                <div class="step-date" *ngIf="!isStepCompleted('ASIGNADO')">Pendiente</div>
              </div>
              <div class="step-line" [class.completed]="isStepCompleted('ASIGNADO')"></div>

              <!-- Completada -->
              <div class="step" [class.completed]="isStepCompleted('COMPLETADA')" [class.active]="isStepActive('COMPLETADA')">
                <div class="step-icon">
                  <lucide-icon name="check-circle" [size]="16"></lucide-icon>
                </div>
                <div class="step-label">Trabajo completado</div>
                <div class="step-date" *ngIf="isStepCompleted('COMPLETADA')">Finalizado</div>
                <div class="step-date" *ngIf="!isStepCompleted('COMPLETADA')">Pendiente</div>
              </div>
            </div>
          </div>

          <!-- Técnico Asignado Details -->
          <div class="info-card" *ngIf="request.tecnicoId">
            <div class="card-icon-circle green">
              <lucide-icon name="user-check" [size]="20"></lucide-icon>
            </div>
            <div class="card-content">
              <h3>Técnico asignado</h3>
              <p>Tu servicio estará a cargo del técnico: <strong>Técnico #{{ request.tecnicoId.substring(0, 8) }}</strong>.</p>
            </div>
          </div>
          
          <!-- Sugerencias de técnicos -->
          <div class="info-card vertical" *ngIf="request.estadoSolicitud === 'PAGADO_BUSCANDO_TECNICO' && !request.tecnicoId">
            <div class="flex-align mb-16">
              <div class="card-icon-circle blue">
                <lucide-icon name="users" [size]="20"></lucide-icon>
              </div>
              <h3>Técnicos sugeridos para ti</h3>
            </div>
            <div class="matches-grid">
              @for (match of matches; track match.tecnicoId) {
                <div class="match-card">
                  <h4>{{ match.nombre }}</h4>
                  <p class="ranking">⭐ {{ match.ranking | number:'1.1-1' }} ({{ match.totalResenas }})</p>
                  <p class="text-sm">Categorías: {{ match.categorias }}</p>
                  <button class="btn-primary full-width mt-8" (click)="elegirTecnico(match.tecnicoId)">
                    Elegir técnico
                  </button>
                </div>
              }
              @if (matches.length === 0 && matchesLoaded) {
                <p class="text-sm text-gray">Buscando técnicos disponibles...</p>
              }
            </div>
          </div>

          <!-- Alert Expiration Box -->
          <div class="alert-expiration-card" *ngIf="request.estadoSolicitud === 'COTIZADO_ESPERANDO_PAGO'">
            <div class="alert-icon">
              <lucide-icon name="shield" [size]="20"></lucide-icon>
            </div>
            <p>
              <strong>Tu solicitud estará activa por 24 horas.</strong><br>
              Si no realizas el pago en este tiempo, la cotización expirará y deberás solicitar nuevamente.
            </p>
          </div>

        </div>
      </div>
      
      <!-- Right Pane -->
      <div class="right-pane">
        <div class="quote-panel">
          <div class="quote-header">
            <div class="quote-icon">
              <lucide-icon name="file-text" [size]="20"></lucide-icon>
            </div>
            <h2>Detalle de la cotización</h2>
          </div>
          
          <div class="quote-body">
            <div class="eval-type-row">
              <span class="label">Evaluación</span>
              <span class="value">Presencial</span>
            </div>
            
            <table class="quote-table">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th class="text-center" style="width: 60px;">Cant.</th>
                  <th class="text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of request.items">
                  <td>{{ item.descripcion }}</td>
                  <td class="text-center" style="width: 60px;">{{ item.cantidad }}</td>
                  <td class="text-right">S/ {{ (item.cantidad * item.precioUnitario) | number:'1.2-2' }}</td>
                </tr>
                <tr *ngIf="request.costoVisita">
                  <td>Evaluación / Visita</td>
                  <td class="text-center" style="width: 60px;">1</td>
                  <td class="text-right">S/ {{ request.costoVisita | number:'1.2-2' }}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="subtotal-row">
              <span class="label-bold">Subtotal</span>
              <span class="value-bold">S/ {{ calculateSubtotal() | number:'1.2-2' }}</span>
            </div>
            
            <div class="total-box">
              <span class="total-label">Total a pagar</span>
              <span class="total-amount">S/ {{ (request.costoTotal || request.costoVisita || 0) | number:'1.2-2' }}</span>
            </div>
            
            <div class="payment-methods">
              <p>Métodos de pago disponibles</p>
              <div class="method-icons">
                <span class="method-badge visa">VISA</span>
                <span class="method-badge mc"><div class="mc-circles"></div></span>
                <span class="method-badge yape">Yape</span>
                <span class="method-badge plin">Plin</span>
                <span class="method-badge transfer">Transferencia</span>
              </div>
            </div>
            
            <div class="quote-actions">
              <button *ngIf="request.estadoSolicitud === 'COTIZADO_ESPERANDO_PAGO' && request.costoTotal" 
                      class="btn-primary full-width" (click)="pagarCotizacion()">
                <lucide-icon name="lock" [size]="18"></lucide-icon> Pagar cotización
              </button>
              
              <button *ngIf="request.estadoSolicitud === 'ESPERANDO_PAGO_VISITA' && request.costoVisita" 
                      class="btn-primary full-width" (click)="pagarVisita()">
                <lucide-icon name="lock" [size]="18"></lucide-icon> Pagar visita
              </button>

              <button *ngIf="request.estadoSolicitud === 'EN_PROCESO' || request.estadoSolicitud === 'TECNICO_ASIGNADO'" 
                      class="btn-primary full-width mt-12 btn-success" (click)="completarTrabajo()">
                <lucide-icon name="check-circle" [size]="18"></lucide-icon> Trabajo Completado
              </button>
              
              <a *ngIf="request.estadoSolicitud === 'COMPLETADO'" 
                 class="btn-primary full-width" 
                 routerLink="/cliente/resenas/nueva/{{ request.id }}" [queryParams]="{tecnicoId: request.tecnicoId}">
                Calificar servicio
              </a>
              
              <button *ngIf="pago && pago.estadoPago === 'PAGADO_ESCROW'" 
                      class="btn-secondary full-width mt-12" 
                      (click)="downloadInvoice()" 
                      [disabled]="downloadingInvoice">
                <lucide-icon name="download" [size]="18"></lucide-icon> 
                {{ downloadingInvoice ? 'Descargando...' : 'Descargar boleta/factura PDF' }}
              </button>
              
              <button class="btn-outline-red full-width mt-12" (click)="cancel()" *ngIf="canCancel()">
                <lucide-icon name="trash-2" [size]="18"></lucide-icon> Cancelar solicitud
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  `,
  styles: [`
    /* ESTILOS PREMIUM DARK DE ALTA FIDELIDAD */
    .detail-page-container {
      display: flex;
      gap: 32px;
      max-width: 1400px;
      margin: 0 auto;
      padding: 32px 24px;
      background: #070a13;
      min-height: calc(100vh - 70px);
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
      color: #f8fafc;
    }
    
    /* Left Pane */
    .left-pane {
      flex: 2;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .back-link {
      color: #818cf8;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      margin-bottom: 24px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: color 0.2s;
    }
    .back-link:hover {
      color: #a5b4fc;
    }
    
    .header-flex-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      gap: 24px;
    }
    .header-details {
      flex: 1;
    }
    .page-title {
      font-size: 2.2rem;
      color: #ffffff;
      font-weight: 800;
      margin: 0 0 14px 0;
    }
    .status-pill-wrapper {
      margin-bottom: 16px;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      box-shadow: 0 0 8px currentColor;
    }
    
    .status-quoted { background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
    .status-quoted .status-dot { background: #22c55e; }
    .status-pending { background: rgba(245,158,11,0.1); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }
    .status-pending .status-dot { background: #f59e0b; }
    .status-process { background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); }
    .status-process .status-dot { background: #3b82f6; }
    .status-completed { background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
    .status-completed .status-dot { background: #10b981; }
    .status-canceled { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
    .status-canceled .status-dot { background: #ef4444; }
    
    .status-description {
      color: #94a3b8;
      font-size: 1rem;
      margin: 0;
      line-height: 1.6;
    }
    
    /* Neon Service Art Card */
    .service-art-card {
      background: #0f172a;
      border: 1.5px solid #1e293b;
      border-radius: 20px;
      width: 140px;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.08);
      flex-shrink: 0;
    }
    .art-svg {
      width: 90px;
      height: 110px;
      filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.45));
    }
    
    /* Info Cards */
    .info-cards-stack {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .info-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }
    .info-card.vertical {
      flex-direction: column;
      gap: 24px;
    }
    .card-icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .card-icon-circle.blue {
      background: rgba(99,102,241,0.1);
      color: #818cf8;
      border: 1px solid rgba(99,102,241,0.2);
    }
    .card-icon-circle.green {
      background: rgba(16,185,129,0.1);
      color: #34d399;
      border: 1px solid rgba(16,185,129,0.2);
    }
    .card-content {
      flex: 1;
    }
    .card-content h3 {
      font-size: 1.1rem;
      color: #ffffff;
      font-weight: 700;
      margin: 0 0 8px 0;
    }
    .card-content p {
      color: #94a3b8;
      font-size: 0.95rem;
      margin: 0;
      line-height: 1.5;
    }
    .flex-align {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .card-header-flex h3 {
      font-size: 1.1rem;
      color: #ffffff;
      font-weight: 700;
      margin: 0;
    }
    .link-action {
      color: #818cf8;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.88rem;
      transition: color 0.2s;
    }
    .link-action:hover {
      color: #a5b4fc;
    }
    
    /* Photos Grid Row */
    .photos-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }
    .photos-grid {
      display: flex;
      gap: 16px;
    }
    .photos-grid img {
      width: 140px;
      height: 100px;
      object-fit: cover;
      border-radius: 12px;
      border: 1px solid #1e293b;
      transition: border-color 0.2s;
    }
    .photos-grid img:hover {
      border-color: #3b82f6;
    }
    .no-photos {
      color: #64748b;
      font-style: italic;
      font-size: 0.95rem;
    }
    .add-more-card {
      width: 140px;
      height: 100px;
      background: #0f172a;
      border: 1.5px dashed #1e293b;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s;
    }
    .add-more-card:hover {
      border-color: #3b82f6;
      color: #f8fafc;
      background: #1e293b;
    }
    .add-more-card .plus-icon {
      font-size: 1.5rem;
      font-weight: 300;
    }
    .add-more-card .label {
      font-size: 0.78rem;
      font-weight: 500;
    }
    
    /* Stepper */
    .stepper-wrapper {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      width: 100%;
      position: relative;
      padding: 10px 0;
    }
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      z-index: 2;
      width: 120px;
    }
    .step-icon {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #0f172a;
      border: 2px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #475569;
      margin-bottom: 12px;
      transition: all 0.2s;
    }
    .step.completed .step-icon {
      background: #10b981;
      border-color: #10b981;
      color: white;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
    }
    .step.active .step-icon {
      background: #0f172a;
      border-color: #f59e0b;
      color: #f59e0b;
      box-shadow: 0 0 15px rgba(245, 158, 11, 0.35);
    }
    .step-label {
      font-size: 0.88rem;
      color: #ffffff;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .step-date {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.3;
    }
    .step-line {
      flex: 1;
      height: 2px;
      background: #1e293b;
      margin-top: 19px;
      z-index: 1;
    }
    .step-line.completed {
      background: #10b981;
    }
    .mb-16 { margin-bottom: 16px; }
    
    /* Alert Expiration Card */
    .alert-expiration-card {
      background: rgba(30,58,138,0.15);
      border: 1px solid rgba(59,130,246,0.25);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .alert-icon {
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .alert-expiration-card p {
      margin: 0;
      color: #94a3b8;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .alert-expiration-card strong {
      color: #f8fafc;
    }
    
    /* Right Pane */
    .right-pane {
      flex: 1;
      min-width: 400px;
    }
    .quote-panel {
      background: #0b0f19;
      border-radius: 16px;
      border: 1px solid #1e293b;
      overflow: hidden;
      position: sticky;
      top: 24px;
    }
    .quote-header {
      background: #0f172a;
      padding: 20px 24px;
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .quote-icon {
      width: 40px;
      height: 40px;
      background: rgba(99,102,241,0.1);
      color: #818cf8;
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .quote-header h2 {
      margin: 0;
      font-size: 1.15rem;
      color: #ffffff;
      font-weight: 700;
    }
    .quote-body {
      padding: 24px;
    }
    .eval-type-row {
      display: flex;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 1px solid #1e293b;
      margin-bottom: 20px;
      font-size: 0.95rem;
    }
    .eval-type-row .label {
      color: #cbd5e1;
      font-weight: 500;
    }
    .eval-type-row .value {
      color: #f8fafc;
      font-weight: 600;
    }
    .quote-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .quote-table th {
      text-align: left;
      padding-bottom: 12px;
      color: #cbd5e1;
      font-weight: 700;
      font-size: 0.9rem;
      border-bottom: 1px solid #1e293b;
    }
    .quote-table td {
      padding: 12px 0;
      color: #94a3b8;
      font-size: 0.92rem;
      border-bottom: 1px dashed #1e293b;
    }
    .text-right {
      text-align: right !important;
    }
    .text-center {
      text-align: center !important;
    }
    .subtotal-row {
      display: flex;
      justify-content: space-between;
      padding: 16px 0;
      margin-bottom: 20px;
      font-size: 1rem;
    }
    .label-bold {
      color: #cbd5e1;
      font-weight: 500;
    }
    .value-bold {
      color: #f8fafc;
      font-weight: 700;
    }
    
    .total-box {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 12px;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      box-shadow: 0 0 20px rgba(99,102,241,0.15);
    }
    .total-label {
      color: #cbd5e1;
      font-weight: 600;
      font-size: 1rem;
    }
    .total-amount {
      color: #ffffff;
      font-size: 1.8rem;
      font-weight: 800;
      text-shadow: 0 0 10px rgba(255,255,255,0.2);
    }
    
    .payment-methods {
      margin-bottom: 24px;
    }
    .payment-methods p {
      color: #cbd5e1;
      font-size: 0.85rem;
      margin: 0 0 12px 0;
      font-weight: 500;
    }
    .method-icons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .method-badge {
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid #1e293b;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
      background: #0f172a;
      color: #cbd5e1;
    }
    .visa { color: #60a5fa; }
    .yape { background: #581c87; color: #f3e8ff; border-color: #701a75; }
    .plin { background: #155e75; color: #ecfeff; border-color: #0e7490; }
    .mc-circles {
      width: 20px; height: 12px;
      background: radial-gradient(circle at left, #eb001b 50%, transparent 50%), radial-gradient(circle at right, #f79e1b 50%, transparent 50%);
    }
    
    .btn-primary {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 16px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1.05rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
    }
    .btn-primary:hover {
      background: #4338ca;
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
    }
    .btn-success {
      background: #10b981;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    .btn-success:hover {
      background: #059669;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }
    .btn-outline-red {
      background: transparent;
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 16px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1.05rem;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      transition: all 0.2s;
    }
    .btn-outline-red:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: #ef4444;
    }
    .full-width {
      width: 100%;
    }
    .mt-12 { margin-top: 12px; }
    .mt-8 { margin-top: 8px; }
    
    /* Matches Grid */
    .matches-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .match-card {
      border: 1px solid #1e293b;
      background: #0f172a;
      border-radius: 12px;
      padding: 16px;
    }
    .match-card h4 {
      margin: 0 0 8px 0;
      font-size: 1.05rem;
      color: #ffffff;
    }
    .ranking {
      margin: 0 0 8px 0;
      color: #f59e0b;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .text-sm {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
    }
    .text-gray {
      color: #64748b;
    }
  `]
})
export class RequestDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly requestService = inject(ServiceRequestService);
  private readonly notificationService = inject(NotificationService);
  private readonly publicCatalogService = inject(PublicCatalogService);
  private readonly paymentService = inject(PaymentService);
  private readonly config = inject(SERVIYA_APP_CONFIG);

  protected request: ServiceRequestResponseDTO | null = null;
  protected paymentCaptured = false;
  protected matches: TechnicianMatch[] = [];
  protected matchesLoaded = false;
  protected pago: PagoCliente | null = null;
  protected downloadingInvoice: boolean = false;

  ngOnInit(): void {
    const requestId = this.route.snapshot.paramMap.get('id');
    if (!requestId) {
      return;
    }

    this.requestService.tracking(requestId).subscribe((request) => {
      this.request = request;

      if (request.estadoSolicitud === 'COMPLETADO') {
        this.checkPaymentCaptured();
      }

      if (request.estadoSolicitud === 'PAGADO_BUSCANDO_TECNICO' && !request.tecnicoId) {
        this.requestService.getMatches(String(request.id)).subscribe((matches) => {
          this.matches = matches || [];
          this.matchesLoaded = true;
        });
      }
    });

    this.loadPayment(Number(requestId));
  }

  loadPayment(requestId: number): void {
    this.paymentService.listarMisPagos().subscribe({
      next: (pagos) => {
        this.pago = pagos.find(p => p.solicitudId === requestId) || null;
      },
      error: (err) => console.error('Error al cargar pagos para la solicitud', err)
    });
  }

  downloadInvoice(): void {
    if (!this.pago) return;
    this.downloadingInvoice = true;
    this.paymentService.descargarComprobante(this.pago.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.pago!.tipoComprobante.toLowerCase()}-serviya-${this.pago!.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.downloadingInvoice = false;
      },
      error: (err) => {
        console.error('Error al descargar comprobante', err);
        this.downloadingInvoice = false;
      }
    });
  }

  cancel(): void {
    if (!this.request) {
      return;
    }
    if (confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
      this.requestService.cancelRequest(String(this.request.id)).subscribe((request) => {
        this.request = request;
      });
    }
  }

  canCancel(): boolean {
    const invalidStates = ['COMPLETADO', 'CANCELADO', 'REEMBOLSADO'];
    return !!this.request && !invalidStates.includes(this.request.estadoSolicitud);
  }

  pagarCotizacion(): void {
    if (!this.request?.costoTotal) {
      return;
    }

    void this.router.navigate(['/cliente/checkout'], {
      queryParams: {
        solicitudId: this.request.id,
        monto: this.request.costoTotal
      }
    });
  }

  pagarVisita(): void {
    if (!this.request?.costoVisita) {
      return;
    }

    void this.router.navigate(['/cliente/checkout'], {
      queryParams: {
        solicitudId: this.request.id,
        montoVisita: this.request.costoVisita
      }
    });
  }

  elegirTecnico(tecnicoId: string): void {
    if (!this.request) {
      return;
    }

    this.requestService.asignarTecnico(String(this.request.id), tecnicoId).subscribe({
      next: () => {
        alert('Técnico asignado correctamente. El técnico ha sido notificado.');
        this.request!.tecnicoId = tecnicoId;
        this.request!.estadoSolicitud = 'TECNICO_ASIGNADO';
        this.matchesLoaded = false;
        this.matches = [];
      },
      error: () => {
        alert('Ocurrió un error al asignar al técnico.');
      }
    });
  }

  completarTrabajo(): void {
    if (!this.request) return;
    if (confirm('¿Estás seguro de marcar este trabajo como completado?')) {
      this.requestService.completarTrabajo(String(this.request.id)).subscribe({
        next: () => {
          this.request!.estadoSolicitud = 'COMPLETADO';
          alert('¡Trabajo marcado como completado!');
        },
        error: () => alert('Ocurrió un error al completar el trabajo.')
      });
    }
  }

  protected getEvidenciaUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('foto_local_')) {
      return localStorage.getItem(url) || url;
    }
    if (url.startsWith('/api')) {
      return `${this.config.apiBaseUrl}/service-request-ms${url}`;
    }
    return url;
  }

  protected getEvidenciaUrls(request: ServiceRequestResponseDTO | null | undefined): string[] {
    if (!request) {
      return [];
    }
    const urls = request.evidenciaUrls?.filter(Boolean) ?? [];
    if (urls.length > 0) {
      return urls;
    }
    return request.urlEvidencia ? [request.urlEvidencia] : [];
  }

  protected calculateSubtotal(): number {
    if (!this.request) {
      return 0;
    }

    let subtotal = 0;
    if (this.request.items) {
      this.request.items.forEach(item => {
        subtotal += item.cantidad * item.precioUnitario;
      });
    }
    if (this.request.costoVisita) {
      subtotal += this.request.costoVisita;
    }
    return subtotal;
  }

  protected getStatusClass(status: string): string {
    if (status === 'PENDIENTE_EVALUACION') return 'status-pending';
    if (status === 'EN_PROCESO' || status === 'PAGADO_BUSCANDO_TECNICO' || status === 'TECNICO_ASIGNADO') return 'status-process';
    if (status === 'COTIZADO_ESPERANDO_PAGO' || status === 'ESPERANDO_PAGO_VISITA') return 'status-quoted';
    if (status === 'COMPLETADO') return 'status-completed';
    if (status === 'CANCELADO' || status === 'REEMBOLSADO') return 'status-canceled';
    return 'status-pending';
  }

  protected getStatusDescription(status: string): string {
    if (status === 'PENDIENTE_EVALUACION') return 'Hemos recibido tu solicitud. Estamos buscando a los mejores técnicos para ti.';
    if (status === 'COTIZADO_ESPERANDO_PAGO') return 'El técnico ya evaluó el servicio y envió la cotización. Revisa los detalles y realiza el pago para confirmar el servicio.';
    if (status === 'ESPERANDO_PAGO_VISITA') return 'Por favor realiza el pago de la evaluación presencial.';
    if (status === 'EN_PROCESO' || status === 'TECNICO_ASIGNADO' || status === 'PAGADO_BUSCANDO_TECNICO') return 'El servicio está en proceso. El técnico está trabajando en tu solicitud.';
    if (status === 'COMPLETADO') return 'El servicio ha sido completado satisfactoriamente.';
    if (status === 'CANCELADO') return 'La solicitud ha sido cancelada.';
    return '';
  }

  protected isStepCompleted(step: string): boolean {
    const status = this.request?.estadoSolicitud || '';
    if (step === 'COTIZADA') {
      return ['COTIZADO_ESPERANDO_PAGO', 'TECNICO_ASIGNADO', 'EN_PROCESO', 'COMPLETADO'].includes(status);
    }
    if (step === 'ACEPTADA') {
      return ['PAGADO_BUSCANDO_TECNICO', 'TECNICO_ASIGNADO', 'EN_PROCESO', 'COMPLETADO'].includes(status);
    }
    if (step === 'ASIGNADO') {
      return !!this.request?.tecnicoId && ['TECNICO_ASIGNADO', 'EN_PROCESO', 'COMPLETADO'].includes(status);
    }
    if (step === 'COMPLETADA') {
      return status === 'COMPLETADO';
    }
    return false;
  }

  protected isStepActive(step: string): boolean {
    const status = this.request?.estadoSolicitud || '';
    if (step === 'COTIZADA' && status === 'PENDIENTE_EVALUACION') return true;
    if (step === 'ACEPTADA' && status === 'COTIZADO_ESPERANDO_PAGO') return true;
    if (step === 'ASIGNADO' && status === 'PAGADO_BUSCANDO_TECNICO') return true;
    if (step === 'COMPLETADA' && (status === 'TECNICO_ASIGNADO' || status === 'EN_PROCESO')) return true;
    return false;
  }

  protected estadoLegible(status: string): string {
    const labels: Record<string, string> = {
      ESPERANDO_PAGO_VISITA: 'Esperando pago de visita',
      PENDIENTE_EVALUACION: 'Pendiente de cotización',
      COTIZADO_ESPERANDO_PAGO: 'Cotizada, esperando pago',
      PAGADO_BUSCANDO_TECNICO: 'Pagada, buscando técnico',
      TECNICO_ASIGNADO: 'Técnico asignado',
      EN_PROCESO: 'En proceso',
      COMPLETADO: 'Completada',
      CANCELADO: 'Cancelada',
      REEMBOLSADO: 'Reembolsada'
    };
    return labels[status] ?? status;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.request) {
      return;
    }

    const files = Array.from(input.files);
    this.publicCatalogService.uploadEvidencias(files).subscribe({
      next: (response) => {
        if (response.urls && response.urls.length > 0 && this.request) {
          this.requestService.agregarEvidencias(String(this.request.id), response.urls).subscribe({
            next: (updatedRequest) => {
              this.request = updatedRequest;
            },
            error: (err) => {
              console.error('Error adding evidences to request:', err);
              alert('Ocurrió un error al agregar las fotos');
            }
          });
        }
      },
      error: (err) => {
        console.error('Error uploading evidences:', err);
        alert('Ocurrió un error al subir las fotos');
      }
    });
  }

  private checkPaymentCaptured(): void {
    this.notificationService.getTimeline().subscribe((notifications) => {
      this.paymentCaptured = notifications.some((notification) =>
        notification.type === 'payment.captured.v1'
        && notification.message
        && notification.message.toLowerCase().includes('pago se ha procesado')
      );
    });
  }
}
