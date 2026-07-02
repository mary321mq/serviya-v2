import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TechnicianLocation } from '../models/technician.model';
import { TechnicianLocationService } from '../services/technician-location.service';

@Component({
  selector: 'app-location-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-header">
      <div>
        <a routerLink="/tecnico" class="eyebrow">&larr; Volver</a>
        <h1>Ubicacion Actual</h1>
      </div>
    </section>

    <div class="location-card">
      <div *ngIf="location">
        <p><strong>Ultima ubicacion reportada:</strong></p>
        <p>Lat: {{ location.lat }}</p>
        <p>Lng: {{ location.lng }}</p>
        <p class="timestamp">Capturada: {{ location.capturedAt | date:'medium' }}</p>
        <p class="timestamp">Expira: {{ location.expiresAt | date:'medium' }}</p>
      </div>
      <div *ngIf="!location">
        <p>No tienes una ubicacion activa.</p>
      </div>

      <div class="actions">
        <button (click)="updateLocation()" [disabled]="updating" class="action-button">
          {{ updating ? 'Actualizando...' : 'Actualizar mi ubicacion ahora' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .location-card { max-width: 500px; padding: 1.5rem; background: #f9fafb; border-radius: 8px; }
    .timestamp { font-size: 0.9rem; color: #6b7280; }
    .actions { margin-top: 1.5rem; }
  `]
})
export class LocationPageComponent implements OnInit {
  private readonly locService = inject(TechnicianLocationService);

  location: TechnicianLocation | null = null;
  updating = false;

  ngOnInit(): void {
    this.loadLocation();
  }

  loadLocation(): void {
    this.locService.getLocation().subscribe({
      next: (loc) => this.location = loc,
      error: () => console.log('No location found or error')
    });
  }

  updateLocation(): void {
    if (!navigator.geolocation) {
      alert('Geolocalizacion no soportada por el navegador');
      return;
    }

    this.updating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const payload = {
          latitud: position.coords.latitude,
          longitud: position.coords.longitude
        };
        this.locService.saveLocation(payload).subscribe({
          next: (loc) => {
            this.location = loc;
            this.updating = false;
          },
          error: () => {
            this.updating = false;
            alert('Error al guardar ubicacion en servidor');
          }
        });
      },
      (error) => {
        this.updating = false;
        alert('Error al obtener geolocalizacion: ' + error.message);
      }
    );
  }
}
