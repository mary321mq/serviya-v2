import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { getDepartments, getProvinces, getDistricts } from 'ubigeo-fns';
import { LucideAngularModule } from 'lucide-angular';

import { ClienteProfileService } from '../services/cliente-profile.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AddressSelectorComponent } from '../../../shared/components/address-selector/address-selector.component';
import { SERVIYA_APP_CONFIG } from '../../../core/config/app-config';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AddressSelectorComponent, LucideAngularModule],
  template: `
    <div class="profile-layout catalog-container">
      <!-- Top Banner -->
      <div class="header-banner">
        <div class="header-content">
          <div class="avatar-wrapper" (click)="fileInput.click()">
            <input type="file" #fileInput hidden (change)="onFileSelected($event)" accept="image/*">
            <div class="avatar-circle">
              <ng-container *ngIf="profile?.avatarUrl; else noAvatar">
                 <img [src]="getAvatarUrl(profile?.avatarUrl)" class="avatar-img" />
              </ng-container>
              <ng-template #noAvatar>
                <!-- Usamos una imagen genérica estilo mockup -->
                <img src="https://ui-avatars.com/api/?name={{profileForm.value.firstName}}&background=1E90FF&color=fff&size=120" class="avatar-img" />
              </ng-template>
            </div>
            <div class="camera-badge">
              <lucide-icon name="camera" [size]="14"></lucide-icon>
            </div>
          </div>
          
          <div class="user-info-section">
            <h1 class="user-name">{{ profileForm.value.firstName || 'Juana' }} {{ profileForm.value.lastName || 'Tito Larico' | uppercase }}</h1>
            <span class="role-badge">SUPER ADMIN</span>
            
            <div class="contact-row">
              <span class="contact-item">
                <lucide-icon name="mail" [size]="14"></lucide-icon>
                {{ profileForm.value.email || 'juana.tito@serviya.com' }}
              </span>
              <span class="contact-item">
                <lucide-icon name="phone" [size]="14"></lucide-icon>
                {{ profileForm.value.telefono || '+51 987 654 321' }}
              </span>
            </div>
            
            <div class="member-since">
              <lucide-icon name="calendar" [size]="14"></lucide-icon>
              Miembro desde enero 2024
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          @if (!isEditing) {
            <button class="btn-neon-blue" (click)="toggleEdit()">
              <lucide-icon name="edit-2" [size]="16"></lucide-icon> Editar perfil
            </button>
          } @else {
            <div style="display: flex; gap: 12px;">
              <button type="button" class="btn-outline" (click)="cancelEdit()">Cancelar</button>
              <button type="button" class="btn-neon-blue" (click)="save()" [disabled]="profileForm.invalid || isSaving">
                {{ isSaving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          }
        </div>
      </div>

      <form [formGroup]="profileForm" (ngSubmit)="save()" class="main-grid">
        <!-- Center Content -->
        <div class="content-left">
          
          <!-- 1. Datos personales & 2. Info Contacto -->
          <div class="row-2-col">
            <div class="dark-card">
              <div class="card-header">
                <div class="card-title">
                  <lucide-icon name="user" [size]="18" color="#3B82F6"></lucide-icon>
                  <span>1. Datos personales</span>
                </div>
                <button type="button" class="btn-link" (click)="toggleEdit()" *ngIf="!isEditing">
                  <lucide-icon name="edit-2" [size]="14"></lucide-icon> Editar
                </button>
              </div>
              <div class="card-body">
                <div class="grid-2">
                  <div class="field-group">
                    <label>Nombres</label>
                    <p *ngIf="!isEditing">{{ profileForm.value.firstName || '-' | uppercase }}</p>
                    <input *ngIf="isEditing" type="text" formControlName="firstName" class="dark-input" />
                  </div>
                  <div class="field-group">
                    <label>Apellidos</label>
                    <p *ngIf="!isEditing">{{ profileForm.value.lastName || '-' | uppercase }}</p>
                    <input *ngIf="isEditing" type="text" formControlName="lastName" class="dark-input" />
                  </div>
                </div>
              </div>
            </div>

            <div class="dark-card">
              <div class="card-header">
                <div class="card-title">
                  <lucide-icon name="phone" [size]="18" color="#3B82F6"></lucide-icon>
                  <span>2. Información de contacto</span>
                </div>
                <button type="button" class="btn-link" (click)="toggleEdit()" *ngIf="!isEditing">
                  <lucide-icon name="edit-2" [size]="14"></lucide-icon> Editar
                </button>
              </div>
              <div class="card-body">
                <div class="field-group">
                  <label>Correo electrónico</label>
                  <div class="flex-between">
                    <p *ngIf="!isEditing">{{ profileForm.value.email || '-' }}</p>
                    <input *ngIf="isEditing" type="email" formControlName="email" class="dark-input flex-1" />
                    <span class="badge-verified" *ngIf="!isEditing">Verificado <lucide-icon name="check" [size]="12"></lucide-icon></span>
                  </div>
                </div>
                
                <div class="field-group mt-3">
                  <label>Teléfono móvil</label>
                  <div class="flex-between">
                    <p *ngIf="!isEditing">{{ profileForm.value.telefono || '-' }}</p>
                    <input *ngIf="isEditing" type="tel" formControlName="telefono" class="dark-input flex-1" />
                    <span class="badge-verified" *ngIf="!isEditing">Verificado <lucide-icon name="check" [size]="12"></lucide-icon></span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- 3. Dirección & 4. Seguridad -->
          <div class="row-2-col mt-4">
            <div class="dark-card h-full">
              <div class="card-header">
                <div class="card-title">
                  <lucide-icon name="map-pin" [size]="18" color="#3B82F6"></lucide-icon>
                  <span>3. Dirección</span>
                </div>
                <button type="button" class="btn-link" (click)="toggleEdit()" *ngIf="!isEditing">
                  <lucide-icon name="edit-2" [size]="14"></lucide-icon> Editar
                </button>
              </div>
              <div class="card-body">
                @if (!isEditing) {
                  <div class="field-group">
                    <label>Dirección principal</label>
                    <p>{{ profileForm.value.direccion || 'Jirón Lambayeque' }}</p>
                  </div>
                  <div class="field-group mt-3">
                    <label>Referencia</label>
                    <p>{{ profileForm.value.referencia || 'Frente al parque principal' }}</p>
                  </div>
                  <div class="grid-2 mt-3">
                    <div class="field-group">
                      <label>Departamento</label>
                      <p>{{ regionName || 'Puno' }}</p>
                    </div>
                    <div class="field-group">
                      <label>Provincia</label>
                      <p>{{ provinciaName || 'San Roman' }}</p>
                    </div>
                  </div>
                  <div class="field-group mt-3">
                    <label>Distrito</label>
                    <p>{{ distritoName || 'Juliaca' }}</p>
                  </div>
                } @else {
                  <app-address-selector 
                    [isProfileMode]="true" 
                    [initialData]="originalData"
                    (addressSelected)="onAddressSelected($event)">
                  </app-address-selector>
                }
              </div>
            </div>

            <div class="dark-card h-full">
              <div class="card-header">
                <div class="card-title">
                  <lucide-icon name="lock" [size]="18" color="#3B82F6"></lucide-icon>
                  <span>4. Seguridad de la cuenta</span>
                </div>
              </div>
              <div class="card-body">
                <div class="field-group flex-between">
                  <div>
                    <label>Contraseña</label>
                    <p>••••••••••••</p>
                  </div>
                  <button type="button" class="btn-link" (click)="changePassword()">Cambiar</button>
                </div>
                
                <div class="divider"></div>
                
                <div class="field-group flex-between mt-3">
                  <label>Autenticación en dos pasos</label>
                  <span class="text-green">Activada</span>
                </div>

                <div class="divider"></div>

                <div class="field-group flex-between mt-3">
                  <label>Último inicio de sesión</label>
                  <span class="text-muted">16 mayo 2024, 10:24 a. m.</span>
                </div>

                <div class="divider"></div>

                <div class="field-group flex-between mt-3">
                  <label>Dispositivos activos</label>
                  <button type="button" class="btn-link">2 dispositivos</button>
                </div>
                
                <button type="button" class="btn-outline w-full mt-4">
                  <lucide-icon name="monitor" [size]="16"></lucide-icon> Ver dispositivos
                </button>
              </div>
            </div>
          </div>
          
          <!-- System Preferences -->
          <div class="dark-card mt-4">
            <div class="card-header border-none">
              <div class="card-title">
                <lucide-icon name="settings" [size]="18" color="#3B82F6"></lucide-icon>
                <span>Preferencias del sistema</span>
              </div>
            </div>
            <div class="card-body">
              <div class="grid-3">
                <div class="pref-item">
                  <div class="pref-title"><lucide-icon name="globe" [size]="16"></lucide-icon> Idioma</div>
                  <select class="dark-select">
                    <option>Español</option>
                    <option>Inglés</option>
                  </select>
                  <p class="pref-desc">Selecciona tu idioma preferido para la plataforma.</p>
                </div>
                
                <div class="pref-item">
                  <div class="pref-title"><lucide-icon name="monitor" [size]="16"></lucide-icon> Tema</div>
                  <select class="dark-select">
                    <option>Oscuro</option>
                    <option>Claro</option>
                  </select>
                  <p class="pref-desc">Elige el tema que te resulte más cómodo.</p>
                </div>
                
                <div class="pref-item">
                  <div class="pref-title flex-between">
                    <div><lucide-icon name="bell" [size]="16"></lucide-icon> Notificaciones</div>
                    <div class="toggle-switch active"><div class="toggle-thumb"></div></div>
                  </div>
                  <p class="pref-desc mt-3">Recibe notificaciones sobre actividades importantes.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Sidebar -->
        <div class="sidebar-right">
          <!-- Completitud del perfil -->
          <div class="dark-card center-text">
            <h3 class="side-title">Completitud del perfil</h3>
            <div class="circular-progress-neon">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="circle glow" [attr.stroke-dasharray]="'100, 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="19" class="percentage">100%</text>
                <text x="18" y="24" class="percentage-label">Completado</text>
              </svg>
            </div>
            <p class="text-sm mt-3 text-muted">¡Excelente! Tu perfil está<br>completo y actualizado.</p>
            
            <div class="info-box-neon mt-4">
              <div class="info-box-icon"><lucide-icon name="star" [size]="18" fill="#F97316"></lucide-icon></div>
              <div class="info-box-text">
                <strong>Sigue así</strong>
                <span>Tu perfil completo te permite<br>aprovechar al máximo ServiYa.</span>
              </div>
              <lucide-icon name="chevron-right" [size]="16" class="arrow"></lucide-icon>
            </div>
          </div>

          <!-- Estado de la cuenta -->
          <div class="dark-card mt-4">
            <h3 class="side-title">Estado de la cuenta</h3>
            <ul class="status-list-neon">
              <li>
                <span><lucide-icon name="check-circle" [size]="16" color="#22C55E"></lucide-icon> Perfil verificado</span>
                <div class="check-icon"><lucide-icon name="check" [size]="12"></lucide-icon></div>
              </li>
              <li>
                <span><lucide-icon name="check-circle" [size]="16" color="#22C55E"></lucide-icon> Correo confirmado</span>
                <div class="check-icon"><lucide-icon name="check" [size]="12"></lucide-icon></div>
              </li>
              <li>
                <span><lucide-icon name="check-circle" [size]="16" color="#22C55E"></lucide-icon> Teléfono confirmado</span>
                <div class="check-icon"><lucide-icon name="check" [size]="12"></lucide-icon></div>
              </li>
              <li>
                <span><lucide-icon name="check-circle" [size]="16" color="#22C55E"></lucide-icon> Información actualizada</span>
                <div class="check-icon"><lucide-icon name="check" [size]="12"></lucide-icon></div>
              </li>
            </ul>
          </div>
          

        </div>
      </form>
    </div>
  `,
  styles: [`
    .catalog-container { width: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 24px; padding: 0 0 24px 0; }
    
    /* Header Banner */
    .header-banner { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 16px; padding: 32px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
    .header-content { display: flex; align-items: center; gap: 32px; }
    
    .avatar-wrapper { position: relative; cursor: pointer; }
    .avatar-circle { width: 120px; height: 120px; border-radius: 50%; padding: 4px; background: linear-gradient(135deg, #1E90FF, #8B5CF6); display: flex; align-items: center; justify-content: center; }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid var(--surface-1); }
    .camera-badge { position: absolute; bottom: 5px; right: 5px; background: #F97316; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid var(--surface-1); transition: transform 0.2s; }
    .avatar-wrapper:hover .camera-badge { transform: scale(1.1); }
    
    .user-info-section { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
    .user-name { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin: 0; line-height: 1; letter-spacing: 0.5px; }
    .role-badge { background: rgba(59,130,246,0.15); color: #60A5FA; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 12px; border: 1px solid rgba(59,130,246,0.3); }
    
    .contact-row { display: flex; gap: 24px; margin-top: 4px; }
    .contact-item { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.9rem; }
    
    .member-since { display: flex; align-items: center; gap: 8px; color: #94A3B8; font-size: 0.85rem; margin-top: 4px; }
    
    .btn-neon-blue { background: rgba(30,144,255,0.1); color: #38BDF8; border: 1px solid rgba(30,144,255,0.3); padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 1rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; box-shadow: 0 0 15px rgba(30,144,255,0.1) inset; }
    .btn-neon-blue:hover { background: rgba(30,144,255,0.2); box-shadow: 0 0 20px rgba(30,144,255,0.3) inset; }
    .btn-neon-blue[disabled] { opacity: 0.5; cursor: not-allowed; }
    
    .btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn-outline:hover { background: rgba(255,255,255,0.05); }
    .btn-link { background: transparent; border: none; color: #3B82F6; font-size: 0.9rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 0; }
    .btn-link:hover { text-decoration: underline; }

    /* Layout */
    .main-grid { display: flex; gap: 24px; align-items: flex-start; }
    .content-left { flex: 1; display: flex; flex-direction: column; }
    .sidebar-right { width: 340px; display: flex; flex-direction: column; }
    
    .row-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    
    /* Dark Cards */
    .dark-card { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); display: flex; flex-direction: column; }
    .h-full { height: 100%; box-sizing: border-box; }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); margin-bottom: 20px; }
    .card-header.border-none { border-bottom: none; padding-bottom: 0; margin-bottom: 20px; }
    .card-title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 10px; }
    
    /* Fields */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; row-gap: 24px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-group label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 500; margin: 0; }
    .field-group p { font-size: 0.95rem; color: var(--text-primary); font-weight: 500; margin: 0; }
    .full-width { grid-column: 1 / -1; }
    .mt-3 { margin-top: 20px; }
    .mt-4 { margin-top: 24px; }
    .w-full { width: 100%; justify-content: center; }
    .flex-between { display: flex; justify-content: space-between; align-items: center; }
    .flex-1 { flex: 1; }
    
    .dark-input { background: var(--surface-2); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 14px; border-radius: 8px; outline: none; font-family: inherit; font-size: 0.95rem; transition: 0.2s; }
    .dark-input:focus { border-color: var(--primary-neon); box-shadow: 0 0 10px rgba(30,144,255,0.2); }
    
    /* Badges & Text */
    .badge-verified { background: rgba(34,197,94,0.1); color: #22C55E; border: 1px solid rgba(34,197,94,0.3); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; display: flex; align-items: center; gap: 6px; }
    .badge-unverified { background: rgba(249,115,22,0.1); color: #F97316; border: 1px solid rgba(249,115,22,0.3); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; display: flex; align-items: center; gap: 6px; }
    .text-green { color: #22C55E; font-weight: 500; }
    .text-muted { color: var(--text-secondary); }
    .divider { height: 1px; background: var(--border-color); margin: 16px 0; }
    
    /* Preferences */
    .pref-item { display: flex; flex-direction: column; gap: 12px; }
    .pref-title { display: flex; align-items: center; gap: 8px; color: var(--text-primary); font-weight: 500; font-size: 0.95rem; }
    .pref-desc { color: var(--text-secondary); font-size: 0.8rem; line-height: 1.4; margin: 0; }
    
    .dark-select { background: var(--surface-2); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 14px; border-radius: 8px; outline: none; font-family: inherit; font-size: 0.95rem; appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; cursor: pointer; }
    
    .toggle-switch { width: 44px; height: 24px; background: var(--surface-3); border-radius: 12px; position: relative; cursor: pointer; transition: 0.3s; }
    .toggle-switch.active { background: #3B82F6; }
    .toggle-thumb { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: 0.3s; }
    .toggle-switch.active .toggle-thumb { left: 23px; }

    /* Right Sidebar */
    .center-text { text-align: center; align-items: center; }
    .side-title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin: 0 0 24px 0; align-self: flex-start; }
    .center-text .side-title { align-self: center; }
    
    .circular-progress-neon { width: 160px; height: 160px; position: relative; margin: 0 auto; filter: drop-shadow(0 0 10px rgba(59,130,246,0.3)); }
    .circular-chart { display: block; width: 100%; height: 100%; }
    .circle-bg { fill: none; stroke: var(--surface-3); stroke-width: 3; }
    .circle { fill: none; stroke-width: 3; stroke-linecap: round; stroke: #3B82F6; }
    .circle.glow { filter: drop-shadow(0 0 5px #3B82F6); }
    .percentage { fill: white; font-size: 0.55em; text-anchor: middle; font-weight: 700; }
    .percentage-label { fill: #94A3B8; font-size: 0.16em; text-anchor: middle; font-weight: 500; }
    .text-sm { font-size: 0.85rem; }
    
    .info-box-neon { background: rgba(249,115,22,0.05); border: 1px solid rgba(249,115,22,0.2); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; text-align: left; cursor: pointer; transition: 0.2s; }
    .info-box-neon:hover { background: rgba(249,115,22,0.1); border-color: rgba(249,115,22,0.4); }
    .info-box-text { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .info-box-text strong { color: #F97316; font-size: 0.9rem; }
    .info-box-text span { color: var(--text-secondary); font-size: 0.8rem; line-height: 1.3; }
    .arrow { color: var(--text-secondary); }
    
    .status-list-neon { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; width: 100%; }
    .status-list-neon li { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); }
    .status-list-neon li:last-child { border-bottom: none; padding-bottom: 0; }
    .status-list-neon span { display: flex; align-items: center; gap: 12px; color: var(--text-primary); font-size: 0.95rem; }
    .check-icon { width: 22px; height: 22px; border-radius: 50%; background: #22C55E; color: white; display: flex; align-items: center; justify-content: center; }
    
    .activity-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 20px; width: 100%; }
    .activity-list li { display: flex; align-items: flex-start; gap: 16px; }
    .activity-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .activity-icon.green { background: rgba(34,197,94,0.1); color: #22C55E; border: 1px solid rgba(34,197,94,0.3); }
    .activity-icon.blue { background: rgba(59,130,246,0.1); color: #3B82F6; border: 1px solid rgba(59,130,246,0.3); }
    .activity-icon.orange { background: rgba(249,115,22,0.1); color: #F97316; border: 1px solid rgba(249,115,22,0.3); }
    
    .activity-text { display: flex; flex-direction: column; gap: 4px; }
    .activity-text strong { font-size: 0.9rem; }
    .activity-text span { font-size: 0.8rem; color: var(--text-secondary); }
    .text-green { color: #22C55E; }
    .text-blue { color: #3B82F6; }
    .text-orange { color: #F97316; }

    @media (max-width: 1100px) {
      .main-grid { flex-direction: column; }
      .sidebar-right { width: 100%; flex-direction: row; gap: 24px; flex-wrap: wrap; }
      .sidebar-right > div { flex: 1; min-width: 300px; }
    }
    @media (max-width: 768px) {
      .row-2-col { grid-template-columns: 1fr; }
      .header-content { flex-direction: column; text-align: center; }
      .contact-row { flex-direction: column; gap: 8px; }
      .header-banner { flex-direction: column; gap: 24px; padding: 24px; }
    }
  `]
})
export class ProfilePageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ClienteProfileService);
  private authService = inject(AuthService);
  private readonly config = inject(SERVIYA_APP_CONFIG);

  isEditing = false;
  isSaving = false;
  message = '';

  regions = getDepartments();
  provinces: { code: string; name: string }[] = [];
  districts: { code: string; name: string }[] = [];

  profileForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.required],
    region: ['', Validators.required],
    provincia: ['', Validators.required],
    distrito: ['', Validators.required],
    direccion: ['', Validators.required],
    referencia: [''],
    lat: [0],
    lng: [0],
    datos: ['']
  });

  originalData: any = {};
  profile: any = null;

  ngOnInit(): void {
    this.profileForm.disable();
    this.loadData();
  }

  onAddressSelected(event: any): void {
    if (event.mode === 'new' && event.newAddress) {
      const addr = event.newAddress;
      let depCode = '';
      let provCode = '';
      let distCode = '';

      if (addr.department) {
        const dep = getDepartments().find(d => d.name === addr.department);
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

      this.profileForm.patchValue({
        region: depCode,
        provincia: provCode,
        distrito: distCode,
        direccion: addr.addressLine,
        referencia: addr.reference,
        lat: addr.lat,
        lng: addr.lng
      });
    }
  }

  get regionName(): string {
    const code = this.profileForm.value.region;
    if (!code) return '';
    const dep = getDepartments().find(d => d.code === code);
    return dep ? dep.name : code;
  }

  get provinciaName(): string {
    const rCode = this.profileForm.value.region;
    const pCode = this.profileForm.value.provincia;
    if (!rCode || !pCode) return pCode || '';
    try {
      const prov = getProvinces(rCode).find(p => p.code === pCode);
      return prov ? prov.name : pCode;
    } catch { return pCode; }
  }

  get distritoName(): string {
    const pCode = this.profileForm.value.provincia;
    const dCode = this.profileForm.value.distrito;
    if (!pCode || !dCode) return dCode || '';
    try {
      const dist = getDistricts(pCode).find(d => d.code === dCode);
      return dist ? dist.name : dCode;
    } catch { return dCode; }
  }
  
  loadData(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        const profileData = {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          telefono: profile.telefono || '',
          region: profile.region || '',
          provincia: profile.provincia || '',
          distrito: profile.distrito || '',
          direccion: profile.direccion || '',
          referencia: profile.referencia || '',
          datos: profile.datos || ''
        };
        
        this.profileForm.patchValue(profileData);
        Object.assign(this.originalData, profileData);

        if (profile.region) {
          this.provinces = getProvinces(profile.region);
        }
        if (profile.provincia) {
          this.districts = getDistricts(profile.provincia);
        }
      },
      error: () => {
        this.message = 'No se pudo cargar tu perfil.';
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = true;
    this.message = '';
    this.profileForm.enable();
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.profileForm.patchValue(this.originalData);
    
    if (this.originalData.region) {
      this.provinces = getProvinces(this.originalData.region);
    } else {
      this.provinces = [];
    }
    if (this.originalData.provincia) {
      this.districts = getDistricts(this.originalData.provincia);
    } else {
      this.districts = [];
    }
    
    this.profileForm.disable();
  }

  changePassword(): void {
    this.authService.manageAccount();
  }

  save(): void {
    if (this.profileForm.invalid) return;
    this.isSaving = true;
    
    const payload = this.profileForm.getRawValue();
    
    this.profileService.saveProfile(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditing = false;
        this.message = 'Perfil guardado exitosamente.';
        Object.assign(this.originalData, payload);
        this.profileForm.disable();
        
        setTimeout(() => this.message = '', 3000);
      },
      error: () => {
        this.isSaving = false;
        this.message = 'Error al guardar el perfil.';
        setTimeout(() => this.message = '', 3000);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.profileService.uploadAvatar(file).subscribe({
        next: (updatedProfile) => {
          this.profile = updatedProfile;
          this.message = 'Avatar actualizado';
          setTimeout(() => this.message = '', 3000);
        },
        error: () => {
          this.message = 'Error al subir la imagen';
          setTimeout(() => this.message = '', 3000);
        }
      });
    }
  }

  protected getAvatarUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/user-ms')) {
      return `${this.config.apiBaseUrl}${url}`;
    }
    return `${this.config.apiBaseUrl}/user-ms${url.startsWith('/') ? url : `/${url}`}`;
  }
}
