import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AdminSettingsService, AppConfigSettings } from '../services/admin-settings.service';

@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="settings-container">
      <div class="header-section">
        <div>
          <h1 class="page-title">Configuración</h1>
          <p class="page-subtitle">Ajustes globales de la plataforma ServiYa.</p>
        </div>
        <button class="btn-primary" (click)="saveSettings()" [disabled]="saving">
          <lucide-icon name="save" [size]="16"></lucide-icon> {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
      
      <div class="settings-grid" *ngIf="settings">
        <div class="settings-card">
          <div class="sc-header">
            <lucide-icon name="percent" [size]="20" class="text-blue"></lucide-icon>
            <h3>Comisiones y Tarifas</h3>
          </div>
          <div class="sc-body">
            <div class="form-group">
              <label>Comisión Base ServiYa (Ej: 0.10 para 10%)</label>
              <input type="number" step="0.01" class="dark-input" [(ngModel)]="settings.comisionPorcentaje" />
            </div>
            <div class="form-group">
              <label>IGV (Ej: 0.18 para 18%)</label>
              <input type="number" step="0.01" class="dark-input" [(ngModel)]="settings.igvPorcentaje" />
              <span class="help-text">Impuesto general a las ventas aplicado sobre la comisión.</span>
            </div>
          </div>
        </div>

        <div class="settings-card">
          <div class="sc-header">
            <lucide-icon name="credit-card" [size]="20" class="text-green"></lucide-icon>
            <h3>Pasarelas de Pago</h3>
          </div>
          <div class="sc-body">
            <div class="toggle-row">
              <span>Habilitar pagos con Yape</span>
              <div class="toggle" [class.active]="settings.yapeEnabled" (click)="settings.yapeEnabled = !settings.yapeEnabled">
                <div class="dot"></div>
              </div>
            </div>
            <div class="toggle-row">
              <span>Habilitar pagos con Tarjeta (Culqi)</span>
              <div class="toggle" [class.active]="settings.culqiEnabled" (click)="settings.culqiEnabled = !settings.culqiEnabled">
                <div class="dot"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container { display: flex; flex-direction: column; gap: 24px; width: 100%; height: 100%; padding-bottom: 40px; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-end; }
    .page-title { margin: 0 0 6px 0; font-size: 1.8rem; font-weight: 700; color: var(--text-primary); }
    .page-subtitle { margin: 0; color: var(--text-secondary); font-size: 0.95rem; }
    
    .btn-primary { background: #3B82F6; border: none; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
    .btn-primary:hover:not(:disabled) { background: #2563EB; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    
    .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px; }
    
    .settings-card { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .sc-header { padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px; }
    .sc-header h3 { margin: 0; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
    .text-blue { color: #3B82F6; }
    .text-green { color: #22C55E; }
    
    .sc-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; }
    .dark-input { background: var(--surface-2); border: 1px solid var(--border-color); padding: 10px 12px; border-radius: 8px; color: var(--text-primary); outline: none; font-size: 1rem; }
    .dark-input:focus { border-color: #3B82F6; }
    .help-text { font-size: 0.8rem; color: var(--text-secondary); }
    
    .toggle-row { display: flex; justify-content: space-between; align-items: center; color: var(--text-primary); font-size: 0.95rem; }
    .toggle { width: 44px; height: 24px; background: var(--surface-3); border-radius: 12px; position: relative; cursor: pointer; transition: 0.3s; }
    .toggle.active { background: #22C55E; }
    .toggle .dot { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .toggle.active .dot { transform: translateX(20px); }
  `]
})
export class AdminSettingsPageComponent implements OnInit {
  private readonly settingsService = inject(AdminSettingsService);
  
  settings: AppConfigSettings | null = null;
  saving = false;

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe({
      next: (data) => this.settings = data,
      error: (err) => console.error('Error fetching settings', err)
    });
  }

  saveSettings(): void {
    if (!this.settings) return;
    this.saving = true;
    
    this.settingsService.updateSettings(this.settings).subscribe({
      next: (data) => {
        this.settings = data;
        this.saving = false;
        alert('Configuración guardada exitosamente');
      },
      error: (err) => {
        console.error('Error saving settings', err);
        this.saving = false;
        alert('Error al guardar la configuración');
      }
    });
  }
}
