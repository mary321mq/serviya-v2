import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { profileCompleteGuard } from './core/auth/profile-complete.guard';
import { ShellComponent } from './core/layout/shell.component';
import { ErrorPageComponent } from './pages/error-page.component';
import { LoadingSessionComponent } from './pages/loading-session.component';
import { LoginComponent } from './pages/login.component';
import { NotFoundComponent } from './pages/not-found.component';
import { UnauthorizedComponent } from './pages/unauthorized.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'error', component: ErrorPageComponent },
  { path: 'loading-session', component: LoadingSessionComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'cliente' },
      {
        path: 'onboarding',
        loadComponent: () => import('./features/cliente/pages/onboarding-wizard.component').then(m => m.OnboardingWizardComponent)
      },
      {
        path: 'cliente',
        canActivate: [roleGuard, profileCompleteGuard],
        data: { roles: ['CLIENTE', 'ADMIN'] },
        loadChildren: () => import('./features/cliente/cliente.routes').then((m) => m.clienteRoutes)
      },
      {
        path: 'solicitudes',
        canActivate: [roleGuard, profileCompleteGuard],
        data: { roles: ['CLIENTE'] },
        redirectTo: 'cliente/solicitudes'
      },
      {
        path: 'pagos',
        canActivate: [roleGuard],
        data: { roles: ['CLIENTE'] },
        redirectTo: 'cliente/pagos'
      },
      {
        path: 'tecnico',
        canActivate: [roleGuard],
        data: { roles: ['TECNICO'] },
        loadChildren: () => import('./features/tecnico/tecnico.routes').then((m) => m.tecnicoRoutes)
      },
      {
        path: 'notificaciones',
        canActivate: [roleGuard],
        data: { roles: ['CLIENTE', 'TECNICO', 'TRABAJADOR'] },
        loadComponent: () => import('./features/cliente/pages/notifications-page.component').then((m) => m.NotificationsPageComponent)
      },
      {
        path: 'trabajador',
        canActivate: [roleGuard],
        data: { roles: ['TRABAJADOR'] },
        loadChildren: () => import('./features/trabajador/trabajador.routes').then((m) => m.trabajadorRoutes)
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes)
      }
    ]
  },
  { path: '**', component: NotFoundComponent }
];
