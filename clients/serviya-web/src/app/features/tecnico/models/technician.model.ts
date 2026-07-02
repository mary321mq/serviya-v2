export type TechnicianApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface TechnicianApplication {
  id: number;
  status: TechnicianApplicationStatus;
  estado?: TechnicianApplicationStatus;
  fullName: string;
  phone: string;
  aboutMe: string;
  identityDocumentType: string;
  identityDocumentNumber: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  ruc?: string;
  categorias?: string;
  department?: string;
  province?: string;
  district?: string;
  addressLine?: string;
  reference?: string;
  lat?: number;
  lng?: number;
  hasStore?: boolean;
  storeName?: string;
}

export interface TechnicianApplicationPayload {
  fullName: string;
  phone: string;
  aboutMe: string;
  identityDocumentType: string;
  identityDocumentNumber: string;
  ruc: string;
  categorias: string;
  department?: string;
  province?: string;
  district?: string;
  addressLine?: string;
  reference?: string;
  lat?: number;
  lng?: number;
  hasStore?: boolean;
  storeName?: string;
}

export interface TechnicianDocument {
  id: string;
  documentType: string;
  originalFilename: string;
  status: string;
  uploadedAt: string;
}

export interface TechnicianProfile {
  id: number;
  categorias: string;
  department: string;
  province: string;
  district: string;
  addressLine: string;
  reference: string;
  lat: number;
  lng: number;
  hasStore: boolean;
  storeName: string;
  estadoDisponibilidad: 'ONLINE' | 'BUSY' | 'OFFLINE';
  ranking: number;
  clienteId: string;
}

export interface TechnicianAvailabilityStatusPayload {
  estado: 'ONLINE' | 'BUSY' | 'OFFLINE';
}



export interface TechnicianSpecialty {
  id: number;
  serviceCode: string;
  active: boolean;
  experienceYears: number;
}

export interface TechnicianSpecialtyPayload {
  serviceCode: string;
  active: boolean;
  experienceYears: number;
}

export interface TechnicianAvailability {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface TechnicianAvailabilityPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface TechnicianLocation {
  id: number;
  lat: number;
  lng: number;
  capturedAt: string;
  expiresAt: string;
}

export interface TechnicianLocationPayload {
  latitud: number;
  longitud: number;
}

export interface Offer {
  id: string;
  batchId: string;
  serviceRequestId: string;
  technicianId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  attemptNumber: number;
  createdAt: string;
  expiresAt: string;
  respondedAt?: string;
  
  serviceName?: string;
  description?: string;
  technicianPrice?: number;
  evidenciaUrls?: string[];
  clienteConfirmoFin?: boolean;
  tecnicoConfirmoFin?: boolean;
  estadoSolicitud?: string;
  direccionFisica?: string;
  catalogoServicio?: any;
  clienteNombre?: string;
  clientePhone?: string;
  costoTotal?: number;
  costoVisita?: number;
}

export interface TechnicianServiceRequest {
  publicId: string;
  clientIdentitySubject: string;
  serviceCode: string;
  description: string;
  addressSnapshotJson: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  status: string;
  idempotencyKey: string;
  technicianIdentitySubject?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestAddressSnapshot {
  addressLine: string;
  district: string;
  city: string;
}
