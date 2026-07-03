# Manual de ejecucion local

Esta guia permite levantar ServiYa v2 desde cero en Windows con PowerShell. La ruta usada en esta maquina es:

```powershell
$ROOT = "C:\Users\ACER\Downloads\nuestro sistema\serviya-v2\serviya-v2"
cd $ROOT
```

Si el proyecto se clona en otra carpeta, cambia solo el valor de `$ROOT`.

## Requisitos

| Herramienta | Uso |
| --- | --- |
| Java 17 | Ejecutar servicios Spring Boot. |
| Maven 3.9+ | Compilar el proyecto padre, librerias y microservicios. |
| Node.js + npm | Instalar dependencias y levantar Angular. |
| Docker Desktop | Ejecutar Keycloak, PostgreSQL, Prometheus, Loki y Grafana. |
| Git | Clonar, versionar y subir cambios a GitHub. |
| PowerShell | Ejecutar los comandos de arranque y validacion. |

## 1. Preparar el proyecto Maven

Desde la raiz del repositorio:

```powershell
cd $ROOT
mvn install -N
mvn -pl libs/testing-support,libs/commons-web install -DskipTests
```

Esto instala el POM padre y las librerias comunes que necesitan los microservicios.

## 2. Levantar infraestructura Docker

Keycloak:

```powershell
cd $ROOT\infra\keycloak
docker compose -f compose-dev.yml up -d
```

Bases de datos por microservicio:

```powershell
cd $ROOT\services\user-ms; docker compose -f compose-dev.yml up -d
cd $ROOT\services\service-request-ms; docker compose -f compose-dev.yml up -d
cd $ROOT\services\payment-ms; docker compose -f compose-dev.yml up -d
cd $ROOT\services\technician-ms; docker compose -f compose-dev.yml up -d
cd $ROOT\services\assignment-ms; docker compose -f compose-dev.yml up -d
cd $ROOT\services\notification-ms; docker compose -f compose-dev.yml up -d
cd $ROOT\services\reviews-ms; docker compose -f compose-dev.yml up -d
```

Observabilidad:

```powershell
cd $ROOT\infra\observability
docker compose -f compose-dev.yml up -d
```

Verificacion rapida de contenedores:

```powershell
docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
```

## 3. Levantar infraestructura Spring

Abre una terminal por proceso para que cada servicio quede activo.

Config Server:

```powershell
cd $ROOT\infra\config
mvn spring-boot:run
```

Eureka:

```powershell
cd $ROOT\infra\eureka
mvn spring-boot:run
```

API Gateway:

```powershell
cd $ROOT\infra\gateway
mvn spring-boot:run
```

## 4. Levantar microservicios

Ejecuta cada microservicio en su propia terminal:

```powershell
cd $ROOT\services\user-ms; mvn spring-boot:run
cd $ROOT\services\payment-ms; mvn spring-boot:run
cd $ROOT\services\service-request-ms; mvn spring-boot:run
cd $ROOT\services\technician-ms; mvn spring-boot:run
cd $ROOT\services\assignment-ms; mvn spring-boot:run
cd $ROOT\services\notification-ms; mvn spring-boot:run
cd $ROOT\services\reviews-ms; mvn spring-boot:run
```

## 5. Levantar frontend Angular

```powershell
cd $ROOT\clients\serviya-web
npm install
npm start -- --host 0.0.0.0 --port 4200
```

Abrir en navegador:

```text
http://localhost:4200
```

## Puertos de trabajo

| Componente | URL |
| --- | --- |
| Frontend Angular | `http://localhost:4200` |
| API Gateway | `http://localhost:18080` |
| Config Server | `http://localhost:18888` |
| Eureka | `http://localhost:18761` |
| Keycloak | `http://localhost:8089` |
| Grafana | `http://localhost:13001` |
| Prometheus | `http://localhost:19091` |
| Loki | `http://localhost:13101` |
| user-ms | `http://localhost:18082/actuator/health` |
| payment-ms | `http://localhost:8083/actuator/health` |
| service-request-ms | `http://localhost:8084/actuator/health` |
| technician-ms | `http://localhost:8085/actuator/health` |
| assignment-ms | `http://localhost:8086/actuator/health` |
| notification-ms | `http://localhost:8087/actuator/health` |
| review-ms | `http://localhost:8088/actuator/health` |

## Bases de datos locales

| Servicio | Contenedor | DB | Puerto host |
| --- | --- | --- | ---: |
| user-ms | `serviya-postgres-user` | `serviya_user` | 5432 |
| service-request-ms | `serviya-postgres-service-request` | `service_request_ms` | 5434 |
| payment-ms | `serviya-postgres-payment` | `serviya_payment` | 5435 |
| technician-ms | `serviya-postgres-technician` | `serviya_technician` | 5436 |
| assignment-ms | `serviya-postgres-assignment` | `assignment_ms` | 5440 |
| notification-ms | `serviya-postgres-notification` | `notification_ms` | 5438 |
| review-ms | `serviya-postgres-review` | `review_ms` | 5437 |

## Validacion de salud

Cuando todo este levantado, ejecuta:

```powershell
$checks = @(
  "http://localhost:18888/actuator/health",
  "http://localhost:18761/actuator/health",
  "http://localhost:18080/actuator/health",
  "http://localhost:18082/actuator/health",
  "http://localhost:8083/actuator/health",
  "http://localhost:8084/actuator/health",
  "http://localhost:8085/actuator/health",
  "http://localhost:8086/actuator/health",
  "http://localhost:8087/actuator/health",
  "http://localhost:8088/actuator/health"
)

foreach ($url in $checks) {
  try {
    $r = Invoke-RestMethod -Uri $url -TimeoutSec 5
    "OK  $url  $($r.status)"
  } catch {
    "ERR $url  $($_.Exception.Message)"
  }
}
```

## Validacion funcional sugerida

1. Abrir `http://localhost:4200`.
2. Iniciar sesion con un usuario del realm `serviya`.
3. Entrar como cliente y crear una solicitud desde el catalogo.
4. Asignar o aceptar un tecnico.
5. Registrar pago desde checkout.
6. Confirmar trabajo terminado desde cliente y tecnico.
7. Revisar que el pago se libere a la wallet del tecnico.
8. Crear una resena del servicio.
9. Revisar notificaciones y dashboard de observabilidad.

## Problemas frecuentes

| Sintoma | Causa probable | Solucion |
| --- | --- | --- |
| `npm.ps1 cannot be loaded` | Politica de ejecucion de PowerShell. | Usar `npm.cmd install` y `npm.cmd start -- --host 0.0.0.0 --port 4200`, o ajustar la politica si el equipo lo permite. |
| `Port 5432 already in use` | PostgreSQL local ocupa el puerto de `user-ms`. | Detener el PostgreSQL local o cambiar el puerto publicado del compose de `user-ms` y actualizar `SERVIYA_DATASOURCE_URL`. |
| Servicios no aparecen en Eureka | Eureka o Config Server no estan levantados. | Iniciar primero Config Server, luego Eureka, luego Gateway y microservicios. |
| `401` o `403` en frontend | Token inexistente, vencido o rol incorrecto. | Cerrar sesion, iniciar de nuevo y validar roles en Keycloak. |
| Prometheus no muestra targets | Servicio apagado o sin `/actuator/prometheus`. | Verificar `/actuator/health` y revisar `infra/observability/prometheus/prometheus-dev.yml`. |
| GitHub Pages sale rojo | Pages no esta usando GitHub Actions o fallo MkDocs. | Revisar `Settings > Pages` y el workflow `Deploy MkDocs`. |

## Comandos de documentacion

Servir MkDocs localmente:

```powershell
cd $ROOT
mkdocs serve
```

Construir documentacion:

```powershell
cd $ROOT
mkdocs build --strict
```
