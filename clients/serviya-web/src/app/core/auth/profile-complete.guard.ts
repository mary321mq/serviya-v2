import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ClienteProfileService } from '../../features/cliente/services/cliente-profile.service';

export const profileCompleteGuard: CanActivateFn = () => {
  const router = inject(Router);
  const profileService = inject(ClienteProfileService);

  return profileService.getProfile().pipe(
    map(profile => {
      if (profile && profile.telefono && profile.direccion) {
        return true;
      } else {
        return router.createUrlTree(['/onboarding']);
      }
    }),
    catchError(() => {
      return of(router.createUrlTree(['/onboarding']));
    })
  );
};
