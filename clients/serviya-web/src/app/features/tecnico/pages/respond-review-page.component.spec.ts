import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { TechnicianReviewService } from '../services/technician-review.service';
import { RespondReviewPageComponent } from './respond-review-page.component';

describe('RespondReviewPageComponent', () => {
  let fixture: ComponentFixture<RespondReviewPageComponent>;
  let reviewService: jasmine.SpyObj<TechnicianReviewService>;

  beforeEach(async () => {
    reviewService = jasmine.createSpyObj<TechnicianReviewService>('TechnicianReviewService', [
      'getReview',
      'respond'
    ]);
    reviewService.getReview.and.returnValue(
      of({
        publicId: 'review-1',
        serviceRequestId: 'service-1',
        technicianId: 'tech-1',
        rating: 5,
        comment: 'Excelente',
        status: 'PUBLISHED',
        createdAt: '',
        updatedAt: '',
        response: null
      })
    );
    reviewService.respond.and.returnValue(
      of({
        id: 1,
        responseText: 'Gracias por la confianza',
        status: 'PUBLISHED',
        createdAt: '',
        updatedAt: ''
      })
    );

    await TestBed.configureTestingModule({
      imports: [RespondReviewPageComponent],
      providers: [
        provideRouter([]),
        { provide: TechnicianReviewService, useValue: reviewService },
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

    fixture = TestBed.createComponent(RespondReviewPageComponent);
    fixture.detectChanges();
  });

  it('responds to a technician review', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const component = fixture.componentInstance as unknown as {
      responseText: string;
      submit: () => void;
    };

    component.responseText = 'Gracias por elegirnos';
    component.submit();

    expect(reviewService.respond).toHaveBeenCalledWith('review-1', {
      responseText: 'Gracias por elegirnos'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/tecnico/resenas']);
  });
});
