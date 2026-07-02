import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export interface Tariff {
  tariffId: string;
  serviceCode: string;
  basePrice: number;
  currency: string;
  version: number;
  active: boolean;
}

export interface PaymentTransaction {
  id: number;
  transactionId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: number;
  transactionId: string;
  type: string;
  amount: number;
  currency: string;
  debitAccount: string;
  creditAccount: string;
  referenceType: string;
  referenceId: string;
  createdAt: string;
}

export interface Wallet {
  technicianId: string;
  balance: number;
  currency: string;
  updatedAt: string;
}

export interface Settlement {
  id: number;
  settlementId: string;
  technicianId: string;
  totalAmount: number;
  status: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminPaymentService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/payment-ms/api/v1/admin';

  getTariffs(): Observable<Tariff[]> {
    return this.api.get<Tariff[]>(`${this.basePath}/tariffs`);
  }

  createTariff(payload: any): Observable<Tariff> {
    return this.api.post<Tariff, any>(`${this.basePath}/tariffs`, payload);
  }

  updateTariff(tariffId: string, payload: any): Observable<Tariff> {
    return this.api.put<Tariff, any>(`${this.basePath}/tariffs/${tariffId}`, payload);
  }

  activateTariff(tariffId: string): Observable<Tariff> {
    return this.api.post<Tariff, any>(`${this.basePath}/tariffs/${tariffId}/activate`, {});
  }

  deactivateTariff(tariffId: string): Observable<Tariff> {
    return this.api.post<Tariff, any>(`${this.basePath}/tariffs/${tariffId}/deactivate`, {});
  }

  getPayments(): Observable<PaymentTransaction[]> {
    return this.api.get<PaymentTransaction[]>(`${this.basePath}/payments`);
  }

  getWallets(): Observable<Wallet[]> {
    return this.api.get<Wallet[]>(`${this.basePath}/wallets`);
  }

  getSettlements(): Observable<Settlement[]> {
    return this.api.get<Settlement[]>(`${this.basePath}/settlements`);
  }

  getLedger(): Observable<LedgerEntry[]> {
    return this.api.get<LedgerEntry[]>(`${this.basePath}/ledger`);
  }

  adjustLedger(payload: { technicianId: string; amount: number; currency: string; reason: string }): Observable<void> {
    return this.api.post<void, any>(`${this.basePath}/ledger/adjustments`, payload);
  }
}
