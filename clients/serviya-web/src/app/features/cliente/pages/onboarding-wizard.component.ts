import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { ClienteProfileService } from '../services/cliente-profile.service';
import { getDepartments, getProvinces, getDistricts } from 'ubigeo-fns';
import { AddressSelectorComponent } from '../../../shared/components/address-selector/address-selector.component';

@Component({
  selector: 'app-onboarding-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AddressSelectorComponent],
  template: `
    <div class="onboarding-layout">
      <!-- LEFT CARD -->
      <div class="main-card">
        <div class="header-section">
          <div class="rocket-icon">🚀</div>
          <div>
            <h2 class="title">¡Completa tu perfil en <span class="text-orange">60 segundos!</span></h2>
            <p class="subtitle">Solo necesitamos algunos datos básicos para ofrecerte la mejor experiencia y beneficios exclusivos.</p>
          </div>
        </div>

        <!-- Top Stepper -->
        <div class="stepper-horizontal">
          <div class="step" [class.active]="currentStep >= 1">
            <div class="circle">1</div>
            <span>Datos básicos</span>
          </div>
          <div class="line" [class.active]="currentStep >= 2"></div>
          <div class="step" [class.active]="currentStep >= 2">
            <div class="circle">2</div>
            <span>Contacto</span>
          </div>
          <div class="line" [class.active]="currentStep >= 3"></div>
          <div class="step" [class.active]="currentStep >= 3">
            <div class="circle">3</div>
            <span>Dirección</span>
          </div>
          <div class="line" [class.active]="currentStep >= 4"></div>
          <div class="step" [class.active]="currentStep >= 4">
            <div class="circle">4</div>
            <span>Confirmación</span>
          </div>
        </div>

        <div class="form-container">
          <div class="form-header">
            <div class="icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <h3>{{ getStepTitle() }}</h3>
              <p>{{ getStepSubtitle() }}</p>
            </div>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="submitProfile()">
            <!-- STEP 1 -->
            <div class="step-pane" *ngIf="currentStep === 1">
              <div class="form-row">
                <div class="form-group half">
                  <label>Nombre</label>
                  <div class="input-wrapper">
                    <input type="text" formControlName="firstName" class="form-control" />
                    <svg *ngIf="profileForm.get('firstName')?.valid" class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                </div>
                <div class="form-group half">
                  <label>Apellido</label>
                  <div class="input-wrapper">
                    <input type="text" formControlName="lastName" class="form-control" />
                    <svg *ngIf="profileForm.get('lastName')?.valid" class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2 -->
            <div class="step-pane" *ngIf="currentStep === 2">
              <div class="form-row">
                <div class="form-group half">
                  <label>Correo Electrónico</label>
                  <div class="input-wrapper">
                    <span class="prefix-icon">✉</span>
                    <input type="email" formControlName="email" class="form-control has-prefix" readonly />
                    <svg *ngIf="profileForm.get('email')?.valid" class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                </div>
                <div class="form-group half">
                  <label>Teléfono</label>
                  <div class="input-wrapper">
                    <span class="prefix-icon">📞</span>
                    <input type="tel" formControlName="telefono" class="form-control has-prefix" />
                    <svg *ngIf="profileForm.get('telefono')?.valid" class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 3 -->
            <div class="step-pane" *ngIf="currentStep === 3">
              <app-address-selector 
                [isProfileMode]="true" 
                [initialData]="originalData"
                (addressSelected)="onAddressSelected($event)">
              </app-address-selector>
            </div>

            <!-- STEP 4 -->
            <div class="step-pane" *ngIf="currentStep === 4">
              <div class="summary-box">
                <p><strong>Nombre:</strong> {{ profileForm.value.firstName }} {{ profileForm.value.lastName }}</p>
                <p><strong>Teléfono:</strong> {{ profileForm.value.telefono }}</p>
                <p><strong>Dirección:</strong> {{ profileForm.value.direccion || 'No especificada' }}</p>
                <p><strong>Distrito:</strong> {{ districtName || 'No especificado' }}</p>
              </div>
            </div>

            <div class="form-footer">
              <div class="security-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <div class="security-text">
                  <strong>Tu información está segura</strong>
                  <span>Protegemos tus datos con los más altos estándares de seguridad.</span>
                </div>
              </div>
              <div class="action-buttons">
                <button type="button" class="btn-skip" (click)="prevStep()" *ngIf="currentStep > 1">Atrás</button>
                <button type="button" class="btn-next" *ngIf="currentStep < 4" (click)="nextStep()">Continuar al siguiente paso ➔</button>
                <button type="submit" class="btn-next" *ngIf="currentStep === 4" [disabled]="profileForm.invalid || isSubmitting">{{ isSubmitting ? 'Guardando...' : 'Finalizar' }}</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- RIGHT CARD -->
      <div class="progress-card">
        <h3 class="progress-card-title">Tu progreso</h3>
        
        <div class="circular-progress">
          <svg viewBox="0 0 36 36" class="circular-chart">
            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="circle" [attr.stroke-dasharray]="((currentStep - 1) * 33.3) + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <text x="18" y="21.5" class="percentage">{{ (currentStep - 1) * 33 }}%</text>
            <text x="18" y="26" class="percentage-label">completado</text>
          </svg>
        </div>
        
        <p class="progress-desc">Te faltan <span class="text-orange">{{ 4 - currentStep }} pasos</span> para activar tu perfil</p>
        
        <ul class="vertical-steps">
          <li [class.completed]="currentStep > 1" [class.current]="currentStep === 1">
            <div class="v-icon">{{ currentStep > 1 ? '✓' : '1' }}</div>
            <div class="v-text"><strong>Datos básicos</strong><span>{{ currentStep > 1 ? 'Completado' : 'Pendiente' }}</span></div>
          </li>
          <li class="v-line"></li>
          <li [class.completed]="currentStep > 2" [class.current]="currentStep === 2">
            <div class="v-icon">{{ currentStep > 2 ? '✓' : '2' }}</div>
            <div class="v-text"><strong>Contacto</strong><span>{{ currentStep > 2 ? 'Completado' : 'Pendiente' }}</span></div>
          </li>
          <li class="v-line"></li>
          <li [class.completed]="currentStep > 3" [class.current]="currentStep === 3">
            <div class="v-icon">{{ currentStep > 3 ? '✓' : '3' }}</div>
            <div class="v-text"><strong>Dirección</strong><span>{{ currentStep > 3 ? 'Completado' : 'Pendiente' }}</span></div>
          </li>
          <li class="v-line"></li>
          <li [class.completed]="currentStep > 4" [class.current]="currentStep === 4">
            <div class="v-icon">{{ currentStep > 4 ? '✓' : '4' }}</div>
            <div class="v-text"><strong>Confirmación</strong><span>{{ currentStep > 4 ? 'Completado' : 'Pendiente' }}</span></div>
          </li>
        </ul>

        <div class="benefits-box">
          <div class="benefits-icon">✨</div>
          <div class="benefits-text">
            <strong>Más servicios, más beneficios</strong>
            <span>Un perfil completo te da acceso a más servicios y recomendaciones personalizadas para ti.</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background-color: #020617; min-height: calc(100vh - 80px); padding: 40px; font-family: 'Inter', sans-serif; }
    .onboarding-layout { display: flex; gap: 24px; max-width: 1200px; margin: 0 auto; align-items: stretch; }
    
    /* Left Card */
    .main-card { background: #0f172a; border-radius: 20px; padding: 48px; flex: 1; border: 1px solid #1e293b; color: #f8fafc; }
    
    .header-section { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 40px; }
    .rocket-icon { font-size: 2.5rem; filter: drop-shadow(0 0 10px rgba(234, 88, 12, 0.5)); }
    .title { font-size: 2rem; font-weight: 700; color: #f8fafc; margin: 0 0 12px 0; }
    .text-orange { color: #f59e0b; }
    .subtitle { color: #94a3b8; font-size: 1rem; line-height: 1.5; margin: 0; }
    
    /* Stepper Horizontal */
    .stepper-horizontal { display: flex; align-items: center; justify-content: center; margin-bottom: 40px; padding: 0 40px; }
    .step { display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0.5; transition: opacity 0.3s; }
    .step.active { opacity: 1; }
    .step .circle { width: 36px; height: 36px; border-radius: 50%; background: #1e293b; border: 2px solid #334155; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1rem; transition: all 0.3s; }
    .step.active .circle { background: #3b82f6; border-color: #60a5fa; box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); }
    .step span { font-size: 0.85rem; font-weight: 500; color: #cbd5e1; }
    .stepper-horizontal .line { flex: 1; height: 2px; background: #334155; margin: 0 16px 24px; transition: background 0.3s; }
    .stepper-horizontal .line.active { background: #3b82f6; }

    /* Form Container */
    .form-container { background: #0b0f19; border-radius: 16px; padding: 32px; border: 1px solid #1e293b; }
    .form-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .icon-box { background: #1e293b; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .form-header h3 { margin: 0 0 4px 0; font-size: 1.25rem; font-weight: 600; color: #f8fafc; }
    .form-header p { margin: 0; font-size: 0.9rem; color: #94a3b8; }
    
    .form-row { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 24px; }
    .half { flex: 1; min-width: 250px; }
    .form-group label { display: block; font-size: 0.9rem; color: #cbd5e1; margin-bottom: 8px; }
    .input-wrapper { position: relative; }
    .form-control { width: 100%; padding: 14px 16px; background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; color: #f8fafc; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
    .form-control:focus { border-color: #3b82f6; }
    .form-control.has-prefix { padding-left: 44px; }
    .prefix-icon { position: absolute; left: 16px; top: 14px; font-size: 1rem; color: #94a3b8; }
    .check-icon { position: absolute; right: 16px; top: 14px; }
    
    .summary-box { background: #0f172a; padding: 24px; border-radius: 12px; border: 1px solid #1e293b; }
    .summary-box p { margin: 0 0 12px 0; color: #cbd5e1; font-size: 0.95rem; }
    .summary-box strong { color: #f8fafc; display: inline-block; width: 100px; }

    /* Footer */
    .form-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 40px; }
    .security-badge { display: flex; align-items: center; gap: 16px; }
    .security-text strong { display: block; color: #f8fafc; font-size: 0.95rem; margin-bottom: 4px; }
    .security-text span { color: #94a3b8; font-size: 0.85rem; }
    .action-buttons { display: flex; align-items: center; gap: 20px; }
    .btn-skip { background: transparent; border: none; color: #60a5fa; cursor: pointer; font-weight: 500; font-size: 0.95rem; }
    .btn-skip:hover { text-decoration: underline; }
    .btn-next { background: linear-gradient(90deg, #3b82f6, #60a5fa); color: white; border: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); }
    
    /* Right Card */
    .progress-card { background: #0f172a; border-radius: 20px; padding: 40px; width: 340px; border: 1px solid #1e293b; display: flex; flex-direction: column; }
    .progress-card-title { color: #f8fafc; font-size: 1.25rem; font-weight: 600; margin: 0 0 32px 0; }
    
    .circular-progress { width: 180px; height: 180px; margin: 0 auto 32px; position: relative; }
    .circular-chart { display: block; margin: 0 auto; max-width: 100%; max-height: 100%; }
    .circle-bg { fill: none; stroke: #1e293b; stroke-width: 2.5; }
    .circle { fill: none; stroke-width: 2.5; stroke-linecap: round; transition: stroke-dasharray 0.8s ease-out; stroke: #3b82f6; filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5)); }
    .percentage { fill: #f8fafc; font-size: 0.6em; text-anchor: middle; font-weight: 700; }
    .percentage-label { fill: #94a3b8; font-size: 0.15em; text-anchor: middle; font-weight: 500; }
    
    .progress-desc { color: #94a3b8; font-size: 0.95rem; margin: 0 0 24px 0; }
    
    .vertical-steps { list-style: none; padding: 0; margin: 0 0 40px 0; }
    .vertical-steps li { display: flex; align-items: center; gap: 16px; opacity: 0.5; }
    .vertical-steps li.current { opacity: 1; }
    .vertical-steps li.completed { opacity: 0.8; }
    .vertical-steps .v-icon { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #475569; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; color: #94a3b8; background: #0f172a; }
    .vertical-steps li.completed .v-icon { background: #3b82f6; border-color: #3b82f6; color: white; }
    .vertical-steps li.current .v-icon { border-color: #60a5fa; color: #60a5fa; }
    .vertical-steps .v-text { display: flex; flex-direction: column; }
    .vertical-steps .v-text strong { color: #f8fafc; font-size: 0.95rem; font-weight: 500; }
    .vertical-steps .v-text span { color: #64748b; font-size: 0.8rem; }
    .v-line { width: 1px; height: 24px; background: #334155; margin: 4px 0 4px 14px !important; }
    
    .benefits-box { background: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; display: flex; gap: 16px; margin-top: auto; }
    .benefits-icon { font-size: 1.5rem; filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6)); }
    .benefits-text strong { display: block; color: #f8fafc; font-size: 0.95rem; margin-bottom: 4px; }
    .benefits-text span { color: #94a3b8; font-size: 0.85rem; line-height: 1.4; }

    @media (max-width: 900px) {
      .onboarding-layout { flex-direction: column; }
      .progress-card { width: 100%; }
    }
  `]
})
export class OnboardingWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private profileService = inject(ClienteProfileService);
  private router = inject(Router);

  isSubmitting = false;
  originalData: any = null;
  currentStep = 1;

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
    lat: [null],
    lng: [null]
  });

  getStepTitle(): string {
    switch(this.currentStep) {
      case 1: return 'Datos básicos';
      case 2: return 'Contacto';
      case 3: return 'Dirección';
      case 4: return 'Confirmación';
      default: return '';
    }
  }

  getStepSubtitle(): string {
    switch(this.currentStep) {
      case 1: return 'Cuéntanos quién eres para brindarte la mejor experiencia.';
      case 2: return '¿Cómo podemos comunicarnos contigo?';
      case 3: return 'Ingresa tu dirección para que los técnicos puedan encontrarte.';
      case 4: return 'Revisa que tu información sea correcta antes de finalizar.';
      default: return '';
    }
  }

  ngOnInit() {
    this.profileService.getProfile().subscribe(profile => {
      this.originalData = profile;
      
      this.profileForm.patchValue({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        telefono: profile.telefono,
        region: profile.region,
        provincia: profile.provincia,
        distrito: profile.distrito,
        direccion: profile.direccion,
        referencia: profile.referencia,
        lat: profile.lat,
        lng: profile.lng
      });
    });
  }

  get districtName(): string {
    const provCode = this.profileForm.value.provincia;
    const distCode = this.profileForm.value.distrito;
    if (!provCode || !distCode) return '';
    try {
      const districts = getDistricts(provCode);
      const dist = districts.find((d: any) => d.code === distCode);
      return dist ? dist.name : distCode;
    } catch (e) {
      return distCode;
    }
  }

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onAddressSelected(event: any) {
    if (event.mode === 'new' && event.newAddress) {
      const addr = event.newAddress;
      let depCode = '';
      let provCode = '';
      let distCode = '';

      if (addr.department) {
        const dep = getDepartments().find((d: any) => d.name === addr.department);
        if (dep) depCode = dep.code;
      }
      if (depCode && addr.province) {
        const prov = getProvinces(depCode).find((p: any) => p.name === addr.province);
        if (prov) provCode = prov.code;
      }
      if (provCode && addr.district) {
        const dist = getDistricts(provCode).find((d: any) => d.name === addr.district);
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

  submitProfile() {
    if (this.profileForm.invalid) {
      alert("Por favor completa todos los campos requeridos antes de finalizar.");
      return;
    }
    
    this.isSubmitting = true;
    const payload = this.profileForm.getRawValue();
    
    this.profileService.saveProfile(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/cliente']);
      },
      error: (err) => {
        console.error('Error saving profile', err);
        alert('Ocurrió un error al guardar tu perfil.');
        this.isSubmitting = false;
      }
    });
  }
}
