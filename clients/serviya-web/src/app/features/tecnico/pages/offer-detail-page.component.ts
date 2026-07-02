import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { SERVIYA_APP_CONFIG } from '../../../core/config/app-config';
import { Offer } from '../models/technician.model';
import { TechnicianOfferService } from '../services/technician-offer.service';

@Component({
  selector: 'app-offer-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, DatePipe, DecimalPipe],
  template: `
    <div class="detail-page-wrapper">
      
      <!-- Top breadcrumb and title -->
      <header class="detail-nav-header">
        <a routerLink="/tecnico/asignaciones" class="back-link">
          <lucide-icon name="arrow-left" [size]="16"></lucide-icon> Volver a asignaciones
        </a>
        <h1>Detalle de asignación</h1>
      </header>

      <div *ngIf="offer" class="detail-columns-container">
        
        <!-- Left Main Column (68% width) -->
        <div class="main-content-col">
          
          <!-- Top Header Card -->
          <div class="detail-header-card">
            <div class="header-left">
              <div class="category-icon-circle" [ngClass]="getCategoryColorClass(offer)">
                <span>{{ getCategoryIcon(offer) }}</span>
              </div>
              <div class="title-meta">
                <h2>{{ offer.serviceName || 'Servicio asignado' }}</h2>
                <p class="ubigeo-label">📍 {{ parseAddress(offer.direccionFisica).ubigeo }}</p>
                <p class="date-label">⏱ Recibida: {{ offer.createdAt | date:'M/d/yy, h:mm a' }}</p>
              </div>
            </div>
            <div class="header-right">
              <div class="badge-wrapper">
                <span class="status-badge-glowing" [ngClass]="offer.estadoSolicitud?.toLowerCase() || ''">
                  <span class="status-dot"></span> {{ estadoLegible(offer.estadoSolicitud) }}
                </span>
              </div>
              <div class="price-info">
                <span class="price-label">Pago estimado</span>
                <span class="price-val">S/ {{ offer.technicianPrice | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Service Details Grid Card -->
          <div class="details-grid-card">
            <h3>Detalles del servicio</h3>
            
            <div class="grid-subcolumns">
              <!-- Left Subcolumn: Photos of the Problem -->
              <div class="subcolumn-left">
                <span class="section-sublabel">📷 Fotos del problema</span>
                <div class="photos-gallery-area">
                  <div class="gallery-grid" *ngIf="offer.evidenciaUrls && offer.evidenciaUrls.length > 0">
                    <a *ngFor="let url of offer.evidenciaUrls" [href]="getEvidenciaUrl(url)" target="_blank">
                      <img [src]="getEvidenciaUrl(url)" alt="Evidencia de la avería" class="problem-thumbnail" />
                    </a>
                  </div>
                  <p *ngIf="!offer.evidenciaUrls || offer.evidenciaUrls.length === 0" class="no-photos-text">
                    No se adjuntaron fotos para este servicio.
                  </p>
                  
                  <!-- Dotted View All Card simulating high-fidelity mockups -->
                  <div class="view-all-dotted-card">
                    <span class="plus-sign">+</span>
                    <span class="label">Ver todas</span>
                  </div>
                </div>

                <button class="btn-fullscreen-photos">
                  <lucide-icon name="maximize-2" [size]="14"></lucide-icon> Ver en pantalla completa
                </button>
              </div>

              <!-- Right Subcolumn: Description, System notes, and Info table -->
              <div class="subcolumn-right">
                <!-- Description Quote Box -->
                <div class="client-description-quote">
                  <span class="quote-symbol">❝</span>
                  <div class="quote-content">
                    <strong>Descripción del cliente</strong>
                    <p>{{ offer.description || 'Se detectó una avería en el punto del servicio. Se requiere inspección y reparación.' }}</p>
                  </div>
                </div>

                <!-- System Notes -->
                <div class="system-notes-box">
                  <lucide-icon name="file-text" [size]="18" class="note-icon"></lucide-icon>
                  <div class="note-content">
                    <strong>Notas del sistema</strong>
                    <p>Cliente disponible en el horario de la tarde/noche. Tiene acceso fácil al punto de trabajo.</p>
                  </div>
                </div>

                <!-- Assignment Metadata Table -->
                <table class="metadata-table">
                  <tr>
                    <td><lucide-icon name="clock" [size]="14"></lucide-icon> Tiempo estimado</td>
                    <td><strong>1 h 30 min</strong></td>
                  </tr>
                  <tr>
                    <td><lucide-icon name="flag" [size]="14"></lucide-icon> Prioridad</td>
                    <td><span class="priority-badge media">Media</span></td>
                  </tr>
                  <tr>
                    <td><lucide-icon name="user" [size]="14"></lucide-icon> Técnico asignado</td>
                    <td><strong>{{ loggedInTechnicianName }}</strong></td>
                  </tr>
                  <tr>
                    <td><lucide-icon name="hash" [size]="14"></lucide-icon> ID de asignación</td>
                    <td><strong>ASG-000{{ offer.id }}</strong></td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <!-- Service Progress Stepper Section -->
          <div class="progress-stepper-card">
            <h3>Progreso del servicio</h3>
            
            <div class="stepper-track-wrapper">
              <div class="stepper-line-progress" [ngStyle]="{'width': getStepperProgressWidth()}"></div>
              <div class="stepper-steps-row">
                
                <!-- Step 1: Solicitud Creada -->
                <div class="stepper-step completed">
                  <div class="step-circle">
                    <lucide-icon name="check" [size]="16"></lucide-icon>
                  </div>
                  <span class="step-title">Solicitud creada</span>
                  <span class="step-date">{{ offer.createdAt | date:'M/d/yy' }}</span>
                  <span class="step-time">{{ offer.createdAt | date:'h:mm a' }}</span>
                </div>

                <!-- Step 2: Asignada -->
                <div class="stepper-step completed">
                  <div class="step-circle">
                    <lucide-icon name="check" [size]="16"></lucide-icon>
                  </div>
                  <span class="step-title">Asignada</span>
                  <span class="step-date">{{ offer.createdAt | date:'M/d/yy' }}</span>
                  <span class="step-time">{{ offer.createdAt | date:'h:mm a' }}</span>
                </div>

                <!-- Step 3: En camino -->
                <div class="stepper-step" [ngClass]="getStepClass(3)">
                  <div class="step-circle">
                    <lucide-icon *ngIf="isStepCompleted(3)" name="check" [size]="16"></lucide-icon>
                    <lucide-icon *ngIf="!isStepCompleted(3)" name="truck" [size]="16"></lucide-icon>
                  </div>
                  <span class="step-title">En camino</span>
                  <span class="step-status-sub">{{ getStepStatusSub(3) }}</span>
                </div>

                <!-- Step 4: En proceso -->
                <div class="stepper-step" [ngClass]="getStepClass(4)">
                  <div class="step-circle">
                    <lucide-icon *ngIf="isStepCompleted(4)" name="check" [size]="16"></lucide-icon>
                    <lucide-icon *ngIf="!isStepCompleted(4)" name="wrench" [size]="16"></lucide-icon>
                  </div>
                  <span class="step-title">En proceso</span>
                  <span class="step-status-sub">{{ getStepStatusSub(4) }}</span>
                </div>

                <!-- Step 5: Finalizada -->
                <div class="stepper-step" [ngClass]="getStepClass(5)">
                  <div class="step-circle">
                    <lucide-icon name="check-square" [size]="16"></lucide-icon>
                  </div>
                  <span class="step-title">Finalizada</span>
                  <span class="step-status-sub">{{ getStepStatusSub(5) }}</span>
                </div>

              </div>
            </div>

            <!-- Contextual Stepper Message Box -->
            <div class="stepper-instruction-banner">
              <lucide-icon name="info" [size]="18" class="banner-info-icon"></lucide-icon>
              <span>{{ getStepperInstructionText() }}</span>
            </div>
          </div>

        </div>

        <!-- Right Sidebar Column (30% width) -->
        <div class="sidebar-actions-col">
          
          <!-- Client Information Card -->
          <div class="sidebar-card client-info-card">
            <h3>👤 Información del cliente</h3>
            
            <div class="client-details-list">
              <div class="client-detail-item">
                <span class="detail-label">Nombre</span>
                <span class="detail-val">{{ offer.clienteNombre || 'Luis Tito Larico Quispe' }}</span>
              </div>

              <div class="client-detail-item">
                <span class="detail-label">Teléfono</span>
                <div class="phone-row">
                  <span class="detail-val">{{ offer.clientePhone || '987 654 321' }}</span>
                  <button class="btn-phone-call" title="Llamar cliente">
                    <lucide-icon name="phone" [size]="16"></lucide-icon>
                  </button>
                </div>
              </div>

              <div class="client-detail-item">
                <span class="detail-label">Dirección</span>
                <span class="detail-val">
                  {{ parseAddress(offer.direccionFisica).ubigeo }}<br>
                  {{ parseAddress(offer.direccionFisica).main }}
                </span>
              </div>

              <div class="client-detail-item">
                <span class="detail-label">Referencia</span>
                <span class="detail-val reference-val">
                  {{ parseAddress(offer.direccionFisica).main || 'Casa de color celeste con reja negra' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Actions Panel Card -->
          <div class="sidebar-card quick-actions-card">
            <h3>⚡ Acciones rápidas</h3>
            
            <div class="actions-buttons-stack">
              
              <!-- Iniciar servicio (only if status is TECNICO_ASIGNADO) -->
              <ng-container *ngIf="offer.estadoSolicitud === 'TECNICO_ASIGNADO'">
                <button (click)="accept()" [disabled]="processing" class="btn-action-solid start-job-btn">
                  <lucide-icon name="play" [size]="16"></lucide-icon> Iniciar servicio
                </button>
              </ng-container>

              <!-- Finalizar trabajo (only if status is EN_PROCESO) -->
              <ng-container *ngIf="offer.estadoSolicitud === 'EN_PROCESO'">
                <button (click)="completeJob()" [disabled]="processing || offer.tecnicoConfirmoFin" class="btn-action-solid finish-job-btn">
                  <lucide-icon name="check-circle" [size]="16"></lucide-icon>
                  {{ offer.tecnicoConfirmoFin ? 'Esperando confirmación' : 'Finalizar trabajo' }}
                </button>
              </ng-container>

              <!-- Contactar cliente button -->
              <button class="btn-action-outline contact-client-btn">
                <lucide-icon name="message-square" [size]="16"></lucide-icon> Contactar cliente
              </button>

              <!-- Ver ubicación en mapa button -->
              <button class="btn-action-outline map-location-btn">
                <lucide-icon name="navigation" [size]="16" class="navigation-icon"></lucide-icon> Ver ubicación en mapa
              </button>

              <!-- Cancelar asignación button (available if not completed/canceled) -->
              <ng-container *ngIf="offer.estadoSolicitud !== 'COMPLETADO' && offer.estadoSolicitud !== 'CANCELADO' && offer.estadoSolicitud !== 'REEMBOLSADO'">
                <button (click)="reject()" [disabled]="processing" class="btn-action-danger cancel-assignment-btn">
                  <lucide-icon name="trash-2" [size]="16"></lucide-icon> Cancelar asignación
                </button>
              </ng-container>

            </div>
          </div>

        </div>

      </div>

      <!-- Loading State -->
      <div *ngIf="!offer" class="loading-state-wrapper">
        <lucide-icon name="loader" class="spinner-icon" [size]="48"></lucide-icon>
        <p>Cargando los detalles de la asignación...</p>
      </div>

    </div>
  `,
  styles: [`
    /* HIGH-FIDELITY DARK PREMIUM CSS FOR TECHNICIAN ASSIGNMENT DETAILS */
    .detail-page-wrapper {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0px 24px 40px 24px;
      background: #070a13;
      min-height: calc(100vh - 70px);
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
      color: #f8fafc;
    }
    .detail-nav-header {
      margin-bottom: 24px;
    }
    .detail-nav-header .back-link {
      color: #3b82f6;
      font-size: 0.9rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 16px;
      font-weight: 600;
      transition: color 0.2s;
    }
    .detail-nav-header .back-link:hover {
      color: #60a5fa;
    }
    .detail-nav-header h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
    }

    /* Columns layout */
    .detail-columns-container {
      display: flex;
      gap: 28px;
      align-items: flex-start;
    }
    .main-content-col {
      flex: 1.6; /* ~68% width */
      display: flex;
      flex-direction: column;
      gap: 28px;
      min-width: 0;
    }
    .sidebar-actions-col {
      flex: 0.7; /* ~30% width */
      display: flex;
      flex-direction: column;
      gap: 28px;
      min-width: 0;
      position: sticky;
      top: 20px;
    }

    /* Top Header Card */
    .detail-header-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }
    .header-left {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .category-icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      flex-shrink: 0;
    }
    .category-icon-circle.blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .category-icon-circle.yellow { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .category-icon-circle.orange { background: rgba(249, 115, 22, 0.15); color: #ffedd5; }
    .category-icon-circle.purple { background: rgba(139, 92, 246, 0.15); color: #c084fc; }
    .category-icon-circle.red { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }

    .title-meta h2 {
      margin: 0 0 8px 0;
      font-size: 1.45rem;
      font-weight: 800;
      color: #ffffff;
    }
    .ubigeo-label {
      font-size: 0.9rem;
      color: #cbd5e1;
      margin: 0 0 6px 0;
    }
    .date-label {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0;
    }
    .header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
      flex-shrink: 0;
    }
    .status-badge-glowing {
      font-size: 0.8rem;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .status-badge-glowing.tecnico_asignado { 
      background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25);
      box-shadow: 0 0 12px rgba(245,158,11,0.15);
    }
    .status-badge-glowing.tecnico_asignado .status-dot { background: #fbbf24; box-shadow: 0 0 8px #fbbf24; }

    .status-badge-glowing.en_proceso { 
      background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25);
      box-shadow: 0 0 12px rgba(59,130,246,0.15);
    }
    .status-badge-glowing.en_proceso .status-dot { background: #60a5fa; box-shadow: 0 0 8px #60a5fa; }

    .status-badge-glowing.completado { 
      background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.25);
      box-shadow: 0 0 12px rgba(16,185,129,0.15);
    }
    .status-badge-glowing.completado .status-dot { background: #34d399; box-shadow: 0 0 8px #34d399; }

    .status-badge-glowing.cancelado { 
      background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.25);
    }
    .status-badge-glowing.cancelado .status-dot { background: #f87171; }

    .price-info {
      text-align: right;
    }
    .price-label {
      font-size: 0.78rem;
      color: #64748b;
      display: block;
      margin-bottom: 2px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .price-val {
      font-size: 1.5rem;
      font-weight: 800;
      color: #10b981;
    }

    /* Details Grid Card */
    .details-grid-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 32px;
    }
    .details-grid-card h3, .progress-stepper-card h3, .sidebar-card h3 {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0 0 24px 0;
      color: #ffffff;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 16px;
    }
    .grid-subcolumns {
      display: flex;
      gap: 32px;
    }
    .subcolumn-left {
      flex: 1.1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .subcolumn-right {
      flex: 1.3;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .section-sublabel {
      font-size: 0.85rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
    }

    /* Photos gallery area */
    .photos-gallery-area {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    .gallery-grid {
      display: flex;
      gap: 12px;
    }
    .problem-thumbnail {
      width: 124px;
      height: 96px;
      object-fit: cover;
      border-radius: 12px;
      border: 1px solid #1e293b;
      transition: border-color 0.2s;
    }
    .problem-thumbnail:hover {
      border-color: #3b82f6;
    }
    .no-photos-text {
      color: #64748b;
      font-style: italic;
      font-size: 0.88rem;
      margin: 0;
    }
    .view-all-dotted-card {
      width: 124px;
      height: 96px;
      background: #0f172a;
      border: 1.5px dashed #1e293b;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s;
    }
    .view-all-dotted-card:hover {
      border-color: #3b82f6;
      color: #f8fafc;
      background: #1e293b;
    }
    .view-all-dotted-card .plus-sign {
      font-size: 1.3rem;
    }
    .view-all-dotted-card .label {
      font-size: 0.75rem;
      font-weight: 500;
    }
    .btn-fullscreen-photos {
      width: 100%;
      background: transparent;
      border: 1px solid #1e293b;
      color: #cbd5e1;
      padding: 12px;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-fullscreen-photos:hover {
      border-color: #3b82f6;
      color: #ffffff;
      background: rgba(59,130,246,0.05);
    }

    /* Client description quote box */
    .client-description-quote {
      background: #0f172a;
      border-left: 3px solid #3b82f6;
      border-radius: 4px 12px 12px 4px;
      padding: 16px;
      display: flex;
      gap: 12px;
      position: relative;
    }
    .quote-symbol {
      font-size: 2.2rem;
      color: rgba(59,130,246,0.25);
      line-height: 1;
      height: 20px;
    }
    .quote-content {
      flex: 1;
    }
    .quote-content strong {
      font-size: 0.88rem;
      color: #ffffff;
      display: block;
      margin-bottom: 4px;
    }
    .quote-content p {
      color: #94a3b8;
      font-size: 0.88rem;
      line-height: 1.5;
      margin: 0;
    }

    /* System notes box */
    .system-notes-box {
      background: rgba(30,41,59,0.4);
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .system-notes-box .note-icon {
      color: #818cf8;
      margin-top: 2px;
      flex-shrink: 0;
    }
    .note-content strong {
      font-size: 0.88rem;
      color: #cbd5e1;
      display: block;
      margin-bottom: 4px;
    }
    .note-content p {
      color: #64748b;
      font-size: 0.82rem;
      line-height: 1.5;
      margin: 0;
    }

    /* Metadata table */
    .metadata-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .metadata-table td {
      padding: 12px 0;
      border-bottom: 1px solid #1e293b;
      font-size: 0.88rem;
      color: #cbd5e1;
    }
    .metadata-table td:first-child {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #64748b;
      font-weight: 600;
    }
    .metadata-table td:last-child {
      text-align: right;
      color: #ffffff;
    }
    .priority-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .priority-badge.media {
      background: rgba(245,158,11,0.15);
      color: #fbbf24;
    }

    /* Progress Stepper Card */
    .progress-stepper-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 32px;
    }
    .stepper-track-wrapper {
      position: relative;
      margin: 32px 0 40px 0;
      padding: 0 10px;
    }
    .stepper-line-progress {
      position: absolute;
      top: 16px;
      left: 20px;
      right: 20px;
      height: 4px;
      background: #1e293b;
      z-index: 1;
      transition: width 0.3s ease;
    }
    .stepper-steps-row {
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 2;
    }
    .stepper-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 100px;
    }
    .stepper-step .step-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #1e293b;
      border: 2px solid #334155;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      transition: all 0.3s ease;
    }
    
    /* Stepper States Styles matching mockup */
    .stepper-step.completed .step-circle {
      background: #10b981;
      border-color: #10b981;
      color: #ffffff;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
    }
    .stepper-step.active .step-circle {
      background: rgba(245,158,11,0.2);
      border-color: #fbbf24;
      color: #fbbf24;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
    }
    
    .stepper-step .step-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 4px;
    }
    .stepper-step.completed .step-title,
    .stepper-step.active .step-title {
      color: #ffffff;
    }

    .stepper-step .step-date, .stepper-step .step-time {
      font-size: 0.75rem;
      color: #64748b;
    }
    .stepper-step.completed .step-date, .stepper-step.completed .step-time {
      color: #cbd5e1;
    }
    .stepper-step .step-status-sub {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
    }
    .stepper-step.active .step-status-sub {
      color: #fbbf24;
    }

    /* Stepper instruction banner */
    .stepper-instruction-banner {
      background: rgba(59,130,246,0.06);
      border: 1px solid rgba(59,130,246,0.2);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #cbd5e1;
      font-size: 0.88rem;
    }
    .banner-info-icon {
      color: #3b82f6;
      flex-shrink: 0;
    }

    /* Sidebar Cards */
    .sidebar-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 28px;
    }
    
    /* Client info items */
    .client-details-list {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .client-detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .client-detail-item .detail-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .client-detail-item .detail-val {
      font-size: 0.88rem;
      color: #ffffff;
      line-height: 1.5;
    }
    .phone-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-phone-call {
      background: transparent;
      border: 1px solid rgba(59,130,246,0.4);
      color: #3b82f6;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-phone-call:hover {
      background: #3b82f6;
      color: #ffffff;
      border-color: #3b82f6;
      box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
    }
    .reference-val {
      color: #94a3b8 !important;
      font-style: italic;
    }

    /* Action buttons stack */
    .actions-buttons-stack {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .btn-action-solid {
      width: 100%;
      border: none;
      padding: 14px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
      color: #ffffff;
    }
    .btn-action-solid.start-job-btn {
      background: #3b82f6;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
    }
    .btn-action-solid.start-job-btn:hover {
      background: #2563eb;
      box-shadow: 0 6px 18px rgba(59, 130, 246, 0.45);
    }
    .btn-action-solid.finish-job-btn {
      background: #10b981;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
    }
    .btn-action-solid.finish-job-btn:hover {
      background: #059669;
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
    }
    .btn-action-solid:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn-action-outline {
      width: 100%;
      background: transparent;
      border: 1px solid #1e293b;
      color: #cbd5e1;
      padding: 14px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-action-outline:hover {
      border-color: #334155;
      color: #ffffff;
      background: #0f172a;
    }
    .btn-action-outline .navigation-icon {
      color: #fbbf24;
    }

    .btn-action-danger {
      width: 100%;
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 14px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-action-danger:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.4);
      color: #ffffff;
    }

    /* Loading state */
    .loading-state-wrapper {
      padding: 80px 40px;
      text-align: center;
      color: #64748b;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .spinner-icon {
      animation: spin 1.5s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class OfferDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly offerService = inject(TechnicianOfferService);
  private readonly config = inject(SERVIYA_APP_CONFIG);

  offer: Offer | null = null;
  processing = false;
  loggedInTechnicianName = 'Raul Pampallco Bautista'; // Defaulting from mockup user

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.offerService.getOffer(id).subscribe({
        next: (o) => {
          this.offer = o;
        },
        error: () => {
          alert('Oferta no encontrada');
          this.router.navigate(['/tecnico/asignaciones']);
        }
      });
    }
  }

  accept(): void {
    if (!this.offer || !confirm('¿Confirmas que inicias este trabajo?')) return;
    this.processing = true;
    this.offerService.acceptOffer(this.offer.id).subscribe({
      next: () => {
        alert('Servicio iniciado correctamente.');
        this.offer!.estadoSolicitud = 'EN_PROCESO';
        this.processing = false;
        this.ngOnInit();
      },
      error: () => {
        alert('Error al iniciar el servicio o la oferta ha expirado.');
        this.processing = false;
        this.ngOnInit();
      }
    });
  }

  reject(): void {
    if (!this.offer || !confirm('¿Seguro que deseas cancelar o rechazar esta asignación?')) return;
    this.processing = true;
    this.offerService.rejectOffer(this.offer.id).subscribe({
      next: () => {
        alert('Asignación cancelada.');
        this.router.navigate(['/tecnico/asignaciones']);
      },
      error: () => {
        alert('Ocurrió un error al cancelar la asignación.');
        this.processing = false;
      }
    });
  }

  completeJob(): void {
    if (!this.offer) return;
    if (confirm('¿Estás seguro de marcar este trabajo como completado? Esto se procesará cuando el cliente también confirme.')) {
      this.processing = true;
      this.offerService.completeJob(this.offer.id).subscribe({
        next: () => {
          this.offer!.tecnicoConfirmoFin = true;
          alert('¡Confirmación de finalización enviada al cliente!');
          this.processing = false;
          this.ngOnInit();
        },
        error: () => {
          alert('Ocurrió un error al completar el trabajo.');
          this.processing = false;
        }
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
    if (url.startsWith('/service-request-ms')) {
      return `${this.config.apiBaseUrl}${url}`;
    }
    return url;
  }

  parseAddress(addressString: string | undefined): { ubigeo: string, main: string } {
    if (!addressString) {
      return { ubigeo: 'Sin ubicación', main: 'Sin dirección' };
    }
    const parts = addressString.split(':');
    if (parts.length > 1) {
      return {
        ubigeo: parts[0].trim(),
        main: parts.slice(1).join(':').trim()
      };
    }
    return { ubigeo: '', main: addressString.trim() };
  }

  getCategoryIcon(offer: Offer): string {
    const name = offer.serviceName?.toLowerCase() || '';
    const cat = offer.catalogoServicio?.categoryCode?.toUpperCase() || '';
    
    if (name.includes('grifer') || name.includes('caño') || name.includes('grifo') || name.includes('faucet')) return '🚰';
    if (cat === 'GASFITERIA' || name.includes('fuga') || name.includes('agua') || name.includes('tuber') || name.includes('leak')) return '💧';
    if (cat === 'ELECTRICIDAD' || name.includes('tomacorriente') || name.includes('eléctr') || name.includes('caja') || name.includes('cable')) return '⚡';
    if (cat === 'PINTURA' || name.includes('pint') || name.includes('pared') || name.includes('paint')) return '🖌️';
    if (name.includes('repisa') || name.includes('mueble') || name.includes('madera')) return '🔨';
    return '🔧';
  }

  getCategoryColorClass(offer: Offer): string {
    const name = offer.serviceName?.toLowerCase() || '';
    const cat = offer.catalogoServicio?.categoryCode?.toUpperCase() || '';
    
    if (name.includes('grifer') || name.includes('caño') || name.includes('grifo') || name.includes('faucet')) return 'orange';
    if (cat === 'GASFITERIA' || name.includes('fuga') || name.includes('agua') || name.includes('tuber') || name.includes('leak')) return 'blue';
    if (cat === 'ELECTRICIDAD' || name.includes('tomacorriente') || name.includes('eléctr') || name.includes('caja') || name.includes('cable')) return 'yellow';
    if (cat === 'PINTURA' || name.includes('pint') || name.includes('pared') || name.includes('paint')) return 'purple';
    return 'red';
  }

  estadoLegible(status: string | undefined): string {
    if (!status) return 'Desconocido';
    const labels: Record<string, string> = {
      TECNICO_ASIGNADO: 'Pendiente',
      EN_PROCESO: 'En proceso',
      COMPLETADO: 'Completada',
      CANCELADO: 'Cancelada',
      REEMBOLSADO: 'Reembolsada'
    };
    return labels[status] ?? status;
  }

  /* Stepper Logic Helpers */
  getStepperProgressWidth(): string {
    if (!this.offer) return '0%';
    const status = this.offer.estadoSolicitud;
    if (status === 'TECNICO_ASIGNADO') return '50%'; // Active at step 3 (En camino)
    if (status === 'EN_PROCESO') return '75%'; // Active at step 4 (En proceso)
    if (status === 'COMPLETADO') return '100%'; // Active/Finished at step 5
    return '25%';
  }

  getStepClass(stepNum: number): string {
    if (!this.offer) return '';
    const status = this.offer.estadoSolicitud;
    
    if (stepNum === 3) {
      if (status === 'TECNICO_ASIGNADO') return 'active';
      if (status === 'EN_PROCESO' || status === 'COMPLETADO') return 'completed';
    }
    if (stepNum === 4) {
      if (status === 'TECNICO_ASIGNADO') return '';
      if (status === 'EN_PROCESO') return 'active';
      if (status === 'COMPLETADO') return 'completed';
    }
    if (stepNum === 5) {
      if (status === 'COMPLETADO') return 'completed';
    }
    return '';
  }

  isStepCompleted(stepNum: number): boolean {
    if (!this.offer) return false;
    const status = this.offer.estadoSolicitud;
    if (stepNum === 3) return status === 'EN_PROCESO' || status === 'COMPLETADO';
    if (stepNum === 4) return status === 'COMPLETADO';
    return false;
  }

  getStepStatusSub(stepNum: number): string {
    if (!this.offer) return '';
    const status = this.offer.estadoSolicitud;
    
    if (stepNum === 3) {
      if (status === 'TECNICO_ASIGNADO') return 'Actual';
      return 'Completado';
    }
    if (stepNum === 4) {
      if (status === 'TECNICO_ASIGNADO') return 'Pendiente';
      if (status === 'EN_PROCESO') return 'Actual';
      return 'Completado';
    }
    if (stepNum === 5) {
      if (status === 'COMPLETADO') return 'Completado';
      return 'Pendiente';
    }
    return '';
  }

  getStepperInstructionText(): string {
    if (!this.offer) return '';
    const status = this.offer.estadoSolicitud;
    if (status === 'TECNICO_ASIGNADO') return 'Dirígete al lugar del servicio para iniciar el trabajo.';
    if (status === 'EN_PROCESO') return 'Realiza el servicio y confirma su finalización al terminar.';
    if (status === 'COMPLETADO') return 'El servicio ha sido completado con éxito.';
    return 'Estado del servicio actualizado.';
  }
}
