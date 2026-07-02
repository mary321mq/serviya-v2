import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { PagoCliente, PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-payments-history-page',
  standalone: true,
  imports: [CommonModule, DatePipe, LucideAngularModule],
  template: `
    <section class="payments-page">
      <header class="page-hero">
        <div>
          <span class="eyebrow">Pagos</span>
          <h1>Historial de pagos</h1>
          <p>Consulta tus pagos, estados y descarga tu boleta o factura cuando el cobro este confirmado.</p>
        </div>
      </header>

      <div class="summary-grid">
        <div class="summary-card">
          <lucide-icon name="receipt-text" [size]="22"></lucide-icon>
          <span>Total pagado</span>
          <strong>S/ {{ totalPagado | number:'1.2-2' }}</strong>
        </div>
        <div class="summary-card">
          <lucide-icon name="clock" [size]="22"></lucide-icon>
          <span>Pendientes</span>
          <strong>{{ pendientes }}</strong>
        </div>
        <div class="summary-card">
          <lucide-icon name="file-check-2" [size]="22"></lucide-icon>
          <span>Comprobantes</span>
          <strong>{{ aprobados }}</strong>
        </div>
      </div>

      <section class="table-card">
        <div class="table-header">
          <span>Solicitud</span>
          <span>Comprobante</span>
          <span>Metodo</span>
          <span>Monto</span>
          <span>Estado</span>
          <span>Accion</span>
        </div>

        @for (pago of pagos; track pago.id) {
          <article class="payment-row">
            <div>
              <strong>Solicitud #{{ pago.solicitudId }}</strong>
              <small>{{ pago.createdAt | date:'dd/MM/yyyy HH:mm' }}</small>
            </div>
            <div>
              <strong>{{ pago.tipoComprobante === 'FACTURA' ? 'Factura' : 'Boleta' }}</strong>
              <small>{{ pago.tipoDocumento }} {{ pago.numeroDocumento }}</small>
            </div>
            <div>
              <span class="method">{{ formatMetodo(pago.pasarela) }}</span>
            </div>
            <div class="amount">S/ {{ pago.montoTotal | number:'1.2-2' }}</div>
            <div>
              <span class="status" [class.ok]="pago.estadoPago === 'PAGADO_ESCROW'" [class.pending]="pago.estadoPago === 'PENDIENTE'" [class.failed]="pago.estadoPago === 'FALLIDO'">
                {{ formatEstado(pago.estadoPago) }}
              </span>
            </div>
            <div>
              <button class="download-btn" [disabled]="pago.estadoPago !== 'PAGADO_ESCROW' || downloadingId === pago.id" (click)="descargar(pago)">
                <lucide-icon name="download" [size]="16"></lucide-icon>
                {{ downloadingId === pago.id ? 'Descargando...' : 'Descargar PDF' }}
              </button>
            </div>
          </article>
        } @empty {
          <div class="empty-state">
            <lucide-icon name="receipt" [size]="40"></lucide-icon>
            <p>Aun no tienes pagos registrados.</p>
          </div>
        }
      </section>
    </section>
  `,
  styles: [`
    .payments-page { display: flex; flex-direction: column; gap: 22px; }
    .page-hero { background: radial-gradient(circle at top left, rgba(30,144,255,.22), transparent 34%), linear-gradient(135deg, #0B1120, #111827); border: 1px solid rgba(30,144,255,.28); border-radius: 18px; padding: 28px; box-shadow: var(--glow-blue); }
    .eyebrow { color: var(--accent-neon); font-size: .78rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    h1 { color: var(--text-primary); margin: 8px 0; font-size: 2rem; }
    p { color: var(--text-secondary); margin: 0; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; }
    .summary-card { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 8px; }
    .summary-card lucide-icon { color: var(--primary-neon); filter: drop-shadow(0 0 8px rgba(30,144,255,.35)); }
    .summary-card span { color: var(--text-secondary); font-size: .88rem; }
    .summary-card strong { color: var(--text-primary); font-size: 1.5rem; }
    .table-card { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; }
    .table-header, .payment-row { display: grid; grid-template-columns: 1.2fr 1.2fr 1fr .8fr 1fr 1.1fr; gap: 14px; align-items: center; padding: 16px 18px; }
    .table-header { color: var(--primary-neon); background: rgba(30,144,255,.06); font-size: .78rem; font-weight: 800; text-transform: uppercase; }
    .payment-row { border-top: 1px solid var(--border-color); }
    .payment-row strong { color: var(--text-primary); display: block; }
    .payment-row small { color: var(--text-secondary); display: block; margin-top: 3px; }
    .method { color: var(--text-primary); }
    .amount { color: var(--accent-neon); font-weight: 800; }
    .status { border: 1px solid var(--border-color); border-radius: 999px; color: var(--text-secondary); display: inline-flex; font-size: .8rem; font-weight: 700; padding: 6px 10px; }
    .status.ok { background: rgba(34,197,94,.12); border-color: rgba(34,197,94,.32); color: #4ade80; }
    .status.pending { background: rgba(250,204,21,.12); border-color: rgba(250,204,21,.32); color: #fde047; }
    .status.failed { background: rgba(239,68,68,.12); border-color: rgba(239,68,68,.32); color: #fca5a5; }
    .download-btn { align-items: center; background: rgba(30,144,255,.12); border: 1px solid rgba(30,144,255,.35); border-radius: 10px; color: var(--primary-neon); cursor: pointer; display: inline-flex; gap: 8px; min-height: 38px; padding: 0 12px; }
    .download-btn:disabled { cursor: not-allowed; opacity: .45; }
    .empty-state { align-items: center; color: var(--text-secondary); display: flex; flex-direction: column; gap: 10px; padding: 44px; }
    @media (max-width: 920px) { .table-header { display: none; } .payment-row { grid-template-columns: 1fr; } }
  `]
})
export class PaymentsHistoryPageComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);

  protected pagos: PagoCliente[] = [];
  protected downloadingId: number | null = null;

  ngOnInit(): void {
    this.paymentService.listarMisPagos().subscribe({
      next: (pagos) => this.pagos = pagos,
      error: (err) => console.error('Error al cargar pagos del cliente', err)
    });
  }

  get totalPagado(): number {
    return this.pagos
      .filter((p) => p.estadoPago === 'PAGADO_ESCROW')
      .reduce((sum, p) => sum + Number(p.montoTotal || 0), 0);
  }

  get pendientes(): number {
    return this.pagos.filter((p) => p.estadoPago === 'PENDIENTE').length;
  }

  get aprobados(): number {
    return this.pagos.filter((p) => p.estadoPago === 'PAGADO_ESCROW').length;
  }

  protected descargar(pago: PagoCliente): void {
    this.downloadingId = pago.id;
    this.paymentService.descargarComprobante(pago.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pago.tipoComprobante.toLowerCase()}-serviya-${pago.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.downloadingId = null;
      },
      error: (err) => {
        console.error('Error al descargar comprobante', err);
        this.downloadingId = null;
      }
    });
  }

  protected formatEstado(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      PAGADO_ESCROW: 'Pagado',
      REEMBOLSADO: 'Reembolsado',
      LIQUIDADO_AL_TECNICO: 'Liquidado',
      FALLIDO: 'Fallido'
    };
    return map[estado] || estado;
  }

  protected formatMetodo(metodo: string): string {
    const map: Record<string, string> = {
      YAPE_PLIN: 'Yape / Plin',
      MERCADO_PAGO: 'Tarjeta',
      CULQI: 'Tarjeta',
      TRANSFERENCIA: 'Transferencia'
    };
    return map[metodo] || metodo;
  }
}
