import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EstadoTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { TechnicianReview } from '../models/technician-review.model';
import { TechnicianReviewService } from '../services/technician-review.service';

@Component({
  selector: 'app-technician-reviews-page',
  standalone: true,
  imports: [RouterLink, EstadoTextoPipe],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Tecnico</p>
        <h1>Resenas recibidas</h1>
      </div>
    </section>

    <section class="list">
      @for (review of reviews; track review.publicId) {
        <article class="list-item">
          <div>
            <strong>{{ review.rating }}/5 - Servicio evaluado</strong>
            <p>{{ review.comment || 'Sin comentario.' }}</p>
            @if (review.response) {
              <p>Respuesta publicada: {{ review.response.responseText }}</p>
            }
          </div>
          <div class="button-row">
            <span class="pill">{{ review.status | estadoTexto }}</span>
            @if (!review.response) {
              <a class="primary-link" [routerLink]="['/tecnico/resenas', review.publicId, 'responder']">
                Responder
              </a>
            }
          </div>
        </article>
      } @empty {
        <p class="empty-state">Aun no tienes resenas recibidas.</p>
      }
    </section>
  `
})
export class TechnicianReviewsPageComponent implements OnInit {
  private readonly reviewService = inject(TechnicianReviewService);

  protected reviews: TechnicianReview[] = [];

  ngOnInit(): void {
    this.reviewService.getReviews().subscribe((reviews) => {
      this.reviews = reviews;
    });
  }
}
