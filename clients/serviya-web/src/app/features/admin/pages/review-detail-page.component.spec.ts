import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AdminReviewService } from '../services/admin-review.service';
import { AdminReviewDetailPageComponent } from './review-detail-page.component';

describe('AdminReviewDetailPageComponent', () => {
  let fixture: ComponentFixture<AdminReviewDetailPageComponent>;
  let reviewService: jasmine.SpyObj<AdminReviewService>;

  beforeEach(async () => {
    reviewService = jasmine.createSpyObj<AdminReviewService>('AdminReviewService', [
      'getReview',
      'hide',
      'restore'
    ]);
    reviewService.getReview.and.returnValue(of(review('PUBLISHED')));
    reviewService.hide.and.returnValue(of(review('HIDDEN')));
    reviewService.restore.and.returnValue(of(review('PUBLISHED')));

    await TestBed.configureTestingModule({
      imports: [AdminReviewDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: AdminReviewService, useValue: reviewService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'review-1' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminReviewDetailPageComponent);
    fixture.detectChanges();
  });

  it('hides a published review', () => {
    const component = fixture.componentInstance as unknown as {
      reason: string;
      moderate: () => void;
    };

    component.reason = 'Contenido inapropiado';
    component.moderate();

    expect(reviewService.hide).toHaveBeenCalledWith('review-1', {
      reason: 'Contenido inapropiado'
    });
  });

  it('restores a hidden review', () => {
    const component = fixture.componentInstance as unknown as {
      review: ReturnType<typeof review>;
      reason: string;
      moderate: () => void;
    };

    component.review = review('HIDDEN');
    component.reason = 'Apelacion aceptada';
    component.moderate();

    expect(reviewService.restore).toHaveBeenCalledWith('review-1', {
      reason: 'Apelacion aceptada'
    });
  });

  function review(status: 'PUBLISHED' | 'HIDDEN') {
    return {
      publicId: 'review-1',
      serviceRequestId: 'service-1',
      technicianId: 'tech-1',
      rating: 4,
      comment: 'Buen servicio',
      status,
      createdAt: '',
      updatedAt: ''
    };
  }
});
