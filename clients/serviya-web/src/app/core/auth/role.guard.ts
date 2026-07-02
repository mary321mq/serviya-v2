import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AppRole, AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const expectedRoles = (route.data['roles'] ?? []) as readonly AppRole[];

  if (!auth.isAuthenticated()) {
    void auth.login(`${globalThis.location.origin}${state.url}`);
    return false;
  }

  if (auth.hasAnyRole(expectedRoles)) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
