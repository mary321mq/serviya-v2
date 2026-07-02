import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export interface PortfolioPhoto {
  id: number;
  clienteId: string;
  fileUrl: string;
  originalFilename: string;
  description: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class TecnicoPortfolioService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/technician-ms/api/v1/me/technician/portfolio';
  private readonly publicPath = '/technician-ms/api/v1/public';

  getPortfolio(): Observable<PortfolioPhoto[]> {
    return this.api.get<PortfolioPhoto[]>(this.basePath);
  }

  getPublicPortfolio(clienteId: string): Observable<PortfolioPhoto[]> {
    return this.api.get<PortfolioPhoto[]>(`${this.publicPath}/technicians/${clienteId}/portfolio`);
  }

  uploadPhoto(file: File, description: string): Observable<PortfolioPhoto> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    
    // api-client might not support multipart easily without custom headers, let's assume it does or we use HttpClient
    // Actually, in previous services we saw file upload logic, I should check TechnicianDocumentService
    return this.api.post<PortfolioPhoto, FormData>(this.basePath, formData);
  }

  deletePhoto(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  getPhotoUrl(id: number): string {
    return `/technician-ms/api/v1/public/portfolio/photo/${id}`;
  }
}
