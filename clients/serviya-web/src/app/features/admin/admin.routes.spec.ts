import { adminRoutes } from './admin.routes';

describe('adminRoutes', () => {
  it('registers admin review moderation routes', () => {
    expect(adminRoutes.map((route) => route.path)).toEqual(
      jasmine.arrayContaining(['resenas', 'resenas/:id'])
    );
  });

  it('registers admin monitor routes', () => {
    expect(adminRoutes.map((route) => route.path)).toEqual(
      jasmine.arrayContaining(['monitor', 'solicitudes', 'eventos', 'pagos'])
    );
  });
});
