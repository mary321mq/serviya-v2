export interface ClienteProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  telefono: string;
  direccion: string;
  referencia: string;
  region: string;
  provincia: string;
  distrito: string;
  datos: string;
  lat?: number;
  lng?: number;
  avatarUrl?: string;
}

export interface ClienteProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  referencia?: string;
  region?: string;
  provincia?: string;
  distrito?: string;
  datos?: string;
  lat?: number;
  lng?: number;
}

export interface ClientePreferences {
  language: string;
  timezone: string;
  notificationsEnabled: boolean;
}
