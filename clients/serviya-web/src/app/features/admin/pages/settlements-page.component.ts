import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { AdminPaymentService, Settlement, Wallet } from '../services/admin-payment.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-settlements-page',
  standalone: true,
  imports: [CommonModule, EstadoTextoPipe, LucideAngularModule],
  template: `
    <div class="settlements-container">
      <div class="header-section">
        <div>
          <h1 class="page-title">Liquidaciones a Técnicos</h1>
          <p class="page-subtitle">Gestiona las ganancias generadas por los técnicos y transfiere sus fondos.</p>
        </div>
        <button class="btn-primary" (click)="loadData()">
          <lucide-icon name="refresh-cw" [size]="16"></lucide-icon> Actualizar Datos
        </button>
      </div>
      
      <div class="mb-8">
        <h2 class="section-title">Billeteras Pendientes (Fondos por Pagar)</h2>
        <div class="grid-wallets">
          <div *ngFor="let w of wallets" class="wallet-card">
            <div class="wc-header">
              <lucide-icon name="user" [size]="20" class="text-gray"></lucide-icon>
              <h3 class="text-sm font-semibold">Técnico: {{ w.technicianId }}</h3>
            </div>
            <div class="wc-body">
              <span class="balance" [ngClass]="w.balance > 0 ? 'text-green' : 'text-gray'">
                {{ w.currency }} {{ w.balance | number:'1.2-2' }}
              </span>
              <p class="text-xs text-muted mt-1">Actualizado: {{ w.updatedAt | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <div class="wc-footer">
              <button class="btn-pay" [disabled]="w.balance <= 0" (click)="payWallet(w)">
                <lucide-icon name="banknote" [size]="16"></lucide-icon> Liquidar Fondos
              </button>
            </div>
          </div>
          <div *ngIf="wallets.length === 0" class="empty-state-sm">No hay billeteras registradas.</div>
        </div>
      </div>

      <div>
        <h2 class="section-title">Historial de Liquidaciones</h2>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Liquidación ID</th>
                <th>Técnico</th>
                <th>Periodo</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of settlements">
                <td class="font-mono text-muted">{{ s.settlementId }}</td>
                <td>{{ s.technicianId }}</td>
                <td class="text-sm">{{ s.periodStart | date:'dd/MM/yyyy' }} - {{ s.periodEnd | date:'dd/MM/yyyy' }}</td>
                <td class="font-bold text-green">S/ {{ s.totalAmount | number:'1.2-2' }}</td>
                <td>
                  <span class="badge badge-success">{{ s.status | estadoTexto }}</span>
                </td>
                <td>
                  <button class="btn-icon text-blue"><lucide-icon name="download" [size]="16"></lucide-icon></button>
                </td>
              </tr>
              <tr *ngIf="settlements.length === 0">
                <td colspan="6" class="text-center py-8 text-muted">No se encontraron liquidaciones.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settlements-container { display: flex; flex-direction: column; gap: 24px; width: 100%; height: 100%; padding-bottom: 40px; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-end; }
    .page-title { margin: 0 0 6px 0; font-size: 1.8rem; font-weight: 700; color: var(--text-primary); }
    .page-subtitle { margin: 0; color: var(--text-secondary); font-size: 0.95rem; }
    .section-title { font-size: 1.2rem; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; margin-top: 0; }
    
    .btn-primary { background: #3B82F6; border: none; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
    .btn-primary:hover { background: #2563EB; }
    
    .grid-wallets { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .wallet-card { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
    .wc-header { padding: 16px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px; color: var(--text-primary); }
    .wc-header h3 { margin: 0; }
    .wc-body { padding: 20px 16px; }
    .balance { font-size: 2rem; font-weight: 700; display: block; line-height: 1; }
    .wc-footer { padding: 16px; background: rgba(0,0,0,0.2); border-top: 1px solid var(--border-color); }
    
    .btn-pay { width: 100%; background: #22C55E; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 600; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
    .btn-pay:hover:not(:disabled) { background: #16A34A; }
    .btn-pay:disabled { background: var(--surface-3); color: var(--text-secondary); cursor: not-allowed; }
    
    .text-green { color: #22C55E; }
    .text-gray { color: var(--text-secondary); }
    .text-muted { color: var(--text-secondary); opacity: 0.7; }
    .empty-state-sm { background: var(--surface-1); border: 1px dashed var(--border-color); border-radius: 12px; padding: 30px; text-align: center; color: var(--text-secondary); grid-column: 1 / -1; }
    
    .table-container { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: 16px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(0,0,0,0.2); }
    .data-table td { padding: 16px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; vertical-align: middle; }
    .data-table tr:hover td { background: var(--surface-2); }
    
    .font-mono { font-family: monospace; }
    .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-block; }
    .badge-success { background: rgba(34, 197, 94, 0.15); color: #4ADE80; border: 1px solid rgba(34, 197, 94, 0.3); }
    .text-center { text-align: center; }
    .py-8 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
    
    .btn-icon { background: none; border: none; padding: 8px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s; }
    .btn-icon:hover { background: var(--surface-3); }
    .text-blue { color: #3B82F6; }
  `]
})
export class SettlementsPageComponent implements OnInit {
  wallets: Wallet[] = [];
  settlements: Settlement[] = [];
  private service = inject(AdminPaymentService);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.service.getWallets().subscribe({
      next: (res) => this.wallets = res,
      error: () => this.wallets = []
    });
    this.service.getSettlements().subscribe({
      next: (res) => this.settlements = res,
      error: () => this.settlements = []
    });
  }

  payWallet(w: Wallet): void {
    alert('Funcionalidad de pago simulada. Monto a liquidar: ' + w.balance + ' ' + w.currency);
  }
}
