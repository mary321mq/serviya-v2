# Guion de presentacion final

Duracion total sugerida: 10 minutos de exposicion, 5 minutos de demo tecnica y 3 minutos de preguntas.

## 1. Apertura

- Proyecto: ServiYa.
- Problema: gestion integral de servicios tecnicos a domicilio.
- Objetivo: conectar clientes, trabajadores/cotizadores, tecnicos y administradores con pagos, comprobantes y seguimiento.

## 2. Arquitectura final

Explicar:

- Frontend Angular.
- API Gateway.
- Keycloak.
- Eureka y Config Server.
- Microservicios de solicitudes, pagos, tecnicos, usuarios, resenas, asignaciones y notificaciones.
- Prometheus y Grafana.

## 3. Flujo end-to-end

1. Cliente crea solicitud.
2. Trabajador revisa y cotiza.
3. Cliente paga.
4. Sistema asigna tecnico.
5. Tecnico atiende.
6. Cliente califica.
7. Notificaciones acompanan cada cambio relevante.

## 4. Seguridad

Mostrar:

- Login con Keycloak.
- Roles por panel.
- Rutas protegidas en gateway.
- Token JWT enviado desde frontend.

## 5. Eventos y consistencia

Mostrar:

- Notificacion de bienvenida.
- Nueva cotizacion.
- Pago pendiente.
- Pago exitoso.
- Solicitud aprobada.
- Resena pendiente.

## 6. Observabilidad

Mostrar en Grafana:

- Estado de servicios.
- Trafico HTTP por segundo.
- Errores HTTP 4xx/5xx.
- Latencia HTTP p95.

## 7. Aportes individuales

Cada integrante debe decir:

- Que desarrollo.
- Que archivos o servicios toco.
- Que commits o PR lo evidencian.
- Que parte demostrara en vivo.

## 8. Cierre

- Riesgos actuales.
- Incidencias corregidas.
- Mejoras futuras.
- Confirmar que el producto esta documentado, ejecutable e integrado.
