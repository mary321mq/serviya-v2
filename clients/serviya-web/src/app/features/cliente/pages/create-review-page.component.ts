import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ClientReviewService } from '../services/client-review.service';
import { ServiceRequestService } from '../services/service-request.service';
import { ClienteProfileService } from '../services/cliente-profile.service';
import { ServiceRequestResponseDTO } from '../services/public-catalog.service';
import { ClienteProfile } from '../models/cliente-profile.model';

@Component({
  selector: 'app-create-client-review-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="create-review-container">
      <!-- Left Main Form Column -->
      <div class="left-column">
        <a routerLink="/cliente/resenas" class="back-link">
          <lucide-icon name="chevron-left" [size]="18"></lucide-icon> Volver a mis reseñas
        </a>

        <div class="header-section">
          <h1>Calificar reseña</h1>
          <p class="subtitle">Tu opinión ayuda a mejorar la calidad del servicio en ServiYa.</p>
        </div>

        <!-- Customer Identity Card -->
        <div class="customer-identity-card" *ngIf="request">
          <div class="card-avatar">
            <lucide-icon name="user" [size]="20"></lucide-icon>
          </div>
          <div class="customer-info">
            <span class="customer-name">
              Cliente: {{ clientProfile ? (clientProfile.firstName + ' ' + clientProfile.lastName) : 'Juan Pérez Quispe' }}
            </span>
            <span class="completion-date" *ngIf="request.updatedAt || request.createdAt">
              Terminado: {{ (request.updatedAt || request.createdAt) | date:'d MMM, yyyy h:mm a' }}
            </span>
          </div>
          <span class="status-badge-completed">
            <span class="status-dot"></span> Servicio completado
          </span>
        </div>

        <!-- Main Rating Form -->
        <form (ngSubmit)="submit()" #revForm="ngForm" class="review-form-panel">
          <!-- Star Rating Selector -->
          <div class="rating-selector-section">
            <span class="form-label">¿Cómo calificarías este servicio?</span>
            <div class="stars-row">
              <span *ngFor="let starNum of [1, 2, 3, 4, 5]" 
                    (click)="setRating(starNum)" 
                    (mouseenter)="hoverRating = starNum" 
                    (mouseleave)="hoverRating = 0"
                    class="star-icon"
                    [class.filled]="starNum <= (hoverRating || rating)">
                ★
              </span>
            </div>
            <span class="rating-description-label">{{ getRatingLabel(hoverRating || rating) }}</span>
          </div>

          <!-- Aspects Grid -->
          <div class="aspects-section">
            <span class="form-label">¿Qué destacarías de la atención? (Opcional)</span>
            <div class="aspects-grid">
              <button type="button" 
                      class="aspect-btn" 
                      [class.active]="isAspectSelected('comunicacion')" 
                      (click)="toggleAspect('comunicacion')">
                <span>💬 Comunicación</span>
              </button>
              <button type="button" 
                      class="aspect-btn" 
                      [class.active]="isAspectSelected('puntualidad')" 
                      (click)="toggleAspect('puntualidad')">
                <span>⏰ Puntualidad</span>
              </button>
              <button type="button" 
                      class="aspect-btn" 
                      [class.active]="isAspectSelected('respeto')" 
                      (click)="toggleAspect('respeto')">
                <span>🤝 Respeto</span>
              </button>
              <button type="button" 
                      class="aspect-btn" 
                      [class.active]="isAspectSelected('condiciones')" 
                      (click)="toggleAspect('condiciones')">
                <span>🛠️ Condiciones</span>
              </button>
            </div>
          </div>

          <!-- Comments Textarea -->
          <div class="comments-section">
            <span class="form-label">Cuéntanos más (opcional)</span>
            <div class="textarea-wrapper">
              <textarea
                name="comment"
                [(ngModel)]="comment"
                [maxlength]="maxCommentLength"
                placeholder="Describe tu experiencia detalladamente..."
              ></textarea>
              <span class="char-counter">{{ comment.length || 0 }} / {{ maxCommentLength }}</span>
            </div>
          </div>

          <!-- Status Message -->
          @if (message) {
            <p class="status-message-error">{{ message }}</p>
          }

          <!-- Submit Button -->
          <div class="submit-actions-row">
            <button class="submit-button" type="submit" [disabled]="revForm.invalid || !canSubmit()">
              ☆ Enviar calificación
            </button>
            <span class="disclaimer-note">Tu calificación será visible para ServiYa</span>
          </div>
        </form>
      </div>

      <!-- Right Sidebar Column -->
      <div class="right-column" *ngIf="request">
        <!-- Service Summary Card -->
        <div class="service-summary-card">
          <h3>📄 Resumen del servicio</h3>
          
          <div class="summary-header">
            <div class="service-thumb-container">
              <ng-container [ngSwitch]="request.catalogoServicio.categoryCode.toUpperCase()">
                <div *ngSwitchCase="'ELECTRICIDAD'" class="category-icon yellow">⚡</div>
                <div *ngSwitchCase="'GASFITERIA'" class="category-icon blue">💧</div>
                <div *ngSwitchCase="'PINTURA'" class="category-icon purple">🖌️</div>
                <div *ngSwitchDefault class="category-icon green">🔧</div>
              </ng-container>
            </div>
            <div class="service-meta">
              <span class="service-title-text">{{ request.catalogoServicio.nombre }}</span>
              <span class="service-location-text">📍 {{ parseAddress(request.direccionFisica).ubigeo }}</span>
              <span class="service-date-text" *ngIf="request.createdAt">
                📅 {{ request.createdAt | date:'d MMM, yyyy' }}
              </span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="details-list">
            <div class="details-row-item">
              <span class="detail-label-text">Código de solicitud</span>
              <span class="detail-value-text font-mono">#{{ request.id }}</span>
            </div>
            <div class="details-row-item">
              <span class="detail-label-text">Técnico asignado</span>
              <span class="detail-value-text highlight">{{ getTechnicianName() }}</span>
            </div>
            <div class="details-row-item">
              <span class="detail-label-text">Estado</span>
              <span class="status-badge-compact font-bold">
                <span class="status-dot"></span> Completado
              </span>
            </div>
          </div>
        </div>

        <!-- Trust Shield Banner -->
        <div class="trust-shield-banner">
          <lucide-icon name="shield" [size]="24" class="shield-icon"></lucide-icon>
          <p class="trust-message">
            Gracias por tu compromiso. Tu opinión nos ayuda a crecer y brindar un mejor servicio.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* CONTENEDOR PRINCIPAL PREMIUM DARK SPLIT */
    .create-review-container {
      display: grid;
      grid-template-columns: 1.8fr 1fr;
      gap: 32px;
      max-width: 1300px;
      margin: 0 auto;
      padding: 32px 24px;
      background: #070a13;
      min-height: calc(100vh - 70px);
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
      color: #f8fafc;
    }

    /* Columna Izquierda (Formulario) */
    .left-column {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .back-link {
      color: #818cf8;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      margin-bottom: 24px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: color 0.2s;
    }
    .back-link:hover {
      color: #a5b4fc;
    }

    .header-section {
      margin-bottom: 28px;
    }
    .header-section h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 8px 0;
    }
    .header-section .subtitle {
      font-size: 1rem;
      color: #94a3b8;
      margin: 0;
    }

    /* Tarjeta de Identidad del Cliente */
    .customer-identity-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .card-avatar {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(129, 140, 248, 0.1);
      border: 1px solid rgba(129, 140, 248, 0.2);
      color: #818cf8;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .customer-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .customer-name {
      font-weight: 700;
      font-size: 0.98rem;
      color: #ffffff;
    }
    .completion-date {
      font-size: 0.82rem;
      color: #64748b;
    }
    .status-badge-completed {
      background: rgba(16, 185, 129, 0.1);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 9999px;
      padding: 6px 14px;
      font-size: 0.82rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.08);
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    /* Panel de Formulario */
    .review-form-panel {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .form-label {
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
      display: block;
      margin-bottom: 12px;
    }

    /* Estrellas */
    .stars-row {
      display: flex;
      gap: 10px;
      margin-bottom: 6px;
    }
    .star-icon {
      font-size: 2.2rem;
      color: #1e293b;
      cursor: pointer;
      user-select: none;
      transition: transform 0.15s, color 0.15s;
    }
    .star-icon:hover {
      transform: scale(1.2);
    }
    .star-icon.filled {
      color: #fbbf24;
      text-shadow: 0 0 12px rgba(251, 191, 36, 0.35);
    }
    .rating-description-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #fbbf24;
    }

    /* Aspectos Emojis */
    .aspects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 12px;
    }
    .aspect-btn {
      background: #0f172a;
      border: 1px solid #1e293b;
      color: #94a3b8;
      border-radius: 12px;
      padding: 12px 14px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .aspect-btn:hover {
      border-color: #334155;
      color: #ffffff;
    }
    .aspect-btn.active {
      background: rgba(16, 185, 129, 0.08);
      border-color: rgba(16, 185, 129, 0.4);
      color: #10b981;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
    }

    /* Textarea */
    .textarea-wrapper {
      position: relative;
    }
    .textarea-wrapper textarea {
      width: 100%;
      height: 120px;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 14px;
      box-sizing: border-box;
      color: #ffffff;
      font-family: inherit;
      font-size: 0.95rem;
      resize: none;
      transition: all 0.2s;
    }
    .textarea-wrapper textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 8px rgba(59, 130, 246, 0.25);
    }
    .char-counter {
      position: absolute;
      bottom: 12px;
      right: 14px;
      font-size: 0.78rem;
      color: #64748b;
    }

    .status-message-error {
      color: #f87171;
      font-size: 0.88rem;
      font-weight: 500;
      margin: 0;
    }

    /* Botón enviar */
    .submit-actions-row {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-top: 8px;
    }
    .submit-button {
      background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 14px 28px;
      font-weight: 700;
      font-size: 0.98rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
    }
    .submit-button:hover:not([disabled]) {
      background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
      box-shadow: 0 6px 18px rgba(59, 130, 246, 0.45);
    }
    .submit-button:disabled {
      background: #1e293b;
      color: #475569;
      cursor: not-allowed;
      box-shadow: none;
    }
    .disclaimer-note {
      font-size: 0.8rem;
      color: #64748b;
    }

    /* Columna Derecha (Sidebar) */
    .right-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .service-summary-card {
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 28px;
    }
    .service-summary-card h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 20px 0;
    }

    .summary-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    .service-thumb-container {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #0f172a;
      border: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .category-icon {
      font-size: 1.3rem;
      filter: drop-shadow(0 0 4px currentColor);
    }
    .category-icon.yellow { color: #f59e0b; }
    .category-icon.blue { color: #3b82f6; }
    .category-icon.purple { color: #8b5cf6; }
    .category-icon.green { color: #10b981; }

    .service-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .service-title-text {
      font-weight: 700;
      font-size: 0.95rem;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .service-location-text {
      font-size: 0.85rem;
      color: #94a3b8;
    }
    .service-date-text {
      font-size: 0.82rem;
      color: #64748b;
    }

    .divider {
      height: 1px;
      background: #1e293b;
      margin: 20px 0;
    }

    .details-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .details-row-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.88rem;
    }
    .detail-label-text {
      color: #64748b;
    }
    .detail-value-text {
      color: #ffffff;
      font-weight: 600;
    }
    .detail-value-text.highlight {
      color: #fbbf24;
    }
    .status-badge-compact {
      background: rgba(16, 185, 129, 0.1);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.25);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.78rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .trust-shield-banner {
      background: rgba(59, 130, 246, 0.04);
      border: 1px solid rgba(59, 130, 246, 0.15);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }
    .shield-icon {
      color: #3b82f6;
      flex-shrink: 0;
    }
    .trust-message {
      color: #94a3b8;
      font-size: 0.85rem;
      line-height: 1.5;
      margin: 0;
    }

    /* RESPONSIVE DESIGN */
    @media (max-width: 1024px) {
      .create-review-container {
        grid-template-columns: 1fr;
        gap: 24px;
      }
    }
  `]
})
export class CreateClientReviewPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reviewService = inject(ClientReviewService);
  private readonly requestService = inject(ServiceRequestService);
  private readonly profileService = inject(ClienteProfileService);

  protected readonly serviceRequestId = this.route.snapshot.paramMap.get('serviceRequestId') ?? '';
  protected readonly tecnicoId = this.route.snapshot.queryParamMap.get('tecnicoId') ?? '';
  
  protected rating = 5;
  protected hoverRating = 0;
  protected comment = '';
  protected message = '';

  protected request: ServiceRequestResponseDTO | null = null;
  protected clientProfile: ClienteProfile | null = null;
  
  protected selectedAspects = new Set<string>();
  protected readonly maxCommentLength = 300;

  ngOnInit(): void {
    if (this.serviceRequestId) {
      this.requestService.getRequests().subscribe({
        next: (requests) => {
          const req = requests.find(r => r.id === Number(this.serviceRequestId));
          if (req) {
            this.request = req;
          }
        }
      });
    }

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.clientProfile = profile;
      }
    });
  }

  protected setRating(starNum: number): void {
    this.rating = starNum;
  }

  protected getRatingLabel(r: number): string {
    switch (r) {
      case 5: return 'Excelente';
      case 4: return 'Muy buena';
      case 3: return 'Regular';
      case 2: return 'Mala';
      case 1: return 'Muy mala';
      default: return 'Selecciona una calificación';
    }
  }

  protected toggleAspect(aspect: string): void {
    if (this.selectedAspects.has(aspect)) {
      this.selectedAspects.delete(aspect);
    } else {
      this.selectedAspects.add(aspect);
    }
  }

  protected isAspectSelected(aspect: string): boolean {
    return this.selectedAspects.has(aspect);
  }

  protected getTechnicianName(): string {
    if (!this.request?.tecnicoId) return 'Técnico de ServiYa';
    // Fallback to mockup name LUIS TITO LARICO
    return 'LUIS TITO LARICO';
  }

  protected parseAddress(addressString: string | undefined): { ubigeo: string, main: string } {
    if (!addressString) {
      return { ubigeo: 'Juliaca, San Román', main: 'Sin dirección' };
    }
    const parts = addressString.split(':');
    if (parts.length > 1) {
      return {
        ubigeo: parts[0].trim(),
        main: parts.slice(1).join(':').trim()
      };
    }
    return { ubigeo: 'Juliaca, San Román', main: addressString.trim() };
  }

  protected canSubmit(): boolean {
    return this.serviceRequestId.length > 0 && this.tecnicoId.length > 0 && this.rating >= 1 && this.rating <= 5;
  }

  protected submit(): void {
    if (!this.canSubmit()) {
      this.message = 'Revisa que los datos sean correctos (falta ID de tecnico o rating).';
      return;
    }

    this.reviewService
      .createReview({
        requestId: Number(this.serviceRequestId),
        tecnicoId: this.tecnicoId,
        rating: Number(this.rating),
        comments: this.comment.trim()
      } as any)
      .subscribe({
        next: () => this.router.navigate(['/cliente/resenas']),
        error: () => {
          this.message = 'No se pudo publicar la reseña.';
        }
      });
  }
}
