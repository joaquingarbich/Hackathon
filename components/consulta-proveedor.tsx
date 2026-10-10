"use client";
// Panel de consulta (W04): arma el mensaje y abre WhatsApp con el número registrado. Sin reservas ni pagos.
import { useState } from "react";
import { Phone } from "lucide-react";
import { claseBoton, claseControl, soles } from "@/components/ui";
import { TEXTO_CATALOGO } from "@/config/textos";

/** "900000011" / "+51 900 000 011" → "51900000011" (WhatsApp exige el código de país). */
export const numeroWhatsapp = (tel: string) => {
  const d = tel.replace(/\D/g, "");
  return d.length === 9 ? `51${d}` : d;
};

const personasTexto = (n: number) => `${n} ${n === 1 ? "persona" : "personas"}`;

function fechaCorta(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "2-digit" });
}

export function PanelConsulta({ servicio, precio, unidad, telefono, hoy }: { servicio: string; precio: number | null; unidad: string; telefono: string | null; hoy: string }) {
  const [fecha, setFecha] = useState("");
  const [personas, setPersonas] = useState(2);
  const mensaje = TEXTO_CATALOGO.mensaje(servicio, personasTexto(personas), fechaCorta(fecha));
  const wa = telefono ? `https://wa.me/${numeroWhatsapp(telefono)}?text=${encodeURIComponent(mensaje)}` : null;
  const porPersona = unidad === "por persona";

  return (
    <>
      <aside id="consulta" aria-labelledby="t-consulta" className="flex flex-col gap-3.5 rounded-[1.125rem] border-2 border-primario bg-superficie p-5 md:sticky md:top-5">
        <h2 id="t-consulta" className="sr-only">{TEXTO_CATALOGO.tuConsulta}</h2>
        {precio !== null && (
          <div className="flex flex-col">
            <span><b className="text-[1.75rem]">{soles(precio)}</b> <span className="text-texto-suave">{unidad}</span></span>
            {porPersona && <span className="text-[0.9375rem] text-texto-suave">{soles(precio * personas)} para {personasTexto(personas)} · precio referencial</span>}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label htmlFor="c-fecha" className="text-[0.9375rem] font-bold">Fecha <span className="font-normal text-texto-suave">(opcional)</span></label>
          <input id="c-fecha" type="date" min={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} className={claseControl} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="c-personas" className="text-[0.9375rem] font-bold">Personas</label>
          <select id="c-personas" value={personas} onChange={(e) => setPersonas(Number(e.target.value))} className={claseControl}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{personasTexto(n)}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 rounded-control bg-fondo p-3">
          <span className="text-[0.875rem] text-texto-suave">{TEXTO_CATALOGO.mensajeSeEnviara}</span>
          <span className="text-[0.9375rem]">“{mensaje}”</span>
        </div>
        {wa ? (
          <>
            <a href={wa} target="_blank" rel="noreferrer" className={claseBoton("primario")}>{TEXTO_CATALOGO.whatsapp}</a>
            <a href={`tel:${telefono}`} className={claseBoton("secundario")}><Phone aria-hidden className="size-5" /> {TEXTO_CATALOGO.llamar}</a>
            <span className="text-[0.875rem] text-texto-suave">{TEXTO_CATALOGO.notaContacto}</span>
          </>
        ) : (
          <span className="text-[0.9375rem] text-texto-suave">{TEXTO_CATALOGO.sinTelefono}</span>
        )}
      </aside>

      {/* Móvil: precio y acción principal al alcance del pulgar */}
      {wa && (
        <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-separador bg-fondo px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:hidden">
          {precio !== null && <span><b className="text-xl">{soles(precio)}</b> <span className="text-[0.875rem] text-texto-suave">{unidad}</span></span>}
          <a href={wa} target="_blank" rel="noreferrer" className={claseBoton("primario", "flex-1")}>{TEXTO_CATALOGO.whatsapp}</a>
        </div>
      )}
    </>
  );
}
