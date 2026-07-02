import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { NotificationService } from '../services/notification.service';
import { ServiceRequestService } from '../services/service-request.service';
import { RequestDetailPageComponent } from './request-detail-page.component';

describe('RequestDetailPageComponent', () => {
  let fixture: ComponentFixture<RequestDetailPageComponent>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => '123'
      }
    }
  };

  const mockRequestService = {
    tracking: jasmine.createSpy('tracking').and.returnValue(of({
      id: 123,
      clienteId: 'client-1',
      tecnicoId: 'tech-1',
      catalogoServicio: {
        id: 1,
        codigo: 'S1',
        categoryCode: 'CAT',
        nombre: 'Gasfiteria',
        descripcion: 'Revision',
        precioBaseReferencial: 25,
        requiereFoto: false,
        activo: true,
        tipoCobro: 'COTIZACION',
        modalidadEvaluacion: 'PRESENCIAL'
      },
      urlEvidencia: '',
      direccionFisica: 'Av. 1',
      latitud: -12,
      longitud: -77,
      costoVisita: 25,
      costoManoObra: 30,
      costoMateriales: 10,
      costoTotal: 65,
      estadoSolicitud: 'COTIZADO_ESPERANDO_PAGO',
      createdAt: '2026-06-22T00:00:00',
      updatedAt: '2026-06-22T01:00:00'
    })),
    cancelRequest: jasmine.createSpy('cancelRequest'),
    getMatches: jasmine.createSpy('getMatches').and.returnValue(of([])),
    asignarTecnico: jasmine.createSpy('asignarTecnico')
  };

  const mockNotificationService = {
    getTimeline: jasmine.createSpy('getTimeline').and.returnValue(of([]))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ServiceRequestService, useValue: mockRequestService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestDetailPageComponent);
    fixture.detectChanges();
  });

  it('shows quote details and payment action', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Gasfiteria');
    expect(text).toContain('Av. 1');
    expect(text).toContain('Cotizada, esperando pago');
    expect(text).toContain('Pagar cotizacion');
  });
});
