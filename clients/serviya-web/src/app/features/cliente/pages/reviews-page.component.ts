import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ClientReview, ClientReviewEligibility } from '../models/client-review.model';
import { ClientReviewService } from '../services/client-review.service';
import { ServiceRequestService } from '../services/service-request.service';
import { ServiceRequestResponseDTO } from '../services/public-catalog.service';

@Component({
  selector: 'app-client-reviews-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="reviews-layout">
      <!-- PANEL IZQUIERDO -->
      <div class="main-panel">
        <div class="page-title">
          <h1>Reseñas</h1>
          <p>Califica los servicios que has recibido y ayuda a otros clientes.</p>
        </div>

        <!-- SERVICIOS PENDIENTES -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-row">
              <span class="section-icon">⭐</span>
              <div>
                <h2>Servicios pendientes de calificar</h2>
                <p>Tu opinión ayuda a mejorar la calidad del servicio.</p>
              </div>
            </div>
            <span class="pending-badge" *ngIf="pendingServices.length > 0">
              {{ pendingServices.length }} servicios pendientes
            </span>
          </div>

          <div class="pending-list">
            @for (srv of pendingServices; track srv.id) {
              <div class="pending-item">
                <div class="pending-icon" [style.background]="getRandomColor(srv.id)">
                  <span>{{ getServiceEmoji(srv.catalogoServicio.categoryCode) }}</span>
                </div>
                <div class="pending-info">
                  <strong>{{ srv.catalogoServicio.nombre || 'Servicio' }}</strong>
                  <span class="code-label">Servicio completado</span>
                </div>
                <div class="pending-meta">
                  <span class="meta-icon">📅</span>
                  <div>
                    <span class="meta-label">Completado</span>
                    <span class="meta-value">{{ formatDate(srv.updatedAt) }}</span>
                  </div>
                </div>
                <div class="pending-meta">
                  <span class="meta-icon">📍</span>
                  <div>
                    <span class="meta-label">Dirección</span>
                    <span class="meta-value">{{ srv.direccionFisica || 'Sin dirección' }}</span>
                  </div>
                </div>
                <div class="pending-stars">
                  @for (s of [1,2,3,4,5]; track s) {
                    <span class="star empty">☆</span>
                  }
                </div>
                <a class="btn-rate" [routerLink]="['/cliente/resenas/nueva', srv.id]" [queryParams]="{tecnicoId: srv.tecnicoId}">
                  Calificar servicio
                </a>
              </div>
            } @empty {
              <div class="empty-pending">
                <span class="empty-icon">✅</span>
                <p>No tienes servicios pendientes de calificar. ¡Excelente!</p>
              </div>
            }
          </div>
        </div>

        <!-- MIS RESEÑAS PUBLICADAS -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title-row">
              <span class="section-icon">💬</span>
              <div>
                <h2>Mis reseñas publicadas</h2>
                <p>Gracias por compartir tu experiencia con nuestros técnicos.</p>
              </div>
            </div>
          </div>

          <div class="reviews-list">
            @for (review of displayedReviews; track review.publicId) {
              <div class="review-item">
                <div class="review-avatar">
                  <span>{{ getInitials(review.technicianId) }}</span>
                </div>
                <div class="review-content">
                  <div class="review-top">
                    <div class="reviewer-info">
                      <strong>Técnico #{{ review.technicianId.substring(0, 8) }}</strong>
                      <span class="review-category">{{ getCategoryFromRequest(review.serviceRequestId) }}</span>
                    </div>
                    <div class="review-rating-row">
                      <span class="rating-label">Tu calificación</span>
                      <div class="stars-row">
                        @for (s of [1,2,3,4,5]; track s) {
                          <span class="star" [class.filled]="s <= review.rating">{{ s <= review.rating ? '★' : '☆' }}</span>
                        }
                      </div>
                      <span class="rating-badge" [class.excellent]="review.rating >= 5" [class.good]="review.rating === 4" [class.regular]="review.rating === 3">
                        {{ getRatingLabel(review.rating) }}
                      </span>
                    </div>
                  </div>
                  <p class="review-comment">{{ review.comment || 'Sin comentario.' }}</p>
                </div>
                <div class="review-date">
                  <span class="date-icon">📅</span>
                  <div>
                    <span class="date-label">Fecha</span>
                    <span class="date-value">{{ formatDate(review.createdAt) }}</span>
                  </div>
                </div>
                <button class="btn-more">⋯</button>
              </div>
            } @empty {
              <div class="empty-reviews">
                <span class="empty-icon">💬</span>
                <p>Aún no has creado reseñas. Califica un servicio completado para comenzar.</p>
              </div>
            }
          </div>

          <button class="btn-load-more" *ngIf="reviews.length > displayLimit" (click)="displayLimit = displayLimit + 5">
            Ver más reseñas <span>▾</span>
          </button>
        </div>
      </div>

      <!-- PANEL DERECHO (SIDEBAR) -->
      <div class="sidebar">
        <!-- RESUMEN -->
        <div class="sidebar-card summary-card">
          <h3>Resumen de reseñas</h3>
          <div class="summary-body">
            <div class="avg-section">
              <span class="avg-label">Calificación promedio</span>
              <div class="avg-number">{{ averageRating }}</div>
              <div class="avg-stars">
                @for (s of [1,2,3,4,5]; track s) {
                  <span class="star" [class.filled]="s <= roundedAvg">{{ s <= roundedAvg ? '★' : '☆' }}</span>
                }
              </div>
              <span class="avg-based">Basado en {{ reviews.length }} reseñas</span>
            </div>
            <div class="bar-chart">
              @for (r of [5,4,3,2,1]; track r) {
                <div class="bar-row">
                  <span class="bar-label">{{ r }}</span>
                  <span class="bar-star">★</span>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="getBarWidth(r)" [style.background]="getBarColor(r)"></div>
                  </div>
                  <span class="bar-count">{{ getRatingCount(r) }}</span>
                </div>
              }
            </div>
          </div>
          <a class="sidebar-link" routerLink="/cliente/resenas">Ver todas mis reseñas →</a>
        </div>

        <!-- CÓMO FUNCIONAN -->
        <div class="sidebar-card how-it-works">
          <h3><span class="hw-icon">❓</span> ¿Cómo funcionan las reseñas?</h3>
          <div class="hw-steps">
            <div class="hw-step">
              <div class="hw-step-icon" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">🎯</div>
              <div>
                <strong>1. Califica el servicio</strong>
                <p>Luego de que el servicio sea completado, podrás calificar al técnico.</p>
              </div>
            </div>
            <div class="hw-step">
              <div class="hw-step-icon" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">✍️</div>
              <div>
                <strong>2. Comparte tu experiencia</strong>
                <p>Escribe un comentario sobre el servicio recibido y tu experiencia.</p>
              </div>
            </div>
            <div class="hw-step">
              <div class="hw-step-icon" style="background: rgba(34, 197, 94, 0.15); color: #22c55e;">🤝</div>
              <div>
                <strong>3. Ayuda a otros clientes</strong>
                <p>Tu opinión ayuda a otros usuarios a elegir con confianza.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- GRACIAS -->
        <div class="sidebar-card thanks-card">
          <div class="thanks-icon">💛</div>
          <h3>¡Gracias por tu confianza!</h3>
          <p>Tus reseñas nos motivan a seguir mejorando y brindar un servicio de calidad.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reviews-layout { display: flex; gap: 28px; }
    .main-panel { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 24px; }
    .sidebar { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 20px; }

    .page-title h1 { font-size: 1.8rem; font-weight: 700; color: #f8fafc; margin: 0 0 6px 0; }
    .page-title p { color: #94a3b8; font-size: 1rem; margin: 0; }

    /* Section Card */
    .section-card { background: #0b0f19; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .section-title-row { display: flex; gap: 12px; align-items: center; }
    .section-icon { font-size: 1.3rem; }
    .section-header h2 { margin: 0; font-size: 1.1rem; font-weight: 600; color: #f8fafc; }
    .section-header p { margin: 4px 0 0 0; font-size: 0.85rem; color: #64748b; }
    .pending-badge { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; white-space: nowrap; }

    /* Pending List */
    .pending-list { display: flex; flex-direction: column; gap: 12px; }
    .pending-item { display: flex; align-items: center; gap: 16px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px 20px; transition: border-color 0.2s; flex-wrap: wrap; }
    .pending-item:hover { border-color: #334155; }
    .pending-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
    .pending-info { display: flex; flex-direction: column; gap: 2px; min-width: 160px; }
    .pending-info strong { color: #f8fafc; font-size: 0.95rem; }
    .code-label { color: #64748b; font-size: 0.78rem; }
    .pending-meta { display: flex; gap: 8px; align-items: center; min-width: 120px; }
    .meta-icon { font-size: 0.9rem; }
    .meta-label { display: block; color: #64748b; font-size: 0.75rem; }
    .meta-value { display: block; color: #cbd5e1; font-size: 0.82rem; }
    .pending-stars { display: flex; gap: 2px; }
    .star { font-size: 1.1rem; color: #334155; }
    .star.filled { color: #fbbf24; }
    .star.empty { color: #334155; }
    .btn-rate { padding: 8px 18px; background: transparent; border: 1px solid #3b82f6; border-radius: 10px; color: #60a5fa; font-size: 0.85rem; font-weight: 500; cursor: pointer; text-decoration: none; white-space: nowrap; transition: all 0.2s; }
    .btn-rate:hover { background: #3b82f6; color: #fff; }

    /* Reviews List */
    .reviews-list { display: flex; flex-direction: column; gap: 16px; }
    .review-item { display: flex; gap: 16px; align-items: flex-start; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; transition: border-color 0.2s; position: relative; flex-wrap: wrap; }
    .review-item:hover { border-color: #334155; }
    .review-avatar { width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, #1e293b, #334155); display: flex; align-items: center; justify-content: center; color: #94a3b8; font-weight: 600; font-size: 0.9rem; flex-shrink: 0; }
    .review-content { flex: 1; min-width: 0; }
    .review-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
    .reviewer-info { display: flex; flex-direction: column; gap: 2px; }
    .reviewer-info strong { color: #f8fafc; font-size: 0.95rem; }
    .review-category { color: #fbbf24; font-size: 0.8rem; font-weight: 500; }
    .review-rating-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .rating-label { color: #64748b; font-size: 0.8rem; }
    .stars-row { display: flex; gap: 2px; }
    .stars-row .star { font-size: 1rem; }
    .rating-badge { padding: 3px 10px; border-radius: 16px; font-size: 0.75rem; font-weight: 600; }
    .rating-badge.excellent { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
    .rating-badge.good { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
    .rating-badge.regular { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
    .review-comment { color: #94a3b8; font-size: 0.88rem; line-height: 1.5; margin: 0; }
    .review-date { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
    .date-icon { font-size: 0.9rem; }
    .date-label { display: block; color: #64748b; font-size: 0.75rem; }
    .date-value { display: block; color: #cbd5e1; font-size: 0.82rem; white-space: nowrap; }
    .btn-more { position: absolute; top: 16px; right: 16px; background: none; border: none; color: #64748b; font-size: 1.2rem; cursor: pointer; padding: 4px; }
    .btn-more:hover { color: #f8fafc; }

    .btn-load-more { display: flex; align-items: center; gap: 8px; margin: 20px auto 0; padding: 10px 28px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; color: #94a3b8; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .btn-load-more:hover { border-color: #334155; color: #f8fafc; }

    /* Empty states */
    .empty-pending, .empty-reviews { text-align: center; padding: 32px 20px; color: #64748b; }
    .empty-icon { font-size: 2rem; display: block; margin-bottom: 8px; }
    .empty-pending p, .empty-reviews p { margin: 0; font-size: 0.9rem; }

    /* Sidebar Cards */
    .sidebar-card { background: #0b0f19; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; }
    .sidebar-card h3 { margin: 0 0 16px 0; font-size: 1rem; font-weight: 600; color: #f8fafc; display: flex; align-items: center; gap: 8px; }

    /* Summary */
    .summary-body { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .avg-section { text-align: center; }
    .avg-label { color: #64748b; font-size: 0.82rem; display: block; margin-bottom: 4px; }
    .avg-number { font-size: 3rem; font-weight: 700; color: #f8fafc; line-height: 1; }
    .avg-stars { margin: 8px 0; display: flex; justify-content: center; gap: 4px; }
    .avg-stars .star { font-size: 1.2rem; }
    .avg-based { color: #64748b; font-size: 0.82rem; }
    .bar-chart { width: 100%; display: flex; flex-direction: column; gap: 6px; }
    .bar-row { display: flex; align-items: center; gap: 6px; }
    .bar-label { width: 12px; text-align: right; color: #94a3b8; font-size: 0.82rem; font-weight: 600; }
    .bar-star { color: #fbbf24; font-size: 0.8rem; }
    .bar-track { flex: 1; height: 8px; background: #1e293b; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
    .bar-count { width: 22px; text-align: right; color: #94a3b8; font-size: 0.82rem; }
    .sidebar-link { display: block; text-align: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid #1e293b; color: #60a5fa; font-size: 0.88rem; font-weight: 500; text-decoration: none; }
    .sidebar-link:hover { color: #93c5fd; }

    /* How It Works */
    .hw-icon { font-size: 1.1rem; }
    .hw-steps { display: flex; flex-direction: column; gap: 16px; }
    .hw-step { display: flex; gap: 12px; align-items: flex-start; }
    .hw-step-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
    .hw-step strong { color: #f8fafc; font-size: 0.88rem; display: block; margin-bottom: 2px; }
    .hw-step p { color: #64748b; font-size: 0.82rem; margin: 0; line-height: 1.4; }

    /* Thanks */
    .thanks-card { text-align: center; }
    .thanks-icon { font-size: 2.5rem; margin-bottom: 8px; filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.4)); }
    .thanks-card p { color: #94a3b8; font-size: 0.88rem; line-height: 1.5; margin: 0; }

    @media (max-width: 960px) {
      .reviews-layout { flex-direction: column; }
      .sidebar { width: 100%; }
      .pending-item { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class ClientReviewsPageComponent implements OnInit {
  private readonly reviewService = inject(ClientReviewService);
  private readonly requestService = inject(ServiceRequestService);

  protected eligibleReviews: ClientReviewEligibility[] = [];
  protected reviews: ClientReview[] = [];
  protected allRequests: ServiceRequestResponseDTO[] = [];
  protected pendingServices: ServiceRequestResponseDTO[] = [];
  protected displayLimit = 5;

  ngOnInit(): void {
    forkJoin({
      reviews: this.reviewService.getReviews(),
      eligible: this.reviewService.getEligibleReviews(),
      requests: this.requestService.getRequests()
    }).subscribe({
      next: ({ reviews, eligible, requests }) => {
        this.reviews = reviews;
        this.eligibleReviews = eligible;
        this.allRequests = requests;

        // Find completed services that haven't been reviewed yet
        const reviewedRequestIds = new Set(reviews.map(r => r.serviceRequestId));
        this.pendingServices = requests.filter(r =>
          (r.estadoSolicitud === 'COMPLETADO' || r.estadoSolicitud === 'TERMINADO') &&
          !reviewedRequestIds.has(String(r.id))
        );
      },
      error: (err) => console.error('Error loading reviews data', err)
    });
  }

  get displayedReviews(): ClientReview[] {
    return this.reviews.slice(0, this.displayLimit);
  }

  get averageRating(): string {
    if (this.reviews.length === 0) return '0.0';
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  get roundedAvg(): number {
    return Math.round(parseFloat(this.averageRating));
  }

  getRatingCount(rating: number): number {
    return this.reviews.filter(r => r.rating === rating).length;
  }

  getBarWidth(rating: number): number {
    if (this.reviews.length === 0) return 0;
    return (this.getRatingCount(rating) / this.reviews.length) * 100;
  }

  getBarColor(rating: number): string {
    const colors: Record<number, string> = {
      5: '#3b82f6',
      4: '#60a5fa',
      3: '#fbbf24',
      2: '#f97316',
      1: '#ef4444'
    };
    return colors[rating] || '#3b82f6';
  }

  getRatingLabel(rating: number): string {
    if (rating >= 5) return 'Excelente';
    if (rating === 4) return 'Muy bueno';
    if (rating === 3) return 'Bueno';
    if (rating === 2) return 'Regular';
    return 'Malo';
  }

  getInitials(id: string): string {
    if (!id) return '??';
    return id.substring(0, 2).toUpperCase();
  }

  getCategoryFromRequest(serviceRequestId: string): string {
    const req = this.allRequests.find(r => String(r.id) === serviceRequestId);
    if (req?.catalogoServicio?.categoryCode) {
      const emoji = this.getServiceEmoji(req.catalogoServicio.categoryCode);
      return `${emoji} ${req.catalogoServicio.categoryCode}`;
    }
    return '🔧 Servicio';
  }

  getServiceEmoji(categoryCode?: string): string {
    const map: Record<string, string> = {
      'PLOMERIA': '🔧',
      'ELECTRICIDAD': '⚡',
      'CARPINTERIA': '🪚',
      'PINTURA': '🖌️',
      'CERRAJERIA': '🔐',
      'LIMPIEZA': '🧹',
      'GASFITERIA': '🚿',
    };
    return map[categoryCode || ''] || '🔧';
  }

  getRandomColor(id: number): string {
    const colors = [
      'rgba(59,130,246,0.2)',
      'rgba(251,191,36,0.2)',
      'rgba(34,197,94,0.2)',
      'rgba(168,85,247,0.2)',
      'rgba(239,68,68,0.2)',
    ];
    return colors[id % colors.length];
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }
}
