import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ServiceDetailPageComponent } from './service-detail-page.component';
import { TechnicianNotificationService } from '../services/technician-notification.service';
import { TechnicianServiceRequestService } from '../services/technician-service-request.service';
import { ActivatedRoute } from '@angular/router';

describe('ServiceDetailPageComponent', () => {
  let component: ServiceDetailPageComponent;
  let fixture: ComponentFixture<ServiceDetailPageComponent>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => 'REQ-123'
      }
    }
  };

  const mockNotificationService = {
    getTimeline: jasmine.createSpy('getTimeline').and.returnValue(of([{
      id: 1,
      correlationId: 'REQ-123',
      type: 'service-request.assigned.v1',
      createdAt: '2026-06-22T00:00:00Z'
    }]))
  };

  const mockServiceRequestService = {
    startService: jasmine.createSpy('startService').and.returnValue(of({})),
    completeService: jasmine.createSpy('completeService').and.returnValue(of({}))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: TechnicianNotificationService, useValue: mockNotificationService },
        { provide: TechnicianServiceRequestService, useValue: mockServiceRequestService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and show ASSIGNED status', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('ASSIGNED');
    expect(text).toContain('Iniciar Servicio');
  });

  it('iniciar servicio', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.startService();
    expect(mockServiceRequestService.startService).toHaveBeenCalledWith('REQ-123');
    expect(component.status).toBe('IN_PROGRESS');
  });

  it('completar servicio', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.serviceId = 'REQ-123';
    component.completeService();
    expect(mockServiceRequestService.completeService).toHaveBeenCalledWith('REQ-123');
  });
});
