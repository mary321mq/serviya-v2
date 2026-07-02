import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { MonitorEventsPageComponent } from './monitor-events-page.component';
import { AdminMonitorService } from '../services/admin-monitor.service';
import { FormsModule } from '@angular/forms';

describe('MonitorEventsPageComponent', () => {
  let component: MonitorEventsPageComponent;
  let fixture: ComponentFixture<MonitorEventsPageComponent>;

  const mockMonitorService = {
    getEventsByCorrelationId: jasmine.createSpy('getEventsByCorrelationId').and.returnValue(of([{
      id: 1, correlationId: 'REQ-123', status: 'READ', type: 'test.event', eventId: 'EVT-1'
    }])),
    getFailedEvents: jasmine.createSpy('getFailedEvents').and.returnValue(of([{
      id: 2, correlationId: 'REQ-456', status: 'FAILED', type: 'failed.event', eventId: 'EVT-2'
    }]))
  };

  const mockActivatedRoute = {
    queryParams: of({ correlationId: 'REQ-123' })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorEventsPageComponent, FormsModule],
      providers: [
        provideRouter([]),
        { provide: AdminMonitorService, useValue: mockMonitorService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MonitorEventsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load events by query param', () => {
    expect(component).toBeTruthy();
    expect(mockMonitorService.getEventsByCorrelationId).toHaveBeenCalledWith('REQ-123');
    expect(component.events.length).toBe(1);
    expect(component.events[0].eventId).toBe('EVT-1');
  });

  it('should load failed events', () => {
    component.loadFailed();
    expect(mockMonitorService.getFailedEvents).toHaveBeenCalled();
    expect(component.events.length).toBe(1);
    expect(component.events[0].eventId).toBe('EVT-2');
  });
});
