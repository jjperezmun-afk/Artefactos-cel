---
name: sigper-revision
description: Revisa en modo solo lectura si el sistema de planillas SIGPER está completo y al día (Maestros, catálogo de equipos, vencimientos de SOAP/revisión técnica/permiso, mantenciones, horómetros, asignaciones, planillas de proyecto, gastos, cobros y fichas de personal) y entrega un informe con semáforo más una lista lista para pegar en pendientes. Úsalo cuando JJ pida "revisa el sistema", "qué falta cargar", "valida las planillas", "revisión semanal" o antes de la reunión semanal o de preparar estados de pago.
---

# Revisión del sistema SIGPER (solo lectura)

## Reglas
- **Nunca modifiques, guardes ni muevas** ninguna planilla. El script copia cada archivo a una carpeta temporal y lee la copia.
- No inventes datos. Si algo no se puede leer, repórtalo tal cual.
- Responde en español, breve, con lo más urgente primero.

## Rutas
- Archivos centrales: `H:\Mi unidad\SIGPER\Archivos` (SIGPER_Finanzas, SIGPER_Equipos, SIGPER_Remuneraciones, SIGPER_Documentos).
- Planillas de proyecto: `H:\Mi unidad\SIGPER\Proyectos`. Se buscan en todas las subcarpetas como `PRY-xxxx *.xlsx`, ignorando cualquier ruta que contenga "Respaldo" y los archivos temporales `~$`.
- Si alguna ruta no existe, pregúntale a JJ antes de seguir. No busques en todo el disco.

## Pasos
1. Comprueba que Python tenga `openpyxl` (`pip install openpyxl` si falta).
2. Ejecuta, desde la carpeta de este skill:
   `python revisar.py --archivos "H:\Mi unidad\SIGPER\Archivos" --proyectos "H:\Mi unidad\SIGPER\Proyectos"`
   Si JJ pide guardar el informe, agrega `--salida "<carpeta de scripts>\revisiones\Revision_AAAA-MM-DD.md"`. Guárdalo en la carpeta de scripts, nunca dentro de Drive.
3. Entrega:
   - una línea de resumen (cuántas altas, medias y bajas);
   - las **Altas** primero, agrupadas por área;
   - el bloque "Para la lista de pendientes", tal cual, para copiar;
   - las Bajas solo como conteo por área, salvo que JJ las pida.
4. Si una Alta se puede resolver con un documento que ya está en Drive (por ejemplo, el PDF del SOAP en la carpeta del equipo), dilo e indica la ruta. **No cargues el dato**: solo indícalo.

## Qué revisa
| Área | Revisión | Nivel |
|---|---|---|
| Maestros | Estado, Comuna y Tipo de escena (lista: Movimiento de tierra / Obras civiles / Apoyo eléctrico / Arriendo); que cada PRY tenga su planilla y que no haya planillas duplicadas | Alta / Media / Baja |
| Catálogo | Equipos activos con proveedor, tarifa de costo y tarifa de cobro; mínimo h/mes si se mide en horas | Media |
| Vencimientos | SOAP, revisión técnica y permiso de circulación por patente en `tbl_Documentos`: falta, vencido o vence en 30 días o menos. Si la tabla no existe, avisa una vez | Alta / Media |
| Mantenciones | Próxima mantención registrada; alerta si faltan 50 h (o 1.000 km) o menos, o si ya pasó | Alta / Media |
| Horómetro | Equipos con mínimo de horas sin lectura en más de 7 días | Media |
| Asignación | Equipo activo sin asignación vigente; IDs que no existen en Catálogo o Maestros | Alta / Media |
| Proyectos | "¿Calza?" del estado, fecha de actualización, atraso, gasto más rápido que el avance, actividades sin fechas de plan y celdas de resumen sin calcular | Alta / Media / Baja |
| Finanzas | Gastos sin ID_PRY, sin N° de documento o con documento "Por confirmar"; recordatorios sin fecha; EP enviados sin facturar; cobros vencidos | Alta / Media / Baja |
| Personal | Fichas con RUT, inicio, contrato, AFP, salud y sueldo; existencia de `tbl_Acreditaciones` | Alta / Media |

## Si cambia la estructura
Si se renombra una tabla o una columna, el script deja de encontrarla y lo informa como faltante. En ese caso, ajusta los nombres en `revisar.py` (busca `tabla("tbl_...")` y `g(fila, "Columna")`). No cambies las planillas para que calcen con el script.
