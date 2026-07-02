import { clienteRoutes } from './cliente.routes';

describe('clienteRoutes', () => {
  it('registers the client feature pages', () => {
    expect(clienteRoutes.map((route) => route.path)).toEqual([
      '',
      'perfil',
      'servicios',
      'servicios/:id',
      'solicitudes',
      'checkout',
      'solicitudes/nueva',
      'solicitudes/:id',
      'resenas',
      'resenas/nueva/:serviceRequestId',
      'postular-tecnico',
      'notificaciones'
    ]);
  });
});
