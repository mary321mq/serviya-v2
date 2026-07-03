# Entregables BL

La defensa tecnica S15 exige tres entregables grupales. Este archivo deja trazabilidad de lo que debe estar en BL y de lo que queda evidenciado en GitHub.

## Resumen de entrega

| Entregable | Destino oficial | Evidencia en repo |
| --- | --- | --- |
| Documentacion MkDocs | GitHub Pages y BL si se solicita enlace | `docs/`, `mkdocs.yml`, `.github/workflows/docs.yml` |
| PDF grupal desde documentacion | BLearning (BL) | `docs/defensa-s15/entregables-finales/S15_ServiYa_U3_Docs.pdf` |
| Presentacion final | BLearning (BL) | `docs/defensa-s15/entregables-finales/ProductoCurso_ServiYa_Presentacion.pptx` |

## 1. Sitio de documentacion

Debe estar en el repositorio y publicado como sitio navegable.

- Repositorio: <https://github.com/mary321mq/serviya-v2>
- Sitio esperado de GitHub Pages: <https://mary321mq.github.io/serviya-v2/>
- Workflow: `.github/workflows/docs.yml`

Comando local:

```powershell
cd "C:\Users\ACER\Downloads\nuestro sistema\serviya-v2\serviya-v2"
pip install -r requirements-docs.txt
mkdocs serve
```

URL local:

```text
http://localhost:8000
```

### Publicacion en GitHub Pages

1. Entrar a GitHub, seccion `Settings` -> `Pages`.
2. En `Build and deployment`, seleccionar `GitHub Actions`.
3. Ejecutar el workflow `Deploy MkDocs` o hacer push a `main`.
4. Verificar el enlace publicado.

## 2. PDF grupal desde la documentacion

Nombre solicitado por la guia del curso:

```text
S15_Equipo##_U3_Docs.pdf
```

Forma aceptada:

1. Abrir el sitio MkDocs publicado o local.
2. Usar imprimir del navegador.
3. Guardar como PDF.
4. Subir a BL.

!!! warning "Regla importante"
    El PDF debe generarse desde la documentacion. No se acepta un PDF armado manualmente fuera del sitio.

## 3. Presentacion final

Archivo disponible en el repo:

```text
docs/defensa-s15/entregables-finales/ProductoCurso_ServiYa_Presentacion.pptx
```

Nombre solicitado por la guia del curso si se exporta como PDF:

```text
ProductoCurso_Equipo##_Presentacion.pdf
```

Contenido minimo esperado:

- Nombre del proyecto y equipo.
- Problema o flujo de negocio.
- Arquitectura final.
- Flujo end-to-end.
- Seguridad, eventos, consistencia y observabilidad.
- Integracion frontend.
- Evidencias principales.
- Aporte individual de cada integrante.
- Evidencia de participacion individual en GitHub.
- Demo asignada a cada integrante.
- Riesgos, incidencias y mejoras futuras.

## Datos del equipo

| Campo | Valor |
| --- | --- |
| Equipo | Pendiente de confirmar |
| Proyecto | ServiYa |
| Link GitHub | <https://github.com/mary321mq/serviya-v2> |
| Link documentacion | <https://mary321mq.github.io/serviya-v2/> |
| Rama integrada evaluada | `main` |
| Evidencia de merge | Historial de commits y rama `main` en GitHub |

