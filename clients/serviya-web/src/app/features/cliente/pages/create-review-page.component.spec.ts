import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ClientReviewService } from '../services/client-review.service';
import { CreateClientReviewPageComponent } from './create-review-page.component';

describe('CreateClientReviewPageComponent', () => {
  let fixture: ComponentFixture<CreateClientReviewPageComponent>;
  let reviewService: jasmine.SpyObj<ClientReviewService>;

  beforeEach(async () => {
    reviewService = jasmine.createSpyObj<ClientReviewService>('ClientReviewService', [
      'createReview'
    ]);
    reviewService.createReview.and.returnValue(
      of({
        publicId: 'review-1',
        serviceRequestId: 'service-1',
        technicianId: 'tech-1',
        rating: 5,
        comment: 'Buen servicio',
        status: 'PUBLISHED',
        createdAt: '',
        updatedAt: ''
      })
    );

    await TestBed.configureTestingModule({
      imports: [CreateClientReviewPageComponent],
      providers: [
        provideRouter([]),
        { provide: ClientReviewService, useValue: reviewService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'serviceRequestId' ? '123' : null)
              },
              queryParamMap: {
                get: (key: string) => (key === 'tecnicoId' ? 'tech-1' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateClientReviewPageComponent);
    fixture.detectChanges();
  });

  it('validates rating between 1 and 5', () => {
    const component = fixture.componentInstance as unknown as {
      rating: number;
      canSubmit: () => boolean;
      submit: () => void;
    };

    component.rating = 0;
    expect(component.canSubmit()).toBeFalse();
    component.submit();
    expect(reviewService.createReview).not.toHaveBeenCalled();

    component.rating = 5;
    expect(component.canSubmit()).toBeTrue();
  });

  it('creates a client review', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const component = fixture.componentInstance as unknown as {
      rating: number;
      comment: string;
      submit: () => void;
    };

    component.rating = 4;
    component.comment = 'Trabajo correcto';
    component.submit();

    expect(reviewService.createReview).toHaveBeenCalledWith({
      requestId: 123,
      tecnicoId: 'tech-1',
      rating: 4,
      comments: 'Trabajo correcto'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/cliente/resenas']);
  });
});
