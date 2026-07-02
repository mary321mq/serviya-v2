import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { SERVIYA_APP_CONFIG } from '../config/app-config';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(SERVIYA_APP_CONFIG);

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.toGatewayUrl(path));
  }

  getBlob(path: string): Observable<Blob> {
    return this.http.get(this.toGatewayUrl(path), { responseType: 'blob' });
  }

  post<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http.post<T>(this.toGatewayUrl(path), body);
  }

  put<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http.put<T>(this.toGatewayUrl(path), body);
  }

  patch<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http.patch<T>(this.toGatewayUrl(path), body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.toGatewayUrl(path));
  }

  private toGatewayUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.config.apiBaseUrl}${normalizedPath}`;
  }
}
