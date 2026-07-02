import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-session',
  standalone: true,
  template: `
    <div class="page-panel" style="text-align: center; padding: 4rem 1rem;">
      <h2>Iniciando Sesión...</h2>
      <p>Asegurando la conexión con ServiYa</p>
    </div>
  `
})
export class LoadingSessionComponent {}
