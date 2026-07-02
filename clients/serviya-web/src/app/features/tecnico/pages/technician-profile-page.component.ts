import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SERVIYA_APP_CONFIG } from '../../../core/config/app-config';
import { EstadoTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { TechnicianProfile } from '../models/technician.model';
import { TechnicianProfileService } from '../services/technician-profile.service';
import { ClienteProfileService } from '../../cliente/services/cliente-profile.service';
import { ClienteProfile } from '../../cliente/models/cliente-profile.model';

@Component({
  selector: 'app-technician-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, EstadoTextoPipe],
  template: `
    <section class="page-header">
      <div>
        <a routerLink="/tecnico" class="eyebrow">&larr; Volver</a>
        <h1>Perfil Publico</h1>
      </div>
    </section>

    <div *ngIf="userProfile" style="margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
      <div class="avatar-container" (click)="fileInput.click()" style="cursor: pointer; width: 60px; height: 60px; position: relative;">
        <input type="file" #fileInput hidden (change)="onFileSelected($event)" accept="image/*">
        <ng-container *ngIf="userProfile.avatarUrl; else noAvatar">
           <img [src]="getAvatarUrl(userProfile.avatarUrl)" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
        </ng-container>
        <ng-template #noAvatar>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#3b82f6"/></svg>
        </ng-template>
        <div style="position: absolute; bottom: 0; right: 0; background: #3b82f6; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
      </div>
      <div>
        <h2 style="margin: 0; font-size: 1.25rem;">{{ userProfile.firstName }} {{ userProfile.lastName }}</h2>
        <p style="margin: 0; color: #64748b;">Cambiar foto de perfil</p>
        <p *ngIf="message" style="margin: 0; color: #10b981; font-size: 0.875rem;">{{ message }}</p>
      </div>
    </div>

    <div *ngIf="profile" class="profile-stats">
      <p>Rating: {{ profile.ranking }} / 5</p>
      <p>Estado de disponibilidad: <strong>{{ profile.estadoDisponibilidad | estadoTexto }}</strong></p>
    </div>

    <div class="form-container">
      <p class="text-gray-600 mb-4">Nota: El estado de disponibilidad y el GPS se configuran directamente desde el Panel Principal.</p>
    </div>
  `,
  styles: [`
    .profile-stats { margin-bottom: 2rem; padding: 1rem; background: #f9fafb; border-radius: 8px; }
    .form-container { max-width: 400px; }
  `]
})
export class TechnicianProfilePageComponent implements OnInit {
  private readonly profileService = inject(TechnicianProfileService);
  private readonly userProfileService = inject(ClienteProfileService);
  private readonly config = inject(SERVIYA_APP_CONFIG);

  profile: TechnicianProfile | null = null;
  userProfile: ClienteProfile | null = null;
  message = '';

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (p) => {
        this.profile = p;
      },
      error: () => console.error('Error al cargar perfil técnico')
    });

    this.userProfileService.getProfile().subscribe({
      next: (p) => {
        this.userProfile = p;
      },
      error: () => console.error('Error al cargar perfil de usuario')
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.userProfileService.uploadAvatar(file).subscribe({
        next: (updatedProfile) => {
          this.userProfile = updatedProfile;
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
