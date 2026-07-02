import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { SERVIYA_APP_CONFIG } from '../config/app-config';
import { AuthService } from './auth.service';
import { tokenInterceptor } from './token.interceptor';

describe('tokenInterceptor', () => {
  let httpMock: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['getValidToken']);
    auth.getValidToken.and.resolveTo('secure-token');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        {
          provide: SERVIYA_APP_CONFIG,
          useValue: {
            apiBaseUrl: 'http://localhost:8080',
            keycloak: { url: 'http://localhost:8089', realm: 'serviya', clientId: 'serviya-web' }
          }
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('adds Authorization Bearer only for API Gateway requests', fakeAsync(() => {
    const http = TestBed.inject(HttpClient);

    http.get('http://localhost:8080/user-ms/profile').subscribe();
    tick();

    const apiRequest = httpMock.expectOne('http://localhost:8080/user-ms/profile');
    expect(apiRequest.request.headers.get('Authorization')).toBe('Bearer secure-token');
    apiRequest.flush({});

    http.get('https://assets.example.test/app.json').subscribe();
    tick();

    const externalRequest = httpMock.expectOne('https://assets.example.test/app.json');
    expect(externalRequest.request.headers.has('Authorization')).toBeFalse();
    externalRequest.flush({});
  }));
});
