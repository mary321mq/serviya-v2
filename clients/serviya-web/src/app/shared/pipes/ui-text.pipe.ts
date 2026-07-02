import { Pipe, PipeTransform } from '@angular/core';

const STATUS_LABELS: Record<string, string> = {
  ACCEPTED: 'Aceptada',
  ACTIVE: 'Activo',
  APPROVED: 'Aprobada',
  ASSIGNED: 'Asignado',
  BUSY: 'Ocupado',
  CANCELLED: 'Cancelada',
  CAPTURED: 'Capturado',
  COMPLETED: 'Completado',
  COTIZADO_ESPERANDO_PAGO: 'Cotizada, esperando pago',
  CREATED: 'Creada',
  DRAFT: 'Borrador',
  EN_PROCESO: 'En proceso',
  ESPERANDO_PAGO_VISITA: 'Esperando pago de visita',
  EXPIRED: 'Expirada',
  FAILED: 'Fallido',
  HIDDEN: 'Oculta',
  IN_PROGRESS: 'En proceso',
  OFFLINE: 'Desconectado',
  ONLINE: 'Disponible',
  PAGADO_BUSCANDO_TECNICO: 'Pagada, buscando tecnico',
  PAYMENT_FAILED: 'Pago fallido',
  PAYMENT_PENDING: 'Pago pendiente',
  PAYMENT_SUCCESS: 'Pago exitoso',
  PENDING: 'Pendiente',
  PENDIENTE_EVALUACION: 'Pendiente de evaluacion',
  PUBLISHED: 'Publicada',
  READ: 'Leida',
  REJECTED: 'Rechazada',
  SUBMITTED: 'Enviada',
  TECNICO_ASIGNADO: 'Tecnico asignado',
  UNDER_REVIEW: 'En revision',
  UNREAD: 'No leida',
  VISIT_PAYMENT_PENDING: 'Pago de visita pendiente'
};

const SERVICE_LABELS: Record<string, string> = {
  ELECTRICAL_BASIC: 'Servicio electrico',
  PLUMBING_BASIC: 'Gasfiteria',
  SIN_CODIGO: 'Servicio no especificado'
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CARD: 'Tarjeta',
  CREDIT_CARD: 'Tarjeta',
  DEBIT_CARD: 'Tarjeta',
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  YAPE: 'Yape',
  PLIN: 'Plin'
};

@Pipe({ name: 'estadoTexto', standalone: true })
export class EstadoTextoPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return 'Sin estado';
    const normalized = value.trim().toUpperCase();
    return STATUS_LABELS[normalized] ?? humanize(normalized);
  }
}

@Pipe({ name: 'servicioTexto', standalone: true })
export class ServicioTextoPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return 'Servicio no especificado';
    const normalized = value.trim().toUpperCase();
    return SERVICE_LABELS[normalized] ?? humanize(normalized);
  }
}

@Pipe({ name: 'metodoPagoTexto', standalone: true })
export class MetodoPagoTextoPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return 'No especificado';
    const normalized = value.trim().toUpperCase();
    return PAYMENT_METHOD_LABELS[normalized] ?? humanize(normalized);
  }
}

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split(/[_\-.]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
