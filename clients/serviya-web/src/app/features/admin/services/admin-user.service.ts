import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export interface AdminUserProfile {
  publicId: string;
  identitySubject: string;
  firstName: string;
  lastName: string;
  emailContact: string;
  phone?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private api = inject(ApiClientService);

  getAllClients(): Observable<AdminUserProfile[]> {
    return this.api.get<AdminUserProfile[]>('/user-ms/api/v1/admin/clients');
  }

  createClient(payload: any): Observable<AdminUserProfile> {
    return this.api.post<AdminUserProfile>('/user-ms/api/v1/admin/clients', payload);
  }

  updateClient(id: string, payload: Partial<AdminUserProfile>): Observable<AdminUserProfile> {
    return this.api.put<AdminUserProfile>(`/user-ms/api/v1/admin/clients/${id}`, payload);
  }

  deleteClient(id: string): Observable<void> {
    return this.api.delete<void>(`/user-ms/api/v1/admin/clients/${id}`);
  }
}
