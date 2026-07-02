import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CreateRequestPageComponent } from './create-request-page.component';

describe('CreateRequestPageComponent', () => {
  let fixture: ComponentFixture<CreateRequestPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRequestPageComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRequestPageComponent);
    fixture.detectChanges();
  });

  it('points users to the connected catalog flow', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Elige un servicio del catalogo');
    expect(text).toContain('Ir al catalogo');
  });
});
