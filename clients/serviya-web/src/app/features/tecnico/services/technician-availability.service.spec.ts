import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TechnicianAvailabilityService } from './technician-availability.service';
import { ApiClientService } from '../../../core/http/api-client.service';
import { TechnicianAvailabilityPayload } from '../models/technician.model';
import { SERVIYA_APP_CONFIG } from '../../../core/config/app-config';

describe('TechnicianAvailabilityService', () => {
  let service: TechnicianAvailabilityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiClientService,
        { provide: SERVIYA_APP_CONFIG, useValue: { apiBaseUrl: '' } }
      ]
    });
    service = TestBed.inject(TechnicianAvailabilityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch availability', () => {
    service.getAvailability().subscribe(res => {
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne('/technician-ms/api/v1/me/technician/availability');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, dayOfWeek: 1, startTime: '08:00', endTime: '18:00', active: true }]);
  });

  it('should save availability', () => {
    const payload: TechnicianAvailabilityPayload[] = [
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', active: true }
    ];

    service.saveAvailability(payload).subscribe(res => {
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne('/technician-ms/api/v1/me/technician/availability');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush([{ id: 2, ...payload[0] }]);
  });
});
