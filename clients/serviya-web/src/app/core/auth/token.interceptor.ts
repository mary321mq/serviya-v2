import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { SERVIYA_APP_CONFIG } from '../config/app-config';
import { AuthService } from './auth.service';

export const tokenInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const config = inject(SERVIYA_APP_CONFIG);
  const router = inject(Router);

  if (!request.url.startsWith(config.apiBaseUrl)) {
    return next(request);
  }

  return from(auth.getValidToken()).pipe(
    switchMap((token) => {
      const securedRequest = token
        ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : request;

      return next(securedRequest).pipe(
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              void auth.login();
            } else if (error.status === 403 && !isRecoverableFeatureRequest(request.url)) {
              void router.navigate(['/unauthorized']);
            }
          }
          return throwError(() => error);
        })
      );
    })
  );
};

function isRecoverableFeatureRequest(url: string): boolean {
  return url.includes('/technician-ms/api/v1/me/technician/documents');
}
