import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <section class="admin-dashboard">
      <header class="dashboard-hero">
        <div>
          <span class="eyebrow">Panel administrativo</span>
          <h1>Centro de control ServiYa</h1>
          <p>Gestiona usuarios, tecnicos, catalogo, pagos y monitoreo operativo desde un solo lugar.</p>
        </div>
        <a routerLink="/admin/monitor" class="hero-action">
          <lucide-icon name="activity" [size]="18"></lucide-icon>
          Ver monitoreo
        </a>
      </header>

      <div class="status-strip">
        <div class="status-item blue">
          <lucide-icon name="shield-check" [size]="22"></lucide-icon>
          <div>
            <strong>Operacion</strong>
            <span>Panel activo</span>
          </div>
        </div>
        <div class="status-item orange">
          <lucide-icon name="bell-ring" [size]="22"></lucide-icon>
          <div>
            <strong>Alertas</strong>
            <span>Revisar eventos</span>
          </div>
        </div>
        <div class="status-item green">
          <lucide-icon name="wallet-cards" [size]="22"></lucide-icon>
          <div>
            <strong>Pagos</strong>
            <span>Control financiero</span>
          </div>
        </div>
      </div>

      <div class="section-heading">
        <h2>Accesos principales</h2>
        <p>Modulos sincronizados con los microservicios de ServiYa.</p>
      </div>

      <div class="dashboard-grid">
        <a routerLink="/admin/tecnicos/postulaciones" class="dashboard-card primary">
          <div class="card-icon"><lucide-icon name="user-check" [size]="24"></lucide-icon></div>
          <div>
            <h3>Postulaciones</h3>
            <p>Revisa documentos, valida perfiles y aprueba tecnicos.</p>
          </div>
          <lucide-icon class="arrow" name="arrow-up-right" [size]="18"></lucide-icon>
        </a>

        <a routerLink="/admin/usuarios" class="dashboard-card">
          <div class="card-icon"><lucide-icon name="users" [size]="24"></lucide-icon></div>
          <div>
            <h3>Usuarios</h3>
            <p>Administra clientes, tecnicos, trabajadores y accesos.</p>
          </div>
          <lucide-icon class="arrow" name="arrow-up-right" [size]="18"></lucide-icon>
        </a>

        <a routerLink="/admin/catalogo/categorias" class="dashboard-card">
          <div class="card-icon"><lucide-icon name="layout-grid" [size]="24"></lucide-icon></div>
          <div>
            <h3>Categorias</h3>
            <p>Organiza el catalogo y sus grupos de servicios.</p>
          </div>
          <lucide-icon class="arrow" name="arrow-up-right" [size]="18"></lucide-icon>
        </a>

        <a routerLink="/admin/catalogo/servicios" class="dashboard-card">
          <div class="card-icon"><lucide-icon name="wrench" [size]="24"></lucide-icon></div>
          <div>
            <h3>Servicios</h3>
            <p>Configura servicios, precios base, fotos y requisitos.</p>
          </div>
          <lucide-icon class="arrow" name="arrow-up-right" [size]="18"></lucide-icon>
        </a>

        <a routerLink="/admin/solicitudes" class="dashboard-card">
          <div class="card-icon"><lucide-icon name="clipboard-list" [size]="24"></lucide-icon></div>
          <div>
            <h3>Solicitudes</h3>
            <p>Supervisa estados, evidencias y cotizaciones de clientes.</p>
          </div>
          <lucide-icon class="arrow" name="arrow-up-right" [size]="18"></lucide-icon>
        </a>

        <a routerLink="/admin/pagos" class="dashboard-card accent">
          <div class="card-icon"><lucide-icon name="credit-card" [size]="24"></lucide-icon></div>
          <div>
            <h3>Pagos</h3>
            <p>Consulta comprobantes, transacciones y descargas.</p>
          </div>
          <lucide-icon class="arrow" name="arrow-up-right" [size]="18"></lucide-icon>
        </a>

        <a routerLink="/admin/liquidaciones" class="dashboard-card">
          <div class="card-icon"><lucide-icon name="badge-dollar-sign" [size]="24"></lucide-icon></div>
          <div>
            <h3>Liquidaciones</h3>
            <p>Revisa saldos, billeteras y movimientos pendientes.</p>
          </div>
          <lucide-icon class="arrow" name="arrow-up-right" [size]="18"></lucide-icon>
        </a>

        <a routerLink="/admin/eventos" class="dashboard-card">
          <div class="card-icon"><lucide-icon name="radio-tower" [size]="24"></lucide-icon></div>
          <div>
            <h3>Eventos</h3>
            <p>Analiza eventos asincronos, fallidos y procesados.</p>
          </div>
          <lucide-icon class="arrow" name="arrow-up-right" [size]="18"></lucide-icon>
        </a>

        <a routerLink="/admin/reportes" class="dashboard-card">
          <div class="card-icon"><lucide-icon name="bar-chart-3" [size]="24"></lucide-icon></div>
          <div>
            <h3>Reportes</h3>
            <p>Consulta metricas operativas y resumen del sistema.</p>
          </div>
          <lucide-icon class="arrow" name="arrow-up-right" [size]="18"></lucide-icon>
        </a>

        <a routerLink="/admin/configuracion" class="dashboard-card">
          <div class="card-icon"><lucide-icon name="settings" [size]="24"></lucide-icon></div>
          <div>
            <h3>Configuracion</h3>
            <p>Ajusta parametros generales y reglas del sistema.</p>
          </div>
          <lucide-icon class="arrow" name="arrow-up-right" [size]="18"></lucide-icon>
        </a>
      </div>
    </section>
  `,
  styles: [`
    .admin-dashboard {
      display: flex;
      flex-direction: column;
      gap: 24px;
      width: 100%;
    }

    .dashboard-hero {
      align-items: center;
      background:
        radial-gradient(circle at top left, rgba(30, 144, 255, 0.24), transparent 34%),
        radial-gradient(circle at top right, rgba(255, 138, 0, 0.18), transparent 30%),
        linear-gradient(135deg, #0B1120 0%, #111827 100%);
      border: 1px solid rgba(30, 144, 255, 0.28);
      border-radius: 18px;
      box-shadow: var(--glow-blue);
      display: flex;
      gap: 20px;
      justify-content: space-between;
      padding: 28px;
    }

    .eyebrow {
      color: var(--accent-neon);
      display: block;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    h1 {
      color: var(--text-primary);
      font-size: 2rem;
      line-height: 1.1;
    }

    .dashboard-hero p,
    .section-heading p,
    .dashboard-card p,
    .status-item span {
      color: var(--text-secondary);
    }

    .dashboard-hero p {
      font-size: 1rem;
      line-height: 1.55;
      margin-top: 10px;
      max-width: 660px;
    }

    .hero-action {
      align-items: center;
      align-self: center;
      background: linear-gradient(135deg, var(--primary-600), var(--primary-neon));
      border: 1px solid rgba(30, 144, 255, 0.5);
      border-radius: 12px;
      box-shadow: var(--glow-blue);
      color: #fff;
      display: inline-flex;
      font-weight: 800;
      gap: 8px;
      min-height: 46px;
      padding: 0 18px;
      text-decoration: none;
      white-space: nowrap;
    }

    .status-strip {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .status-item {
      align-items: center;
      background: var(--surface-1);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      display: flex;
      gap: 14px;
      min-height: 86px;
      padding: 18px;
    }

    .status-item lucide-icon {
      border-radius: 12px;
      padding: 10px;
    }

    .status-item.blue lucide-icon {
      background: rgba(30, 144, 255, 0.14);
      color: var(--primary-neon);
      box-shadow: var(--glow-blue);
    }

    .status-item.orange lucide-icon {
      background: rgba(255, 138, 0, 0.14);
      color: var(--accent-neon);
      box-shadow: var(--glow-orange);
    }

    .status-item.green lucide-icon {
      background: rgba(34, 197, 94, 0.14);
      color: var(--success);
      box-shadow: 0 0 18px rgba(34, 197, 94, 0.25);
    }

    .status-item strong {
      color: var(--text-primary);
      display: block;
      font-size: 1rem;
      margin-bottom: 3px;
    }

    .section-heading {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .section-heading h2 {
      color: var(--text-primary);
      font-size: 1.25rem;
    }

    .dashboard-grid {
      display: grid;
      gap: 18px;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    }

    .dashboard-card {
      background:
        linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01)),
        var(--surface-1);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      color: inherit;
      display: grid;
      gap: 16px;
      grid-template-columns: auto 1fr auto;
      min-height: 150px;
      padding: 20px;
      position: relative;
      text-decoration: none;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .dashboard-card:hover {
      border-color: rgba(30, 144, 255, 0.55);
      box-shadow: var(--glow-blue);
      transform: translateY(-3px);
    }

    .dashboard-card.accent:hover {
      border-color: rgba(255, 138, 0, 0.55);
      box-shadow: var(--glow-orange);
    }

    .dashboard-card.primary {
      border-color: rgba(30, 144, 255, 0.42);
    }

    .card-icon {
      align-items: center;
      background: rgba(30, 144, 255, 0.12);
      border: 1px solid rgba(30, 144, 255, 0.28);
      border-radius: 12px;
      color: var(--primary-neon);
      display: flex;
      height: 48px;
      justify-content: center;
      width: 48px;
    }

    .accent .card-icon {
      background: rgba(255, 138, 0, 0.13);
      border-color: rgba(255, 138, 0, 0.3);
      color: var(--accent-neon);
    }

    .dashboard-card h3 {
      color: var(--text-primary);
      font-size: 1.05rem;
      margin-bottom: 8px;
    }

    .dashboard-card p {
      font-size: 0.9rem;
      line-height: 1.45;
    }

    .arrow {
      color: var(--text-secondary);
      margin-top: 4px;
      transition: color 0.2s ease, transform 0.2s ease;
    }

    .dashboard-card:hover .arrow {
      color: var(--accent-neon);
      transform: translate(2px, -2px);
    }

    @media (max-width: 900px) {
      .dashboard-hero {
        align-items: flex-start;
        flex-direction: column;
      }

      .status-strip {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .dashboard-hero {
        padding: 22px;
      }

      h1 {
        font-size: 1.6rem;
      }

      .dashboard-card {
        grid-template-columns: auto 1fr;
      }

      .arrow {
        display: none;
      }
    }
  `]
})
export class AdminDashboardComponent {}
