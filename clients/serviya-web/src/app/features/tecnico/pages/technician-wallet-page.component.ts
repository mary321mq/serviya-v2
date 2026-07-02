import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import {
  TechnicianWallet,
  TechnicianWalletService,
  WithdrawalMethod
} from '../services/technician-wallet.service';

@Component({
  selector: 'app-technician-wallet-page',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, LucideAngularModule],
  template: `
    <section class="wallet-page">
      <header class="wallet-hero">
        <div>
          <span class="eyebrow">Billetera</span>
          <h1>Pagos acumulados ServiYa</h1>
          <p>Administra tus abonos por servicios completados y retira tu saldo por tarjeta, Yape, Plin o PayPal.</p>
        </div>
        <div class="balance-box">
          <span>Saldo disponible</span>
          <strong>S/ {{ wallet?.balance || 0 | number:'1.2-2' }}</strong>
        </div>
      </header>

      <div class="wallet-grid">
        <section class="panel">
          <div class="panel-title">
            <lucide-icon name="plus-circle" [size]="20"></lucide-icon>
            <h2>Asociar metodo de retiro</h2>
          </div>

          <form class="form-grid" (ngSubmit)="guardarMetodo()">
            <label>
              Modalidad
              <select [(ngModel)]="methodForm.type" name="type" required>
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
                <option value="CARD">Tarjeta bancaria</option>
                <option value="PAYPAL">PayPal</option>
              </select>
            </label>
            <label>
              Titular
              <input [(ngModel)]="methodForm.holderName" name="holderName" placeholder="Nombre del titular" required>
            </label>
            <label>
              Numero, cuenta o correo
              <input [(ngModel)]="methodForm.destination" name="destination" placeholder="Ej. 999888777 o correo@paypal.com" required>
            </label>
            <label>
              Alias
              <input [(ngModel)]="methodForm.alias" name="alias" placeholder="Ej. Mi Yape principal">
            </label>
            <button class="primary-button" type="submit" [disabled]="savingMethod">
              {{ savingMethod ? 'Guardando...' : 'Guardar metodo' }}
            </button>
          </form>
        </section>

        <section class="panel">
          <div class="panel-title">
            <lucide-icon name="send" [size]="20"></lucide-icon>
            <h2>Solicitar retiro</h2>
          </div>

          <form class="form-grid" (ngSubmit)="solicitarRetiro()">
            <label>
              Metodo
              <select [(ngModel)]="withdrawForm.methodId" name="methodId" required>
                <option [ngValue]="null">Selecciona un metodo</option>
                @for (method of wallet?.withdrawalMethods || []; track method.id) {
                  <option [ngValue]="method.id">{{ formatMethod(method) }}</option>
                }
              </select>
            </label>
            <label>
              Monto
              <input type="number" [(ngModel)]="withdrawForm.amount" name="amount" min="1" step="0.01" required>
            </label>
            <button class="primary-button accent" type="submit" [disabled]="requestingWithdrawal || !withdrawForm.methodId">
              {{ requestingWithdrawal ? 'Procesando...' : 'Solicitar retiro' }}
            </button>
          </form>
          @if (message) {
            <p class="message">{{ message }}</p>
          }
        </section>
      </div>

      <section class="panel">
        <div class="panel-title">
          <lucide-icon name="wallet-cards" [size]="20"></lucide-icon>
          <h2>Metodos asociados</h2>
        </div>
        <div class="methods-list">
          @for (method of wallet?.withdrawalMethods || []; track method.id) {
            <article class="method-card">
              <strong>{{ formatMethodType(method.type) }}</strong>
              <span>{{ method.alias || 'Sin alias' }}</span>
              <small>{{ method.holderName }} - {{ mask(method.destination) }}</small>
            </article>
          } @empty {
            <p class="empty">Aun no tienes metodos de retiro asociados.</p>
          }
        </div>
      </section>

      <div class="wallet-grid">
        <section class="panel">
          <div class="panel-title">
            <lucide-icon name="list" [size]="20"></lucide-icon>
            <h2>Movimientos</h2>
          </div>
          <div class="movement-list">
            @for (movement of wallet?.movements || []; track movement.id) {
              <article class="movement-row">
                <div>
                  <strong>{{ formatMovement(movement.type) }}</strong>
                  <small>{{ movement.description || 'Movimiento de billetera' }}</small>
                </div>
                <div class="movement-amount" [class.negative]="movement.amount < 0">
                  {{ movement.amount < 0 ? '-' : '+' }} S/ {{ abs(movement.amount) | number:'1.2-2' }}
                  <small>{{ movement.createdAt | date:'dd/MM/yyyy HH:mm' }}</small>
                </div>
              </article>
            } @empty {
              <p class="empty">Aun no hay movimientos en tu billetera.</p>
            }
          </div>
        </section>

        <section class="panel">
          <div class="panel-title">
            <lucide-icon name="history" [size]="20"></lucide-icon>
            <h2>Retiros solicitados</h2>
          </div>
          <div class="movement-list">
            @for (withdrawal of wallet?.withdrawals || []; track withdrawal.id) {
              <article class="movement-row">
                <div>
                  <strong>{{ withdrawal.destinationSummary }}</strong>
                  <small>{{ withdrawal.createdAt | date:'dd/MM/yyyy HH:mm' }}</small>
                </div>
                <div class="movement-amount negative">
                  S/ {{ withdrawal.amount | number:'1.2-2' }}
                  <small>{{ formatStatus(withdrawal.status) }}</small>
                </div>
              </article>
            } @empty {
              <p class="empty">Aun no solicitaste retiros.</p>
            }
          </div>
        </section>
      </div>
    </section>
  `,
  styles: [`
    .wallet-page { display: flex; flex-direction: column; gap: 22px; }
    .wallet-hero { align-items: center; background: radial-gradient(circle at top left, rgba(30,144,255,.24), transparent 34%), radial-gradient(circle at top right, rgba(255,138,0,.18), transparent 30%), linear-gradient(135deg, #0B1120, #111827); border: 1px solid rgba(30,144,255,.28); border-radius: 18px; box-shadow: var(--glow-blue); display: flex; justify-content: space-between; gap: 20px; padding: 28px; }
    .eyebrow { color: var(--accent-neon); display: block; font-size: .78rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    h1, h2, p { margin: 0; }
    h1 { color: var(--text-primary); font-size: 2rem; margin-top: 8px; }
    .wallet-hero p, .empty, .message { color: var(--text-secondary); margin-top: 8px; }
    .balance-box { background: rgba(30,144,255,.1); border: 1px solid rgba(30,144,255,.32); border-radius: 16px; min-width: 240px; padding: 20px; text-align: right; }
    .balance-box span { color: var(--text-secondary); display: block; }
    .balance-box strong { color: var(--accent-neon); display: block; font-size: 2.2rem; margin-top: 8px; }
    .wallet-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; }
    .panel { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 16px; padding: 20px; }
    .panel-title { align-items: center; color: var(--text-primary); display: flex; gap: 10px; margin-bottom: 16px; }
    .panel-title lucide-icon { color: var(--primary-neon); filter: drop-shadow(0 0 8px rgba(30,144,255,.35)); }
    .panel-title h2 { font-size: 1.1rem; }
    .form-grid { display: grid; gap: 12px; }
    label { color: var(--text-secondary); display: grid; gap: 6px; font-size: .86rem; }
    input, select { background: #0f172a; border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-primary); min-height: 42px; padding: 0 12px; }
    .primary-button { background: linear-gradient(135deg, var(--primary-600), var(--primary-neon)); border: 0; border-radius: 10px; box-shadow: var(--glow-blue); color: #fff; cursor: pointer; font-weight: 800; min-height: 44px; }
    .primary-button.accent { background: linear-gradient(135deg, var(--accent-600), var(--accent-neon)); box-shadow: var(--glow-orange); }
    .primary-button:disabled { cursor: not-allowed; opacity: .55; }
    .methods-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
    .method-card { background: #0f172a; border: 1px solid var(--border-color); border-radius: 12px; display: grid; gap: 5px; padding: 14px; }
    .method-card strong { color: var(--primary-neon); }
    .method-card span { color: var(--text-primary); }
    .method-card small, .movement-row small { color: var(--text-secondary); }
    .movement-list { display: grid; gap: 10px; }
    .movement-row { align-items: center; background: #0f172a; border: 1px solid var(--border-color); border-radius: 12px; display: flex; justify-content: space-between; gap: 12px; padding: 14px; }
    .movement-row strong { color: var(--text-primary); display: block; }
    .movement-amount { color: #4ade80; font-weight: 900; text-align: right; }
    .movement-amount.negative { color: #fca5a5; }
    .movement-amount small { display: block; font-weight: 500; margin-top: 3px; }
    @media (max-width: 780px) { .wallet-hero { align-items: flex-start; flex-direction: column; } .balance-box { min-width: 0; text-align: left; width: 100%; } }
  `]
})
export class TechnicianWalletPageComponent implements OnInit {
  private readonly walletService = inject(TechnicianWalletService);

  protected wallet: TechnicianWallet | null = null;
  protected savingMethod = false;
  protected requestingWithdrawal = false;
  protected message = '';

  protected methodForm = {
    type: 'YAPE',
    holderName: '',
    destination: '',
    alias: ''
  };

  protected withdrawForm: { methodId: number | null; amount: number } = {
    methodId: null,
    amount: 0
  };

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.walletService.getWallet().subscribe({
      next: (wallet) => this.wallet = wallet,
      error: (err) => console.error('Error al cargar billetera', err)
    });
  }

  protected guardarMetodo(): void {
    this.savingMethod = true;
    this.walletService.createMethod({
      ...this.methodForm,
      alias: this.methodForm.alias || this.methodForm.type
    }).subscribe({
      next: () => {
        this.savingMethod = false;
        this.methodForm = { type: 'YAPE', holderName: '', destination: '', alias: '' };
        this.load();
      },
      error: (err) => {
        console.error('Error al guardar metodo de retiro', err);
        this.savingMethod = false;
      }
    });
  }

  protected solicitarRetiro(): void {
    if (!this.withdrawForm.methodId) {
      return;
    }
    this.requestingWithdrawal = true;
    this.walletService.requestWithdrawal({
      methodId: this.withdrawForm.methodId,
      amount: Number(this.withdrawForm.amount)
    }).subscribe({
      next: () => {
        this.message = 'Retiro solicitado correctamente. El administrador lo revisara.';
        this.requestingWithdrawal = false;
        this.withdrawForm = { methodId: null, amount: 0 };
        this.load();
      },
      error: (err) => {
        this.message = err?.error?.detail || 'No se pudo solicitar el retiro.';
        this.requestingWithdrawal = false;
      }
    });
  }

  protected formatMethod(method: WithdrawalMethod): string {
    return `${this.formatMethodType(method.type)} - ${method.alias || this.mask(method.destination)}`;
  }

  protected formatMethodType(type: string): string {
    const map: Record<string, string> = {
      CARD: 'Tarjeta bancaria',
      YAPE: 'Yape',
      PLIN: 'Plin',
      PAYPAL: 'PayPal'
    };
    return map[type] || type;
  }

  protected formatMovement(type: string): string {
    const map: Record<string, string> = {
      ABONO_SERVIYA: 'Abono ServiYa',
      RETIRO_SOLICITADO: 'Retiro solicitado'
    };
    return map[type] || type;
  }

  protected formatStatus(status: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      APROBADO: 'Aprobado',
      RECHAZADO: 'Rechazado',
      PAGADO: 'Pagado'
    };
    return map[status] || status;
  }

  protected mask(value: string): string {
    if (!value || value.length <= 4) {
      return '****';
    }
    return `****${value.slice(-4)}`;
  }

  protected abs(value: number): number {
    return Math.abs(Number(value || 0));
  }
}
