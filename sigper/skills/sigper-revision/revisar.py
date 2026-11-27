"""Revisión de completitud del sistema SIGPER (solo lectura).

Uso:
  python revisar.py --archivos "H:/Mi unidad/SIGPER/Archivos" --proyectos "H:/Mi unidad/SIGPER/Proyectos" [--hoy 2026-11-27] [--salida informe.md]

Nunca guarda ni modifica los .xlsx: los copia a una carpeta temporal y los lee ahí.
"""
import argparse, datetime as dt, glob, os, re, shutil, sys, tempfile, unicodedata
import openpyxl
from openpyxl.utils import range_boundaries

ESCENAS = {"Movimiento de tierra", "Obras civiles", "Apoyo eléctrico", "Arriendo"}
SIN_ESCENA = {"PRY-0000", "PRY-0099"}
DOCS_VEHICULO = ["SOAP", "Revisión técnica", "Permiso de circulación"]
ACTIVO_NO = {"devuelto", "devuelta", "dado de baja"}

def norm(s):
    s = unicodedata.normalize("NFD", str(s or "")).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", s).strip().lower()

def vacio(v):
    return v is None or (isinstance(v, str) and v.strip() in ("", "—", "-"))

def fecha(v):
    if isinstance(v, dt.datetime): return v.date()
    if isinstance(v, dt.date): return v
    return None

class Libro:
    def __init__(self, ruta, tmp):
        self.nombre = os.path.basename(ruta)
        copia = os.path.join(tmp, re.sub(r"[^\w.-]", "_", self.nombre))
        shutil.copy2(ruta, copia)  # solo lectura sobre la copia
        self.v = openpyxl.load_workbook(copia, data_only=True)
        self.f = openpyxl.load_workbook(copia, data_only=False)

    def tabla(self, nombre):
        for ws in self.v.worksheets:
            if nombre in ws.tables:
                c0, r0, c1, r1 = range_boundaries(ws.tables[nombre].ref)
                head = [ws.cell(r0, c).value for c in range(c0, c1 + 1)]
                filas = []
                for r in range(r0 + 1, r1 + 1):
                    vals = [ws.cell(r, c).value for c in range(c0, c1 + 1)]
                    if all(vacio(x) for x in vals): continue
                    d = {norm(h): x for h, x in zip(head, vals)}
                    d["_fila"] = r; d["_hoja"] = ws.title
                    filas.append(d)
                return filas
        return None

    def nombre_def(self, n):
        if n not in self.v.defined_names: return ("falta", None)
        for sh, ref in self.v.defined_names[n].destinations:
            celda = ref.replace("$", "").split(":")[0]
            val = self.v[sh][celda].value
            form = self.f[sh][celda].value
            return ("ok", val) if not (isinstance(form, str) and form.startswith("=") and val is None) else ("sin_calculo", None)
        return ("falta", None)

def g(d, *claves):
    for c in claves:
        c = norm(c)
        for k, v in d.items():
            if k == c or (isinstance(k, str) and k.startswith(c)):
                if not vacio(v): return v
    return None

class Informe:
    def __init__(self): self.items = []
    def add(self, nivel, area, titulo, detalle="", proyecto="", donde=""):
        self.items.append(dict(nivel=nivel, area=area, titulo=titulo, detalle=detalle, proyecto=proyecto, donde=donde))

def revisar(archivos, proyectos, hoy):
    inf = Informe(); tmp = tempfile.mkdtemp(prefix="sigper_rev_")
    ruta = lambda n: os.path.join(archivos, n)
    libros = {}
    for n in ["SIGPER_Finanzas.xlsx", "SIGPER_Equipos.xlsx", "SIGPER_Remuneraciones.xlsx", "SIGPER_Documentos.xlsx"]:
        if os.path.exists(ruta(n)): libros[n] = Libro(ruta(n), tmp)
        else: inf.add("Alta", "Archivos", f"No encontré {n}", f"Buscado en {archivos}")
    pry_files = {}
    for p in glob.glob(os.path.join(proyectos, "**", "PRY-*.xlsx"), recursive=True):
        if "respaldo" in norm(p) or os.path.basename(p).startswith("~$"): continue
        m = re.match(r"(PRY-\d{4})", os.path.basename(p))
        if m: pry_files.setdefault(m.group(1), []).append(p)

    fin = libros.get("SIGPER_Finanzas.xlsx"); eq = libros.get("SIGPER_Equipos.xlsx"); rem = libros.get("SIGPER_Remuneraciones.xlsx")

    # --- A. Maestros
    proyectos_m = {}
    if fin:
        for r in fin.tabla("tbl_Proyectos") or []:
            pid = g(r, "ID_PRY");  proyectos_m[pid] = r
            if not pid: continue
            nom = g(r, "Proyecto") or pid
            if vacio(g(r, "Estado")): inf.add("Alta", "Maestros", f"{pid} sin estado", "", nom, f"Maestros fila {r['_fila']}")
            if pid in SIN_ESCENA: continue
            esc = g(r, "Tipo de escena")
            if vacio(esc): inf.add("Baja", "Maestros", f"{pid}: falta Tipo de escena", "Solo para la maqueta 3D", nom, f"Maestros fila {r['_fila']}")
            elif esc not in ESCENAS: inf.add("Media", "Maestros", f"{pid}: Tipo de escena no válido ({esc})", "Valores: " + " / ".join(sorted(ESCENAS)), nom)
            if vacio(g(r, "Comuna")): inf.add("Baja", "Maestros", f"{pid}: falta Comuna", "El mapa no puede ubicar la obra", nom)
            if pid not in pry_files: inf.add("Media", "Proyectos", f"{pid}: no encontré su planilla 'PRY-… .xlsx'", f"Buscado en {proyectos}", nom)
        for pid, rutas in pry_files.items():
            if len(rutas) > 1: inf.add("Media", "Proyectos", f"{pid}: hay {len(rutas)} planillas con ese código", "; ".join(rutas))
            if pid not in proyectos_m: inf.add("Alta", "Proyectos", f"{pid} tiene planilla pero no está en Maestros", rutas[0])

    # --- B a F. Equipos
    if eq:
        cat = eq.tabla("tbl_Catalogo") or []; asig = eq.tabla("tbl_Asignacion") or []
        hor = eq.tabla("tbl_Horometro") or []; man = eq.tabla("tbl_Mantenciones") or []
        docs = eq.tabla("tbl_Documentos")
        ids = {g(c, "ID_EQ") for c in cat}
        activos = [c for c in cat if norm(g(c, "Estado")) not in ACTIVO_NO]
        if docs is None:
            inf.add("Alta", "Vencimientos", "No existe la tabla de vencimientos (tbl_Documentos) en SIGPER_Equipos",
                    "Columnas sugeridas: ID_EQ, Patente, Documento, N°, Emisión, Vence, Archivo (enlace), Revisado")
        for c in activos:
            eid, pat = g(c, "ID_EQ"), g(c, "Patente") or ""
            adm = "administrativ" in norm(g(c, "Tipo")) or "administrativ" in norm(g(c, "Estado"))
            et = f"{eid} {pat}".strip(); pr = g(c, "Proyecto actual") or ""
            if not adm:
                for campo in ["Proveedor", "Tarifa costo", "Tarifa cobro"]:
                    if vacio(g(c, campo)): inf.add("Media", "Catálogo", f"{et}: falta {campo}", "", pr, f"Catálogo fila {c['_fila']}")
            if norm(g(c, "Medidor")) == "horas" and vacio(g(c, "Mínimo h/mes")) and not adm:
                inf.add("Baja", "Catálogo", f"{et}: medidor en horas sin mínimo mensual", "", pr)
            # vencimientos
            if docs is not None and pat:
                for dn in DOCS_VEHICULO:
                    fil = [d for d in docs if (g(d, "ID_EQ") == eid or norm(g(d, "Patente")) == norm(pat)) and norm(dn) in norm(g(d, "Documento"))]
                    if not fil: inf.add("Alta", "Vencimientos", f"{et}: falta {dn}", "No está cargado", pr); continue
                    v = max((fecha(g(d, "Vence")) for d in fil if fecha(g(d, "Vence"))), default=None)
                    if not v: inf.add("Alta", "Vencimientos", f"{et}: {dn} sin fecha de vencimiento", "", pr)
                    elif v < hoy: inf.add("Alta", "Vencimientos", f"{et}: {dn} VENCIDO", f"Venció el {v:%d-%m-%Y}", pr)
                    elif (v - hoy).days <= 30: inf.add("Media", "Vencimientos", f"{et}: {dn} vence en {(v - hoy).days} días", f"{v:%d-%m-%Y}", pr)
            # asignación
            abiertas = [a for a in asig if g(a, "ID_EQ") == eid and (not fecha(g(a, "Hasta")) or fecha(g(a, "Hasta")) >= hoy)]
            if not abiertas and not adm: inf.add("Media", "Asignación", f"{et}: activo pero sin asignación vigente", "Agrega una fila en Asignación o márcalo Devuelto", pr)
            # horómetro y mantención
            lect = sorted([h for h in hor if g(h, "ID_EQ") == eid and fecha(g(h, "Fecha"))], key=lambda h: fecha(g(h, "Fecha")))
            minimo = g(c, "Mínimo h/mes")
            if minimo and not adm:
                if not lect: inf.add("Media", "Horómetro", f"{et}: sin lecturas de horómetro", "", pr)
                else:
                    dias = (hoy - fecha(g(lect[-1], "Fecha"))).days
                    if dias > 7: inf.add("Media", "Horómetro", f"{et}: última lectura hace {dias} días", f"{fecha(g(lect[-1], 'Fecha')):%d-%m-%Y}", pr)
            if norm(g(c, "Medidor")) in ("horas", "km") and not adm:
                prox = [m for m in man if g(m, "ID_EQ") == eid and not vacio(g(m, "Próxima lectura"))]
                if not prox: inf.add("Media", "Mantenciones", f"{et}: sin próxima mantención registrada", "Carga la última mantención y la lectura de la próxima", pr)
                elif lect:
                    falta = (g(prox[-1], "Próxima lectura") or 0) - (g(lect[-1], "Lectura") or 0)
                    umbral = 50 if norm(g(c, "Medidor")) == "horas" else 1000
                    if falta <= 0: inf.add("Alta", "Mantenciones", f"{et}: mantención vencida", f"Pasó {abs(falta):,.0f} sobre la lectura programada".replace(",", "."), pr)
                    elif falta <= umbral: inf.add("Media", "Mantenciones", f"{et}: mantención próxima", f"Faltan {falta:,.0f}".replace(",", "."), pr)
        for a in asig:
            if g(a, "ID_EQ") and g(a, "ID_EQ") not in ids: inf.add("Alta", "Asignación", f"{g(a,'ID_EQ')} no existe en el Catálogo", f"Asignación fila {a['_fila']}")
            if proyectos_m and g(a, "ID_PRY") and g(a, "ID_PRY") not in proyectos_m: inf.add("Alta", "Asignación", f"{g(a,'ID_PRY')} no existe en Maestros", f"Asignación fila {a['_fila']}")

    # --- G. Planillas de proyecto
    for pid, rutas in sorted(pry_files.items()):
        try: L = Libro(rutas[0], tmp)
        except Exception as e: inf.add("Alta", "Proyectos", f"{pid}: no se pudo abrir", str(e)); continue
        nom = (proyectos_m.get(pid) and g(proyectos_m[pid], "Proyecto")) or pid
        est, calza = L.nombre_def("RES_Calza")
        if est == "ok" and norm(calza) not in ("si", "sí"): inf.add("Alta", "Proyectos", f"{pid}: el estado no calza con Maestros", f"Anotado: {L.nombre_def('RES_EstadoAnotado')[1]} · Maestros: {L.nombre_def('RES_EstadoMaestros')[1]}", nom)
        est_act, act = L.nombre_def("RES_Actualizado")
        if est_act == "ok" and vacio(act): inf.add("Baja", "Proyectos", f"{pid}: sin fecha de última actualización", "Celda RES_Actualizado", nom)
        estado_m = norm(g(proyectos_m.get(pid, {}), "Estado"))
        if estado_m == "en ejecucion":
            atraso = L.nombre_def("RES_DiasAtraso")[1]
            if isinstance(atraso, (int, float)) and atraso > 0: inf.add("Media", "Proyectos", f"{pid}: {atraso:.0f} días de atraso", "", nom)
            alerta = L.nombre_def("RES_AlertaAvance")[1]
            if alerta and "adelanta" in norm(alerta): inf.add("Media", "Proyectos", f"{pid}: {alerta}", f"Avance físico {L.nombre_def('RES_AvanceFisico')[1]:.0%} · costo gastado {L.nombre_def('RES_AvanceCosto')[1]:.0%}" if isinstance(L.nombre_def('RES_AvanceFisico')[1], float) else "", nom)
            plan = L.tabla("tbl_Plan") or []
            if not plan: inf.add("Media", "Planificación", f"{pid}: sin actividades en Planificación", "", nom)
            for p in plan:
                if vacio(g(p, "Inicio plan")) or vacio(g(p, "Fin plan")): inf.add("Media", "Planificación", f"{pid}: actividad sin fechas de plan", str(g(p, "Actividad")), nom)
        sin = [n for n in L.v.defined_names if n.startswith("RES_") and L.nombre_def(n)[0] == "sin_calculo"]
        if sin: inf.add("Media", "Integridad", f"{pid}: {len(sin)} celdas de resumen sin calcular", "Abre la planilla en Excel y guárdala", nom)

    # --- H. Finanzas
    if fin:
        gastos = fin.tabla("tbl_Gastos") or []
        rec = [x for x in gastos if not fecha(g(x, "Fecha"))]
        if rec: inf.add("Baja", "Finanzas", f"{len(rec)} gastos sin fecha (recordatorios)", "; ".join(str(g(x, 'Descripción'))[:40] for x in rec[:5]))
        for x in gastos:
            if fecha(g(x, "Fecha")) and vacio(g(x, "ID_PRY")): inf.add("Alta", "Finanzas", "Gasto sin ID_PRY", f"{g(x,'Descripción')} · fila {x['_fila']}")
            td = norm(g(x, "Tipo Doc"))
            if td == "por confirmar": inf.add("Media", "Finanzas", "Gasto con documento por confirmar", f"{g(x,'Descripción')} · fila {x['_fila']}", g(x, "Proyecto"))
            elif td in ("factura", "guia copec", "guía copec", "boleta") and vacio(g(x, "N° Doc")): inf.add("Media", "Finanzas", "Gasto sin N° de documento", f"{g(x,'Descripción')} · fila {x['_fila']}", g(x, "Proyecto"))
        for c in fin.tabla("tbl_Cobros") or []:
            if norm(g(c, "Estado")) == "pagado": continue
            dv = g(c, "Días vencida")
            if isinstance(dv, (int, float)) and dv > 0: inf.add("Alta", "Cobros", f"{g(c,'N° EP')} vencido hace {dv:.0f} días", str(g(c, "Glosa")), g(c, "Proyecto"))
            elif vacio(g(c, "N° Factura")) and not vacio(g(c, "Envío EP")): inf.add("Media", "Cobros", f"{g(c,'N° EP')} enviado sin facturar", str(g(c, "Glosa")), g(c, "Proyecto"))
        for n in [n for n in fin.v.defined_names if n.startswith("RES_")]:
            if fin.nombre_def(n)[0] == "sin_calculo": inf.add("Media", "Integridad", f"Finanzas: {n} sin calcular", "Abre y guarda en Excel")

    # --- I. Personal
    if rem:
        req = ["RUT", "Fecha inicio", "Tipo de contrato", "AFP", "Salud", "Sueldo base"]
        for f in rem.tabla("tbl_Fichas") or []:
            for campo in req:
                if vacio(g(f, campo)): inf.add("Alta", "Personal", f"{g(f,'ID_EMP')} {g(f,'Nombre')}: falta {campo}", "Ficha")
        if rem.tabla("tbl_Acreditaciones") is None:
            inf.add("Media", "Personal", "No existe tabla de acreditaciones (tbl_Acreditaciones)", "Contrato, RIOHS/EPP, exámenes, curso de riesgos, licencia, certificación de operador, con vencimiento")
    shutil.rmtree(tmp, ignore_errors=True)
    return inf

def salida(inf, hoy):
    ord_ = {"Alta": 0, "Media": 1, "Baja": 2}
    it = sorted(inf.items, key=lambda x: (ord_[x["nivel"]], x["area"], x["titulo"]))
    n = {k: sum(1 for x in it if x["nivel"] == k) for k in ord_}
    out = [f"# Revisión SIGPER · {hoy:%d-%m-%Y}", "", f"**{n['Alta']} altas · {n['Media']} medias · {n['Baja']} bajas.** Solo lectura: no se modificó ningún archivo.", ""]
    for area in sorted({x["area"] for x in it}, key=lambda a: min(ord_[x["nivel"]] for x in it if x["area"] == a)):
        out.append(f"## {area}")
        for x in [y for y in it if y["area"] == area]:
            extra = " · ".join(s for s in [x["proyecto"], x["detalle"], x["donde"]] if s)
            out.append(f"- **{x['nivel']}** · {x['titulo']}" + (f" — {extra}" if extra else ""))
        out.append("")
    out += ["## Para la lista de pendientes", "```"]
    out += [f"- [{x['nivel']}] {x['titulo']}" + (f" — {x['proyecto']}" if x["proyecto"] else "") for x in it if x["nivel"] != "Baja"]
    out += ["```"]
    return "\n".join(out)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--archivos", required=True); ap.add_argument("--proyectos", required=True)
    ap.add_argument("--hoy"); ap.add_argument("--salida")
    a = ap.parse_args()
    hoy = dt.date.fromisoformat(a.hoy) if a.hoy else dt.date.today()
    txt = salida(revisar(a.archivos, a.proyectos, hoy), hoy)
    if a.salida:
        with open(a.salida, "w", encoding="utf-8") as fh: fh.write(txt)
    sys.stdout.reconfigure(encoding="utf-8"); print(txt)
