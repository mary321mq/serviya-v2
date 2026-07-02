import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { EstadoTextoPipe } from '../../../shared/pipes/ui-text.pipe';
import { AdminTechnicianService, TechnicianApplication, TechnicianDocument } from '../services/admin-technician.service';
import { LucideAngularModule } from 'lucide-angular';

interface DocumentView {
  doc: TechnicianDocument;
  previewUrl: SafeUrl;
  resourceUrl: SafeResourceUrl;
  objectUrl: string;
  isPdf: boolean;
}

@Component({
  selector: 'app-technician-application-detail-page',
  standalone: true,
  imports: [CommonModule, EstadoTextoPipe, LucideAngularModule],
  template: `
    <div class="app-detail-container">
      <div class="top-bar">
        <button (click)="back()" class="btn-link">
          <lucide-icon name="chevron-left" [size]="16"></lucide-icon> Volver a la lista
        </button>
      </div>

      <div class="page-header">
        <h1 class="page-title">Detalle de Postulación</h1>
        <div class="header-actions">
          <button class="btn-outline">
            <lucide-icon name="printer" [size]="16"></lucide-icon> Imprimir
          </button>
          <button class="btn-outline">
            <lucide-icon name="more-vertical" [size]="16"></lucide-icon> Acciones <lucide-icon name="chevron-down" [size]="16"></lucide-icon>
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <lucide-icon name="loader" [size]="40" class="spinning"></lucide-icon>
        <p>Cargando detalle de postulación...</p>
      </div>

      <div *ngIf="!loading && errorMessage" class="error-state">
        <h2>No se pudo cargar la postulación</h2>
        <p>{{ errorMessage }}</p>
      </div>

      <ng-container *ngIf="!loading && !errorMessage && app">
        <!-- Profile Card -->
        <div class="profile-card">
          <div class="profile-info-main">
            <div class="avatar">
              <lucide-icon name="user" [size]="48"></lucide-icon>
            </div>
            <div class="profile-details">
              <h2 class="profile-name">{{ app.fullName }}</h2>
              <span class="postulacion-id">Postulación ID: POS-{{ (app.id + '').padStart(7, '0') }}</span>
              <div class="profile-contacts">
                <span class="contact-item"><lucide-icon name="phone" [size]="14"></lucide-icon> {{ app.phone }}</span>
                <span class="contact-item"><lucide-icon name="mail" [size]="14"></lucide-icon> {{ app.fullName.split(' ')[0].toLowerCase() + '@gmail.com' }}</span>
              </div>
              <div class="profile-date">
                <lucide-icon name="calendar" [size]="14"></lucide-icon> Postulado el 16 mayo 2024, 10:24 a. m.
              </div>
            </div>
          </div>
          <div class="profile-status-area">
            <div class="status-block">
              <span class="status-label">Estado de postulación</span>
              <span class="badge" [ngClass]="{
                'badge-warning': app.estado === 'PENDING' || app.estado === 'SUBMITTED',
                'badge-info': app.estado === 'UNDER_REVIEW',
                'badge-success': app.estado === 'APPROVED',
                'badge-danger': app.estado === 'REJECTED'
              }">
                <lucide-icon *ngIf="app.estado === 'APPROVED'" name="check" [size]="14"></lucide-icon>
                {{ app.estado | estadoTexto }}
              </span>
            </div>
            <div class="eval-block">
              <div class="eval-item">
                <span class="eval-label">Evaluado por:</span>
                <span class="eval-value">Juana Tito Larico</span>
              </div>
              <div class="eval-item">
                <span class="eval-label">Evaluado el:</span>
                <span class="eval-value">17 mayo 2024, 02:15 p. m.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Grids -->
        <div class="details-grid">
          <!-- Información Personal -->
          <div class="info-card">
            <div class="card-header">
              <lucide-icon name="user" [size]="18" class="icon-blue"></lucide-icon>
              <h3>Información Personal</h3>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">Nombres:</span>
                <span class="info-value">{{ app.fullName.split(' ')[0] }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Apellidos:</span>
                <span class="info-value">{{ app.fullName.split(' ').slice(1).join(' ') || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">DNI:</span>
                <span class="info-value">71234567</span>
              </div>
              <div class="info-row">
                <span class="info-label">Fecha de nacimiento:</span>
                <span class="info-value">12/04/1992</span>
              </div>
              <div class="info-row">
                <span class="info-label">Teléfono / Celular:</span>
                <span class="info-value">{{ app.phone }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Correo electrónico:</span>
                <span class="info-value">{{ app.fullName.split(' ')[0].toLowerCase() + '@gmail.com' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Estado civil:</span>
                <span class="info-value">Soltero</span>
              </div>
              <div class="info-row">
                <span class="info-label">Nacionalidad:</span>
                <span class="info-value">Peruana</span>
              </div>
            </div>
          </div>

          <!-- Ubicación -->
          <div class="info-card">
            <div class="card-header">
              <lucide-icon name="map-pin" [size]="18" class="icon-blue"></lucide-icon>
              <h3>Ubicación</h3>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">Región:</span>
                <span class="info-value">{{ app.department || 'Puno' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Provincia:</span>
                <span class="info-value">{{ app.province || 'San Román' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Distrito:</span>
                <span class="info-value">{{ app.district || 'Juliaca' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Dirección exacta:</span>
                <span class="info-value">{{ app.addressLine || 'Jr. Los Incas 123, Urb. Villa Hermosa' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Referencia:</span>
                <span class="info-value">Frente al Mercado Santa Bárbara</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Evidencias -->
        <div class="info-card mt-6">
          <div class="card-header">
            <lucide-icon name="paperclip" [size]="18" class="icon-blue"></lucide-icon>
            <h3>Evidencias y Documentos Adjuntos</h3>
          </div>
          <div class="card-body">
            <div *ngIf="documents.length === 0" class="empty-docs">
              El técnico no ha adjuntado ningún documento aún.
            </div>
            <div class="documents-grid" *ngIf="documents.length > 0">
              <div *ngFor="let d of documents" class="document-item">
                <div class="doc-header">
                  <div class="doc-title">
                    <h4>{{ d.doc.documentType }}</h4>
                    <span class="doc-filename">{{ d.doc.originalFilename }}</span>
                  </div>
                  <span class="doc-badge" [class.pdf]="d.isPdf">{{ d.isPdf ? 'PDF' : 'IMAGEN' }}</span>
                </div>
                <div class="doc-preview">
                  <iframe *ngIf="d.isPdf" [src]="d.resourceUrl" title="PDF Preview"></iframe>
                  <img *ngIf="!d.isPdf" [src]="d.previewUrl" alt="Document Preview">
                </div>
                <div class="doc-actions">
                  <button (click)="openDocument(d)" class="btn-action">
                    <lucide-icon name="eye" [size]="16"></lucide-icon> Ver
                  </button>
                  <button (click)="downloadDocument(d)" class="btn-action">
                    <lucide-icon name="download" [size]="16"></lucide-icon> Descargar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Extra Info Grids -->
        <div class="details-grid mt-6">
          <!-- Detalles Postulacion -->
          <div class="info-card">
            <div class="card-header">
              <lucide-icon name="list" [size]="18" class="icon-blue"></lucide-icon>
              <h3>Detalles de la Postulación</h3>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">Servicio solicitado:</span>
                <span class="info-value">{{ app.requestedService || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Categoría:</span>
                <span class="info-value">{{ app.categorias || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Experiencia declarada:</span>
                <span class="info-value">{{ app.experience || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Disponibilidad:</span>
                <span class="info-value">{{ app.availability || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Horario preferido:</span>
                <span class="info-value">{{ app.preferredSchedule || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Notas -->
          <div class="info-card">
            <div class="card-header">
              <lucide-icon name="message-square" [size]="18" class="icon-orange"></lucide-icon>
              <h3>Notas y Observaciones</h3>
            </div>
            <div class="card-body">
              <div class="notes-box" *ngIf="app.evaluatorNotes; else noNotes">
                <p>{{ app.evaluatorNotes }}</p>
                <div class="notes-author">
                  <div class="notes-avatar"><lucide-icon name="user" [size]="16"></lucide-icon></div>
                  <div class="notes-meta">
                    <span class="n-name">{{ app.evaluatorName || 'Admin' }}</span>
                    <span class="n-role">{{ app.evaluatorRole || 'Super Admin' }}</span>
                  </div>
                  <span class="n-date" *ngIf="app.evaluatedAt">{{ app.evaluatedAt | date:'dd MMMM yyyy, hh:mm a' }}</span>
                </div>
              </div>
              <ng-template #noNotes>
                <div class="empty-docs">Aún no hay notas de evaluación.</div>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- Floating Actions -->
        <div class="floating-actions" *ngIf="app.estado === 'PENDING' || app.estado === 'SUBMITTED' || app.estado === 'UNDER_REVIEW'">
          <button (click)="approve()" class="btn-float btn-approve">
            <lucide-icon name="check" [size]="18"></lucide-icon> Aprobar
          </button>
          <button class="btn-float btn-pending">
            <lucide-icon name="clock" [size]="18"></lucide-icon> Pendiente
          </button>
          <button (click)="reject()" class="btn-float btn-reject">
            <lucide-icon name="x" [size]="18"></lucide-icon> Rechazar
          </button>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .app-detail-container { padding: 24px; max-width: 1300px; margin: 0 auto; color: var(--text-primary); display: flex; flex-direction: column; gap: 20px; padding-bottom: 100px; }
    
    .top-bar { margin-bottom: 8px; }
    .btn-link { background: none; border: none; color: #60A5FA; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; font-size: 0.95rem; padding: 0; }
    .btn-link:hover { text-decoration: underline; }

    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-title { font-size: 1.8rem; font-weight: 700; margin: 0; }
    .header-actions { display: flex; gap: 12px; }
    .btn-outline { background: var(--surface-1); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px 16px; border-radius: 6px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 500; transition: 0.2s; }
    .btn-outline:hover { background: var(--surface-2); }

    .profile-card { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; display: flex; justify-content: space-between; align-items: center; }
    .profile-info-main { display: flex; gap: 24px; align-items: center; }
    .avatar { width: 80px; height: 80px; background: #E2E8F0; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #475569; }
    .profile-details { display: flex; flex-direction: column; gap: 6px; }
    .profile-name { font-size: 1.4rem; font-weight: 700; margin: 0; }
    .postulacion-id { background: rgba(59, 130, 246, 0.15); color: #93C5FD; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; width: max-content; margin-bottom: 4px; }
    .profile-contacts { display: flex; gap: 16px; color: var(--text-secondary); font-size: 0.9rem; }
    .contact-item { display: inline-flex; align-items: center; gap: 6px; }
    .profile-date { color: var(--text-secondary); font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; }

    .profile-status-area { display: flex; gap: 40px; }
    .status-block, .eval-block { display: flex; flex-direction: column; gap: 8px; }
    .status-label { color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 0.85rem; width: max-content; }
    .badge-success { background: rgba(34, 197, 94, 0.15); color: #4ADE80; border: 1px solid rgba(34, 197, 94, 0.3); }
    .badge-warning { background: rgba(245, 158, 11, 0.15); color: #FCD34D; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-info { background: rgba(59, 130, 246, 0.15); color: #93C5FD; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-danger { background: rgba(239, 68, 68, 0.15); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.3); }
    
    .eval-item { display: flex; flex-direction: column; }
    .eval-label { color: var(--text-secondary); font-size: 0.75rem; }
    .eval-value { font-size: 0.9rem; font-weight: 500; }

    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .mt-6 { margin-top: 6px; }
    
    .info-card { background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; }
    .card-header { padding: 16px 20px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 10px; }
    .card-header h3 { margin: 0; font-size: 1.1rem; font-weight: 600; }
    .icon-blue { color: #60A5FA; }
    .icon-orange { color: #F97316; }
    .card-body { padding: 20px; }
    
    .info-row { display: grid; grid-template-columns: 160px 1fr; margin-bottom: 12px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { color: var(--text-secondary); font-size: 0.9rem; }
    .info-value { font-weight: 500; font-size: 0.95rem; }

    .documents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .document-item { background: var(--surface-2); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
    .doc-header { padding: 12px 16px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: flex-start; }
    .doc-title h4 { margin: 0; font-size: 0.95rem; font-weight: 600; }
    .doc-filename { font-size: 0.75rem; color: var(--text-secondary); }
    .doc-badge { background: rgba(148, 163, 184, 0.1); color: #CBD5E1; padding: 2px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; }
    .doc-badge.pdf { background: rgba(239, 68, 68, 0.15); color: #FCA5A5; }
    
    .doc-preview { height: 160px; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .doc-preview iframe { width: 100%; height: 100%; border: none; }
    .doc-preview img { width: 100%; height: 100%; object-fit: cover; }
    
    .doc-actions { display: flex; border-top: 1px solid var(--border-color); }
    .btn-action { flex: 1; background: transparent; border: none; border-right: 1px solid var(--border-color); color: var(--text-primary); padding: 12px; font-size: 0.85rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: 0.2s; }
    .btn-action:last-child { border-right: none; }
    .btn-action:hover { background: var(--surface-3); }
    
    .notes-box { background: rgba(0,0,0,0.2); border-radius: 8px; padding: 16px; border: 1px solid var(--border-color); }
    .notes-box p { margin: 0 0 16px 0; font-size: 0.95rem; }
    .notes-author { display: flex; align-items: center; gap: 12px; }
    .notes-avatar { width: 32px; height: 32px; background: #334155; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .notes-meta { display: flex; flex-direction: column; flex: 1; }
    .n-name { font-size: 0.85rem; font-weight: 600; }
    .n-role { font-size: 0.7rem; color: var(--text-secondary); }
    .n-date { font-size: 0.8rem; color: var(--text-secondary); }

    .floating-actions { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 16px; background: var(--surface-1); padding: 16px 24px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); z-index: 100; }
    .btn-float { border: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 1rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
    .btn-approve { background: rgba(34, 197, 94, 0.1); color: #4ADE80; border: 1px solid rgba(34, 197, 94, 0.3); }
    .btn-approve:hover { background: rgba(34, 197, 94, 0.2); }
    .btn-pending { background: rgba(245, 158, 11, 0.1); color: #FCD34D; border: 1px solid rgba(245, 158, 11, 0.3); }
    .btn-pending:hover { background: rgba(245, 158, 11, 0.2); }
    .btn-reject { background: rgba(239, 68, 68, 0.1); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.3); }
    .btn-reject:hover { background: rgba(239, 68, 68, 0.2); }

    .loading-state, .error-state { text-align: center; padding: 60px; background: var(--surface-1); border: 1px solid var(--border-color); border-radius: 12px; }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class TechnicianApplicationDetailPageComponent implements OnInit, OnDestroy {
  app?: TechnicianApplication;
  documents: DocumentView[] = [];
  loading = true;
  errorMessage = '';
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(AdminTechnicianService);
  private sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.errorMessage = 'No se recibio el identificador de la postulacion.';
      return;
    }

    this.service.getApplicationById(id).subscribe({
      next: data => {
        this.app = data;
        this.loading = false;
        this.loadDocuments(data.clienteId);
      },
      error: err => {
        this.loading = false;
        this.errorMessage = this.getLoadErrorMessage(err);
        console.error('Error al cargar detalle de postulacion', err);
      }
    });
  }

  loadDocuments(clienteId: string): void {
    this.service.getTechnicianDocuments(clienteId).subscribe({
      next: docs => {
        docs.forEach(doc => {
          this.service.getDocumentFile(doc.id).subscribe({
            next: blob => {
              const objectUrl = URL.createObjectURL(blob);
              const previewUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
              const resourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
              this.documents.push({
                doc,
                previewUrl,
                resourceUrl,
                objectUrl,
                isPdf: this.isPdfDocument(doc, blob)
              });
            },
            error: err => console.warn('No se pudo cargar archivo de documento', doc.id, err)
          });
        });
      },
      error: err => console.warn('No se pudieron cargar documentos de la postulacion', err)
    });
  }

  private getLoadErrorMessage(err: any): string {
    if (err?.status === 404) {
      return 'La postulacion seleccionada no existe o ya no esta disponible.';
    }

    if (err?.status === 403) {
      return 'Tu usuario no tiene permisos para ver esta postulacion.';
    }

    const detail = err?.error?.detail;
    return detail || 'Ocurrio un error al consultar el detalle. Revisa que el backend technician-ms este actualizado.';
  }

  private isPdfDocument(doc: TechnicianDocument, blob: Blob): boolean {
    return blob.type === 'application/pdf' || doc.originalFilename.toLowerCase().endsWith('.pdf');
  }

  openDocument(document: DocumentView): void {
    window.open(document.objectUrl, '_blank', 'noopener');
  }

  downloadDocument(document: DocumentView): void {
    const link = window.document.createElement('a');
    link.href = document.objectUrl;
    link.download = document.doc.originalFilename;
    link.click();
  }

  ngOnDestroy(): void {
    this.documents.forEach(d => URL.revokeObjectURL(d.objectUrl));
  }

  approve(): void {
    if(this.app) {
      const notes = prompt('Notas / Comentarios (opcional):') || '';
      if(confirm('¿Aprobar esta postulación?')) {
        this.service.approveApplication(this.app.id.toString(), notes).subscribe(() => this.router.navigate(['/admin/tecnicos/postulaciones']));
      }
    }
  }

  reject(): void {
    if (this.app) {
      const reason = prompt('Notas / Motivo de rechazo:');
      if (reason) {
        this.service.rejectApplication(this.app.id.toString(), reason).subscribe(() => this.router.navigate(['/admin/tecnicos/postulaciones']));
      }
    }
  }

  back(): void {
    this.router.navigate(['/admin/tecnicos/postulaciones']);
  }
}
