import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TechnicianProfileService } from '../services/technician-profile.service';
import { TechnicianProfile } from '../models/technician.model';

@Component({
  selector: 'app-tecnico-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Técnico</p>
        <h1>Panel de Control</h1>
      </div>
    </section>

    <section class="quick-actions" *ngIf="profile">
      <div class="status-card">
        <h3>Estado Actual</h3>
        <p class="status-badge" [ngClass]="profile.estadoDisponibilidad.toLowerCase()">
          {{ estadoEnEspanol }}
        </p>
        <div class="action-buttons">
          <button (click)="toggleAvailability()" class="action-button primary">
            Cambiar a {{ estadoSiguiente }}
          </button>
        </div>
      </div>

      <div class="status-card">
        <h3>Mi Ubicación (GPS)</h3>
        <p *ngIf="profile.lat && profile.lng">
          Lat: {{ profile.lat | number:'1.2-4' }}<br>
          Lng: {{ profile.lng | number:'1.2-4' }}
        </p>
        <p *ngIf="!profile.lat || !profile.lng" class="text-gray-500">
          Ubicación no registrada.
        </p>
        <div class="action-buttons">
          <button (click)="updateGPS()" class="action-button secondary" [disabled]="updatingGps">
            {{ updatingGps ? 'Obteniendo GPS...' : 'Actualizar GPS' }}
          </button>
        </div>
      </div>
    </section>

    <section class="grid mt-8">
      <a class="feature-card" routerLink="/tecnico/postulacion">
        <h2>Postulación</h2>
        <p>Aplica para ser técnico o revisa tu estado.</p>
      </a>
      <a class="feature-card" routerLink="/tecnico/documentos">
        <h2>Documentos</h2>
        <p>Sube los documentos requeridos.</p>
      </a>
      <a class="feature-card" routerLink="/tecnico/perfil">
        <h2>Perfil</h2>
        <p>Configura si estás activo y disponible.</p>
      </a>
      <a class="feature-card" routerLink="/tecnico/especialidades">
        <h2>Especialidades</h2>
        <p>Define los servicios que ofreces.</p>
      </a>
      <a class="feature-card" routerLink="/tecnico/disponibilidad">
        <h2>Disponibilidad</h2>
        <p>Configura tu horario semanal.</p>
      </a>
      <a class="feature-card" routerLink="/tecnico/ubicacion">
        <h2>Ubicación</h2>
        <p>Actualiza tu dirección manual.</p>
      </a>
      <a class="feature-card" routerLink="/tecnico/ofertas">
        <h2>Ofertas</h2>
        <p>Revisa y acepta ofertas de trabajo.</p>
      </a>
      <a class="feature-card" routerLink="/tecnico/portafolio">
        <h2>Mi Portafolio</h2>
        <p>Sube fotos y muestra tu trabajo a los clientes.</p>
      </a>
    </section>
  `,
  styles: [`
    .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .status-card { background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .status-card h3 { margin-top: 0; font-size: 1.1rem; color: #374151; margin-bottom: 1rem; }
    .status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; }
    .status-badge.online { background: #dcfce7; color: #166534; }
    .status-badge.offline { background: #f3f4f6; color: #4b5563; }
    .status-badge.busy { background: #fef08a; color: #854d0e; }
    .action-buttons { margin-top: 1rem; }
    .mt-8 { margin-top: 2rem; }
  `]
})
export class TecnicoDashboardComponent implements OnInit {
  profile: TechnicianProfile | null = null;
  updatingGps = false;

  private service = inject(TechnicianProfileService);

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.service.getProfile().subscribe({
      next: (p) => this.profile = p,
      error: (e) => console.error('No se pudo cargar el perfil', e)
    });
  }

  toggleAvailability() {
    if (!this.profile) return;
    const nextState = this.profile.estadoDisponibilidad === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    this.service.updateAvailability({ estado: nextState }).subscribe(() => {
      this.loadProfile();
    });
  }

  get estadoEnEspanol(): string {
    if (!this.profile) return '';
    switch (this.profile.estadoDisponibilidad) {
      case 'ONLINE': return 'DISPONIBLE';
      case 'OFFLINE': return 'DESCONECTADO';
      case 'BUSY': return 'OCUPADO';
      default: return this.profile.estadoDisponibilidad;
    }
  }

  get estadoSiguiente(): string {
    if (!this.profile) return '';
    return this.profile.estadoDisponibilidad === 'ONLINE' ? 'DESCONECTADO' : 'DISPONIBLE';
  }

  updateGPS() {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta GPS.');
      return;
    }

    this.updatingGps = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.service.updateLocation({ latitud: pos.coords.latitude, longitud: pos.coords.longitude }).subscribe({
          next: () => {
            this.updatingGps = false;
            this.loadProfile();
            alert('Ubicación actualizada correctamente.');
          },
          error: () => {
            this.updatingGps = false;
            alert('Error al guardar la ubicación en el servidor.');
          }
        });
      },
      (err) => {
        this.updatingGps = false;
        alert('Error al obtener la ubicación: ' + err.message);
      }
    );
  }
}
