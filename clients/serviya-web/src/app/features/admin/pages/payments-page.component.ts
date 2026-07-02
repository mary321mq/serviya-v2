import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { EstadoTextoPipe, MetodoPagoTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { AdminPaymentService, LedgerEntry, PaymentTransaction } from '../services/admin-payment.service';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [CommonModule, EstadoTextoPipe, MetodoPagoTextoPipe],
  template: `
    <div class="max-w-5xl mx-auto py-8">
      <h1 class="text-2xl font-bold mb-4">Pagos y libro mayor</h1>

      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-2">Transacciones de pago</h2>
        <div class="overflow-x-auto bg-white rounded shadow max-h-64">
          <table class="min-w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-gray-100 uppercase tracking-wider sticky top-0">
              <tr>
                <th class="px-6 py-4">Operacion</th>
                <th class="px-6 py-4">Monto</th>
                <th class="px-6 py-4">Metodo</th>
                <th class="px-6 py-4">Estado</th>
                <th class="px-6 py-4">Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of payments" class="border-b hover:bg-gray-50">
                <td class="px-6 py-4">Pago registrado</td>
                <td class="px-6 py-4">{{ p.amount | number:'1.2-2' }} {{ p.currency }}</td>
                <td class="px-6 py-4">{{ p.paymentMethod | metodoPagoTexto }}</td>
                <td class="px-6 py-4">{{ p.status | estadoTexto }}</td>
                <td class="px-6 py-4">{{ p.createdAt | date:'short' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 class="text-xl font-semibold mb-2 flex justify-between">
          Libro mayor
          <button (click)="adjustLedger()" class="px-3 py-1 bg-yellow-500 text-white rounded text-sm">Nuevo ajuste</button>
        </h2>
        <div class="overflow-x-auto bg-white rounded shadow max-h-96">
          <table class="min-w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-gray-100 uppercase tracking-wider sticky top-0">
              <tr>
                <th class="px-4 py-3">Tipo</th>
                <th class="px-4 py-3">Monto</th>
                <th class="px-4 py-3">Origen</th>
                <th class="px-4 py-3">Destino</th>
                <th class="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let entry of ledger" class="border-b hover:bg-gray-50">
                <td class="px-4 py-3">{{ formatLedgerType(entry.type) }}</td>
                <td class="px-4 py-3 font-semibold">{{ entry.amount | number:'1.2-2' }} {{ entry.currency }}</td>
                <td class="px-4 py-3">{{ formatAccount(entry.debitAccount) }}</td>
                <td class="px-4 py-3">{{ formatAccount(entry.creditAccount) }}</td>
                <td class="px-4 py-3">{{ entry.createdAt | date:'short' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PaymentsPageComponent implements OnInit {
  payments: PaymentTransaction[] = [];
  ledger: LedgerEntry[] = [];
  private service = inject(AdminPaymentService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.getPayments().subscribe(res => this.payments = res);
    this.service.getLedger().subscribe(res => this.ledger = res);
  }

  adjustLedger(): void {
    const technicianId = prompt('Codigo interno del tecnico para el ajuste:');
    const amountStr = prompt('Monto del ajuste (positivo a favor del tecnico, negativo en contra):');
    const currency = prompt('Moneda (ej. PEN):', 'PEN');
    const reason = prompt('Motivo del ajuste:');

    if (technicianId && amountStr && currency && reason) {
      this.service.adjustLedger({
        technicianId,
        amount: parseFloat(amountStr),
        currency,
        reason
      }).subscribe(() => this.load());
    }
  }

  protected formatLedgerType(type: string): string {
    const normalized = type?.toUpperCase?.() ?? '';
    const labels: Record<string, string> = {
      PAYMENT: 'Pago',
      CAPTURE: 'Cobro capturado',
      ADJUSTMENT: 'Ajuste manual',
      SETTLEMENT: 'Liquidacion',
      REFUND: 'Devolucion',
      COMMISSION: 'Comision'
    };
    return labels[normalized] ?? 'Movimiento contable';
  }

  protected formatAccount(account: string): string {
    const normalized = account?.toUpperCase?.() ?? '';
    if (normalized.includes('CLIENT')) return 'Cuenta del cliente';
    if (normalized.includes('TECH') || normalized.includes('TECN')) return 'Cuenta del tecnico';
    if (normalized.includes('SERVIYA') || normalized.includes('PLATFORM')) return 'Cuenta ServiYa';
    if (normalized.includes('BANK') || normalized.includes('CASH')) return 'Cuenta de cobro';
    return 'Cuenta interna';
  }
}
