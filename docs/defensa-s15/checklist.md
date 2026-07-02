# Checklist de evaluacion S15

Este checklist traduce la guia de defensa tecnica S15 a evidencias concretas para ServiYa.

## Entregables grupales

| Requisito | Evidencia en ServiYa | Estado |
| --- | --- | --- |
| Documentacion en MkDocs | Sitio MkDocs en `docs/` y `mkdocs.yml` | Listo |
| PDF generado desde documentacion | Exportar desde navegador o pipeline de docs | Pendiente |
| Presentacion final | PPT o equivalente | Pendiente |
| Documentacion publicada | GitHub Pages u otra plataforma | Pendiente |
| Producto integrado y ejecutable | Rama comun del equipo | Pendiente |
| Anexos individuales | Un anexo por integrante | Pendiente |

## Evidencia tecnica minima

| Criterio | Que demostrar |
| --- | --- |
| Arquitectura final | Frontend, gateway, Keycloak, Eureka, Config, microservicios, observabilidad. |
| Flujo end-to-end | Cliente crea solicitud, trabajador cotiza, cliente paga, tecnico atiende, cliente califica. |
| Seguridad | Login Keycloak, roles, rutas protegidas y JWT en gateway. |
| Comunicacion sincrona | Angular -> Gateway -> microservicios; Feign entre servicios. |
| Eventos y consistencia | Notificaciones de cotizacion, pago, asignacion y resena pendiente. |
| Observabilidad | Prometheus, Grafana, metricas HTTP, errores 4xx/5xx y latencia p95. |
| Diagnostico | Logs, respuestas HTTP, metricas y errores frecuentes. |
| Integracion frontend | Paneles cliente, tecnico, trabajador y admin consumiendo gateway. |

## Preguntas esperadas del docente

1. Que parte desarrollaste y como se integra con el sistema?
2. Que evidencia demuestra que tu aporte funciona?
3. Como diagnosticarias un fallo relacionado con tu componente?

## Orden recomendado de exposicion

1. Presentar proyecto, equipo y repositorio.
2. Explicar problema de negocio.
3. Mostrar arquitectura final.
4. Ejecutar demo end-to-end.
5. Mostrar seguridad, eventos, consistencia y observabilidad.
6. Mostrar documentacion reproducible.
7. Mostrar evidencias individuales en GitHub.
8. Cada integrante demuestra su aporte.
9. Cerrar con riesgos, incidencias y mejoras futuras.
