import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="auth-page">
      <section class="auth-panel">
        <h1>Acceso restringido</h1>
        <p>Tu rol actual no permite abrir esta vista.</p>
        <a class="primary-link" routerLink="/">Volver al inicio</a>
      </section>
    </main>
  `
})
export class UnauthorizedComponent {}
