import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiClientService } from '../../../core/http/api-client.service';
import { ServiceRequestService } from '../services/service-request.service';
import { ServiceRequestResponseDTO } from '../services/public-catalog.service';
import { TecnicoPortfolioService, PortfolioPhoto } from '../../tecnico/services/tecnico-portfolio.service';

interface TechnicianDTO {
  tecnicoId: string;
  nombreCompleto?: string;
  categorias: string;
  ranking: number;
  lat: number;
  lng: number;
  distance?: number;
}

@Component({
  selector: 'app-assign-technician-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="assign-container">
      <div class="header">
        <button class="back-btn" (click)="goBack()">
          <i class="fas fa-arrow-left"></i> Volver a la solicitud
        </button>
        <h1 class="title">Selecciona a tu técnico</h1>
        <p class="subtitle" *ngIf="request">Buscando técnicos para la categoría: <strong>{{ request.catalogoServicio.nombre }}</strong></p>
      </div>

      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Buscando técnicos cercanos disponibles...</p>
      </div>

      <div class="empty-state" *ngIf="!loading && technicians.length === 0">
        <i class="fas fa-users-slash"></i>
        <h3>No hay técnicos disponibles en este momento</h3>
        <p>Intenta nuevamente en unos minutos. Los técnicos disponibles aparecerán aquí.</p>
        <button class="btn-primary" (click)="loadTechnicians()">Actualizar búsqueda</button>
      </div>

      <div class="technicians-grid" *ngIf="!loading && technicians.length > 0">
        <div class="technician-card" *ngFor="let tech of technicians">
          <div class="tech-header">
            <div class="tech-avatar">
              <i class="fas fa-user-tie"></i>
            </div>
            <div class="tech-info">
              <h3 class="tech-name">{{ tech.nombreCompleto || tech.tecnicoId }}</h3>
              <div class="tech-rating">
                <i class="fas fa-star" *ngFor="let _ of [1,2,3,4,5]; let i = index" 
                   [class.active]="i < tech.ranking"></i>
                <span class="rating-value">{{ tech.ranking | number:'1.1-1' }}</span>
              </div>
            </div>
          </div>
          
          <div class="tech-details">
            <div class="detail-row">
              <i class="fas fa-map-marker-alt"></i>
              <span>Cercanía: <strong>{{ tech.distance ? (tech.distance | number:'1.1-2') + ' km' : 'Calculando...' }}</strong></span>
            </div>
            <div class="detail-row">
              <i class="fas fa-check-circle text-green"></i>
              <span class="text-green">Disponible ahora</span>
            </div>
          </div>
          
          <button class="btn-assign" (click)="assignTechnician(tech.tecnicoId)" [disabled]="assigning === tech.tecnicoId">
            <span *ngIf="assigning !== tech.tecnicoId">Seleccionar técnico</span>
            <span *ngIf="assigning === tech.tecnicoId"><i class="fas fa-spinner fa-spin"></i> Asignando...</span>
          </button>
          <button class="btn-outline mt-2" (click)="openProfile(tech)">
            Ver Perfil Público
          </button>
        </div>
      </div>
      
      <!-- Public Profile Modal -->
      <div class="modal-backdrop" *ngIf="selectedTechProfile" (click)="closeProfile()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="btn-close" (click)="closeProfile()"><i class="fas fa-times"></i></button>
          
          <div class="modal-header">
            <div class="tech-avatar lg">
              <i class="fas fa-user-tie"></i>
            </div>
            <div>
              <h2>{{ selectedTechProfile.nombreCompleto || selectedTechProfile.tecnicoId }}</h2>
              <div class="tech-rating">
                <i class="fas fa-star" *ngFor="let _ of [1,2,3,4,5]; let i = index" 
                   [class.active]="i < selectedTechProfile.ranking"></i>
                <span class="rating-value">{{ selectedTechProfile.ranking | number:'1.1-1' }}</span>
              </div>
              <p class="tech-cats">{{ selectedTechProfile.categorias }}</p>
            </div>
          </div>
          
          <div class="modal-body">
            <h3>Portafolio de Trabajos</h3>
            <div class="loading" *ngIf="loadingPortfolio">
               <i class="fas fa-spinner fa-spin"></i> Cargando portafolio...
            </div>
            
            <div class="empty-state" *ngIf="!loadingPortfolio && portfolioPhotos.length === 0">
              <p>Este técnico aún no ha subido fotos de sus trabajos.</p>
            </div>
            
            <div class="portfolio-grid" *ngIf="!loadingPortfolio && portfolioPhotos.length > 0">
              <div class="portfolio-item" *ngFor="let photo of portfolioPhotos">
                <div class="photo-img" [style.backgroundImage]="'url(' + portfolioService.getPhotoUrl(photo.id) + ')'"></div>
                <p class="photo-desc" *ngIf="photo.description">{{ photo.description }}</p>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-assign w-full" (click)="assignSelectedTech()" [disabled]="assigning === selectedTechProfile.tecnicoId">
              {{ assigning === selectedTechProfile.tecnicoId ? 'Asignando...' : 'Asignar a este Técnico' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .assign-container { max-width: 1000px; margin: 40px auto; padding: 0 24px; font-family: 'Inter', sans-serif; }
    .header { margin-bottom: 32px; }
    .back-btn { background: none; border: none; color: #64748b; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 0; }
    .back-btn:hover { color: #0f172a; }
    .title { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
    .subtitle { color: #64748b; font-size: 1.1rem; margin: 0; }
    
    .loading-state, .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #4f46e5; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    
    .empty-state i { font-size: 3rem; color: #cbd5e1; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.3rem; color: #334155; margin: 0 0 8px 0; }
    .empty-state p { color: #64748b; margin-bottom: 24px; }
    
    .btn-primary { background: #4f46e5; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { background: #4338ca; }
    
    .technicians-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .technician-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
    .technician-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    
    .tech-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .tech-avatar { width: 56px; height: 56px; background: #e0e7ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #4f46e5; font-size: 1.5rem; }
    .tech-info { flex: 1; }
    .tech-name { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; }
    
    .tech-rating { display: flex; align-items: center; gap: 2px; }
    .tech-rating i { color: #cbd5e1; font-size: 0.9rem; }
    .tech-rating i.active { color: #fbbf24; }
    .rating-value { margin-left: 6px; font-weight: 600; color: #475569; font-size: 0.9rem; }
    
    .tech-details { background: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
    .detail-row { display: flex; align-items: center; gap: 10px; color: #475569; font-size: 0.95rem; }
    .detail-row i { color: #94a3b8; width: 16px; text-align: center; }
    .text-green { color: #059669 !important; font-weight: 600; }
    
    .btn-assign { width: 100%; background: #4f46e5; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: background 0.2s; }
    .btn-assign:hover:not([disabled]) { background: #4338ca; }
    .btn-assign[disabled] { background: #94a3b8; cursor: not-allowed; }
    .btn-outline { width: 100%; background: transparent; color: #4f46e5; border: 1px solid #4f46e5; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn-outline:hover { background: #eff6ff; }
    .mt-2 { margin-top: 8px; }
    .w-full { width: 100%; }
    
    /* Modal Styles */
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
    .modal-content { background: white; border-radius: 16px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
    .btn-close { position: absolute; top: 20px; right: 20px; background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 1.2rem; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .btn-close:hover { background: #e2e8f0; color: #0f172a; }
    
    .modal-header { padding: 30px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 20px; }
    .tech-avatar.lg { width: 80px; height: 80px; font-size: 2.5rem; }
    .modal-header h2 { margin: 0 0 8px 0; font-size: 1.5rem; color: #0f172a; }
    .tech-cats { color: #64748b; margin: 8px 0 0 0; font-size: 0.95rem; }
    
    .modal-body { padding: 30px; }
    .modal-body h3 { margin: 0 0 20px 0; color: #1e293b; font-size: 1.25rem; }
    
    .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .portfolio-item { border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; }
    .photo-img { height: 160px; background-size: cover; background-position: center; background-color: #f1f5f9; }
    .photo-desc { padding: 12px; margin: 0; font-size: 0.9rem; color: #475569; background: white; border-top: 1px solid #f1f5f9; }
    
    .modal-footer { padding: 20px 30px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
  `]
})
export class AssignTechnicianPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private serviceRequestService = inject(ServiceRequestService);
  private api = inject(ApiClientService);
  public portfolioService = inject(TecnicoPortfolioService);

  requestId!: number;
  request: ServiceRequestResponseDTO | null = null;
  
  technicians: TechnicianDTO[] = [];
  loading = true;
  assigning: string | null = null;
  
  selectedTechProfile: TechnicianDTO | null = null;
  portfolioPhotos: PortfolioPhoto[] = [];
  loadingPortfolio = false;

  ngOnInit() {
    this.requestId = Number(this.route.snapshot.paramMap.get('solicitudId'));
    if (!this.requestId) {
      this.goBack();
      return;
    }
    
    this.loadRequestDetails();
  }

  loadRequestDetails() {
    this.serviceRequestService.getRequests().subscribe({
      next: (requests) => {
        const req = requests.find(r => r.id === this.requestId);
        if (req) {
          this.request = req;
          this.loadTechnicians();
        } else {
          alert('Solicitud no encontrada');
          this.goBack();
        }
      },
      error: () => {
        alert('Error cargando solicitud');
        this.goBack();
      }
    });
  }

  loadTechnicians() {
    this.loading = true;
    
    // Simulate getting client's current location (e.g., from browser or from request details)
    const clientLat = -15.84; // Mocked client location
    const clientLng = -70.02;

    const url = `/technician-ms/api/v1/technicians/online?categoria=${this.request?.catalogoServicio?.categoryCode || ''}&lat=${clientLat}&lng=${clientLng}`;
    
    this.api.get<TechnicianDTO[]>(url).subscribe({
      next: (techs) => {
        this.technicians = techs;
        // The backend should ideally calculate distance. If it doesn't return it in DTO, we might mock it here for UI.
        this.technicians.forEach(t => {
           if (!t.distance) {
               // Pseudo distance calc if backend didn't do it
               t.distance = Math.random() * 5 + 1; // 1 to 6 km
           }
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  assignTechnician(tecnicoId: string) {
    this.assigning = tecnicoId;
    
    this.api.post(`/service-request-ms/api/v1/solicitudes/${this.requestId}/asignar?tecnicoId=${tecnicoId}`, {}).subscribe({
      next: () => {
        alert('Técnico asignado exitosamente');
        this.router.navigate(['/cliente/solicitudes', this.requestId]);
      },
      error: () => {
        this.assigning = null;
        alert('Error al asignar el técnico');
      }
    });
  }

  openProfile(tech: TechnicianDTO) {
    this.selectedTechProfile = tech;
    this.loadingPortfolio = true;
    this.portfolioPhotos = [];
    
    this.portfolioService.getPublicPortfolio(tech.tecnicoId).subscribe({
      next: (photos) => {
        this.portfolioPhotos = photos;
        this.loadingPortfolio = false;
      },
      error: () => {
        this.loadingPortfolio = false;
      }
    });
  }
  
  closeProfile() {
    this.selectedTechProfile = null;
  }
  
  assignSelectedTech() {
    if (this.selectedTechProfile) {
      this.assignTechnician(this.selectedTechProfile.tecnicoId);
    }
  }

  goBack() {
    if (this.requestId) {
      this.router.navigate(['/cliente/solicitudes', this.requestId]);
    } else {
      this.router.navigate(['/cliente/solicitudes']);
    }
  }
}
