import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import { ClientePreferences, ClienteProfile, ClienteProfilePayload } from '../models/cliente-profile.model';

@Injectable({ providedIn: 'root' })
export class ClienteProfileService {
  private readonly api = inject(ApiClientService);

  getProfile(): Observable<ClienteProfile> {
    return this.api.get<ClienteProfile>('/user-ms/api/v1/me/profile');
  }

  saveProfile(payload: ClienteProfilePayload): Observable<ClienteProfile> {
    return this.api.put<ClienteProfile, ClienteProfilePayload>('/user-ms/api/v1/me/profile', payload);
  }

  uploadAvatar(file: File): Observable<ClienteProfile> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<ClienteProfile, FormData>('/user-ms/api/v1/me/profile/avatar', formData);
  }
}
