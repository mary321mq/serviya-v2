import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import { TechnicianApplication, TechnicianApplicationPayload } from '../models/technician.model';

@Injectable({ providedIn: 'root' })
export class TechnicianApplicationService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/technician-ms/api/v1/me/technician/application';

  getApplication(): Observable<TechnicianApplication> {
    return this.api.get<TechnicianApplication>(this.basePath);
  }

  saveApplication(payload: TechnicianApplicationPayload): Observable<TechnicianApplication> {
    return this.api.put<TechnicianApplication, TechnicianApplicationPayload>(this.basePath, payload);
  }

  submitApplication(): Observable<void> {
    return this.api.post<void, any>(`${this.basePath}/submit`, {});
  }
}
