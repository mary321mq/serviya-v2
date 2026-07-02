import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import { TechnicianDocument } from '../models/technician.model';

@Injectable({ providedIn: 'root' })
export class TechnicianDocumentService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/technician-ms/api/v1/me/technician/documents';

  getDocuments(): Observable<TechnicianDocument[]> {
    return this.api.get<TechnicianDocument[]>(this.basePath);
  }

  uploadDocument(file: File, documentType: string): Observable<TechnicianDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    // Assuming ApiClientService supports FormData or we just pass it as body
    // If not, ApiClientService might need multipart support. 
    // We will use standard post with formData
    return this.api.post<TechnicianDocument, FormData>(this.basePath, formData);
  }

  deleteDocument(documentId: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${documentId}`);
  }
}
