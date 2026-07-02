# S15 - Defensa Tecnica

## 1. Arquitectura final y flujo end-to-end implementado

La arquitectura final de ServiYa usa frontend Angular, API Gateway, Keycloak, Config Server, Eureka Server, microservicios Spring Boot, base de datos por servicio y observabilidad con Prometheus, Grafana, Loki y Promtail.

| Componente | Responsabilidad |
|---|---|
| `serviya-web` | Interfaz web para cliente, tecnico, trabajador y admin |
| `api-gateway` | Enrutamiento, seguridad y punto unico de entrada |
| `keycloak` | Autenticacion, usuarios y roles |
| `config-server` | Configuracion centralizada |
| `eureka-server` | Registro y descubrimiento de servicios |
| `service-request-ms` | Solicitudes, cotizaciones, estados y asignacion |
| `technician-ms` | Postulacion, perfil y disponibilidad del tecnico |
| `assignment-ms` | Busqueda de tecnicos disponibles por categoria y ubicacion |
| `payment-ms` | Pagos, comprobantes, historial y billetera |
| `review-ms` | Resenas y calificaciones |
| `notification-ms` | Notificaciones in-app |

### Flujo end-to-end

1. Cliente inicia sesion en Keycloak.
2. Cliente selecciona un servicio.
3. Si es `COTIZACION + REMOTA`, se crea gratis y pasa a `PENDIENTE_EVALUACION`.
4. Si es `COTIZACION + PRESENCIAL`, se crea en `ESPERANDO_PAGO_VISITA`.
5. Cliente paga la visita presencial.
6. Backend cambia a `PENDIENTE_EVALUACION`.
7. Trabajador envia cotizacion.
8. Solicitud pasa a `COTIZADO_ESPERANDO_PAGO`.
9. Cliente paga la cotizacion.
10. Solicitud pasa a `PAGADO_BUSCANDO_TECNICO`.
11. Cliente selecciona tecnico.
12. Tecnico acepta o rechaza.
13. Si acepta, queda `BUSY` hasta finalizar.
14. Cliente y tecnico confirman finalizacion.
15. Solicitud pasa a `COMPLETADO`.
16. `payment-ms` acredita la billetera del tecnico.
17. Cliente deja resena.

## 2. Seguridad, comunicacion, consistencia y observabilidad

### Seguridad

El sistema usa Keycloak con JWT y roles:

| Rol | Permisos |
|---|---|
| `CLIENTE` | Crear solicitudes, pagar, ver historial y calificar |
| `TECNICO` | Ver ofertas, aceptar, rechazar y completar trabajos |
| `TRABAJADOR` | Revisar solicitudes y emitir cotizaciones |
| `ADMIN` | Gestionar catalogo, usuarios, tecnicos, pagos y monitoreo |

### Comunicacion sincrona

- Angular consume el API Gateway.
- Gateway enruta a microservicios.
- Los microservicios usan REST y Feign Client.

Ejemplos:

- `service-request-ms` llama a `assignment-ms`.
- `service-request-ms` llama a `technician-ms` para disponibilidad.
- `service-request-ms` llama a `payment-ms` para billetera.
- Servicios llaman a `notification-ms` para notificaciones.

### Comunicacion asincrona o desacoplada

Las notificaciones se manejan como un componente desacoplado. Si falla la notificacion, no debe romper el flujo principal de negocio.

### Consistencia

El sistema aplica consistencia eventual entre estados de solicitud, billetera, disponibilidad de tecnico y notificaciones.

Reglas criticas:

- Un tecnico que rechaza una solicitud no vuelve a aparecer para esa misma solicitud.
- Un tecnico ocupado no aparece para otros clientes.
- La cotizacion remota no cobra visita.
- La cotizacion presencial cobra visita antes de evaluacion.

### Observabilidad

| Herramienta | Puerto | Uso |
|---|---:|---|
| Prometheus | `19091` | Metricas |
| Grafana | `13001` | Dashboards |
| Loki | `3100` | Logs |
| Promtail | interno | Recoleccion de logs |

Paneles esperados:

- Estado de servicios.
- Trafico HTTP por segundo.
- Latencia HTTP p95.
- Errores HTTP 4xx/5xx.
- CPU del proceso.
- Memoria JVM.
- Logs por microservicio.

## 3. Orden de arranque de los servicios

1. Bases de datos.
2. Keycloak.
3. Config Server.
4. Eureka Server.
5. API Gateway.
6. Microservicios backend.
7. Observabilidad.
8. Frontend Angular.

## 4. Puertos y variables de entorno

| Servicio | Puerto |
|---|---:|
| Frontend Angular | `4200` |
| API Gateway | `18080` |
| Config Server | `18888` |
| Eureka Server | `18761` |
| Keycloak | `8089` |
| service-request-ms | `8084` |
| payment-ms | `8083` |
| technician-ms | `8085` |
| assignment-ms | `8086` |
| notification-ms | `8087` |
| review-ms | `8088` |
| PostgreSQL service-request-ms | `5434` |
| PostgreSQL payment-ms | `5435` |
| PostgreSQL technician-ms | `5436` |
| PostgreSQL review-ms | `5437` |
| PostgreSQL notification-ms | `5438` |
| PostgreSQL assignment-ms | `5440` |

Variables principales:

| Variable | Ejemplo |
|---|---|
| `CONFIG_SERVER_URL` | `http://localhost:18888` |
| `SERVIYA_KEYCLOAK_ISSUER_URI` | `http://localhost:8089/realms/serviya` |
| `SERVIYA_SERVICE_REQUEST_MS_URI` | `http://localhost:8084` |
| `SERVIYA_PAYMENT_MS_URI` | `http://localhost:8083` |
| `SERVIYA_TECHNICIAN_MS_URI` | `http://localhost:8085` |
| `SERVIYA_ASSIGNMENT_MS_URI` | `http://localhost:8086` |
| `SERVIYA_NOTIFICATION_MS_URI` | `http://localhost:8087` |
| `SERVIYA_REVIEW_MS_URI` | `http://localhost:8088` |

## 5. Rutas y datos de prueba

Base externa:

```text
http://localhost:18080
```

### Crear solicitud presencial

```http
POST /service-request-ms/api/v1/solicitudes
```

```json
{
  "catalogServiceId": 6,
  "direccionFisica": "Puno, San Roman, Juliaca: Heroes de La Guerra del Pacifico",
  "latitud": -15.4992,
  "longitud": -70.1333,
  "cantidad": 1,
  "evidenciaUrls": [
    "/api/v1/solicitudes/evidencia/fuga.jpg"
  ]
}
```

Resultado esperado:

```json
{
  "estadoSolicitud": "ESPERANDO_PAGO_VISITA",
  "costoVisita": 20.00
}
```

### Crear solicitud remota

```json
{
  "catalogServiceId": 7,
  "direccionFisica": "Puno, San Roman, Juliaca: Jr. Lima 123",
  "latitud": -15.5001,
  "longitud": -70.1299,
  "cantidad": 1,
  "evidenciaUrls": [
    "/api/v1/solicitudes/evidencia/problema-remoto.jpg"
  ]
}
```

Resultado esperado:

```json
{
  "estadoSolicitud": "PENDIENTE_EVALUACION",
  "costoVisita": 0.00
}
```

### Marcar pago

```http
POST /service-request-ms/api/v1/solicitudes/{id}/marcar-pagado
```

### Cotizar solicitud

```http
POST /service-request-ms/api/v1/solicitudes/trabajador/{id}/cotizar
```

```json
{
  "items": [
    {
      "descripcion": "Mano de obra",
      "cantidad": 1,
      "precioUnitario": 80.00
    }
  ]
}
```

### Descargar comprobante

```http
GET /payment-ms/api/v1/pagos/{id}/comprobante
```

## 6. Comandos de ejecucion

Bases de datos:

```powershell
cd C:\ServiYa\serviya-v2\services\service-request-ms
docker compose -f compose-dev.yml up -d
```

Backend:

```powershell
cd C:\ServiYa\serviya-v2\infra\config
mvn spring-boot:run
```

```powershell
cd C:\ServiYa\serviya-v2\infra\eureka
mvn spring-boot:run
```

```powershell
cd C:\ServiYa\serviya-v2\infra\gateway
mvn spring-boot:run
```

```powershell
cd C:\ServiYa\serviya-v2\services\service-request-ms
mvn spring-boot:run
```

Frontend:

```powershell
cd C:\ServiYa\serviya-v2\clients\serviya-web
npm install
ng serve
```

## 7. Evidencias esperadas y criterios de verificacion

| Evidencia | Criterio |
|---|---|
| Login con Keycloak | Usuario autenticado con rol correcto |
| Solicitud remota | `PENDIENTE_EVALUACION`, costo visita `0` |
| Solicitud presencial | `ESPERANDO_PAGO_VISITA`, costo visita mayor a `0` |
| Pago de visita | Estado cambia a `PENDIENTE_EVALUACION` |
| Cotizacion enviada | Estado `COTIZADO_ESPERANDO_PAGO` |
| Pago de cotizacion | Estado `PAGADO_BUSCANDO_TECNICO` |
| Tecnico acepta | Estado `EN_PROCESO`, tecnico `BUSY` |
| Trabajo completado | Estado `COMPLETADO` |
| Billetera | Abono registrado |
| PDF | Comprobante descargable |
| Grafana | Dashboard con metricas y logs |

## 8. Errores frecuentes y solucion

### Puerto ocupado

```powershell
netstat -ano | findstr :8085
taskkill /PID <PID> /F
```

### `@PathVariable` sin nombre

Usar siempre:

```java
@PathVariable("id") Long id
```

### Cotizacion presencial no crea solicitud

Verificar que PostgreSQL permita `ESPERANDO_PAGO_VISITA` en `solicitudes_servicio_estado_solicitud_check`.

### Prometheus muestra servicios abajo

Verificar:

```text
http://localhost:8084/actuator/prometheus
http://localhost:8083/actuator/prometheus
http://localhost:8085/actuator/prometheus
```
