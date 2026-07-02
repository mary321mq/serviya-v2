import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminEventsService, SystemEvent } from '../services/admin-events.service';

@Component({
  selector: 'app-events-monitor-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto py-8">
      <h1 class="text-2xl font-bold mb-4">Monitor de Eventos (Simulado)</h1>
      <p class="text-gray-600 mb-4">Muestra los eventos procesados a través del Outbox/Inbox y el bus de Kafka.</p>
      
      <div class="overflow-x-auto bg-gray-900 text-green-400 rounded shadow font-mono text-sm max-h-96">
        <table class="min-w-full text-left whitespace-nowrap">
          <thead class="bg-gray-800 uppercase tracking-wider sticky top-0">
            <tr>
              <th class="px-4 py-3">Fecha</th>
              <th class="px-4 py-3">Tipo de Evento</th>
              <th class="px-4 py-3">Agregado</th>
              <th class="px-4 py-3">Payload</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ev of events" class="border-b border-gray-700 hover:bg-gray-800">
              <td class="px-4 py-3">{{ ev.createdAt | date:'mediumTime' }}</td>
              <td class="px-4 py-3 text-blue-300">{{ ev.type }}</td>
              <td class="px-4 py-3">{{ ev.aggregateId }}</td>
              <td class="px-4 py-3 text-xs whitespace-pre-wrap">{{ ev.payload | json }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class EventsMonitorPageComponent implements OnInit {
  events: SystemEvent[] = [];
  private service = inject(AdminEventsService);

  ngOnInit(): void {
    this.service.getEvents().subscribe(res => this.events = res);
  }
}
