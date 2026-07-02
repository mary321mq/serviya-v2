import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicCatalogService, CatalogServiceDTO, ServiceCategory } from '../services/public-catalog.service';
import { SERVIYA_APP_CONFIG } from '../../../core/config/app-config';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="catalog-wrapper">
      <div class="catalog-header">
        <h1>Catálogo de Servicios</h1>
        <p>Explora los servicios disponibles y solicita una cotización o visita técnica.</p>
      </div>

      <!-- BUSCADOR + FILTRO -->
      <div class="search-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            placeholder="Buscar por nombre o descripción..."
          />
        </div>
        <select [(ngModel)]="selectedCategory" class="category-select">
          <option value="">Todas las categorías</option>
          @for (cat of categories; track cat.codigo) {
            <option [value]="cat.codigo">{{ cat.nombre }}</option>
          }
        </select>
      </div>

      <!-- PÍLDORAS DE CATEGORÍAS -->
      <div class="category-pills">
        <button 
          class="pill" 
          [class.active]="selectedCategory === ''"
          (click)="selectedCategory = ''"
        >
          <span class="pill-icon">🔧</span> Todas las categorías
        </button>
        @for (cat of categories; track cat.codigo) {
          <button 
            class="pill"
            [class.active]="selectedCategory === cat.codigo"
            (click)="selectedCategory = cat.codigo"
          >
            <span class="pill-icon">{{ getCategoryIcon(cat.codigo) }}</span> {{ cat.nombre }}
          </button>
        }
      </div>

      <!-- LOADING / ERROR -->
      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Cargando catálogo...</span>
        </div>
      } @else if (error) {
        <div class="error-state">
          ⚠️ Error al cargar el catálogo: {{ error }}
        </div>
      } @else {
        <!-- GRILLA DE SERVICIOS -->
        <div class="services-grid">
          @for (servicio of paginatedServicios; track servicio.id) {
            <a class="service-card" [routerLink]="['/cliente/servicios', servicio.codigo]">
              <div class="card-image">
                <img 
                  *ngIf="servicio.imageUrl" 
                  [src]="getServiceImageUrl(servicio.imageUrl)" 
                  [alt]="servicio.nombre"
                  (error)="onImgError($event)"
                />
                <div *ngIf="!servicio.imageUrl" class="placeholder-img">
                  <span>{{ getCategoryIcon(servicio.categoryCode) }}</span>
                </div>
                <span class="category-badge">{{ getCategoryIcon(servicio.categoryCode) }}</span>
              </div>
              <div class="card-body">
                <h3>{{ servicio.nombre }}</h3>
                <p class="card-desc">{{ servicio.descripcion }}</p>
                <div class="card-duration" *ngIf="servicio.duracionEstimada">
                  <span class="dur-icon">⏱</span> Duración: {{ servicio.duracionEstimada }}
                </div>
              </div>
              <div class="card-footer">
                <div class="price-section">
                  <span class="price-label">DESDE</span>
                  <span class="price-value">S/ {{ servicio.precioBaseReferencial | number:'1.2-2' }}</span>
                </div>
                <button class="btn-details">Ver detalles →</button>
              </div>
            </a>
          } @empty {
            <div class="empty-state">
              <span class="empty-icon">🔍</span>
              <p>No se encontraron servicios que coincidan con la búsqueda.</p>
            </div>
          }
        </div>

        <!-- PAGINACIÓN -->
        <div class="pagination-bar" *ngIf="filteredServicios.length > 0">
          <span class="page-info">Mostrando {{ startIndex + 1 }} a {{ endIndex }} de {{ filteredServicios.length }} servicios</span>
          <div class="page-buttons">
            <button class="page-btn" [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1">‹</button>
            @for (p of totalPagesArray; track p) {
              <button 
                class="page-btn" 
                [class.active]="currentPage === p"
                (click)="currentPage = p"
              >{{ p }}</button>
            }
            <button class="page-btn" [disabled]="currentPage === totalPages" (click)="currentPage = currentPage + 1">›</button>
          </div>
          <select [(ngModel)]="pageSize" (change)="currentPage = 1" class="page-size-select">
            <option [value]="6">6 por página</option>
            <option [value]="12">12 por página</option>
            <option [value]="24">24 por página</option>
          </select>
        </div>
      }
    </div>
  `,
  styles: [`
    .catalog-wrapper { padding: 0; }
    
    .catalog-header { margin-bottom: 28px; }
    .catalog-header h1 { font-size: 1.8rem; font-weight: 700; color: #f8fafc; margin: 0 0 8px 0; }
    .catalog-header p { color: #94a3b8; font-size: 1rem; margin: 0; }

    /* Buscador */
    .search-row { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 280px; position: relative; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 16px; font-size: 1rem; color: #64748b; }
    .search-box input { width: 100%; padding: 14px 16px 14px 44px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; color: #f8fafc; font-size: 1rem; transition: border-color 0.2s; box-sizing: border-box; }
    .search-box input:focus { outline: none; border-color: #3b82f6; }
    .search-box input::placeholder { color: #64748b; }
    .category-select { min-width: 220px; padding: 14px 16px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; color: #f8fafc; font-size: 1rem; cursor: pointer; }
    .category-select:focus { outline: none; border-color: #3b82f6; }

    /* Píldoras */
    .category-pills { display: flex; gap: 10px; margin-bottom: 28px; overflow-x: auto; padding-bottom: 4px; }
    .category-pills::-webkit-scrollbar { height: 4px; }
    .category-pills::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    .pill { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 30px; border: 1px solid #1e293b; background: #0b0f19; color: #94a3b8; font-size: 0.9rem; font-weight: 500; cursor: pointer; white-space: nowrap; transition: all 0.25s; }
    .pill:hover { border-color: #334155; color: #cbd5e1; }
    .pill.active { background: #1e40af; border-color: #3b82f6; color: #f8fafc; box-shadow: 0 0 16px rgba(59, 130, 246, 0.3); }
    .pill-icon { font-size: 1.1rem; }

    /* Grid */
    .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; margin-bottom: 32px; }

    /* Card */
    .service-card { display: flex; flex-direction: column; background: #0b0f19; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; text-decoration: none; transition: all 0.3s ease; cursor: pointer; }
    .service-card:hover { border-color: #334155; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4); }

    .card-image { position: relative; height: 180px; background: #0f172a; overflow: hidden; }
    .card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .service-card:hover .card-image img { transform: scale(1.05); }
    .placeholder-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); font-size: 3rem; }
    .category-badge { position: absolute; top: 12px; left: 12px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); border: 1px solid #334155; border-radius: 8px; padding: 6px 10px; font-size: 1rem; }

    .card-body { padding: 20px 20px 12px 20px; flex: 1; }
    .card-body h3 { margin: 0 0 8px 0; font-size: 1.1rem; font-weight: 600; color: #f8fafc; line-height: 1.3; }
    .card-desc { margin: 0; color: #94a3b8; font-size: 0.88rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .card-duration { margin-top: 12px; display: flex; align-items: center; gap: 6px; color: #64748b; font-size: 0.85rem; }
    .dur-icon { font-size: 0.9rem; }

    .card-footer { padding: 16px 20px; border-top: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; }
    .price-section { display: flex; flex-direction: column; }
    .price-label { font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
    .price-value { color: #60a5fa; font-weight: 700; font-size: 1.2rem; }
    .btn-details { background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 10px; padding: 10px 18px; font-size: 0.88rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-details:hover { background: #3b82f6; border-color: #3b82f6; }

    /* Loading */
    .loading-state { text-align: center; padding: 60px 20px; color: #64748b; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #1e293b; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-state { padding: 20px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; text-align: center; }

    .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #64748b; border: 1px dashed #1e293b; border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .empty-icon { font-size: 2.5rem; }

    /* Pagination */
    .pagination-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding: 20px 0; border-top: 1px solid #1e293b; }
    .page-info { color: #64748b; font-size: 0.88rem; }
    .page-buttons { display: flex; gap: 6px; }
    .page-btn { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: 1px solid #1e293b; background: #0b0f19; color: #94a3b8; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .page-btn:hover:not(:disabled) { border-color: #334155; color: #f8fafc; }
    .page-btn.active { background: #3b82f6; border-color: #3b82f6; color: #f8fafc; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-size-select { padding: 8px 12px; background: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; color: #94a3b8; font-size: 0.88rem; cursor: pointer; }

    @media (max-width: 768px) {
      .services-grid { grid-template-columns: 1fr; }
      .search-row { flex-direction: column; }
      .pagination-bar { flex-direction: column; text-align: center; }
    }
  `]
})
export class CatalogPageComponent implements OnInit {
  private readonly catalogService = inject(PublicCatalogService);
  private readonly config = inject(SERVIYA_APP_CONFIG);

  servicios: CatalogServiceDTO[] = [];
  categories: ServiceCategory[] = [];
  
  searchTerm: string = '';
  selectedCategory: string = '';

  currentPage = 1;
  pageSize: number = 6;

  loading = true;
  error: string | null = null;

  private categoryIcons: Record<string, string> = {
    'PLOMERIA': '🔧',
    'ELECTRICIDAD': '⚡',
    'CARPINTERIA': '🪚',
    'PINTURA': '🖌️',
    'CERRAJERIA': '🔐',
    'LIMPIEZA': '🧹',
    'GASFITERIA': '🚿',
    'ALBAÑILERIA': '🧱',
  };

  get filteredServicios(): CatalogServiceDTO[] {
    return this.servicios.filter(s => {
      const matchCategory = this.selectedCategory ? s.categoryCode === this.selectedCategory : true;
      const term = this.searchTerm.toLowerCase();
      const matchSearch = term ? (s.nombre.toLowerCase().includes(term) || (s.descripcion && s.descripcion.toLowerCase().includes(term))) : true;
      return matchCategory && matchSearch;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredServicios.length / this.pageSize);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredServicios.length);
  }

  get paginatedServicios(): CatalogServiceDTO[] {
    return this.filteredServicios.slice(this.startIndex, this.endIndex);
  }

  getCategoryIcon(code: string): string {
    return this.categoryIcons[code] || '🔧';
  }

  getServiceImageUrl(url: string | null | undefined): string {
    if (!url) {
      return '';
    }

    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }

    if (url.startsWith('/assets')) {
      return url;
    }

    if (url.startsWith('/service-request-ms')) {
      return `${this.config.apiBaseUrl}${url}`;
    }

    if (url.startsWith('/api')) {
      return `${this.config.apiBaseUrl}/service-request-ms${url}`;
    }

    return url.startsWith('/') ? `${this.config.apiBaseUrl}${url}` : url;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  ngOnInit(): void {
    this.catalogService.getCategories().subscribe({
      next: (data) => this.categories = data.filter(c => c.activo),
      error: (err) => console.error('Error cargando categorías', err)
    });

    this.catalogService.getAllServices().subscribe({
      next: (data) => {
        this.servicios = data.filter(s => s.activo);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar el catálogo.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
