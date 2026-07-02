import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable, map } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export interface DashboardStats {
  usuariosTotales: number;
  trabajadoresActivos: number;
  serviciosPublicados: number;
  postulacionesTotales: number;
  
  postulacionesPorDia: { date: string; count: number }[];
  postulacionesPorEstado: { pendientes: number; aprobadas: number; rechazadas: number };
  
  serviciosMasSolicitados: { name: string; count: number }[];
  actividadReciente: { text: string; user: string; date: Date; type: 'success' | 'info' | 'warning' | 'danger' }[];
}

@Injectable({ providedIn: 'root' })
export class AdminReportsService {
  private api = inject(ApiClientService);

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      users: this.api.get<any[]>('/user-ms/api/v1/admin/clients'),
      applications: this.api.get<any[]>('/technician-ms/api/v1/admin/technicians/applications'),
      requests: this.api.get<any[]>('/service-request-ms/api/v1/admin/solicitudes')
    }).pipe(
      map(({ users, applications, requests }) => {
        
        // 1. Totals
        const usuariosTotales = users.length;
        const trabajadoresActivos = applications.filter(a => a.estado === 'APPROVED').length;
        const serviciosPublicados = requests.length; // Usaremos el total de solicitudes publicadas/creadas
        const postulacionesTotales = applications.length;

        // 2. Postulaciones por estado
        const pendientes = applications.filter(a => a.estado === 'PENDING').length;
        const aprobadas = applications.filter(a => a.estado === 'APPROVED').length;
        const rechazadas = applications.filter(a => a.estado === 'REJECTED').length;

        // 3. Postulaciones por día (últimos 7 días)
        const postulacionesPorDiaMap = new Map<string, number>();
        
        // Generate last 7 days keys
        for(let i=6; i>=0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = `${d.getDate()} ${d.toLocaleString('es-ES', { month: 'short' })}`;
          postulacionesPorDiaMap.set(key, 0);
        }

        applications.forEach(a => {
          if (!a.createdAt) return;
          const date = new Date(a.createdAt);
          const diffTime = Math.abs(new Date().getTime() - date.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          if(diffDays <= 7) {
            const key = `${date.getDate()} ${date.toLocaleString('es-ES', { month: 'short' })}`;
            if(postulacionesPorDiaMap.has(key)) {
              postulacionesPorDiaMap.set(key, postulacionesPorDiaMap.get(key)! + 1);
            }
          }
        });

        const postulacionesPorDia = Array.from(postulacionesPorDiaMap.entries()).map(([date, count]) => ({ date, count }));

        // 4. Servicios más solicitados
        const serviceCount = new Map<string, number>();
        requests.forEach(r => {
          const sName = r.catalogoServicio?.nombre || 'Desconocido';
          serviceCount.set(sName, (serviceCount.get(sName) || 0) + 1);
        });

        const serviciosMasSolicitados = Array.from(serviceCount.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // top 5

        // 5. Actividad reciente (combinando postulates y requests)
        const activities: any[] = [];
        
        applications.forEach(a => {
           activities.push({
             text: a.estado === 'APPROVED' ? 'Técnico aprobado' : (a.estado === 'REJECTED' ? 'Postulación rechazada' : 'Nueva postulación recibida'),
             user: a.firstName + ' ' + a.lastName,
             date: new Date(a.updatedAt || a.createdAt),
             type: a.estado === 'APPROVED' ? 'warning' : (a.estado === 'REJECTED' ? 'danger' : 'info')
           });
        });

        requests.forEach(r => {
           activities.push({
             text: 'Servicio publicado',
             user: r.clienteNombre || 'Cliente anónimo',
             date: new Date(r.createdAt),
             type: 'success'
           });
        });

        activities.sort((a, b) => b.date.getTime() - a.date.getTime());
        const actividadReciente = activities.slice(0, 5);

        return {
          usuariosTotales,
          trabajadoresActivos,
          serviciosPublicados,
          postulacionesTotales,
          postulacionesPorDia,
          postulacionesPorEstado: { pendientes, aprobadas, rechazadas },
          serviciosMasSolicitados,
          actividadReciente
        };
      })
    );
  }
}
