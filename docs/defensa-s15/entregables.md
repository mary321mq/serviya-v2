# Entregables BL

La defensa tecnica S15 exige tres entregables grupales.

## 1. Sitio de documentacion

Debe estar en el repositorio y publicado como sitio navegable.

Comando local:

```powershell
cd C:\ServiYa\serviya-v2
mkdocs serve
```

URL local:

```text
http://localhost:8000
```

### Publicacion en GitHub Pages

Se agrego el workflow:

```text
.github/workflows/docs.yml
```

Para usarlo:

1. Subir los cambios al repositorio.
2. Entrar a GitHub, seccion "Settings" -> "Pages".
3. En "Build and deployment", seleccionar "GitHub Actions".
4. Ejecutar el workflow "Deploy MkDocs" o hacer push a `main`/`master`.
5. Copiar el enlace publicado y colocarlo en el `index`.

## 2. PDF grupal desde la documentacion

Nombre solicitado:

```text
S15_Equipo##_U3_Docs.pdf
```

Forma aceptada:

1. Abrir el sitio MkDocs.
2. Usar imprimir del navegador.
3. Guardar como PDF.
4. Subir a BL.

!!! warning "Regla importante"
    El PDF debe generarse desde la documentacion. No se acepta un PDF armado manualmente fuera del sitio.

## 3. Presentacion final

Nombre solicitado:

```text
ProductoCurso_Equipo##_Presentacion.pdf
```

Contenido minimo:

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
| Equipo | Pendiente |
| Proyecto | ServiYa |
| Link GitHub | Pendiente |
| Link documentacion | Pendiente |
| Rama integrada evaluada | Pendiente |
| Evidencia de merge | Pendiente |
