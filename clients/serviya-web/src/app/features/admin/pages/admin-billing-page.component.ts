import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AdminMonitorService } from '../services/admin-monitor.service';
import { AdminPayment } from '../models/monitor.model';
import { AdminSettingsService } from '../services/admin-settings.service';

@Component({
  selector: 'app-admin-billing-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="billing-container">
      <div class="header-section">
        <div>
          <h1 class="page-title">Facturación</h1>
          <p class="page-subtitle">Gestión de facturas y boletas electrónicas emitidas.</p>
        </div>
        <div class="flex-actions">
          <div class="search-box">
            <lucide-icon name="search" [size]="18" class="search-icon"></lucide-icon>
            <input type="text" placeholder="Buscar por DNI/RUC o Cliente..." [(ngModel)]="searchTerm" (input)="filterInvoices()" />
          </div>
          <button class="btn-secondary" (click)="loadInvoices()">
            <lucide-icon name="refresh-cw" [size]="16" [class.spinning]="loading"></lucide-icon> Actualizar
          </button>
        </div>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="mc-icon boleta"><lucide-icon name="receipt" [size]="24"></lucide-icon></div>
          <div class="mc-info">
            <span class="mc-label">Boletas Emitidas</span>
            <span class="mc-value">{{ boletasCount }}</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="mc-icon factura"><lucide-icon name="file-text" [size]="24"></lucide-icon></div>
          <div class="mc-info">
            <span class="mc-label">Facturas Emitidas</span>
            <span class="mc-value">{{ facturasCount }}</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="mc-icon total"><lucide-icon name="coins" [size]="24"></lucide-icon></div>
          <div class="mc-info">
            <span class="mc-label">Recaudación IGV (Aprox)</span>
            <span class="mc-value">S/ {{ totalIgv | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Comprobante</th>
              <th>Cliente / Razón Social</th>
              <th>Documento</th>
              <th>Fecha Emisión</th>
              <th>Subtotal</th>
              <th>IGV ({{ (igvPercent * 100) | number:'1.0-0' }}%)</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inv of filteredInvoices">
              <td>
                <div class="comprobante-cell">
                  <span class="badge" [ngClass]="inv.tipoComprobante === 'FACTURA' ? 'badge-factura' : 'badge-boleta'">
                    {{ inv.tipoComprobante }}
                  </span>
                  <span class="serie">SV-{{ (inv.id + '').padStart(8, '0') }}</span>
                </div>
              </td>
              <td>{{ inv.nombreCliente }}</td>
              <td>
                <span class="doc-type">{{ inv.tipoDocumento }}</span>
                {{ inv.numeroDocumento }}
              </td>
              <td>{{ inv.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>S/ {{ getSubtotal(inv.montoTotal) | number:'1.2-2' }}</td>
              <td>S/ {{ getIgv(inv.montoTotal) | number:'1.2-2' }}</td>
              <td class="font-bold">S/ {{ inv.montoTotal | number:'1.2-2' }}</td>
              <td>
                <button class="btn-icon text-blue" (click)="download(inv)" [disabled]="downloadingId === inv.id" title="Descargar PDF">
                  <lucide-icon name="download" [size]="16"></lucide-icon>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredInvoices.length === 0">
              <td colspan="8" class="text-center py-8 text-muted">No se encontraron comprobantes emitidos.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .billing-container { display: flex; flex-direction: column; gap: 24px; width: 100%; height: 100%; padding-bottom: 40px; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-end; }
    .page-title { margin: 0 0 6px 0; font-size: 1.8rem; font-weight: 700; color: var(--text-primary); }
    .page-subtitle { margin: 0; color: var(--text-secondary); font-size: 0.95rem; }
    
    .flex-actions { display: flex; gap: 12px; align-items: center; }
    .search-box { position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
    .search-box input { background: var(--surface-1); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 16px 10px 40px; border-radius: 8px; width: 260px; font-size: 0.95rem; outline: none; }
    .search-box input:focus { border-color: #3B82F6; }
    
    .btn-secondary { background: var(--surface-2); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 16px; border-radius: 8px; font-weight: 500; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
    .btn-secondary:hover { background: var(--surface-3); }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    
    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .metric-card { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; }
    .mc-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .mc-icon.boleta { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
    .mc-icon.factura { background: rgba(168, 85, 247, 0.1); color: #A855F7; }
    .mc-icon.total { background: rgba(34, 197, 94, 0.1); color: #22C55E; }
    .mc-info { display: flex; flex-direction: column; gap: 4px; }
    .mc-label { color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; }
    .mc-value { color: var(--text-primary); font-size: 1.6rem; font-weight: 700; }
    
    .table-container { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: 16px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(0,0,0,0.2); }
    .data-table td { padding: 16px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; vertical-align: middle; }
    .data-table tr:hover td { background: var(--surface-2); }
    
    .comprobante-cell { display: flex; flex-direction: column; gap: 4px; }
    .badge { padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; display: inline-block; width: max-content; }
    .badge-factura { background: rgba(168, 85, 247, 0.15); color: #C084FC; border: 1px solid rgba(168, 85, 247, 0.3); }
    .badge-boleta { background: rgba(59, 130, 246, 0.15); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3); }
    .serie { font-family: monospace; color: var(--text-secondary); font-size: 0.9rem; }
    
    .doc-type { font-size: 0.75rem; color: var(--text-secondary); background: var(--surface-3); padding: 2px 6px; border-radius: 4px; margin-right: 6px; }
    .font-bold { font-weight: 600; }
    .text-center { text-align: center; }
    .py-8 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
    .text-muted { color: var(--text-secondary); }
    
    .btn-icon { background: none; border: none; padding: 8px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s; }
    .btn-icon:hover { background: var(--surface-3); }
    .text-blue { color: #3B82F6; }
    .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AdminBillingPageComponent implements OnInit {
  private readonly monitorService = inject(AdminMonitorService);
  private readonly settingsService = inject(AdminSettingsService);

  allInvoices: AdminPayment[] = [];
  filteredInvoices: AdminPayment[] = [];
  
  loading = false;
  searchTerm = '';
  downloadingId: number | null = null;
  
  boletasCount = 0;
  facturasCount = 0;
  totalIgv = 0;
  igvPercent = 0.18;

  ngOnInit() {
    this.settingsService.getSettings().subscribe(s => this.igvPercent = s.igvPorcentaje);
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading = true;
    this.monitorService.getCapturedPayments().subscribe({
      next: (data) => {
        // En facturación solo mostramos los pagos que ya generaron comprobante (PAGADO_ESCROW o LIBERADO)
        this.allInvoices = data.filter(p => p.estadoPago === 'PAGADO_ESCROW' || p.estadoPago === 'LIBERADO_AL_TECNICO');
        this.calculateMetrics();
        this.filterInvoices();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filterInvoices() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredInvoices = [...this.allInvoices];
      return;
    }
    
    this.filteredInvoices = this.allInvoices.filter(inv => 
      inv.numeroDocumento.includes(term) || 
      inv.nombreCliente.toLowerCase().includes(term)
    );
  }

  calculateMetrics() {
    this.boletasCount = this.allInvoices.filter(i => i.tipoComprobante === 'BOLETA').length;
    this.facturasCount = this.allInvoices.filter(i => i.tipoComprobante === 'FACTURA').length;
    this.totalIgv = this.allInvoices.reduce((acc, inv) => acc + this.getIgv(inv.montoTotal), 0);
  }

  getSubtotal(total: number): number {
    return total / (1 + this.igvPercent);
  }

  getIgv(total: number): number {
    return total - this.getSubtotal(total);
  }

  download(payment: AdminPayment) {
    this.downloadingId = payment.id;
    this.monitorService.downloadPaymentReceipt(payment.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprobante-serviya-${payment.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.downloadingId = null;
      },
      error: () => this.downloadingId = null
    });
  }
}
