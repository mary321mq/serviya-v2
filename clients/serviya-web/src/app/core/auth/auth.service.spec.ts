import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { KEYCLOAK_INSTANCE } from './keycloak.token';

describe('AuthService', () => {
  let keycloak: {
    authenticated?: boolean;
    token?: string;
    tokenParsed?: unknown;
    init: jasmine.Spy;
    login: jasmine.Spy;
    logout: jasmine.Spy;
    register: jasmine.Spy;
    updateToken: jasmine.Spy;
  };

  beforeEach(() => {
    keycloak = {
      authenticated: true,
      token: 'jwt-token',
      tokenParsed: {
        name: 'Cliente Uno',
        realm_access: { roles: ['CLIENTE', 'offline_access'] }
      },
      init: jasmine.createSpy('init').and.resolveTo(true),
      login: jasmine.createSpy('login').and.resolveTo(),
      logout: jasmine.createSpy('logout').and.resolveTo(),
      register: jasmine.createSpy('register').and.resolveTo(),
      updateToken: jasmine.createSpy('updateToken').and.resolveTo(true)
    };

    TestBed.configureTestingModule({
      providers: [{ provide: KEYCLOAK_INSTANCE, useValue: keycloak }]
    });
  });

  it('initializes Keycloak with PKCE and reads realm roles', async () => {
    const service = TestBed.inject(AuthService);

    await service.initialize();

    expect(keycloak.init).toHaveBeenCalledWith(
      jasmine.objectContaining({ onLoad: 'check-sso', pkceMethod: 'S256' })
    );
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.username()).toBe('Cliente Uno');
    expect(service.roles()).toEqual(['CLIENTE']);
  });

  it('refreshes and returns a valid in-memory token', async () => {
    const service = TestBed.inject(AuthService);
    await service.initialize();

    await expectAsync(service.getValidToken()).toBeResolvedTo('jwt-token');
    expect(keycloak.updateToken).toHaveBeenCalledWith(30);
  });

  it('opens Keycloak registration redirecting to the client profile', async () => {
    const service = TestBed.inject(AuthService);

    await service.register();

    expect(keycloak.register).toHaveBeenCalledWith(
      jasmine.objectContaining({ redirectUri: 'http://localhost:9876/cliente/perfil' })
    );
  });
});
