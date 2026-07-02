import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import { ServiceCatalogItem, ServiceCategory } from '../models/service-catalog.model';

@Injectable({ providedIn: 'root' })
export class ServiceCatalogService {
  private readonly api = inject(ApiClientService);

  getCategories(): Observable<ServiceCategory[]> {
    return this.api.get<ServiceCategory[]>('/service-request-ms/api/v1/catalog/categories');
  }

  getServices(): Observable<ServiceCatalogItem[]> {
    return this.api.get<ServiceCatalogItem[]>('/service-request-ms/api/v1/catalog/services');
  }

  getService(serviceCode: string): Observable<ServiceCatalogItem> {
    return this.api.get<ServiceCatalogItem>(`/service-request-ms/api/v1/catalog/services/${serviceCode}`);
  }
}
