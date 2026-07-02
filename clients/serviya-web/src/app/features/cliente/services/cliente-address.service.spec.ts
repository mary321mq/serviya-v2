import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import { ClienteAddressPayload } from '../models/cliente-address.model';
import { ClienteAddressService } from './cliente-address.service';

describe('ClienteAddressService', () => {
  let api: jasmine.SpyObj<ApiClientService>;
  let service: ClienteAddressService;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiClientService>('ApiClientService', ['get', 'post', 'put', 'delete']);
    api.get.and.returnValue(of([]));
    api.post.and.returnValue(of({}));
    api.put.and.returnValue(of({}));
    api.delete.and.returnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [{ provide: ApiClientService, useValue: api }]
    });
    service = TestBed.inject(ClienteAddressService);
  });

  it('uses Gateway user-ms paths', () => {
    const payload: ClienteAddressPayload = {
      department: 'Lima',
      province: 'Lima',
      district: 'Miraflores',
      addressLine: 'Av. 1',
      reference: null,
      primary: true
    };

    service.createAddress(payload).subscribe();

    expect(api.get).toHaveBeenCalledWith('/user-ms/api/v1/me/profile');
    expect(api.put).toHaveBeenCalledWith('/user-ms/api/v1/me/profile', jasmine.objectContaining({
      region: 'Lima',
      provincia: 'Lima',
      distrito: 'Miraflores',
      direccion: 'Av. 1',
      referencia: null
    }));
  });
});
