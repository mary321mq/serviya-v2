import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { AdminPaymentService, Tariff } from '../services/admin-payment.service';

@Component({
  selector: 'app-tariffs-page',
  standalone: true,
  imports: [CommonModule, ServicioTextoPipe],
  template: `
    <div class="max-w-4xl mx-auto py-8">
      <h1 class="text-2xl font-bold mb-4">Gestion de tarifas</h1>
      <button (click)="createTariff()" class="mb-4 px-4 py-2 bg-blue-600 text-white rounded">Nueva tarifa</button>
      
      <div class="overflow-x-auto bg-white rounded shadow">
        <table class="min-w-full text-left text-sm whitespace-nowrap">
          <thead class="bg-gray-100 uppercase tracking-wider border-b-2">
            <tr>
              <th class="px-6 py-4">Servicio</th>
              <th class="px-6 py-4">Precio base</th>
              <th class="px-6 py-4">Version</th>
              <th class="px-6 py-4">Activo</th>
              <th class="px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of tariffs" class="border-b hover:bg-gray-50">
              <td class="px-6 py-4">{{ t.serviceCode | servicioTexto }}</td>
              <td class="px-6 py-4">{{ t.basePrice | number:'1.2-2' }} {{ t.currency }}</td>
              <td class="px-6 py-4">v{{ t.version }}</td>
              <td class="px-6 py-4">
                <span [class.text-green-600]="t.active" [class.text-red-600]="!t.active" class="font-bold">
                  {{ t.active ? 'Si' : 'No' }}
                </span>
              </td>
              <td class="px-6 py-4 flex gap-2">
                <button *ngIf="!t.active" (click)="toggleActive(t, true)" class="px-3 py-1 bg-green-500 text-white rounded">Activar</button>
                <button *ngIf="t.active" (click)="toggleActive(t, false)" class="px-3 py-1 bg-red-500 text-white rounded">Desactivar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class TariffsPageComponent implements OnInit {
  tariffs: Tariff[] = [];
  private service = inject(AdminPaymentService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.getTariffs().subscribe(res => this.tariffs = res);
  }

  createTariff(): void {
    const serviceCode = prompt('Servicio:');
    const basePriceStr = prompt('Precio base:');
    const currency = prompt('Moneda (ej. PEN, USD):');
    if (serviceCode && basePriceStr && currency) {
      this.service.createTariff({ serviceCode, basePrice: parseFloat(basePriceStr), currency }).subscribe(() => this.load());
    }
  }

  toggleActive(t: Tariff, active: boolean): void {
    const req = active ? this.service.activateTariff(t.tariffId) : this.service.deactivateTariff(t.tariffId);
    req.subscribe(() => this.load());
  }
}
