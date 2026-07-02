import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Cliente</p>
        <h1>Panel cliente</h1>
      </div>
      <a class="action-button" routerLink="/cliente/solicitudes/nueva">Nueva solicitud</a>
    </section>

    <section class="grid">
      <a class="feature-card" routerLink="/cliente/servicios">
        <h2>Catálogo de Servicios</h2>
        <p>Explora y solicita servicios para tu hogar o negocio.</p>
      </a>

      <a class="feature-card" routerLink="/cliente/perfil">
        <h2>Perfil</h2>
        <p>Datos de contacto, preferencias y consentimientos.</p>
      </a>

      <a class="feature-card" routerLink="/cliente/solicitudes">
        <h2>Solicitudes</h2>
        <p>Revisa el estado basico de tus solicitudes.</p>
      </a>
    </section>
  `
})
export class ClienteDashboardComponent {}
