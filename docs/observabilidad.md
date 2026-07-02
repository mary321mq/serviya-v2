# Observabilidad

ServiYa usa Prometheus y Grafana para monitorear servicios, trafico HTTP, latencia y errores.

## URLs locales

| Herramienta | URL |
| --- | --- |
| Prometheus | `http://localhost:19091` |
| Grafana | `http://localhost:13001` |

## Que debe mostrar Grafana

El dashboard principal esta organizado por secciones:

| Seccion | Paneles |
| --- | --- |
| Salud general | Estado UP/DOWN de servicios. |
| Actividad en tiempo real | Barras de requests y resumen operativo por servicio. |
| Rendimiento HTTP | Trafico HTTP por segundo y latencia p95. |
| Recursos JVM | CPU del proceso y memoria JVM usada. |
| Errores y diagnostico | Errores 4xx/5xx, gauges de salud y logs relevantes. |

### Estado de servicios

Debe mostrar cada servicio como activo/inactivo segun Prometheus pueda recolectar metricas.

Servicios esperados:

- `api-gateway`
- `assignment-ms`
- `config-server`
- `eureka-server`
- `keycloak`
- `notification-ms`
- `payment-ms`
- `prometheus`
- `review-ms`
- `service-request-ms`
- `technician-ms`
- `user-ms`

### Trafico HTTP por segundo

Mide cuantas peticiones HTTP procesa cada servicio por segundo.

Utilidad:

- Ver si el gateway esta recibiendo trafico.
- Detectar servicios sin uso.
- Confirmar que frontend esta consumiendo backend.

### Requests actuales por servicio

Panel de barras para comparar rapidamente que microservicio esta recibiendo mas trafico en la ventana actual.

Consulta base:

```promql
sum by (application) (rate(http_server_requests_seconds_count{application=~"$application"}[5m]))
```

### Resumen operativo por servicio

Tabla consolidada con:

- Estado UP/DOWN.
- Requests por segundo.
- Errores 4xx/5xx por segundo.
- Latencia p95.

Este panel sirve para defensa tecnica porque permite explicar salud, carga, errores y latencia en una sola vista.

### Errores HTTP 4xx/5xx

Debe mostrar errores por servicio.

Interpretacion:

- `4xx`: problema de cliente, permisos, token, ruta o validacion.
- `5xx`: problema interno del microservicio, excepcion o dependencia caida.

### Latencia HTTP p95

Muestra el percentil 95 de duracion de requests.

Interpretacion:

- Si p95 sube, el servicio esta lento para la mayoria de usuarios.
- Revisar base de datos, llamadas Feign y endpoints con mas carga.

### Gauges de salud

Se agregaron tres medidores:

| Gauge | Que mide | Interpretacion |
| --- | --- | --- |
| Disponibilidad de servicios | Promedio de `up` para los servicios seleccionados | Cerca de 1.0 indica servicios levantados. |
| Tasa de errores 4xx/5xx | Errores HTTP por segundo | Si sube, revisar permisos, rutas o excepciones. |
| Latencia p95 maxima | Mayor p95 entre servicios seleccionados | Si pasa umbral amarillo/rojo, revisar servicio lento. |

## Recargar dashboard provisionado

Grafana lee el dashboard desde:

```text
infra/observability/grafana/dashboards/serviya-overview.json
```

En desarrollo, reinicia Grafana para forzar la recarga:

```powershell
cd C:\ServiYa\serviya-v2\infra\observability
docker compose -f compose-dev.yml restart grafana
```

Luego abre:

```text
http://localhost:13001
```

## Verificacion rapida en Prometheus

Prueba estas consultas:

```promql
up
```

```promql
http_server_requests_seconds_count
```

```promql
http_server_requests_seconds_sum
```

```promql
http_server_requests_seconds_bucket
```

Si no aparece un servicio, normalmente falta levantarlo, exponer Actuator o registrar su target en Prometheus.
