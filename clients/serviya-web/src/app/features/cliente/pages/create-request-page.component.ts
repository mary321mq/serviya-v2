import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-request-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Cliente</p>
        <h1>Nueva solicitud</h1>
      </div>
    </section>

    <section class="page-panel">
      <h2>Elige un servicio del catalogo</h2>
      <p>
        Para crear una solicitud se necesita el servicio, la direccion exacta y la ubicacion en mapa.
        Ese flujo esta conectado desde el catalogo.
      </p>
      <a class="primary-link" routerLink="/cliente/servicios">Ir al catalogo</a>
    </section>
  `
})
export class CreateRequestPageComponent {}
