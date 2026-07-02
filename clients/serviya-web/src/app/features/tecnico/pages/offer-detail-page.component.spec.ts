import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfferDetailPageComponent } from './offer-detail-page.component';
import { TechnicianOfferService } from '../services/technician-offer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Offer } from '../models/technician.model';

describe('OfferDetailPageComponent', () => {
  let component: OfferDetailPageComponent;
  let fixture: ComponentFixture<OfferDetailPageComponent>;
  let offerServiceMock: jasmine.SpyObj<TechnicianOfferService>;
  let router: Router;

  const mockOffer: Offer = {
    id: 'offer-1',
    batchId: 'batch-1',
    serviceRequestId: 'req-1',
    technicianId: 'tech-1',
    status: 'PENDING',
    attemptNumber: 1,
    createdAt: new Date().toISOString(),
    expiresAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    offerServiceMock = jasmine.createSpyObj('TechnicianOfferService', ['getOffer', 'acceptOffer', 'rejectOffer']);

    offerServiceMock.getOffer.and.returnValue(of(mockOffer));
    offerServiceMock.acceptOffer.and.returnValue(of(void 0));
    offerServiceMock.rejectOffer.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [OfferDetailPageComponent, RouterTestingModule],
      providers: [
        { provide: TechnicianOfferService, useValue: offerServiceMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'offer-1' } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OfferDetailPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.stub();
    fixture.detectChanges();
  });

  it('should accept offer', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert').and.stub();

    component.accept();

    expect(offerServiceMock.acceptOffer).toHaveBeenCalledWith('offer-1');
    expect(router.navigate).toHaveBeenCalledWith(['/tecnico/servicios']);
  });

  it('should reject offer', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert').and.stub();

    component.reject();

    expect(offerServiceMock.rejectOffer).toHaveBeenCalledWith('offer-1');
    expect(router.navigate).toHaveBeenCalledWith(['/tecnico/ofertas']);
  });
});
