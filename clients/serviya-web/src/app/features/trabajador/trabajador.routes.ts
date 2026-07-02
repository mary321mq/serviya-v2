import { Routes } from '@angular/router';

import { WorkerQuotesPageComponent } from './worker-quotes-page.component';
import { WorkerCentroOperativoComponent } from './worker-centro-operativo.component';

export const trabajadorRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'centro-operativo' },
  { path: 'centro-operativo', component: WorkerCentroOperativoComponent },
  { path: 'cotizaciones', component: WorkerQuotesPageComponent }
];
