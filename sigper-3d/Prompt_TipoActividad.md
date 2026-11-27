Necesito agregar la columna "Tipo de actividad" en la hoja Planificación de las planillas de proyecto (PRY-xxxx). **Regla principal: las planillas y sus flujos actuales tienen prioridad sobre el visor 3D.** Si algo de esto pone en riesgo una fórmula, una consulta de Power Query, el bloque de Resumen o el generador de planillas, detente y avísame antes de seguir.

## Qué agregar
1. En `tbl_Plan` (hoja Planificación), una columna nueva llamada **"Tipo de actividad"**, agregada **al final de la tabla**. No muevas, renombres ni borres columnas existentes.
2. Validación de datos con esta lista cerrada (guárdala en la hoja Listas como `lst_TipoActividad`):
   - A1 Movilización e instalación de faenas
   - A2 Replanteo y topografía
   - A3 Retiro y demolición
   - A4 Excavación
   - A5 Perforación y pernos
   - A6 Emplantillado, enfierradura y moldaje
   - A7 Hormigonado y curado
   - A8 Rellenos y compactación
   - A9 Canalizaciones y cámaras
   - A10 Malla de tierra
   - A11 Montaje de estructuras y equipos
   - A12 Tendido de conductores
   - A13 Cercos
   - A14 Mejora de caminos
   - A15 Terminaciones
   - A16 Desmovilización y entrega
   - A17 Arriendo de equipos
   - A18 Instalación de manta o revestimiento
3. La columna es **opcional**: si queda vacía, nada debe fallar.
4. **Ninguna fórmula, resumen, Gantt ni formato condicional** debe depender de esta columna.

## Cómo hacerlo con seguridad
1. **Respaldo primero:** antes de tocar cada archivo, copia la planilla a `Archivos/Respaldos/` con la fecha y el motivo `antes-tipo-actividad` en el nombre.
2. **Plantilla y generador:** cambia primero el script generador, para que las planillas nuevas ya traigan la columna. Después aplica el cambio a las 12 planillas existentes (PRY-0001 a PRY-0011 y PRY-0099).
3. **Power Query:** antes y después de guardar cada archivo, verifica que las consultas sigan existiendo y que actualicen. [Probable] Guardar con openpyxl puede borrarlas; si es así, usa el mismo método que ya usaste para editar estas planillas sin perderlas.
4. **Formato condicional del Gantt:** comprueba que siga apuntando a las mismas columnas. Recuerda definir bgColor además de fgColor.
5. **Valores precargados:** puedes proponer un tipo por actividad a partir de su nombre (por ejemplo, "Excavación" → A4, "Hormigonado" → A7, "Arriendo EQ-…" → A17). **No los escribas sin mostrarme antes la tabla** con proyecto, actividad y tipo propuesto. Los casos dudosos (por ejemplo, "Reparación de hormigón y tuberías") déjalos vacíos y marcados.
6. **Validación al cerrar:**
   - recalcula y confirma cero errores nuevos;
   - el bloque de Resumen (nombres `RES_`) da los mismos valores antes y después del cambio;
   - todas las tablas conservan su nombre;
   - el skill `sigper-revision` corre sin alertas nuevas causadas por este cambio.
7. Entrega un informe corto: archivos modificados, respaldos creados, comprobaciones hechas y la tabla de tipos propuestos para que yo la apruebe.
