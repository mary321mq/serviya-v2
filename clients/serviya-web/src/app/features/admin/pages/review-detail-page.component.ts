import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EstadoTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { AdminReview } from '../models/admin-review.model';
import { AdminReviewService } from '../services/admin-review.service';

@Component({
  selector: 'app-admin-review-detail-page',
  standalone: true,
  imports: [FormsModule, RouterLink, EstadoTextoPipe],
  template: `
    <section class="page-header">
      <div>
        <a routerLink="/admin/resenas" class="eyebrow">&lt; Volver</a>
        <h1>Detalle de resena</h1>
      </div>
    </section>

    @if (review) {
      <section class="detail-panel">
        <p class="eyebrow">Estado {{ review.status | estadoTexto }}</p>
        <h2>{{ review.rating }}/5</h2>
        <p>{{ review.comment || 'Sin comentario.' }}</p>
        <p>Servicio evaluado</p>
        <p>Tecnico revisado</p>
      </section>

      <form class="page-panel" (ngSubmit)="moderate()">
        <label class="full-span">
          Razon
          <textarea
            name="reason"
            [(ngModel)]="reason"
            maxlength="1000"
            placeholder="Motivo de la moderacion"
          ></textarea>
        </label>

        @if (message) {
          <p class="status-message">{{ message }}</p>
        }

        <div class="button-row">
          @if (review.status === 'PUBLISHED') {
            <button class="primary-button" type="submit">Ocultar</button>
          } @else {
            <button class="primary-button" type="submit">Restaurar</button>
          }
        </div>
      </form>
    } @else {
      <p class="empty-state">Cargando resena.</p>
    }
  `
})
export class AdminReviewDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly reviewService = inject(AdminReviewService);

  protected readonly reviewId = this.route.snapshot.paramMap.get('id') ?? '';
  protected review: AdminReview | null = null;
  protected reason = '';
  protected message = '';

  ngOnInit(): void {
    this.load();
  }

  protected moderate(): void {
    if (!this.review) {
      return;
    }

    const payload = { reason: this.reason.trim() };
    const request =
      this.review.status === 'PUBLISHED'
        ? this.reviewService.hide(this.review.publicId, payload)
        : this.reviewService.restore(this.review.publicId, payload);

    request.subscribe({
      next: (review) => {
        this.review = review;
        this.reason = '';
        this.message = 'Moderacion registrada.';
      },
      error: () => {
        this.message = 'No se pudo moderar la resena.';
      }
    });
  }

  private load(): void {
    if (!this.reviewId) {
      return;
    }

    this.reviewService.getReview(this.reviewId).subscribe((review) => {
      this.review = review;
    });
  }
}
