import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TechnicianServiceRequest } from '../models/technician.model';

@Injectable({
  providedIn: 'root'
})
export class TechnicianServiceRequestService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/service-request-ms/api/v1/solicitudes';

  startService(requestId: string): Observable<TechnicianServiceRequest> {
    return this.http.post<TechnicianServiceRequest>(`${this.apiUrl}/${requestId}/aceptar`, {});
  }

  completeService(requestId: string): Observable<TechnicianServiceRequest> {
    return this.http.post<TechnicianServiceRequest>(`${this.apiUrl}/${requestId}/terminar`, {});
  }
}
