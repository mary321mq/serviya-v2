import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EstadoTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { AdminReview } from '../models/admin-review.model';
import { AdminReviewService } from '../services/admin-review.service';

@Component({
  selector: 'app-admin-reviews-page',
  standalone: true,
  imports: [RouterLink, EstadoTextoPipe],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Admin</p>
        <h1>Moderacion de resenas</h1>
      </div>
    </section>

    <section class="list">
      @for (review of reviews; track review.publicId) {
        <a class="list-item" [routerLink]="['/admin/resenas', review.publicId]">
          <div>
            <strong>{{ review.rating }}/5 - Servicio evaluado</strong>
            <p>{{ review.comment || 'Sin comentario.' }}</p>
          </div>
          <span class="pill">{{ review.status | estadoTexto }}</span>
        </a>
      } @empty {
        <p class="empty-state">No hay resenas para moderar.</p>
      }
    </section>
  `
})
export class AdminReviewsPageComponent implements OnInit {
  private readonly reviewService = inject(AdminReviewService);

  protected reviews: AdminReview[] = [];

  ngOnInit(): void {
    this.reviewService.getReviews().subscribe((reviews) => {
      this.reviews = reviews;
    });
  }
}
