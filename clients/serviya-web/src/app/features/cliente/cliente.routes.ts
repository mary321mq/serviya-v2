import { Routes } from '@angular/router';

import { ClienteDashboardComponent } from './pages/cliente-dashboard.component';
import { ClientReviewsPageComponent } from './pages/reviews-page.component';
import { CreateClientReviewPageComponent } from './pages/create-review-page.component';
import { CreateRequestPageComponent } from './pages/create-request-page.component';
import { MyRequestsPageComponent } from './pages/my-requests-page.component';
import { ProfilePageComponent } from './pages/profile-page.component';
import { RequestDetailPageComponent } from './pages/request-detail-page.component';
import { NotificationsPageComponent } from './pages/notifications-page.component';
import { ApplicationPageComponent } from '../tecnico/pages/application-page.component';
import { ServiceDetailPageComponent } from './pages/service-detail-page.component';
import { CatalogPageComponent } from './pages/catalog-page.component';
import { CheckoutPageComponent } from './pages/checkout-page.component';
import { AssignTechnicianPageComponent } from './pages/assign-technician-page.component';
import { PaymentsHistoryPageComponent } from './pages/payments-history-page.component';

export const clienteRoutes: Routes = [
  { path: '', component: ClienteDashboardComponent },
  { path: 'perfil', component: ProfilePageComponent },
  { path: 'servicios', component: CatalogPageComponent },
  { path: 'servicios/:id', component: ServiceDetailPageComponent },
  { path: 'solicitudes', component: MyRequestsPageComponent },
  { path: 'checkout', component: CheckoutPageComponent },
  { path: 'pagos', component: PaymentsHistoryPageComponent },
  { path: 'solicitudes/nueva', component: CreateRequestPageComponent },
  { path: 'solicitudes/:id', component: RequestDetailPageComponent },
  { path: 'solicitudes/:solicitudId/tecnicos', component: AssignTechnicianPageComponent },
  { path: 'resenas', component: ClientReviewsPageComponent },
  { path: 'resenas/nueva/:serviceRequestId', component: CreateClientReviewPageComponent },
  { path: 'postular-tecnico', component: ApplicationPageComponent },
  { path: 'notificaciones', component: NotificationsPageComponent }
];
