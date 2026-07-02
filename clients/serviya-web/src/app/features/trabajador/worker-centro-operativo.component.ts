import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiClientService } from '../../core/http/api-client.service';

@Component({
  selector: 'app-worker-centro-operativo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="centro-container">
      <div class="page-header">
        <h4 class="page-subtitle">TÉCNICO</h4>
        <h1 class="page-title">Centro operativo</h1>
        <p class="page-description">Activa tu disponibilidad, comparte tu ubicación en tiempo real y gestiona tu zona de trabajo.</p>
      </div>

      <div class="main-grid">
        <!-- Estado de trabajo -->
        <div class="card">
          <h3 class="card-title">Estado de trabajo</h3>
          
          <div class="status-indicator available" *ngIf="estado === 'ONLINE'">
            <span class="status-dot"></span> Disponible
          </div>
          <div class="status-indicator" style="background: #fff7ed; color: #c2410c;" *ngIf="estado === 'BUSY'">
            <span class="status-dot" style="background: #ea580c;"></span> En pausa
          </div>
          <div class="status-indicator" style="background: #f1f5f9; color: #475569;" *ngIf="estado === 'OFFLINE'">
            <span class="status-dot" style="background: #94a3b8;"></span> Desconectado
          </div>
          <p class="status-text">
            <span *ngIf="estado === 'ONLINE'">Estás disponible para recibir solicitudes de trabajo.</span>
            <span *ngIf="estado === 'BUSY'">Estás ocupado o en pausa.</span>
            <span *ngIf="estado === 'OFFLINE'">No recibirás solicitudes de trabajo nuevas.</span>
          </p>
          
          <div class="status-toggle-group">
            <button class="toggle-btn" [class.active]="estado === 'OFFLINE'" (click)="setEstado('OFFLINE')"><span class="dot gray"></span> Desconectado</button>
            <button class="toggle-btn" [class.active]="estado === 'BUSY'" (click)="setEstado('BUSY')"><span class="dot orange"></span> En pausa</button>
            <button class="toggle-btn" [class.active]="estado === 'ONLINE'" (click)="setEstado('ONLINE')"><span class="dot green"></span> Disponible</button>
          </div>
          
          <div class="info-alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Mantén tu ubicación activa para recibir más solicitudes cercanas.
          </div>
        </div>

        <!-- Ubicación en tiempo real -->
        <div class="card location-card">
          <div class="location-header">
            <h3 class="card-title">Ubicación en tiempo real</h3>
            <span class="badge badge-green" *ngIf="estado === 'ONLINE'">Activa</span>
            <span class="badge" style="background: #f1f5f9; color: #475569;" *ngIf="estado !== 'ONLINE'">Inactiva</span>
          </div>
          
          <div class="location-content">
            <div class="location-details">
              <div class="location-name">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Ubicación actual
              </div>
              <div class="coordinates" *ngIf="lat && lng">
                Lat: {{ lat | number:'1.4-4' }}<br>
                Lng: {{ lng | number:'1.4-4' }}
              </div>
              <div class="coordinates" *ngIf="!lat || !lng">
                No registrada
              </div>
              
              <div class="update-info" *ngIf="lastUpdate">
                <strong>Actualizado</strong>
                <span><span class="dot green-small"></span> hace {{ ((+currentDate - +lastUpdate) / 60000) | number:'1.0-0' }} minutos</span>
              </div>
              
              <button class="btn-primary" (click)="actualizarUbicacion()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                Actualizar ubicación
              </button>
              
              <a href="#" class="edit-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar zona de cobertura
              </a>
            </div>
            
            <div class="map-container">
              <!-- Placeholder for Google Maps or Leaflet -->
              <div class="map-placeholder">
                <div class="map-marker">
                  <div class="marker-pulse"></div>
                  <div class="marker-pin">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                </div>
                <div class="map-controls">
                  <button>+</button>
                  <button>-</button>
                  <button class="locate-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-grid">
        <!-- Zona de cobertura -->
        <div class="card coverage-card">
          <h3 class="card-title">Zona de cobertura</h3>
          <div class="coverage-content">
            <div class="radius-info">
              <div class="radius-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
              </div>
              <div class="radius-text">
                <span>Radio de atención</span>
                <div class="radius-value">8 km <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
                <p>Recibirás solicitudes dentro de esta zona.</p>
              </div>
            </div>
            
            <div class="zones-info">
              <span>Zonas principales</span>
              <div class="tags-container">
                <span class="tag">Centro de Puno</span>
                <span class="tag">Jr. Lima</span>
                <span class="tag">Jr. Moquegua</span>
                <span class="tag">Av. El Sol</span>
                <span class="tag">Bellavista</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Consejo -->
        <div class="card tip-card">
          <div class="tip-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Consejo
          </div>
          <p>Aumenta tu radio de atención para recibir más oportunidades de trabajo.</p>
          <a href="#" class="tip-link">Ajustar cobertura &rarr;</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .centro-container {
      padding: 32px 40px;
      background: #f8fafc;
      min-height: calc(100vh - 70px);
      font-family: 'Inter', sans-serif;
    }
    
    .page-header {
      margin-bottom: 32px;
    }
    .page-subtitle {
      color: #4f46e5;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 1px;
      margin: 0 0 8px 0;
    }
    .page-title {
      font-size: 2rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 8px 0;
    }
    .page-description {
      color: #64748b;
      font-size: 1rem;
      margin: 0;
    }
    
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .bottom-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }
    
    @media (max-width: 1024px) {
      .main-grid, .bottom-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }
    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 20px 0;
    }
    
    /* Estado de trabajo */
    .status-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: #ecfdf5;
      color: #059669;
      padding: 16px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 1.2rem;
      margin-bottom: 16px;
    }
    .status-dot {
      width: 12px;
      height: 12px;
      background: #059669;
      border-radius: 50%;
    }
    .status-text {
      text-align: center;
      color: #64748b;
      font-size: 0.95rem;
      margin: 0 0 24px 0;
    }
    
    .status-toggle-group {
      display: flex;
      background: #f1f5f9;
      border-radius: 8px;
      padding: 4px;
      margin-bottom: 24px;
    }
    .toggle-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: transparent;
      border: none;
      padding: 12px;
      border-radius: 6px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
    }
    .toggle-btn.active {
      background: white;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot.gray { background: #94a3b8; }
    .dot.orange { background: #f59e0b; }
    .dot.green { background: #10b981; }
    .dot.green-small { background: #10b981; width: 6px; height: 6px; display: inline-block; margin-right: 4px; border-radius: 50%; }
    
    .info-alert {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #eff6ff;
      color: #1e40af;
      padding: 16px;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    
    /* Ubicación en tiempo real */
    .location-card {
      display: flex;
      flex-direction: column;
    }
    .location-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .location-header .card-title { margin: 0; }
    .badge {
      padding: 4px 10px;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .badge-green {
      background: #ecfdf5;
      color: #059669;
    }
    
    .location-content {
      display: flex;
      gap: 24px;
      flex: 1;
    }
    .location-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .location-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 1.1rem;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .coordinates {
      color: #475569;
      font-family: monospace;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .update-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 24px;
      font-size: 0.9rem;
    }
    .update-info strong { color: #0f172a; }
    .update-info span { color: #059669; font-weight: 500; }
    
    .btn-primary {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      margin-bottom: 16px;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #4338ca; }
    
    .edit-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #4f46e5;
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
    }
    .edit-link:hover { text-decoration: underline; }
    
    .map-container {
      flex: 1.5;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .map-placeholder {
      width: 100%;
      height: 100%;
      background: #e2e8f0 url('https://upload.wikimedia.org/wikipedia/commons/a/a9/OpenStreetMap_Puno_Peru.png') center/cover no-repeat;
      position: relative;
      min-height: 250px;
    }
    /* Pseudo-map style just for visual representation */
    .map-marker {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .marker-pulse {
      position: absolute;
      width: 60px;
      height: 60px;
      background: rgba(79, 70, 229, 0.2);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    .marker-pin {
      position: relative;
      width: 32px;
      height: 32px;
      background: #4f46e5;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .marker-pin svg {
      transform: rotate(45deg);
    }
    .map-controls {
      position: absolute;
      right: 12px;
      top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .map-controls button {
      width: 32px;
      height: 32px;
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: bold;
      color: #334155;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    /* Zona de cobertura */
    .coverage-card {
      display: flex;
      flex-direction: column;
    }
    .coverage-content {
      display: flex;
      gap: 32px;
    }
    @media (max-width: 600px) {
      .coverage-content { flex-direction: column; gap: 24px; }
    }
    .radius-info {
      display: flex;
      gap: 16px;
      flex: 1;
    }
    .radius-icon {
      width: 48px;
      height: 48px;
      background: #eff6ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .radius-text span {
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .radius-value {
      font-size: 1.8rem;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 4px 0;
    }
    .radius-text p {
      color: #64748b;
      font-size: 0.85rem;
      margin: 0;
    }
    
    .zones-info {
      flex: 1.5;
    }
    .zones-info span {
      display: block;
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 12px;
    }
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .tag {
      background: #f1f5f9;
      color: #475569;
      padding: 6px 12px;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    
    /* Consejo */
    .tip-card {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
    }
    .tip-header {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4f46e5;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .tip-card p {
      color: #475569;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0 0 16px 0;
    }
    .tip-link {
      color: #4f46e5;
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
    }
    .tip-link:hover { text-decoration: underline; }
  `]
})
export class WorkerCentroOperativoComponent implements OnInit {
  private readonly api = inject(ApiClientService);
  
  estado: 'ONLINE' | 'OFFLINE' | 'BUSY' = 'OFFLINE';
  lat: number | null = null;
  lng: number | null = null;
  lastUpdate: Date | null = null;
  
  loading = true;
  updatingLocation = false;
  
  get currentDate(): Date {
    return new Date();
  }
  
  ngOnInit() {
    this.cargarPerfil();
  }
  
  cargarPerfil() {
    this.api.get<any>('/technician-ms/api/v1/me/technician/profile').subscribe({
      next: (perfil) => {
        this.estado = perfil.estadoDisponibilidad || 'OFFLINE';
        this.lat = perfil.lat;
        this.lng = perfil.lng;
        // In a real app we'd track last update time from DB or locally
        this.lastUpdate = new Date();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
  
  setEstado(nuevoEstado: 'ONLINE' | 'OFFLINE' | 'BUSY') {
    this.api.post('/technician-ms/api/v1/me/technician/availability', { estado: nuevoEstado }).subscribe({
      next: () => {
        this.estado = nuevoEstado;
        if (nuevoEstado === 'ONLINE') {
          this.actualizarUbicacion();
        }
      },
      error: () => alert('Error al cambiar estado')
    });
  }
  
  actualizarUbicacion() {
    if (this.estado === 'OFFLINE') {
      alert('Debes estar Disponible o En pausa para actualizar tu ubicación.');
      return;
    }
    
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    
    this.updatingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const payload = {
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude
        };
        
        this.api.post('/technician-ms/api/v1/me/technician/location', payload).subscribe({
          next: () => {
            this.lat = payload.latitud;
            this.lng = payload.longitud;
            this.lastUpdate = new Date();
            this.updatingLocation = false;
          },
          error: () => {
            alert('Error al guardar ubicación en el servidor.');
            this.updatingLocation = false;
          }
        });
      },
      (err) => {
        console.error(err);
        alert('No se pudo obtener la ubicación.');
        this.updatingLocation = false;
      },
      { enableHighAccuracy: true }
    );
  }
}
