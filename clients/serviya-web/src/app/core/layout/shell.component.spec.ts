import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { ShellComponent } from './shell.component';

@Component({
  standalone: true,
  template: '<p>Cliente placeholder</p>'
})
class PlaceholderComponent {}

describe('ShellComponent', () => {
  let fixture: ComponentFixture<ShellComponent>;

  beforeEach(async () => {
    const authStub = {
      isAuthenticated: () => true,
      username: () => 'Cliente Uno',
      roles: () => ['CLIENTE'],
      login: jasmine.createSpy('login').and.resolveTo(),
      logout: jasmine.createSpy('logout').and.resolveTo()
    };

    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        provideRouter([{ path: '', component: PlaceholderComponent }]),
        { provide: AuthService, useValue: authStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
  });

  it('renders the authenticated shell navigation', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.topbar')?.textContent).toContain('Cliente Uno');
    expect(compiled.querySelector('.sidebar')?.textContent).toContain('Cliente');
    expect(compiled.querySelector('.app-content')).not.toBeNull();
  });
});
