# Manual de ejecucion

Comandos utiles para levantar y verificar ServiYa en desarrollo local.

## Frontend

```powershell
cd C:\ServiYa\serviya-v2\clients\serviya-web
npm install
npm start -- --host 0.0.0.0 --port 4200
```

URL:

```text
http://localhost:4200
```

## Keycloak

```powershell
cd C:\ServiYa\serviya-v2\infra\keycloak
docker compose -f compose-dev.yml up -d
```

URL:

```text
http://localhost:8089
```

## Gateway

```powershell
cd C:\ServiYa\serviya-v2\infra\gateway
mvn spring-boot:run
```

URL base:

```text
http://localhost:18080
```

## Microservicios

Ejemplo:

```powershell
cd C:\ServiYa\serviya-v2\services\notification-ms
mvn spring-boot:run
```

Repetir para los servicios necesarios.

## Documentacion

```powershell
cd C:\ServiYa\serviya-v2
mkdocs serve
```

URL:

```text
http://localhost:8000
```

## Verificaciones de build

Frontend:

```powershell
cd C:\ServiYa\serviya-v2\clients\serviya-web
npm run build
```

Backend:

```powershell
cd C:\ServiYa\serviya-v2\services\notification-ms
mvn test -DskipTests
```
