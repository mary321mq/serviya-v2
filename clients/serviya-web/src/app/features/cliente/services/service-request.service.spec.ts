import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import { CreateServiceRequestDTO } from './public-catalog.service';
import { ServiceRequestService } from './service-request.service';

describe('ServiceRequestService', () => {
  let api: jasmine.SpyObj<ApiClientService>;
  let service: ServiceRequestService;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiClientService>('ApiClientService', ['get', 'post']);
    api.get.and.returnValue(of([]));
    api.post.and.returnValue(of({}));

    TestBed.configureTestingModule({
      providers: [{ provide: ApiClientService, useValue: api }]
    });
    service = TestBed.inject(ServiceRequestService);
  });

  it('creates requests through the service-request-ms Gateway route', () => {
    const payload: CreateServiceRequestDTO = {
      catalogServiceId: 1,
      direccionFisica: 'Av. 1',
      latitud: -12,
      longitud: -77,
      cantidad: 1
    };

    service.createRequest(payload).subscribe();

    expect(api.post).toHaveBeenCalledWith('/service-request-ms/api/v1/solicitudes', payload);
  });
});
