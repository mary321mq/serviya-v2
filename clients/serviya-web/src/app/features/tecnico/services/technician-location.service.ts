import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import { TechnicianLocation, TechnicianLocationPayload } from '../models/technician.model';

@Injectable({ providedIn: 'root' })
export class TechnicianLocationService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/technician-ms/api/v1/me/technician/location';

  getLocation(): Observable<TechnicianLocation> {
    return this.api.get<TechnicianLocation>(this.basePath);
  }

  saveLocation(payload: TechnicianLocationPayload): Observable<TechnicianLocation> {
    return this.api.put<TechnicianLocation, TechnicianLocationPayload>(this.basePath, payload);
  }
}
