import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';

export interface WalletMovement {
  id: number;
  technicianId: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  createdAt: string;
}

export interface WithdrawalMethod {
  id: number;
  technicianId: string;
  type: 'CARD' | 'YAPE' | 'PLIN' | 'PAYPAL';
  holderName: string;
  destination: string;
  alias: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRequest {
  id: number;
  technicianId: string;
  methodId: number;
  amount: number;
  currency: string;
  status: string;
  destinationSummary: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianWallet {
  technicianId: string;
  balance: number;
  currency: string;
  updatedAt: string;
  movements: WalletMovement[];
  withdrawalMethods: WithdrawalMethod[];
  withdrawals: WithdrawalRequest[];
}

@Injectable({ providedIn: 'root' })
export class TechnicianWalletService {
  private readonly api = inject(ApiClientService);
  private readonly basePath = '/payment-ms/api/v1/wallet/me';

  getWallet(): Observable<TechnicianWallet> {
    return this.api.get<TechnicianWallet>(this.basePath);
  }

  createMethod(payload: {
    type: string;
    holderName: string;
    destination: string;
    alias: string;
  }): Observable<WithdrawalMethod> {
    return this.api.post<WithdrawalMethod, typeof payload>(`${this.basePath}/methods`, payload);
  }

  requestWithdrawal(payload: { methodId: number; amount: number }): Observable<WithdrawalRequest> {
    return this.api.post<WithdrawalRequest, typeof payload>(`${this.basePath}/withdrawals`, payload);
  }
}
