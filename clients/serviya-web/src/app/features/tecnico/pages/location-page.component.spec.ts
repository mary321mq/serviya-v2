import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationPageComponent } from './location-page.component';
import { TechnicianLocationService } from '../services/technician-location.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('LocationPageComponent', () => {
  let component: LocationPageComponent;
  let fixture: ComponentFixture<LocationPageComponent>;
  let locServiceMock: jasmine.SpyObj<TechnicianLocationService>;

  beforeEach(async () => {
    locServiceMock = jasmine.createSpyObj('TechnicianLocationService', ['getLocation', 'saveLocation']);
    locServiceMock.getLocation.and.returnValue(of(null as any));

    await TestBed.configureTestingModule({
      imports: [LocationPageComponent, RouterTestingModule],
      providers: [
        { provide: TechnicianLocationService, useValue: locServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should update location via navigator.geolocation', () => {
    const mockGeolocation = {
      getCurrentPosition: jasmine.createSpy('getCurrentPosition').and.callFake((success: Function) => {
        success({ coords: { latitude: 12.34, longitude: 56.78 } });
      })
    };
    spyOnProperty(navigator, 'geolocation', 'get').and.returnValue(mockGeolocation as any);

    locServiceMock.saveLocation.and.returnValue(of({ id: 1, lat: 12.34, lng: 56.78, capturedAt: '', expiresAt: '' }));

    component.updateLocation();

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(locServiceMock.saveLocation).toHaveBeenCalledWith({ latitud: 12.34, longitud: 56.78 });
    expect(component.updating).toBeFalse();
  });
});
