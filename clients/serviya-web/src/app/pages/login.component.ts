import { Component, inject } from '@angular/core';

import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <main class="auth-page">
      <section class="auth-panel">
        <h1>ServiYa</h1>
        <p>Acceso seguro con Keycloak.</p>
        <button type="button" class="primary-button" (click)="login()">Entrar</button>
        <button type="button" class="secondary-button" (click)="register()">Registrarme</button>
      </section>
    </main>
  `
})
export class LoginComponent {
  private readonly auth = inject(AuthService);

  login(): void {
    void this.auth.login();
  }

  register(): void {
    void this.auth.register();
  }
}
