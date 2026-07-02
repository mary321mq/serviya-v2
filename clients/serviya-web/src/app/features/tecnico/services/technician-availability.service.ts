import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import { TechnicianAvailability, TechnicianAvailabilityPayload } from '../models/technician.model';

@Injectable({ providedIn: 'root' })
export class TechnicianAvailabilityService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/technician-ms/api/v1/me/technician/availability';

  getAvailability(): Observable<TechnicianAvailability[]> {
    return this.api.get<TechnicianAvailability[]>(this.basePath);
  }

  saveAvailability(payload: TechnicianAvailabilityPayload[]): Observable<TechnicianAvailability[]> {
    return this.api.put<TechnicianAvailability[], TechnicianAvailabilityPayload[]>(this.basePath, payload);
  }
}
