import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { SERVIYA_APP_CONFIG } from '../../../core/config/app-config';
import { NotificationsPageComponent } from './notifications-page.component';

describe('NotificationsPageComponent', () => {
  let component: NotificationsPageComponent;
  let fixture: ComponentFixture<NotificationsPageComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SERVIYA_APP_CONFIG, useValue: { apiBaseUrl: '' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsPageComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('notificaciones cargan', () => {
    const req = httpTestingController.expectOne('/notification-ms/api/v1/notifications/me');
    expect(req.request.method).toEqual('GET');
    req.flush([
      {
        id: 1,
        title: 'Test',
        message: 'Message',
        status: 'UNREAD',
        createdAt: '2026-06-22T00:00:00Z'
      }
    ]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Test');
    expect(text).toContain('Message');
  });
});
