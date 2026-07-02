# ServiYa - Documentacion Tecnica del Proyecto Final

ServiYa es una plataforma distribuida para gestionar solicitudes de servicios tecnicos, cotizaciones, pagos, comprobantes, postulacion de tecnicos, asignaciones, resenas, notificaciones y observabilidad operacional.

Esta documentacion esta preparada para MkDocs y GitHub Pages.

## Objetivo del sistema

Permitir que un cliente solicite un servicio, reciba una cotizacion, pague, seleccione o reciba asignacion de un tecnico, confirme la finalizacion del trabajo y emita una resena.

## Arquitectura general

- Frontend Angular: `serviya-web`.
- API Gateway: entrada unica para clientes web.
- Keycloak: autenticacion, autorizacion y roles.
- Config Server: configuracion centralizada.
- Eureka Server: descubrimiento de servicios.
- Microservicios: `user-ms`, `service-request-ms`, `technician-ms`, `assignment-ms`, `payment-ms`, `review-ms`, `notification-ms`.
- Observabilidad: Prometheus, Grafana, Loki y Promtail.

## Organizacion

- Unidad 1 (U1): artefactos S01 a S05.
- Unidad 2 (U2): artefactos S06 a S12.
- Unidad 3 (U3): validacion, estabilizacion y defensa tecnica S13 a S15.
- Anexos Individuales: evidencia personal de cada integrante.

## Ejecucion local de la documentacion

```bash
pip install mkdocs mkdocs-material
mkdocs serve
```

Abrir:

```text
http://localhost:8000
```
