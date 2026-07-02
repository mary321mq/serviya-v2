# Demo tecnica end-to-end

Esta guia define una demo reproducible para la defensa.

## Preparacion

1. Levantar Keycloak.
2. Levantar Config Server y Eureka.
3. Levantar Gateway.
4. Levantar microservicios necesarios.
5. Levantar frontend Angular.
6. Levantar Prometheus y Grafana.

## Flujo principal

### 1. Cliente crea solicitud

Evidencia esperada:

- La solicitud se registra.
- Se muestra en "Mis solicitudes".
- Llega notificacion `REQUEST_CREATED`.

### 2. Trabajador cotiza

Evidencia esperada:

- El trabajador ve solicitudes pendientes.
- Envia cotizacion.
- El cliente recibe notificacion `QUOTE_READY`.
- La solicitud pasa a `COTIZADO_ESPERANDO_PAGO`.

### 3. Cliente paga

Evidencia esperada:

- Se crea intencion de pago.
- Se notifica `PAYMENT_PENDING`.
- Al confirmar pago se notifica `PAYMENT_SUCCESS`.
- El cliente puede revisar el comprobante.

### 4. Tecnico atiende

Evidencia esperada:

- Se asigna tecnico.
- El tecnico acepta trabajo.
- Cliente recibe `TECHNICIAN_ON_THE_WAY`.
- Tecnico termina trabajo.
- Cliente recibe `REVIEW_PENDING`.

### 5. Cliente califica

Evidencia esperada:

- Se registra la resena.
- La solicitud queda cerrada o completada.

## Diagnostico durante la demo

| Fallo | Donde mirar | Evidencia |
| --- | --- | --- |
| 401/403 | Gateway, token JWT, roles Keycloak | Consola frontend, logs gateway. |
| 404 | Ruta gateway o controlador backend | Network tab y rutas documentadas. |
| 500 | Logs del microservicio | Stacktrace y metricas 5xx. |
| No aparecen notificaciones | `notification-ms`, gateway, JWT subject | Endpoint `/notification-ms/api/v1/notifications/me`. |
| Servicio no aparece en Grafana | Prometheus targets, Actuator | Consulta `up`. |

## Comandos utiles

```powershell
curl http://localhost:18080/actuator/health
```

```powershell
curl http://localhost:19091/api/v1/query?query=up
```
