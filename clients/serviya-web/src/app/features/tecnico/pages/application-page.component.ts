import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { finalize, Observable, of, switchMap, tap } from 'rxjs';

import { TechnicianApplication } from '../models/technician.model';
import { TechnicianApplicationService } from '../services/technician-application.service';
import { TechnicianDocumentService } from '../services/technician-document.service';
import { PublicCatalogService, ServiceCategory } from '../../cliente/services/public-catalog.service';
import { ClienteProfileService } from '../../cliente/services/cliente-profile.service';
import { AuthService } from '../../../core/auth/auth.service';
import { getDepartments, getProvinces, getDistricts } from 'ubigeo-fns';
import { AddressSelectorComponent } from '../../../shared/components/address-selector/address-selector.component';
import * as L from 'leaflet';

@Component({
  selector: 'app-application-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AddressSelectorComponent],
  template: `
    <div class="wizard-container">
      <div class="wizard-header">
        <h1>Conviértete en <span class="gradient-text">Técnico ServiYa</span></h1>
        <p>Únete a nuestra red de profesionales y empieza a recibir solicitudes de clientes.</p>
      </div>

      <div *ngIf="application && application.estado !== 'DRAFT'" class="status-banner" [ngClass]="application.estado?.toLowerCase() || ''">
        <span class="status-icon">
          <span *ngIf="application.estado === 'SUBMITTED' || application.estado === 'UNDER_REVIEW'">⏳</span>
          <span *ngIf="application.estado === 'APPROVED'">✅</span>
          <span *ngIf="application.estado === 'REJECTED'">❌</span>
        </span>
        <div class="status-content">
          <strong>Estado de Postulación: {{ getEstadoEs(application.estado) }}</strong>
          <p *ngIf="application.estado === 'SUBMITTED'">Tu solicitud está en cola para revisión. Te notificaremos pronto.</p>
          <p *ngIf="application.estado === 'APPROVED'">¡Felicidades! Ya eres parte del equipo. Ve a tu Perfil para activar tu GPS.</p>
        </div>
      </div>

      <!-- Stepper Indicator -->
      <div class="stepper" *ngIf="!application || application.estado === 'DRAFT'">
        <div class="step" [class.active]="currentStep === 1" [class.completed]="currentStep > 1">
          <div class="step-circle">1</div>
          <span class="step-label">Datos Personales</span>
        </div>
        <div class="step-line" [class.completed]="currentStep > 1"></div>
        
        <div class="step" [class.active]="currentStep === 2" [class.completed]="currentStep > 2">
          <div class="step-circle">2</div>
          <span class="step-label">Ubicación y Local</span>
        </div>
        <div class="step-line" [class.completed]="currentStep > 2"></div>
        
        <div class="step" [class.active]="currentStep === 3" [class.completed]="currentStep > 3">
          <div class="step-circle">3</div>
          <span class="step-label">Verificación</span>
        </div>
        <div class="step-line" [class.completed]="currentStep > 3"></div>
        
        <div class="step" [class.active]="currentStep === 4" [class.completed]="currentStep > 4">
          <div class="step-circle">4</div>
          <span class="step-label">Categorías</span>
        </div>
      </div>

      <form [formGroup]="form" class="form-card" *ngIf="!application || application.estado === 'DRAFT'">
        
        <!-- STEP 1: Datos Personales -->
        <div class="step-content" *ngIf="currentStep === 1">
          <div class="step-title-row">
            <span class="step-title-icon">👤</span>
            <div>
              <h2>Paso 1: Sobre ti</h2>
              <p class="subtitle">Cuéntanos sobre ti para conocerte mejor.</p>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Nombres y Apellidos</label>
              <div class="input-wrapper">
                <span class="prefix-icon">👤</span>
                <input formControlName="fullName" type="text" placeholder="MARIA MAMANI LUQUE" />
              </div>
            </div>
            <div class="form-group flex-1">
              <label>Teléfono de contacto</label>
              <div class="input-wrapper">
                <span class="prefix-icon">📞</span>
                <input formControlName="phone" type="text" placeholder="987654321" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label>Correo electrónico</label>
              <div class="input-wrapper">
                <span class="prefix-icon">✉️</span>
                <input type="email" [value]="userEmail" readonly class="readonly-input" />
              </div>
            </div>
            <div class="form-group flex-1">
              <!-- Empty spacer to balance email field in Step 1 -->
            </div>
          </div>

          <div class="form-group">
            <label>Acerca de ti (Opcional pero recomendado)</label>
            <div class="textarea-wrapper">
              <span class="prefix-icon area-icon">✏️</span>
              <textarea formControlName="aboutMe" rows="4" maxlength="500" placeholder="Cuéntanos sobre tu experiencia, habilidades, años de trabajo y lo que te especializa. Esto ayudará a los clientes a conocerte mejor."></textarea>
              <span class="char-counter">{{ aboutMeLength }}/500</span>
            </div>
          </div>
        </div>

        <!-- STEP 2: Ubicación y Tienda Física -->
        <div class="step-content" *ngIf="currentStep === 2">
          <div class="step-title-row">
            <span class="step-title-icon">📍</span>
            <div>
              <h2>Paso 2: Modalidad de Trabajo</h2>
              <p class="subtitle">Indícanos tu zona base y cómo prefieres brindar tus servicios.</p>
            </div>
          </div>
          
          <div class="mode-selection">
            <label class="mode-option" [class.active]="!form.get('hasStore')?.value">
              <input type="radio" formControlName="hasStore" [value]="false">
              <div class="mode-info">
                <strong>Voy a domicilio / Soy independiente</strong>
                <span>Atiende solicitudes en las zonas donde te desplaces.</span>
              </div>
            </label>
            <label class="mode-option" [class.active]="form.get('hasStore')?.value">
              <input type="radio" formControlName="hasStore" [value]="true">
              <div class="mode-info">
                <strong>Tengo un local, taller o puesto fijo</strong>
                <span>Los clientes pueden ubicar tu local y visitarte.</span>
              </div>
            </label>
          </div>

          <!-- Store Details (Only if hasStore is true) -->
          <div class="store-details-box" *ngIf="form.get('hasStore')?.value">
            <p class="store-help">Llena estos datos para que los clientes puedan ubicar tu negocio en el mapa y visitarte.</p>
            
            <div class="form-group">
              <label>Nombre del Local o Puesto</label>
              <div class="input-wrapper">
                <span class="prefix-icon">🏬</span>
                <input formControlName="storeName" type="text" placeholder="Ej. Multiservicios Juanito, Puesto 15" />
              </div>
            </div>

            <app-address-selector 
              [isProfileMode]="true" 
              [initialData]="initialAddressData"
              (addressSelected)="onAddressSelected($event)">
            </app-address-selector>

            <div class="file-upload-zone">
              <label>Foto de la fachada de tu Local / Taller</label>
              <div class="file-input-wrapper">
                <input type="file" (change)="onFileSelected($event, 'STORE_PHOTO')" accept="image/*" class="file-picker" />
                <button type="button" class="btn-upload" (click)="uploadDoc('STORE_PHOTO')" [disabled]="!selectedFiles['STORE_PHOTO'] || uploading['STORE_PHOTO']">
                  {{ uploading['STORE_PHOTO'] ? 'Subiendo...' : 'Subir Foto del Local' }}
                </button>
              </div>
              <span class="success-text" *ngIf="uploadedDocs['STORE_PHOTO']">✅ Foto del local subida correctamente</span>
            </div>
          </div>
          
          <!-- Independent Message (Only if hasStore is false) -->
          <div *ngIf="!form.get('hasStore')?.value" class="independent-info-card">
            <span class="info-icon">🛵</span>
            <p>Trabajarás en modalidad <strong>A Domicilio / Independiente</strong>. Usaremos tu zona seleccionada y la dirección de tu perfil para conectarte con clientes cercanos. ¡Estás listo para continuar!</p>
          </div>
        </div>

        <!-- STEP 3: Identidad y Facturación -->
        <div class="step-content" *ngIf="currentStep === 3">
          <div class="step-title-row">
            <span class="step-title-icon">🛡️</span>
            <div>
              <h2>Paso 3: Verificación Legal</h2>
              <p class="subtitle">Estos datos son necesarios para verificar tu identidad y habilitar tu facturación.</p>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Documento de identidad</label>
              <div class="doc-id-group">
                <span class="prefix-icon">🆔</span>
                <select formControlName="identityDocumentType" class="doc-type-select">
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="PASSPORT">PASSPORT</option>
                </select>
                <div class="doc-divider"></div>
                <input formControlName="identityDocumentNumber" type="text" placeholder="12345678" class="doc-num-input" />
              </div>
            </div>
            <div class="form-group flex-1">
              <label>Número de RUC</label>
              <div class="input-wrapper">
                <span class="prefix-icon">💼</span>
                <input formControlName="ruc" type="text" placeholder="Ej. 10765432101" />
              </div>
            </div>
          </div>

          <div class="file-upload-zone">
            <label>Foto Frontal del DNI / Documento</label>
            <div class="file-input-wrapper">
              <input type="file" (change)="onFileSelected($event, 'DNI_FRONT')" accept="image/*" class="file-picker" />
              <button type="button" class="btn-upload" (click)="uploadDoc('DNI_FRONT')" [disabled]="!selectedFiles['DNI_FRONT'] || uploading['DNI_FRONT']">
                {{ uploading['DNI_FRONT'] ? 'Subiendo...' : 'Subir Foto Frontal' }}
              </button>
            </div>
            <span class="success-text" *ngIf="uploadedDocs['DNI_FRONT']">✅ Subido correctamente</span>
          </div>

          <div class="file-upload-zone" *ngIf="form.get('identityDocumentType')?.value !== 'PASSPORT'">
            <label>Foto Reverso del DNI / Documento</label>
            <div class="file-input-wrapper">
              <input type="file" (change)="onFileSelected($event, 'DNI_BACK')" accept="image/*" class="file-picker" />
              <button type="button" class="btn-upload" (click)="uploadDoc('DNI_BACK')" [disabled]="!selectedFiles['DNI_BACK'] || uploading['DNI_BACK']">
                {{ uploading['DNI_BACK'] ? 'Subiendo...' : 'Subir Foto Reverso' }}
              </button>
            </div>
            <span class="success-text" *ngIf="uploadedDocs['DNI_BACK']">✅ Subido correctamente</span>
          </div>
        </div>

        <!-- STEP 4: Categorías -->
        <div class="step-content" *ngIf="currentStep === 4">
          <div class="step-title-row">
            <span class="step-title-icon">🛠️</span>
            <div>
              <h2>Paso 4: Especialidades</h2>
              <p class="subtitle">Selecciona los servicios que puedes ofrecer. Puedes agregar más después.</p>
            </div>
          </div>
          
          <div class="categories-grid">
            <div class="category-card" *ngFor="let cat of catalogCategories" 
                 [class.selected]="selectedCategoryCodes.includes(cat.codigo)"
                 (click)="toggleCategory(cat.codigo)">
              <div class="check-indicator">
                 <span class="check-circle-icon">{{ selectedCategoryCodes.includes(cat.codigo) ? '🟢' : '⚪' }}</span>
              </div>
              <h3>{{ cat.nombre }}</h3>
            </div>
          </div>
          <p class="error-text" *ngIf="selectedCategoryCodes.length === 0">
            ⚠️ Debes seleccionar al menos una categoría.
          </p>

          <h3 class="section-title">Detalles del Servicio</h3>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Servicio principal que deseas ofrecer</label>
              <div class="input-wrapper">
                <span class="prefix-icon">🔧</span>
                <input formControlName="requestedService" type="text" placeholder="Ej. Instalación Eléctrica" />
              </div>
            </div>
            <div class="form-group flex-1">
              <label>Años de experiencia</label>
              <div class="input-wrapper">
                <span class="prefix-icon">⏳</span>
                <select formControlName="experience">
                  <option value="">Selecciona tu experiencia</option>
                  <option value="Sin experiencia">Sin experiencia</option>
                  <option value="1 a 3 años">1 a 3 años</option>
                  <option value="3 a 5 años">3 a 5 años</option>
                  <option value="Más de 5 años">Más de 5 años</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Disponibilidad</label>
              <div class="input-wrapper">
                <span class="prefix-icon">📅</span>
                <select formControlName="availability">
                  <option value="">Selecciona tu disponibilidad</option>
                  <option value="Tiempo completo">Tiempo completo</option>
                  <option value="Medio tiempo">Medio tiempo</option>
                  <option value="Fines de semana">Fines de semana</option>
                </select>
              </div>
            </div>
            <div class="form-group flex-1">
              <label>Horario Preferido</label>
              <div class="input-wrapper">
                <span class="prefix-icon">⏱</span>
                <input formControlName="preferredSchedule" type="text" placeholder="Ej. Lunes a Sábado, mañanas" />
              </div>
            </div>
          </div>

          <div class="file-upload-zone">
            <label>Curriculum Vitae / Evidencia de Especialidad (Opcional, en PDF)</label>
            <div class="file-input-wrapper">
              <input type="file" (change)="onFileSelected($event, 'CV_DOCUMENT')" accept=".pdf" class="file-picker" />
              <button type="button" class="btn-upload" (click)="uploadDoc('CV_DOCUMENT')" [disabled]="!selectedFiles['CV_DOCUMENT'] || uploading['CV_DOCUMENT']">
                {{ uploading['CV_DOCUMENT'] ? 'Subiendo...' : 'Subir CV (PDF)' }}
              </button>
            </div>
            <span class="success-text" *ngIf="uploadedDocs['CV_DOCUMENT']">✅ Subido correctamente</span>
          </div>
        </div>
        
        <!-- WIZARD ACTIONS -->
        <div class="wizard-actions">
          <a routerLink="/cliente" class="btn-secondary">Cancelar</a>
          <button type="button" class="btn-secondary btn-back" *ngIf="currentStep > 1" (click)="prevStep()">Volver</button>
          
          <button type="button" class="btn-primary" *ngIf="currentStep < 4" (click)="nextStep()" [disabled]="!isStepValid()">Continuar</button>
          
          <button type="button" class="btn-success" *ngIf="currentStep === 4" (click)="submitApplication()" [disabled]="!isStepValid() || submitting">
            {{ submitting ? 'Enviando...' : 'Enviar Postulación' }}
          </button>
        </div>
      </form>

      <!-- Footer de Seguridad -->
      <div class="wizard-footer" *ngIf="!application || application.estado === 'DRAFT'">
        <span>🔒 Tu información está segura y solo será utilizada para verificar tu postulación.</span>
      </div>
    </div>
  `,
  styles: [`
    .wizard-container {
      max-width: 900px;
      margin: 40px auto;
      padding: 0 20px;
      font-family: 'Inter', sans-serif;
      color: #f8fafc;
    }
    .wizard-header {
      text-align: center;
      margin-bottom: 40px;
    }
    .wizard-header h1 {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 10px;
      color: #f8fafc;
    }
    .gradient-text {
      background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .wizard-header p {
      color: #94a3b8;
      font-size: 1.05rem;
      margin: 0;
    }
    
    .status-banner {
      display: flex;
      align-items: center;
      padding: 20px;
      border-radius: 16px;
      margin-bottom: 30px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    .status-icon {
      font-size: 1.8rem;
      margin-right: 20px;
    }
    .status-content strong {
      display: block;
      font-size: 1.15rem;
      margin-bottom: 4px;
    }
    .status-content p {
      margin: 0;
      color: #cbd5e1;
      font-size: 0.95rem;
    }
    
    .submitted, .under_review {
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }
    .approved {
      background: rgba(34, 197, 94, 0.08);
      border: 1px solid rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }
    .rejected {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    /* Stepper */
    .stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 40px;
      position: relative;
    }
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
      width: 25%;
    }
    .step-circle {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #0f172a;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.05rem;
      margin-bottom: 10px;
      border: 2px solid #1e293b;
      transition: all 0.3s ease;
    }
    .step-label {
      color: #475569;
      font-weight: 600;
      font-size: 0.85rem;
      text-align: center;
    }
    
    .step.active .step-circle {
      background: #1e293b;
      color: #3b82f6;
      border-color: #3b82f6;
      box-shadow: 0 0 16px rgba(59, 130, 246, 0.35);
    }
    .step.active .step-label {
      color: #cbd5e1;
      font-weight: 700;
    }
    .step.completed .step-circle {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
    }
    .step.completed .step-label {
      color: #3b82f6;
    }
    
    .step-line {
      flex: 1;
      height: 2px;
      background: #1e293b;
      position: relative;
      top: -14px;
      z-index: 1;
      margin: 0 -8px;
      transition: all 0.3s ease;
    }
    .step-line.completed {
      background: #3b82f6;
      box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
    }
    
    /* Form Card */
    .form-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }
    
    .step-title-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .step-title-icon {
      font-size: 1.8rem;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 12px;
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .step-content h2 {
      color: #f8fafc;
      margin: 0 0 4px 0;
      font-size: 1.4rem;
      font-weight: 700;
    }
    .subtitle {
      color: #94a3b8;
      margin: 0;
      font-size: 0.92rem;
    }
    
    .form-row { display: flex; gap: 20px; }
    .flex-1 { flex: 1; }
    .form-group { margin-bottom: 24px; }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #cbd5e1;
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    /* Input Wrappers with Prefix Icons */
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .prefix-icon {
      position: absolute;
      left: 16px;
      color: #64748b;
      font-size: 1rem;
      pointer-events: none;
    }
    .input-wrapper input, .input-wrapper select, .input-wrapper textarea {
      width: 100%;
      padding: 12px 16px 12px 44px;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      color: #f8fafc;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .input-wrapper input:focus, .input-wrapper select:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .readonly-input {
      background: #0f172a !important;
      opacity: 0.7;
      cursor: not-allowed;
      border-color: #1e293b !important;
    }

    /* Doc Identity Combined Input Group */
    .doc-id-group {
      display: flex;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      align-items: center;
      padding-left: 44px;
      overflow: hidden;
      height: 47px;
      box-sizing: border-box;
      position: relative;
    }
    .doc-id-group:focus-within {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .doc-id-group .prefix-icon {
      left: 16px;
    }
    .doc-type-select {
      background: transparent !important;
      border: none !important;
      color: #cbd5e1 !important;
      font-size: 0.92rem;
      padding: 0 20px 0 0 !important;
      cursor: pointer;
      outline: none;
      width: auto;
      min-width: 65px;
      height: 100%;
    }
    .doc-divider {
      width: 1px;
      height: 20px;
      background: #1e293b;
      margin: 0 4px 0 0;
    }
    .doc-num-input {
      background: transparent !important;
      border: none !important;
      color: #f8fafc !important;
      font-size: 0.95rem;
      padding: 0 !important;
      outline: none;
      flex: 1;
      height: 100%;
    }

    /* Textarea character counter */
    .textarea-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
    }
    .textarea-wrapper textarea {
      width: 100%;
      padding: 14px 16px 36px 44px;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      color: #f8fafc;
      font-size: 0.95rem;
      outline: none;
      box-sizing: border-box;
      resize: vertical;
      line-height: 1.5;
      transition: all 0.2s ease;
    }
    .textarea-wrapper textarea:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .textarea-wrapper .area-icon {
      top: 14px;
    }
    .char-counter {
      position: absolute;
      bottom: 12px;
      right: 16px;
      font-size: 0.78rem;
      color: #475569;
      font-weight: 500;
    }

    /* Step 2 mode option */
    .mode-selection {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
    }
    .mode-option {
      flex: 1;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 14px;
      padding: 20px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .mode-option:hover {
      border-color: #334155;
    }
    .mode-option.active {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.04);
      box-shadow: 0 0 16px rgba(59, 130, 246, 0.08);
    }
    .mode-option input[type="radio"] {
      margin-top: 4px;
      accent-color: #3b82f6;
    }
    .mode-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .mode-info strong {
      color: #f8fafc;
      font-size: 0.95rem;
    }
    .mode-info span {
      color: #64748b;
      font-size: 0.8rem;
    }
    
    .store-details-box {
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 24px;
      background: rgba(15, 23, 42, 0.4);
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .store-help {
      margin: 0;
      color: #94a3b8;
      font-size: 0.88rem;
      line-height: 1.4;
    }
    
    .independent-info-card {
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      gap: 14px;
      align-items: center;
      margin-top: 24px;
    }
    .independent-info-card .info-icon { font-size: 1.5rem; }
    .independent-info-card p {
      margin: 0;
      color: #cbd5e1;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    /* File Upload Zone */
    .file-upload-zone {
      background: #0f172a;
      border: 1px dashed #1e293b;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      text-align: center;
      transition: border-color 0.2s;
    }
    .file-upload-zone:hover { border-color: #334155; }
    .file-upload-zone label {
      display: block;
      font-weight: 600;
      margin-bottom: 12px;
      color: #cbd5e1;
      font-size: 0.9rem;
    }
    .file-input-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .file-picker {
      padding: 8px 12px;
      background: #0b0f19;
      border-radius: 8px;
      border: 1px solid #1e293b;
      color: #cbd5e1;
      font-size: 0.88rem;
    }
    .btn-upload {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-upload:not([disabled]):hover {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }
    .btn-upload[disabled] { opacity: 0.5; cursor: not-allowed; }
    .success-text {
      display: block;
      color: #22c55e;
      margin-top: 10px;
      font-weight: 600;
      font-size: 0.85rem;
    }

    /* Step 4 Category card grid */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .category-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
    }
    .category-card:hover {
      border-color: #334155;
      transform: translateY(-2px);
    }
    .category-card.selected {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.05);
      box-shadow: 0 0 16px rgba(59, 130, 246, 0.1);
    }
    .category-card h3 {
      margin: 12px 0 0 0;
      font-size: 1.05rem;
      color: #cbd5e1;
      font-weight: 600;
    }
    .category-card.selected h3 {
      color: #3b82f6;
    }
    .check-indicator {
      font-size: 1.2rem;
    }
    .error-text { color: #f87171; font-weight: 600; font-size: 0.88rem; text-align: center; }
    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #f8fafc;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 32px;
      margin-bottom: 20px;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 10px;
    }

    /* Actions buttons */
    .wizard-actions {
      display: flex;
      align-items: center;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #1e293b;
      gap: 12px;
    }
    .wizard-actions button, .wizard-actions a {
      padding: 12px 28px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      text-decoration: none;
      display: inline-block;
    }
    .btn-secondary {
      background: transparent;
      color: #94a3b8;
      border: 1px solid #1e293b !important;
    }
    .btn-secondary:hover {
      background: #1e293b;
      color: #f8fafc;
    }
    .btn-back {
      margin-left: 0;
    }
    .btn-primary {
      background: #2563eb;
      color: white;
      margin-left: auto;
    }
    .btn-primary:hover:not([disabled]) {
      background: #1d4ed8;
    }
    .btn-primary[disabled] { background: #1e293b; color: #475569; border-color: #1e293b; cursor: not-allowed; }
    .btn-success {
      background: #16a34a;
      color: white;
      margin-left: auto;
    }
    .btn-success:hover:not([disabled]) {
      background: #15803d;
    }
    .btn-success[disabled] { background: #1e293b; color: #475569; cursor: not-allowed; }
    
    /* Safety footer */
    .wizard-footer {
      text-align: center;
      margin-top: 24px;
      color: #64748b;
      font-size: 0.85rem;
    }

    @media(max-width: 600px) {
      .form-row { flex-direction: column; gap: 0; }
      .stepper { flex-wrap: wrap; gap: 12px 0; }
      .step { width: 50%; }
      .step-line { display: none; }
      .mode-selection { flex-direction: column; }
    }
  `]
})
export class ApplicationPageComponent implements OnInit {
  private readonly appService = inject(TechnicianApplicationService);
  private readonly docService = inject(TechnicianDocumentService);
  private readonly catalogService = inject(PublicCatalogService);
  private readonly clienteProfileService = inject(ClienteProfileService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  form: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    phone: ['', Validators.required],
    aboutMe: [''],
    department: ['', Validators.required],
    province: ['', Validators.required],
    district: ['', Validators.required],
    hasStore: [false],
    storeName: [''],
    addressLine: [''],
    reference: [''],
    identityDocumentType: ['DNI', Validators.required],
    identityDocumentNumber: ['', Validators.required],
    ruc: ['', Validators.required],
    requestedService: ['', Validators.required],
    experience: ['', Validators.required],
    availability: ['', Validators.required],
    preferredSchedule: ['', Validators.required]
  });

  currentStep = 1;
  application: TechnicianApplication | null = null;
  submitting = false;
  userEmail: string = '';

  // Documents State
  selectedFiles: { [key: string]: File | null } = {};
  uploading: { [key: string]: boolean } = {};
  uploadedDocs: { [key: string]: boolean } = {};

  // Catalog State
  catalogCategories: ServiceCategory[] = [];
  selectedCategoryCodes: string[] = [];

  // Ubigeo State
  departments = getDepartments();
  provinces: any[] = [];
  districts: any[] = [];
  selectedLocation: any = null;
  initialAddressData: any = null;

  // Map State
  techMap: L.Map | undefined;
  techMarker: L.Marker | undefined;

  ngOnInit(): void {
    this.loadCatalogCategories();
    this.loadUserProfile();
    this.loadApplication();
    this.checkExistingDocuments();

    this.form.get('hasStore')?.valueChanges.subscribe(hasStore => {
      if (hasStore) {
        this.form.get('storeName')?.setValidators([Validators.required]);
      } else {
        this.form.get('storeName')?.clearValidators();
      }
      this.form.get('storeName')?.updateValueAndValidity();
    });
  }

  get aboutMeLength(): number {
    return this.form.get('aboutMe')?.value?.length || 0;
  }

  loadUserProfile(): void {
    this.clienteProfileService.getProfile().subscribe({
      next: (profile) => {
        this.applyProfileAutofill(profile);
        if (profile?.email) {
          this.userEmail = profile.email;
        } else {
          const username = this.authService.username();
          if (username) {
            this.userEmail = `${username.toLowerCase()}@email.com`;
          }
        }
      },
      error: () => this.applyProfileAutofill(null)
    });
  }

  private applyProfileAutofill(profile: any): void {
    if (this.application && this.application.estado !== 'DRAFT') return;
    
    const f = this.form.value;
    let profileName = '';
    let profilePhone = '';

    if (profile) {
      if (profile.firstName || profile.lastName) {
        profileName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
      }
      if (profile.telefono) {
        profilePhone = profile.telefono;
      }
      
      if (profile.region && !f.department) {
        this.form.patchValue({ department: profile.region });
      }
      if (profile.provincia && !f.province) {
        this.form.patchValue({ province: profile.provincia });
      }
      if (profile.distrito && !f.district) {
        this.form.patchValue({ district: profile.distrito });
      }
      if (profile.direccion && !f.addressLine) {
        this.form.patchValue({ addressLine: profile.direccion });
      }
      if (profile.referencia && !f.reference) {
        this.form.patchValue({ reference: profile.referencia });
      }

      this.initialAddressData = {
        region: profile.region,
        provincia: profile.provincia,
        distrito: profile.distrito,
        direccion: profile.direccion,
        referencia: profile.referencia,
        lat: profile.lat,
        lng: profile.lng
      };

      if (profile.region && !this.selectedLocation) {
         const depName = this.departments.find(d => d.code === profile.region)?.name;
         let provName = '';
         let distName = '';
         try {
           provName = getProvinces(profile.region).find(p => p.code === profile.provincia)?.name || '';
           distName = getDistricts(profile.provincia).find(d => d.code === profile.distrito)?.name || '';
         } catch(e) {}

         this.selectedLocation = {
           department: depName,
           province: provName,
           district: distName,
           addressLine: profile.direccion || '',
           reference: profile.referencia || '',
           lat: profile.lat || 0,
           lng: profile.lng || 0
         };
      }
    }

    if (!profileName) {
      const authFirstName = this.authService.firstName();
      const authLastName = this.authService.lastName();
      if (authFirstName || authLastName) {
        profileName = `${authFirstName || ''} ${authLastName || ''}`.trim();
      } else {
        const username = this.authService.username();
        if (username && username !== 'Usuario') {
          profileName = username;
        }
      }
    }

    if (!f.fullName && profileName) {
      this.form.patchValue({ fullName: profileName });
    }
    if (!f.phone && profilePhone) {
      this.form.patchValue({ phone: profilePhone });
    }
  }

  loadCatalogCategories(): void {
    this.catalogService.getCategories().subscribe({
      next: (data) => this.catalogCategories = data.filter(c => c.activo),
      error: (err) => console.error('Error cargando categorías', err)
    });
  }

  loadApplication(): void {
    this.appService.getApplication().subscribe({
      next: (app) => {
        this.application = app;
        
        const patchData: any = { ...app };
        if (!patchData.fullName) delete patchData.fullName;
        if (!patchData.phone) delete patchData.phone;
        this.form.patchValue(patchData);
        
        if (app.department || app.lat) {
          this.selectedLocation = {
            department: app.department,
            province: app.province,
            district: app.district,
            addressLine: app.addressLine,
            reference: app.reference,
            lat: app.lat,
            lng: app.lng
          };
        }

        if (app.categorias) {
          this.selectedCategoryCodes = app.categorias.split(',');
        }
        if (app.estado !== 'DRAFT') {
          this.form.disable();
        }
      },
      error: (err) => {
        console.error('No application found', err?.message);
      }
    });
  }

  checkExistingDocuments(): void {
    this.docService.getDocuments().subscribe({
      next: (docs) => {
        docs.forEach(doc => {
          this.uploadedDocs[doc.documentType] = true;
        });
      }
    });
  }

  onAddressSelected(event: any) {
    if (event.mode === 'new' && event.newAddress) {
      const addr = event.newAddress;
      let depCode = '';
      let provCode = '';
      let distCode = '';

      if (addr.department) {
        const dep = this.departments.find(d => d.name === addr.department);
        if (dep) depCode = dep.code;
      }
      if (depCode && addr.province) {
        const prov = getProvinces(depCode).find(p => p.name === addr.province);
        if (prov) provCode = prov.code;
      }
      if (provCode && addr.district) {
        const dist = getDistricts(provCode).find(d => d.name === addr.district);
        if (dist) distCode = dist.code;
      }

      this.form.patchValue({
        department: depCode,
        province: provCode,
        district: distCode,
        addressLine: addr.addressLine,
        reference: addr.reference
      });

      this.selectedLocation = {
        department: addr.department,
        province: addr.province,
        district: addr.district,
        addressLine: addr.addressLine,
        reference: addr.reference,
        lat: addr.lat,
        lng: addr.lng
      };
    }
  }

  nextStep(): void {
    if (this.currentStep < 4 && this.isStepValid()) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  getEstadoEs(estado: string | undefined): string {
    switch (estado) {
      case 'DRAFT': return 'Borrador';
      case 'SUBMITTED': return 'Enviada (En Revisión)';
      case 'UNDER_REVIEW': return 'En Revisión';
      case 'APPROVED': return 'Aprobada';
      case 'REJECTED': return 'Rechazada';
      default: return estado || '';
    }
  }

  isStepValid(): boolean {
    if (this.currentStep === 1) {
      return !!(this.form.get('fullName')?.valid && this.form.get('phone')?.valid);
    }
    if (this.currentStep === 2) {
      if (!this.form.get('hasStore')?.value) {
        return true;
      }
      const hasLoc = !!(this.selectedLocation && this.selectedLocation.lat && this.selectedLocation.lng);
      return hasLoc && !!this.form.get('storeName')?.valid && this.uploadedDocs['STORE_PHOTO'];
    }
    if (this.currentStep === 3) {
      return !!(this.form.get('identityDocumentType')?.valid && this.form.get('identityDocumentNumber')?.valid && this.form.get('ruc')?.valid);
    }
    if (this.currentStep === 4) {
      return this.selectedCategoryCodes.length > 0;
    }
    return false;
  }

  onFileSelected(event: any, type: string): void {
    const file = event.target.files[0] || null;
    if (!file) {
      this.selectedFiles[type] = null;
      return;
    }

    if (type === 'CV_DOCUMENT' && !this.isPdfFile(file)) {
      alert('El CV debe ser un archivo PDF.');
      event.target.value = '';
      this.selectedFiles[type] = null;
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('El archivo no debe superar los 20 MB.');
      event.target.value = '';
      this.selectedFiles[type] = null;
      return;
    }

    this.selectedFiles[type] = file;
  }

  private isPdfFile(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }

  uploadDoc(type: string): void {
    const file = this.selectedFiles[type];
    if (!file) return;

    this.uploading[type] = true;
    this.docService.uploadDocument(file, type).subscribe({
      next: () => {
        this.uploading[type] = false;
        this.uploadedDocs[type] = true;
      },
      error: () => {
        this.uploading[type] = false;
        alert('Error al subir el archivo');
      }
    });
  }

  private uploadOptionalCvIfNeeded(): Observable<unknown> {
    const file = this.selectedFiles['CV_DOCUMENT'];
    if (!file || this.uploadedDocs['CV_DOCUMENT']) {
      return of(null);
    }

    this.uploading['CV_DOCUMENT'] = true;
    return this.docService.uploadDocument(file, 'CV_DOCUMENT').pipe(
      tap(() => {
        this.uploadedDocs['CV_DOCUMENT'] = true;
      }),
      finalize(() => {
        this.uploading['CV_DOCUMENT'] = false;
      })
    );
  }

  toggleCategory(code: string): void {
    if (this.application && this.application.estado !== 'DRAFT') return;
    
    const index = this.selectedCategoryCodes.indexOf(code);
    if (index > -1) {
      this.selectedCategoryCodes.splice(index, 1);
    } else {
      this.selectedCategoryCodes.push(code);
    }
  }

  getPayload() {
    return { 
      ...this.form.value, 
      categorias: this.selectedCategoryCodes.join(','),
      department: this.selectedLocation?.department,
      province: this.selectedLocation?.province,
      district: this.selectedLocation?.district,
      addressLine: this.selectedLocation?.addressLine,
      reference: this.selectedLocation?.reference,
      lat: this.selectedLocation?.lat,
      lng: this.selectedLocation?.lng
    };
  }

  submitApplication(): void {
    const docType = this.form.get('identityDocumentType')?.value;
    
    if (!this.uploadedDocs['DNI_FRONT']) {
      alert('Debes subir la foto frontal de tu documento en el Paso 3.');
      this.currentStep = 3;
      return;
    }

    if (docType !== 'PASSPORT' && !this.uploadedDocs['DNI_BACK']) {
      alert('Debes subir la foto reverso de tu documento en el Paso 3.');
      this.currentStep = 3;
      return;
    }

    if (!confirm('¿Estás seguro de enviar la postulación? No podrás editarla luego.')) return;
    
    this.submitting = true;
    this.uploadOptionalCvIfNeeded().pipe(
      switchMap(() => this.appService.saveApplication(this.getPayload())),
      switchMap(() => this.appService.submitApplication())
    ).subscribe({
      next: () => {
        this.submitting = false;
        this.loadApplication();
      },
      error: (err: any) => {
        this.submitting = false;
        console.error('Error al enviar postulacion', err);
        alert('Error al enviar la postulacion. Verifica que el PDF se haya subido correctamente.');
      }
    });
  }
}
