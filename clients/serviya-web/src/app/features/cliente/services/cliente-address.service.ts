import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ApiClientService } from '../../../core/http/api-client.service';
import { ClienteAddress, ClienteAddressPayload } from '../models/cliente-address.model';

@Injectable({ providedIn: 'root' })
export class ClienteAddressService {
  private readonly api = inject(ApiClientService);

  getAddresses(): Observable<ClienteAddress[]> {
    return this.api.get<any>('/user-ms/api/v1/me/profile').pipe(
      map(profile => {
        if (profile && profile.direccion && profile.region) {
          return [{
            publicId: 'profile-address',
            department: profile.region,
            province: profile.provincia,
            district: profile.distrito,
            addressLine: profile.direccion,
            reference: profile.referencia,
            primary: true,
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }];
        }
        return [];
      })
    );
  }

  createAddress(payload: ClienteAddressPayload): Observable<ClienteAddress> {
    return this.api.get<any>('/user-ms/api/v1/me/profile').pipe(
      switchMap(profile => {
        profile.region = payload.department;
        profile.provincia = payload.province;
        profile.distrito = payload.district;
        profile.direccion = payload.addressLine;
        profile.referencia = payload.reference;
        
        return this.api.put<any>('/user-ms/api/v1/me/profile', profile).pipe(
          map(updatedProfile => ({
            publicId: 'profile-address',
            department: updatedProfile.region,
            province: updatedProfile.provincia,
            district: updatedProfile.distrito,
            addressLine: updatedProfile.direccion,
            reference: updatedProfile.referencia,
            primary: true,
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))
        );
      })
    );
  }

  updateAddress(addressId: string, payload: ClienteAddressPayload): Observable<ClienteAddress> {
    return this.api.put<ClienteAddress, ClienteAddressPayload>(
      `/user-ms/api/v1/me/addresses/${addressId}`,
      payload
    );
  }

  deleteAddress(addressId: string): Observable<void> {
    return this.api.delete<void>(`/user-ms/api/v1/me/addresses/${addressId}`);
  }

  setPrimary(addressId: string): Observable<ClienteAddress> {
    return this.api.put<ClienteAddress, Record<string, never>>(
      `/user-ms/api/v1/me/addresses/${addressId}/primary`,
      {}
    );
  }
}
