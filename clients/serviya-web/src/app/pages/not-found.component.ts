import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="auth-page">
      <section class="auth-panel">
        <h1>No encontrado</h1>
        <p>La ruta solicitada no existe.</p>
        <a class="primary-link" routerLink="/">Volver al inicio</a>
      </section>
    </main>
  `
})
export class NotFoundComponent {}
