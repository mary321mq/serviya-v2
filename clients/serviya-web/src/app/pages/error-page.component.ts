import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-panel" style="text-align: center; padding: 4rem 1rem;">
      <h1>Ha ocurrido un error inesperado</h1>
      <p style="margin-bottom: 2rem;">No pudimos procesar tu solicitud de manera segura. Por favor intenta de nuevo.</p>
      <a routerLink="/" class="action-button">Volver al Inicio</a>
    </div>
  `
})
export class ErrorPageComponent {}
