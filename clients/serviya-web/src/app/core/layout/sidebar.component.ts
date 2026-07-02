import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AppRole, AuthService } from '../auth/auth.service';

interface NavigationItem {
  readonly label: string;
  readonly path: string;
  readonly roles: readonly AppRole[];
}

const NAVIGATION: readonly NavigationItem[] = [
  { label: 'Crear solicitud', path: '/cliente/servicios', roles: ['CLIENTE'] },
  { label: 'Perfil', path: '/cliente/perfil', roles: ['CLIENTE', 'ADMIN'] },
  { label: 'Solicitudes', path: '/cliente/solicitudes', roles: ['CLIENTE'] },
  { label: 'Reseñas', path: '/cliente/resenas', roles: ['CLIENTE'] },
  { label: 'Postular tecnico', path: '/cliente/postular-tecnico', roles: ['CLIENTE'] },
  { label: 'Pagos', path: '/cliente/pagos', roles: ['CLIENTE'] },
  { label: 'Tecnico', path: '/tecnico', roles: ['TECNICO'] },
  { label: 'Ofertas', path: '/tecnico/ofertas', roles: ['TECNICO'] },
  { label: 'Mis reseñas', path: '/tecnico/resenas', roles: ['TECNICO'] },
  { label: 'Asignaciones', path: '/tecnico/asignaciones', roles: ['TECNICO'] },
  { label: 'Billetera', path: '/tecnico/wallet', roles: ['TECNICO'] },
  { label: 'Trabajador', path: '/trabajador', roles: ['TRABAJADOR'] },
  { label: 'Centro operativo', path: '/trabajador/centro-operativo', roles: ['TRABAJADOR'] },
  { label: 'Cotizaciones', path: '/trabajador/cotizaciones', roles: ['TRABAJADOR'] },
  { label: 'Notificaciones', path: '/notificaciones', roles: ['CLIENTE', 'TECNICO', 'TRABAJADOR'] },
  { label: 'Usuarios', path: '/admin/usuarios', roles: ['ADMIN'] },
  { label: 'Trabajadores', path: '/admin/trabajadores', roles: ['ADMIN'] },
  { label: 'Técnicos', path: '/admin/tecnicos', roles: ['ADMIN'] },
  { label: 'Postulaciones', path: '/admin/tecnicos/postulaciones', roles: ['ADMIN'] },
  { label: 'Categorías', path: '/admin/catalogo/categorias', roles: ['ADMIN'] },
  { label: 'Servicios', path: '/admin/catalogo/servicios', roles: ['ADMIN'] },
  { label: 'Historial de pagos', path: '/admin/pagos', roles: ['ADMIN'] },
  { label: 'Facturación', path: '/admin/facturacion', roles: ['ADMIN'] },
  { label: 'Liquidaciones', path: '/admin/liquidaciones', roles: ['ADMIN'] },
  { label: 'Reportes', path: '/admin/reportes', roles: ['ADMIN'] },
  { label: 'Configuración', path: '/admin/configuracion', roles: ['ADMIN'] }
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" aria-label="Navegacion principal">
      <div class="sidebar-logo-container">
        <img src="assets/images/LOGO  1.png" alt="ServiYa" style="width: 140px; height: auto; transform: scale(1.6); transform-origin: center center; object-fit: contain; display: block; margin: 10px auto;">
      </div>
      <div class="sidebar-menu">
        @for (item of items(); track item.path) {
          <a [routerLink]="item.path" routerLinkActive="is-selected">
            {{ item.label }}
          </a>
        }
      </div>
    </aside>
  `
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);

  protected readonly items = computed(() => {
    const roles = this.auth.roles();
    if (roles.includes('ADMIN')) {
      return NAVIGATION.filter((item) => item.roles.includes('ADMIN'));
    }

    return NAVIGATION.filter((item) => item.roles.some((role) => roles.includes(role)));
  });
}
