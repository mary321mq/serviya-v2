import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ServicioTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { TechnicianSpecialty } from '../models/technician.model';
import { TechnicianProfileService } from '../services/technician-profile.service';

@Component({
  selector: 'app-specialties-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ServicioTextoPipe],
  template: `
    <section class="page-header">
      <div>
        <a routerLink="/tecnico" class="eyebrow">&larr; Volver</a>
        <h1>Especialidades</h1>
      </div>
    </section>

    <div class="list-container">
      <ul>
        <li *ngFor="let s of specialties">
          <div>
            <strong>{{ s.serviceCode | servicioTexto }}</strong> ({{ s.experienceYears }} años) - 
            <span [class.active-status]="s.active" [class.inactive-status]="!s.active">
              {{ s.active ? 'Activa' : 'Inactiva' }}
            </span>
          </div>
          <button (click)="deleteSpecialty(s.id)" class="action-button secondary small">Eliminar</button>
        </li>
      </ul>
      <p *ngIf="specialties.length === 0">No tienes especialidades configuradas.</p>
    </div>

    <form [formGroup]="form" (ngSubmit)="onAdd()" class="form-container">
      <h3>Agregar especialidad</h3>
      <div class="form-group">
        <label>Servicio</label>
        <input formControlName="serviceCode" type="text" placeholder="Ej: Gasfiteria o electricidad" />
      </div>
      <div class="form-group">
        <label>Años de experiencia</label>
        <input formControlName="experienceYears" type="number" min="0" />
      </div>
      <div class="form-group checkbox-group">
        <label>
          <input type="checkbox" formControlName="active" />
          Especialidad activa
        </label>
      </div>
      <button type="submit" [disabled]="form.invalid || saving" class="action-button">Guardar</button>
    </form>
  `,
  styles: [`
    .list-container { margin-bottom: 2rem; }
    .list-container li { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid #ccc; }
    .active-status { color: #059669; }
    .inactive-status { color: #dc2626; }
    .form-container { max-width: 400px; padding: 1rem; border: 1px solid #eee; border-radius: 4px; }
    .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; }
    .form-group label { margin-bottom: 0.5rem; font-weight: bold; }
    .form-group input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
    .checkbox-group label { display: flex; align-items: center; gap: 0.5rem; font-weight: normal; cursor: pointer; }
    .small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
  `]
})
export class SpecialtiesPageComponent implements OnInit {
  private readonly profileService = inject(TechnicianProfileService);
  private readonly fb = inject(FormBuilder);

  specialties: TechnicianSpecialty[] = [];
  saving = false;

  form: FormGroup = this.fb.group({
    serviceCode: ['', Validators.required],
    experienceYears: [0, [Validators.required, Validators.min(0)]],
    active: [true]
  });

  ngOnInit(): void {
    this.loadSpecialties();
  }

  loadSpecialties(): void {
    this.profileService.getSpecialties().subscribe({
      next: (data) => this.specialties = data,
      error: () => console.error('Error al cargar especialidades')
    });
  }

  onAdd(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.profileService.addSpecialty(this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.form.reset({ experienceYears: 0, active: true });
        this.loadSpecialties();
      },
      error: () => {
        this.saving = false;
        alert('Error al agregar');
      }
    });
  }

  deleteSpecialty(id: number): void {
    if (!confirm('Seguro que deseas eliminar esta especialidad?')) return;
    this.profileService.deleteSpecialty(id).subscribe({
      next: () => this.loadSpecialties(),
      error: () => alert('Error al eliminar')
    });
  }
}
