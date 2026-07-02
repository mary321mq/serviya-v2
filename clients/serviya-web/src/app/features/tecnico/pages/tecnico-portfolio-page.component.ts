import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TecnicoPortfolioService, PortfolioPhoto } from '../services/tecnico-portfolio.service';

@Component({
  selector: 'app-tecnico-portfolio-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="portfolio-container">
      <div class="header">
        <h1>Mi Portafolio de Trabajos</h1>
        <p>Sube fotos de tus mejores trabajos para que los clientes puedan ver la calidad de tus servicios.</p>
      </div>

      <div class="upload-section">
        <h3>Agregar Nueva Foto</h3>
        <form [formGroup]="uploadForm" (ngSubmit)="uploadPhoto()" class="upload-form">
          <div class="file-input-group">
            <label class="file-label" [class.has-file]="selectedFile">
              <i class="fas fa-cloud-upload-alt"></i>
              <span>{{ selectedFile ? selectedFile.name : 'Seleccionar foto' }}</span>
              <input type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden-input">
            </label>
          </div>
          <div class="form-group">
            <label>Descripción breve (opcional)</label>
            <input type="text" formControlName="description" placeholder="Ej: Instalación de luminarias LED">
          </div>
          <button type="submit" class="btn-primary" [disabled]="!selectedFile || uploading">
            <i class="fas fa-spinner fa-spin" *ngIf="uploading"></i>
            {{ uploading ? 'Subiendo...' : 'Subir Foto' }}
          </button>
        </form>
      </div>

      <div class="gallery-section">
        <h3>Mis Fotos Subidas</h3>
        
        <div class="loading" *ngIf="loading">
          <i class="fas fa-circle-notch fa-spin"></i> Cargando portafolio...
        </div>

        <div class="empty-state" *ngIf="!loading && photos.length === 0">
          <i class="fas fa-images"></i>
          <p>Aún no has subido fotos a tu portafolio.</p>
        </div>

        <div class="gallery-grid" *ngIf="!loading && photos.length > 0">
          <div class="photo-card" *ngFor="let photo of photos">
            <div class="photo-img" [style.backgroundImage]="'url(' + service.getPhotoUrl(photo.id) + ')'">
              <div class="photo-actions">
                <button class="btn-delete" (click)="deletePhoto(photo.id)" title="Eliminar foto">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            <div class="photo-info" *ngIf="photo.description">
              <p>{{ photo.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .portfolio-container { max-width: 900px; margin: 30px auto; padding: 0 20px; font-family: 'Inter', sans-serif; }
    .header { margin-bottom: 30px; }
    .header h1 { font-size: 2rem; color: #1e293b; margin: 0 0 10px 0; }
    .header p { color: #64748b; font-size: 1.1rem; margin: 0; }
    
    .upload-section { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 40px; }
    .upload-section h3 { margin-top: 0; color: #0f172a; margin-bottom: 20px; font-size: 1.2rem; }
    
    .upload-form { display: flex; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
    
    .file-input-group { flex: 1; min-width: 200px; }
    .hidden-input { display: none; }
    .file-label { display: flex; align-items: center; gap: 10px; padding: 12px 20px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; cursor: pointer; color: #64748b; transition: 0.2s; font-weight: 500; }
    .file-label:hover { background: #f1f5f9; border-color: #94a3b8; }
    .file-label.has-file { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; border-style: solid; }
    
    .form-group { flex: 2; min-width: 250px; }
    .form-group label { display: block; margin-bottom: 8px; color: #475569; font-size: 0.9rem; font-weight: 500; }
    .form-group input { width: 100%; padding: 12px 15px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; }
    .form-group input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    
    .btn-primary { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
    .btn-primary:hover:not([disabled]) { background: #2563eb; }
    .btn-primary[disabled] { background: #94a3b8; cursor: not-allowed; }
    
    .gallery-section h3 { margin-top: 0; color: #0f172a; margin-bottom: 20px; font-size: 1.2rem; }
    
    .loading, .empty-state { text-align: center; padding: 50px; color: #64748b; }
    .empty-state i { font-size: 3rem; color: #cbd5e1; margin-bottom: 15px; }
    
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
    .photo-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: 0.2s; border: 1px solid #f1f5f9; }
    .photo-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
    
    .photo-img { height: 200px; background-size: cover; background-position: center; position: relative; }
    .photo-actions { position: absolute; top: 10px; right: 10px; opacity: 0; transition: 0.2s; }
    .photo-card:hover .photo-actions { opacity: 1; }
    .btn-delete { background: rgba(239,68,68,0.9); color: white; border: none; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .btn-delete:hover { background: #dc2626; }
    
    .photo-info { padding: 15px; border-top: 1px solid #f1f5f9; }
    .photo-info p { margin: 0; color: #334155; font-size: 0.95rem; line-height: 1.4; }
  `]
})
export class TecnicoPortfolioPageComponent implements OnInit {
  public service = inject(TecnicoPortfolioService);
  private fb = inject(FormBuilder);
  
  photos: PortfolioPhoto[] = [];
  loading = true;
  uploading = false;
  selectedFile: File | null = null;
  
  uploadForm = this.fb.group({
    description: ['']
  });

  ngOnInit() {
    this.loadPhotos();
  }

  loadPhotos() {
    this.loading = true;
    this.service.getPortfolio().subscribe({
      next: (res) => {
        this.photos = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  uploadPhoto() {
    if (!this.selectedFile) return;
    this.uploading = true;
    const desc = this.uploadForm.get('description')?.value || '';
    
    this.service.uploadPhoto(this.selectedFile, desc).subscribe({
      next: (photo) => {
        this.uploading = false;
        this.selectedFile = null;
        this.uploadForm.reset();
        this.photos.unshift(photo);
      },
      error: () => {
        this.uploading = false;
        alert('Error al subir la foto');
      }
    });
  }

  deletePhoto(id: number) {
    if (confirm('¿Seguro que deseas eliminar esta foto?')) {
      this.service.deletePhoto(id).subscribe({
        next: () => {
          this.photos = this.photos.filter(p => p.id !== id);
        },
        error: () => {
          alert('Error al eliminar la foto');
        }
      });
    }
  }
}
