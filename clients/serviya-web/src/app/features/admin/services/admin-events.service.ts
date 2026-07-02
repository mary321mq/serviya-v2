import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export interface SystemEvent {
  id: string;
  type: string;
  aggregateId: string;
  payload: any;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminEventsService {
  private readonly api = inject(ApiClientService);

  getEvents(): Observable<SystemEvent[]> {
    // Currently, there's no endpoint for this in the microservices. We stub it out for the UI.
    return of([
      {
        id: '1',
        type: 'technician.application.approved.v1',
        aggregateId: 'tech-1',
        payload: { status: 'APPROVED' },
        createdAt: new Date().toISOString()
      }
    ]);
  }
}
