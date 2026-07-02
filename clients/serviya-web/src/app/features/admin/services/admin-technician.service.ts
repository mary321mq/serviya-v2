import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export interface TechnicianApplication {
  id: number;
  clienteId: string;
  estado: string;
  fullName: string;
  phone: string;
  addressLine: string;
  department: string;
  province: string;
  district: string;
  hasStore: boolean;
  storeName: string;
  categorias: string;
  requestedService?: string;
  experience?: string;
  availability?: string;
  preferredSchedule?: string;
  evaluatorNotes?: string;
  evaluatorName?: string;
  evaluatorRole?: string;
  evaluatedAt?: string;
}

export interface TechnicianDocument {
  id: string;
  clienteId: string;
  documentType: string;
  originalFilename: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class AdminTechnicianService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/technician-ms/api/v1/admin/technicians/applications';
  private readonly docsBasePath = '/technician-ms/api/v1/admin/technician-documents';

  getApplications(): Observable<TechnicianApplication[]> {
    return this.api.get<TechnicianApplication[]>(`${this.basePath}/pending`);
  }

  getAllApplications(): Observable<TechnicianApplication[]> {
    return this.api.get<TechnicianApplication[]>(this.basePath);
  }

  getApplicationById(id: string): Observable<TechnicianApplication> {
    return this.api.get<TechnicianApplication>(`${this.basePath}/${id}`);
  }

  getTechnicianDocuments(clienteId: string): Observable<TechnicianDocument[]> {
    return this.api.get<TechnicianDocument[]>(`${this.docsBasePath}/${clienteId}`);
  }

  getDocumentFile(documentId: string): Observable<Blob> {
    return this.api.getBlob(`${this.docsBasePath}/${documentId}/file`);
  }

  approveApplication(id: string, notas: string = ''): Observable<void> {
    return this.api.post<void, any>(`${this.basePath}/${id}/approve`, { notas });
  }

  rejectApplication(id: string, reason: string): Observable<void> {
    return this.api.post<void, any>(`${this.basePath}/${id}/reject`, { notas: reason });
  }

  deleteApplication(id: string | number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
