import { ApplicationPageComponent } from './pages/application-page.component';
import { TecnicoDashboardComponent } from './pages/tecnico-dashboard.component';
import { tecnicoRoutes } from './tecnico.routes';

describe('Tecnico Routes', () => {
  it('routes to dashboard by default', () => {
    expect(tecnicoRoutes.find((route) => route.path === '')?.component).toBe(TecnicoDashboardComponent);
  });

  it('routes to postulacion', () => {
    expect(tecnicoRoutes.find((route) => route.path === 'postulacion')?.component).toBe(ApplicationPageComponent);
  });

  it('registers technician routes', () => {
    const paths = tecnicoRoutes.map((route) => route.path);
    expect(paths).toEqual(
      jasmine.arrayContaining(['resenas', 'resenas/:id/responder', 'servicios', 'servicios/:id', 'notificaciones'])
    );
  });
});
