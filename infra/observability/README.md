# Observabilidad ServiYa

Stack replicado desde `C:\ServiYa\ecom-main\obs` y adaptado a ServiYa:

- Prometheus para metricas Spring Boot Actuator.
- Loki para almacenar logs.
- Promtail para enviar logs locales a Loki.
- Grafana con datasources y dashboard provisionados.

## Desarrollo

Desde esta carpeta:

```powershell
docker compose -f compose-dev.yml up -d
```

URLs:

- Grafana: http://localhost:13001
- Prometheus: http://localhost:19091
- Loki: http://localhost:13101

Credenciales Grafana:

- Usuario: `admin`
- Clave: `admin`

Prometheus en desarrollo scrapea los servicios que corren en el host:

- config-server: `18888`
- eureka-server: `18761`
- api-gateway: `18080`
- user-ms: `18082`
- payment-ms: `8083`
- service-request-ms: `8084`
- technician-ms: `8085`
- assignment-ms: `8086`
- notification-ms: `8087`
- review-ms: `8088`
- keycloak: `8089`

## Produccion/local docker

Primero levanta la infraestructura que crea `serviya-prod-net`:

```powershell
cd C:\ServiYa\serviya-v2\infra
docker compose up -d
```

Luego levanta observabilidad:

```powershell
cd C:\ServiYa\serviya-v2\infra\observability
docker compose -f compose.yml up -d
```

URLs:

- Grafana: http://localhost:23001
- Prometheus: http://localhost:29091
- Loki: http://localhost:23101

## Requisitos de los microservicios

Los servicios deben exponer:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    tags:
      application: ${spring.application.name}
```

Tambien deben escribir logs en `logs/<servicio>.log` para que Promtail los recoja.
