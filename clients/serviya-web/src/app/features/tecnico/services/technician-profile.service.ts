import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import { TechnicianProfile, TechnicianSpecialty, TechnicianSpecialtyPayload } from '../models/technician.model';

@Injectable({ providedIn: 'root' })
export class TechnicianProfileService {
  private readonly api = inject(ApiClientService);
  private readonly profileBasePath = '/technician-ms/api/v1/me/technician/profile';
  private readonly specialtyBasePath = '/technician-ms/api/v1/me/technician/specialties';

  getProfile(): Observable<TechnicianProfile> {
    return this.api.get<TechnicianProfile>(this.profileBasePath);
  }

  updateAvailability(payload: { estado: string }): Observable<void> {
    return this.api.post<void, any>('/technician-ms/api/v1/me/technician/availability', payload);
  }

  updateLocation(payload: { latitud: number, longitud: number }): Observable<void> {
    return this.api.post<void, any>('/technician-ms/api/v1/me/technician/location', payload);
  }

  getSpecialties(): Observable<TechnicianSpecialty[]> {
    return this.api.get<TechnicianSpecialty[]>(this.specialtyBasePath);
  }

  addSpecialty(payload: TechnicianSpecialtyPayload): Observable<TechnicianSpecialty> {
    return this.api.post<TechnicianSpecialty, TechnicianSpecialtyPayload>(this.specialtyBasePath, payload);
  }

  updateSpecialty(id: number, payload: TechnicianSpecialtyPayload): Observable<TechnicianSpecialty> {
    return this.api.put<TechnicianSpecialty, TechnicianSpecialtyPayload>(`${this.specialtyBasePath}/${id}`, payload);
  }

  deleteSpecialty(id: number): Observable<void> {
    return this.api.delete<void>(`${this.specialtyBasePath}/${id}`);
  }
}
