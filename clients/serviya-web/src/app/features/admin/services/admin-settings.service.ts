import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export interface AppConfigSettings {
  id: number;
  comisionPorcentaje: number;
  igvPorcentaje: number;
  yapeEnabled: boolean;
  culqiEnabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminSettingsService {
  private readonly api = inject(ApiClientService);

  getSettings(): Observable<AppConfigSettings> {
    return this.api.get<AppConfigSettings>('/payment-ms/api/v1/admin/configuracion');
  }

  updateSettings(settings: Partial<AppConfigSettings>): Observable<AppConfigSettings> {
    return this.api.put<AppConfigSettings, Partial<AppConfigSettings>>('/payment-ms/api/v1/admin/configuracion', settings);
  }
}
