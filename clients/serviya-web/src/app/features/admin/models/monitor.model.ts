export interface AdminServiceRequest {
  publicId: string;
  clientIdentitySubject: string;
  serviceCode: string;
  status: string;
  technicianIdentitySubject?: string;
  urlEvidencia?: string;
  evidenciaUrls?: string[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface AdminEvent {
  id: number;
  eventId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  status: string;
  correlationId: string;
  createdAt: string;
}

export interface AdminPayment {
  id: number;
  solicitudId: number;
  clienteId: string;
  tecnicoId: string;
  montoTotal: number;
  comisionServiya: number;
  gananciaTecnico: number;
  pasarela: string;
  codigoOperacionExterna: string;
  tipoComprobante: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCliente: string;
  estadoPago: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonitorDashboardStats {
  activeRequests: number;
  completedRequests: number;
  failedEvents: number;
  totalPayments: number;
}
