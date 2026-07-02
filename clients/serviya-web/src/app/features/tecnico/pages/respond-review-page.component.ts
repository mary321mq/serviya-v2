import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TechnicianReview } from '../models/technician-review.model';
import { TechnicianReviewService } from '../services/technician-review.service';

@Component({
  selector: 'app-respond-review-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page-header">
      <div>
        <a routerLink="/tecnico/resenas" class="eyebrow">&lt; Volver</a>
        <h1>Responder resena</h1>
      </div>
    </section>

    @if (review) {
      <section class="detail-panel">
        <strong>{{ review.rating }}/5 - Servicio evaluado</strong>
        <p>{{ review.comment || 'Sin comentario.' }}</p>
      </section>
    }

    <form class="page-panel" (ngSubmit)="submit()" #resForm="ngForm">
      <label class="full-span">
        Respuesta
        <textarea
          name="responseText"
          [(ngModel)]="responseText"
          required
          maxlength="1000"
          placeholder="Escribe una respuesta profesional"
        ></textarea>
      </label>

      @if (message) {
        <p class="status-message">{{ message }}</p>
      }
      <button class="primary-button" type="submit" [disabled]="resForm.invalid || !canSubmit()">Responder</button>
    </form>
  `
})
export class RespondReviewPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reviewService = inject(TechnicianReviewService);

  protected readonly reviewId = this.route.snapshot.paramMap.get('id') ?? '';
  protected review: TechnicianReview | null = null;
  protected responseText = '';
  protected message = '';

  ngOnInit(): void {
    if (!this.reviewId) {
      return;
    }

    this.reviewService.getReview(this.reviewId).subscribe((review) => {
      this.review = review;
      this.responseText = review.response?.responseText ?? '';
    });
  }

  protected canSubmit(): boolean {
    return this.reviewId.length > 0 && this.responseText.trim().length > 0 && !this.review?.response;
  }

  protected submit(): void {
    if (!this.canSubmit()) {
      this.message = 'Escribe una respuesta antes de publicar.';
      return;
    }

    this.reviewService
      .respond(this.reviewId, { responseText: this.responseText.trim() })
      .subscribe({
        next: () => this.router.navigate(['/tecnico/resenas']),
        error: () => {
          this.message = 'No se pudo publicar la respuesta.';
        }
      });
  }
}
