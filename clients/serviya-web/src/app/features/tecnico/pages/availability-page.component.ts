import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TechnicianAvailabilityService } from '../services/technician-availability.service';
import { TechnicianAvailabilityPayload } from '../models/technician.model';

@Component({
  selector: 'app-availability-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-header">
      <div>
        <a routerLink="/tecnico" class="eyebrow">&larr; Volver</a>
        <h1>Disponibilidad Semanal</h1>
      </div>
    </section>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-container">
      <div formArrayName="schedules">
        <div *ngFor="let control of schedules.controls; let i = index" [formGroupName]="i" class="schedule-row">
          <select formControlName="dayOfWeek">
            <option [value]="1">Lunes</option>
            <option [value]="2">Martes</option>
            <option [value]="3">Miercoles</option>
            <option [value]="4">Jueves</option>
            <option [value]="5">Viernes</option>
            <option [value]="6">Sabado</option>
            <option [value]="7">Domingo</option>
          </select>

          <input type="time" formControlName="startTime" />
          <span>a</span>
          <input type="time" formControlName="endTime" />

          <label class="active-chk">
            <input type="checkbox" formControlName="active" /> Activo
          </label>
          
          <button type="button" (click)="removeSchedule(i)" class="action-button secondary small">X</button>
        </div>
      </div>
      
      <div class="actions">
        <button type="button" (click)="addSchedule()" class="action-button secondary">Agregar Horario</button>
        <button type="submit" [disabled]="saving" class="action-button">Guardar Todo</button>
      </div>
    </form>
  `,
  styles: [`
    .form-container { max-width: 600px; }
    .schedule-row { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem; padding: 0.5rem; background: #f9fafb; border-radius: 4px; }
    .schedule-row select, .schedule-row input[type="time"] { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
    .active-chk { display: flex; align-items: center; gap: 0.25rem; font-size: 0.9rem; }
    .actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .small { padding: 0.25rem 0.5rem; }
  `]
})
export class AvailabilityPageComponent implements OnInit {
  private readonly availService = inject(TechnicianAvailabilityService);
  private readonly fb = inject(FormBuilder);

  saving = false;

  form: FormGroup = this.fb.group({
    schedules: this.fb.array([])
  });

  get schedules() {
    return this.form.get('schedules') as FormArray;
  }

  ngOnInit(): void {
    this.availService.getAvailability().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          data.forEach(item => {
            this.schedules.push(this.fb.group({
              dayOfWeek: [item.dayOfWeek, Validators.required],
              startTime: [item.startTime, Validators.required],
              endTime: [item.endTime, Validators.required],
              active: [item.active]
            }));
          });
        } else {
          this.addSchedule(); // default empty row
        }
      },
      error: () => {
        console.error('Error loading availability');
        this.addSchedule();
      }
    });
  }

  addSchedule(): void {
    this.schedules.push(this.fb.group({
      dayOfWeek: [1, Validators.required],
      startTime: ['08:00', Validators.required],
      endTime: ['17:00', Validators.required],
      active: [true]
    }));
  }

  removeSchedule(index: number): void {
    this.schedules.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const payload: TechnicianAvailabilityPayload[] = this.form.value.schedules;
    this.availService.saveAvailability(payload).subscribe({
      next: () => {
        this.saving = false;
        alert('Disponibilidad guardada');
      },
      error: () => {
        this.saving = false;
        alert('Error al guardar. Revise solapamientos de horario.');
      }
    });
  }
}
