import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { EstadoTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { TechnicianDocument } from '../models/technician.model';
import { TechnicianDocumentService } from '../services/technician-document.service';

@Component({
  selector: 'app-documents-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, EstadoTextoPipe],
  template: `
    <section class="page-header">
      <div>
        <a routerLink="/tecnico" class="eyebrow">&larr; Volver</a>
        <h1>Documentos</h1>
      </div>
    </section>

    <div class="list-container">
      <h3>Documentos subidos</h3>
      <ul>
        <li *ngFor="let doc of documents">
          {{ formatDocumentType(doc.documentType) }} - {{ doc.originalFilename }} ({{ doc.status | estadoTexto }})
          <button (click)="deleteDocument(doc.id)" class="action-button secondary small">Eliminar</button>
        </li>
      </ul>
      <p *ngIf="documents.length === 0">No hay documentos subidos.</p>
    </div>

    <form [formGroup]="form" (ngSubmit)="onUpload()" class="form-container">
      <div class="form-group">
        <label>Tipo de documento</label>
        <select formControlName="documentType">
          <option value="DNI_FRONT">DNI frente</option>
          <option value="DNI_BACK">DNI reverso</option>
          <option value="CRIMINAL_RECORD">Antecedentes</option>
          <option value="CERTIFICATION">Certificado</option>
        </select>
      </div>
      <div class="form-group">
        <label>Archivo</label>
        <input type="file" (change)="onFileSelected($event)" />
      </div>
      <button type="submit" [disabled]="form.invalid || !selectedFile || uploading" class="action-button">Subir archivo</button>
    </form>
  `,
  styles: [`
    .list-container { margin-bottom: 2rem; }
    .list-container li { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid #ccc; }
    .small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
    .form-container { max-width: 600px; padding: 1rem; border: 1px solid #eee; border-radius: 4px; }
    .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; }
    .form-group label { margin-bottom: 0.5rem; font-weight: bold; }
  `]
})
export class DocumentsPageComponent implements OnInit {
  private readonly docService = inject(TechnicianDocumentService);
  private readonly fb = inject(FormBuilder);

  documents: TechnicianDocument[] = [];
  selectedFile: File | null = null;
  uploading = false;

  form: FormGroup = this.fb.group({
    documentType: ['DNI_FRONT', Validators.required]
  });

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.docService.getDocuments().subscribe({
      next: (docs) => this.documents = docs,
      error: () => console.error('Error al cargar documentos')
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] || null;
  }

  onUpload(): void {
    if (this.form.invalid || !this.selectedFile) return;
    this.uploading = true;
    this.docService.uploadDocument(this.selectedFile, this.form.value.documentType).subscribe({
      next: () => {
        this.uploading = false;
        this.selectedFile = null;
        this.form.reset({ documentType: 'DNI_FRONT' });
        this.loadDocuments();
      },
      error: () => {
        this.uploading = false;
        alert('Error al subir');
      }
    });
  }

  deleteDocument(id: string): void {
    if (!confirm('Eliminar documento?')) return;
    this.docService.deleteDocument(id).subscribe({
      next: () => this.loadDocuments(),
      error: () => alert('Error al eliminar')
    });
  }

  protected formatDocumentType(type: string): string {
    const labels: Record<string, string> = {
      DNI_FRONT: 'DNI frente',
      DNI_BACK: 'DNI reverso',
      CRIMINAL_RECORD: 'Antecedentes',
      CERTIFICATION: 'Certificado'
    };
    return labels[type] ?? 'Documento';
  }
}
