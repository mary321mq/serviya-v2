import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

describe('app routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)]
    });
  });

  it('registers protected role entry points and public auth pages', () => {
    const publicPaths = routes.map((route) => route.path);
    const shellRoute = routes.find((route) => route.path === '');
    const childPaths = shellRoute?.children?.map((route) => route.path) ?? [];

    expect(publicPaths).toContain('login');
    expect(publicPaths).toContain('unauthorized');
    expect(publicPaths).toContain('**');
    expect(childPaths).toEqual(
      jasmine.arrayContaining([
        'cliente',
        'solicitudes',
        'pagos',
        'tecnico',
        'ofertas',
        'asignaciones',
        'wallet',
        'notificaciones',
        'admin'
      ])
    );
  });
});
