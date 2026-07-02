import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, provideRouter } from '@angular/router';

import { AuthService } from './auth.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['hasAnyRole', 'login']);
    (auth as any).isAuthenticated = jasmine.createSpy('isAuthenticated').and.returnValue(true);

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }]
    });
  });

  it('allows users with an expected role', () => {
    auth.hasAnyRole.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['CLIENTE'] } } as unknown as ActivatedRouteSnapshot, {} as never)
    );

    expect(result).toBeTrue();
  });

  it('redirects users without the expected role', () => {
    auth.hasAnyRole.and.returnValue(false);
    const router = TestBed.inject(Router);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles: ['ADMIN'] } } as unknown as ActivatedRouteSnapshot, {} as never)
    );

    expect(router.serializeUrl(result as UrlTree)).toBe('/unauthorized');
  });
});
