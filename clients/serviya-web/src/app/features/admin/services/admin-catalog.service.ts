import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export interface ServiceCategory {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono?: string;
  activo: boolean;
}

export type TipoCobro = 'FIJO' | 'COTIZACION' | 'POR_UNIDAD' | 'POR_METRO';
export type ModalidadEvaluacion = 'REMOTA' | 'PRESENCIAL';

export interface ServiceCatalogItem {
  id?: number;
  codigo: string;
  categoriaId?: number;
  categoryCode: string;
  nombre: string;
  descripcion: string;
  precioBaseReferencial?: number;
  requiereFoto?: boolean;
  tipoCobro?: TipoCobro;
  modalidadEvaluacion?: ModalidadEvaluacion;
  imageUrl?: string;
  duracionEstimada?: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminCatalogService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/service-request-ms/api/v1/admin/catalogs';

  getCategories(): Observable<ServiceCategory[]> {
    return this.api.get<ServiceCategory[]>(`${this.basePath}/categories`);
  }

  createCategory(payload: any): Observable<ServiceCategory> {
    return this.api.post<ServiceCategory, any>(`${this.basePath}/categories`, payload);
  }

  updateCategory(code: string, payload: any): Observable<ServiceCategory> {
    return this.api.put<ServiceCategory, any>(`${this.basePath}/categories/${code}`, payload);
  }

  activateCategory(code: string): Observable<void> {
    return this.api.patch<void, any>(`${this.basePath}/categories/${code}/activate`, {});
  }

  deactivateCategory(code: string): Observable<void> {
    return this.api.patch<void, any>(`${this.basePath}/categories/${code}/deactivate`, {});
  }

  getServices(): Observable<ServiceCatalogItem[]> {
    return this.api.get<ServiceCatalogItem[]>(`${this.basePath}/services`);
  }

  createService(payload: any): Observable<ServiceCatalogItem> {
    return this.api.post<ServiceCatalogItem, any>(`${this.basePath}/services`, payload);
  }

  updateService(code: string, payload: any): Observable<ServiceCatalogItem> {
    return this.api.put<ServiceCatalogItem, any>(`${this.basePath}/services/${code}`, payload);
  }

  activateService(code: string): Observable<void> {
    return this.api.patch<void, any>(`${this.basePath}/services/${code}/activate`, {});
  }

  deactivateService(code: string): Observable<void> {
    return this.api.patch<void, any>(`${this.basePath}/services/${code}/deactivate`, {});
  }

  deleteCategory(code: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/categories/${code}`);
  }

  deleteService(code: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/services/${code}`);
  }
}
