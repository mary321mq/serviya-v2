import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-monitor-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="monitor-layout">
      <nav class="monitor-nav">
        <ul>
          <li><a routerLink="/admin/monitor" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Panel</a></li>
          <li><a routerLink="/admin/solicitudes" routerLinkActive="active">Solicitudes</a></li>
          <li><a routerLink="/admin/eventos" routerLinkActive="active">Eventos</a></li>
          <li><a routerLink="/admin/pagos" routerLinkActive="active">Pagos</a></li>
        </ul>
      </nav>
      <main class="monitor-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .monitor-layout {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    @media (min-width: 768px) {
      .monitor-layout { flex-direction: row; align-items: flex-start; }
    }
    .monitor-nav {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      min-width: 200px;
    }
    .monitor-nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .monitor-nav a {
      display: block;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: #374151;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .monitor-nav a:hover { background: #f3f4f6; }
    .monitor-nav a.active {
      background: #eff6ff;
      color: #2563eb;
      font-weight: bold;
    }
    .monitor-content {
      flex: 1;
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
  `]
})
export class MonitorLayoutComponent {}
