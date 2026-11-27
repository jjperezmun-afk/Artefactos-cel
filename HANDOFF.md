# HANDOFF · Visor 3D de obras SIGPER

Traspaso desde la sesión en la nube (27-11-2026) a la sesión local del PC de JJ.
Rama: `claude/sigper-tracking-system-qnlvll` en `jjperezmun-afk/Artefactos-cel`. Nada está mezclado en `main`.

## 1. Qué hay en el repo

| Ruta | Qué es | Estado |
|---|---|---|
| `sigper-3d/obras2/` | **Visor 3D actual**: `index.html` + `modelos.js` + `m/*.json` (modelos de Majadroid) | Publicado como artefacto "SIGPER · Obras en 3D" |
| `sigper-3d/escenas/` | Banco de pruebas de los 10 módulos y los 3 terrenos base, con controles manuales | Publicado ("Escenas por módulos") |
| `sigper-3d/catalogo/` | Catálogo de los 50 modelos (Majadroid + propios) | Publicado ("Catálogo 3D") |
| `sigper-3d/galeria/` | Evaluación de paquetes CC0 (Majadroid, Kenney, Iacox) | Referencia |
| `sigper-3d/index.html` | Primera maqueta, con datos ficticios | Referencia |
| `sigper-3d/obras.html` | Visor 3D v1, con escenas fijas por tipo (reemplazado por obras2) | Obsoleto |
| `sigper/index.html` | Visor de obras 2D: leía SIGPER_SPA_v20 | **En pausa** (la v20 quedó congelada) |
| `sigper/skills/sigper-revision/` | Skill de revisión del sistema, solo lectura (`SKILL.md` + `revisar.py`) | Listo para copiar a `.claude/skills/` |
| `sigper-3d/Prompt_TipoActividad.md` | Prompt con el que se agregó "Tipo de actividad" | Ya aplicado |

**No están en el repo** (el filtro de la sesión bloqueó subirlos porque tenían nombres o datos de clientes y correos): el prompt v2 de las planillas, el plan de escenas (`PLAN_escenas.md`) y la copia pausada del skill `sigper-informe-interactivo`. JJ los tiene como archivos enviados en la conversación. Lo esencial del plan está en las secciones 3 y 5.

## 2. Cómo funciona y cómo se ejecuta

- Es una página HTML sola (three.js r128, SheetJS 0.18.5 y GLTFLoader, todos desde CDN), sin compilación.
- **Hoy corre como artefacto de claude.ai.** Lee las planillas con el **conector de Google Drive de quien la abre**, mediante la capacidad `mcp`: `search_files` y `download_file_content` en el servidor "Google Drive". O sea, **ya lee las planillas reales**: las mismas que se sincronizan en `H:\Mi unidad\SIGPER`, solo que desde Drive y no desde el disco.
- Para publicar cambios: subir `obras2/index.html` (y `modelos.js` o `m/*.json` si cambian) al artefacto existente con las herramientas de artefactos (`publish_files` con `slug` y `base_version`). La capacidad `mcp` ya está declarada y se conserva.
- **Para correrlo en local leyendo del disco** hay que reemplazar solo la capa de datos. En `obras2/index.html`:
  - `search(q)`, `byTitle(t)` y `dl(f)` llaman al conector. Basta con cambiarlas por lecturas locales: por ejemplo, un servidor de Python que entregue los .xlsx, o un selector de carpeta del navegador.
  - `boot()` arma `OBRAS` y llama a `initWorld()`.
  - Todo lo demás (escena, módulos, panel) no depende de dónde vienen los archivos.
  - Para servirlo: `python -m http.server` en `sigper-3d/obras2/`. Los `m/*.json` se cargan con `fetch`, así que no funciona abriendo el archivo con doble clic.
- **Requisito:** cada .xlsx debe haberse guardado al menos una vez en Excel. SheetJS lee los valores calculados que quedan guardados en el archivo, y openpyxl no los escribe.

## 3. Lógica del visor 3D (obras2)

- **Mapa:** una fila por comuna, ordenada de norte a sur según la latitud de Maestros o una tabla interna de comunas. Las obras sin comuna van a la fila "Sin comuna cargada".
- **Obras que se muestran:** las de Maestros, excepto PRY-0000, PRY-0099 y las que estén Perdidas, Cerradas, Fusionadas o Permanentes. Las de estado "Licitación" aparecen como terreno con cartel; su planilla PRY se lee al tocarlas.
- **Frentes:** un sector de 12 × 12 m por cada valor de `Grupo` en `tbl_Plan`. Las actividades marcadas como hito no generan sector.
- **Tipo de actividad → módulo** (`tipoDe` y `modDe`):
  - Se usa la columna "Tipo de actividad" (regex `^A(\d+)`). Si está vacía, se deduce del nombre con palabras clave (`KW`).
  - A3 → demol · A9 y A10 → canal · A12 → tendido · A14 → camino · A17 → arriendo · A5 y A18 → excav · A1 y A16 → faena.
  - A2, A4, A6, A7, A8, A11, A13 y A15 se asignan por el nombre del Grupo: contrafoso, muro o canal → muro; torre, antena, Mauro o Trueno → torre; panel o radier → fund. Si nada calza, se usa el módulo más frecuente de la obra; si no hay ninguno, excav para Movimiento de tierra y fund para el resto.
  - A2 sin otro módulo en el grupo se suma a la faena.
- **Avance del módulo:** promedio del % de sus actividades. La faena va de 0,1 a 0,85 según las actividades A1 y salta a 0,9 o más cuando avanza A16. Las obras "Terminado…" se dibujan al 100%.
- **Sector "Equipos asignados":** se agrega si hay equipos asignados. Muestra los equipos reales con un modelo según su Tipo, un rombo rojo si están detenidos y una ficha al tocarlos.
- **Terreno base (excluyente):**
  - patio de subestación si Tipo de escena = Apoyo eléctrico;
  - cerro si la obra tiene un módulo de torre o de camino;
  - plano en los demás casos.
- **Módulos (10):** faena, fund, demol, canal, muro, torre, camino, excav, tendido y arriendo. Sus etapas están en el arreglo `MOD`, que es idéntico al de `escenas/`.
- **Colores de estado:** verde para Terminada, celeste para Licitación, ámbar para En ejecución, morado para Adjudicada y gris para otros. El % va en negro y negrita.

## 4. Datos que lee de las planillas

| Archivo (búsqueda en Drive) | Hoja | Tabla (se ubica por sus encabezados) | Columnas que usa |
|---|---|---|---|
| `SIGPER_Finanzas.xlsx` (título exacto) | Maestros | encabezados `ID_PRY`, `Proyecto` | ID_PRY, Proyecto, Cliente, Estado, Comuna, Latitud, Tipo de escena |
| `SIGPER_Equipos.xlsx` | Catálogo | `ID_EQ`, `Tipo` | ID_EQ, Tipo, Patente, Estado, Medidor, Mínimo h/mes, Proveedor |
| | Asignación | `Patente`, `ID_PRY` | ID_EQ, Patente, ID_PRY, Desde, Hasta |
| | Horómetros | `Fecha`, `Patente`, `Lectura` | Fecha, ID_EQ, Lectura |
| | Detenciones | `Patente`, `Desde`, `Hasta` | ID_EQ, Desde, Hasta, Causa |
| | Combustible | `Fecha`, `ID_PRY`, `Patente` | Fecha, Patente, Chofer |
| `SIGPER_Remuneraciones.xlsx` | Asignación | `ID_EMP`, `ID_PRY` | ID_EMP, ID_PRY, Desde, Hasta, Nombre |
| | Fichas | `ID_EMP`, `Nombre` | ID_EMP, Nombre, Cargo (no lee el RUT) |
| `PRY-xxxx <Proyecto>.xlsx` (busca `title contains 'PRY-0'` y filtra con `^PRY-\d{4} .+\.xlsx$`; si hay duplicados, usa el más reciente) | Resumen | nombres definidos | RES_AvanceFisico, RES_AvanceCosto, RES_Facturado, RES_Cobrado, RES_PorCobrar, RES_CostoEstimado, RES_CostoReal, RES_MargenEstPct, RES_MargenRealPct, RES_DiasAtraso, RES_AlertaAvance, RES_AlertaFacturacion, RES_EstadoAnotado, RES_InicioPlan, RES_TerminoPlan, RES_TerminoReal |
| | Planificación | encabezados `N°`, `Actividad` (tbl_Plan) | Actividad, Grupo, Inicio plan, Fin plan, % avance (manual) o % avance, Estado, Hito, **Tipo de actividad** |

La función `table()` toma los encabezados contiguos de la fila y se detiene en la primera celda vacía. Por eso "Tipo de actividad" (columna R, pegada a la tabla) se lee bien, y el Gantt, desde la columna S, no interfiere.

## 5. Cambios a las planillas

| Cambio | Estado |
|---|---|
| "Tipo de actividad" (A1–A18, `lst_TipoActividad`) en tbl_Plan de las 12 planillas PRY | **Hecho** (informado por la sesión maestra el 27-11). Dudosos aprobados: 0002#1→A4, 0002#2 vacío, 0004 #3/#15→A1, #9/#20→A9, #12/#23→A11, #21→A7, 0005#1 vacío, #10→A1, #11→A7 |
| Maestros: Comuna, Latitud, Longitud y Tipo de escena | Columnas creadas. **Falta completar** Tipo de escena (hoy el visor usa la propuesta aprobada) y las comunas o coordenadas de MACFIC y de las obras de Tinguiririca |
| Mantener **Grupo** consistente en tbl_Plan (un nombre por frente) | Pedido. El visor arma los sectores con esa columna |
| `tbl_Documentos` en SIGPER_Equipos (ID_EQ, Patente, Documento, N°, Emisión, Vence, Archivo, Revisado) | **Pendiente.** Para vencimientos de SOAP, revisión técnica y permiso; `sigper-revision` ya la revisa |
| `tbl_Acreditaciones` en SIGPER_Remuneraciones (por persona y documento, con vencimiento) | **Pendiente** |
| Próxima mantención (tbl_Mantenciones: Próxima lectura) | Pendiente de cargar |
| Personal asignado a obras (Asignación de Remuneraciones) | Hoy solo está JJ en PRY-0000, así que el visor no dibuja personas en las obras |

Regla de JJ: **las planillas y sus flujos tienen prioridad sobre el visor.** Cualquier cambio en ellas va con respaldo, sin tocar fórmulas, Resumen ni Power Query, y se valida antes de cerrar.

## 6. Pendiente del visor
1. Probarlo con el conector real de JJ y en el celular. Hasta ahora solo se probó con copias de las planillas del 27-11 y simulando Drive.
2. Cuando Tipo de escena esté completo, ampliar la lista de 4 a 8 escenas si se quiere elegir el terreno base de forma explícita. Hoy se deduce.
3. Mostrar los vencimientos (tbl_Documentos) y las acreditaciones cuando existan.
4. Volver a activar el visor 2D (`sigper/index.html`) leyendo el sistema nuevo, o retirarlo.
5. El informe diario interactivo y la "Revisión semanal de pendientes" están pausados (tareas programadas desactivadas el 27-11). Para reactivarlos, primero hay que cambiar su fuente de la v20 al sistema nuevo.
