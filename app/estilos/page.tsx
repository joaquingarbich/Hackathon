import { BarraAccion, Boton, Campo, ChipProceso, InsigniaEstado, Mono, NotaValoracion, Pagina, Plegable, Sello, Tarjeta } from "@/components/ui";
import { ESTADOS, TEXTO_ESTADO } from "@/config/textos";

// Vitrina del sistema "Sello" v0.2 (docs/DISENO.md): revisar aquí después de cambiar tokens. Probar en claro y oscuro.
const NEUTROS = ["fondo", "superficie", "relleno", "texto", "texto-suave", "borde", "separador", "primario"] as const;
const MUESTRA: Record<(typeof NEUTROS)[number], string> = {
  fondo: "bg-fondo", superficie: "bg-superficie", relleno: "bg-relleno", texto: "bg-texto",
  "texto-suave": "bg-texto-suave", borde: "bg-borde", separador: "bg-separador", primario: "bg-primario",
};

export default function Estilos() {
  return (
    <Pagina>
      <div className="flex flex-col gap-1">
        <h1 className="text-[2.125rem] font-extrabold">Sistema “Sello” v0.2</h1>
        <p className="text-texto-suave">Tinta para la interfaz, color solo para el estado del dictamen, y un único elemento con personalidad: el sello.</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-[1.375rem] font-bold">El sello del dictamen</h2>
        {ESTADOS.map((e) => (
          <Sello key={e} estado={e} resumen={TEXTO_ESTADO[e].resumen.replace("{fecha}", "05/10/2026")} fuentes="MINCETUR · SUNAT" corte="05/10/2026" />
        ))}
      </section>

      <Tarjeta className="flex flex-col gap-3">
        <h2 className="text-[1.375rem] font-bold">Estados en línea</h2>
        <div className="flex flex-wrap gap-2">{ESTADOS.map((e) => <InsigniaEstado key={e} estado={e} />)}</div>
        <h2 className="mt-2 text-[1.375rem] font-bold">Chips de proceso (no son estados públicos)</h2>
        <div className="flex flex-wrap gap-2"><ChipProceso tipo="revision" /><ChipProceso tipo="aprobado" /><ChipProceso tipo="corregir" /></div>
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-3">
        <h2 className="text-[1.375rem] font-bold">Neutros por rol</h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {NEUTROS.map((n) => (
            <li key={n} className="flex items-center gap-2 text-[0.9375rem]"><span className={`size-8 rounded-chip border border-separador ${MUESTRA[n]}`} />{n}</li>
          ))}
        </ul>
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-2">
        <h2 className="text-[1.375rem] font-bold">Tipografía</h2>
        <p className="font-titulo text-[2.125rem] leading-none font-extrabold">Título grande · Bricolage 800</p>
        <p className="font-titulo text-[1.375rem] font-bold">Encabezado de sección · Bricolage 700</p>
        <p className="text-[1.0625rem]">Cuerpo: lo que el turista lee. Atkinson 17.</p>
        <p className="text-[0.9375rem] text-texto-suave">Secundario: explicaciones y metadatos · 15</p>
        <p className="text-[0.8125rem] text-texto-suave">Nota mínima (nunca menos) · 13</p>
        <p><Mono className="font-semibold">20600000001 · Z9X-482</Mono> <span className="text-texto-suave">· mono solo para RUC, placas, n.° y fechas</span></p>
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-3">
        <h2 className="text-[1.375rem] font-bold">Controles</h2>
        <Campo id="d1" etiqueta="Normal" placeholder="20600000001" />
        <Campo id="d2" etiqueta="Error" defaultValue="2060000" error="Escribe los 11 dígitos del RUC (faltan 4)." />
        <Campo id="d3" etiqueta="Con ayuda" ayuda="11 dígitos · formato válido" />
        <Boton>Verificar</Boton>
        <Boton variante="secundario">Contactar</Boton>
        <Boton disabled>Continuar (falta un dato)</Boton>
        <p className="flex items-center gap-2"><NotaValoracion promedio={4.8} /> Excepcional · 126</p>
      </Tarjeta>

      <Plegable titulo="Plegable" extra={<span className="font-bold text-verificado">Vigente</span>}>Contenido del bloque.</Plegable>

      <BarraAccion><Boton className="w-full sm:w-auto">Contactar por canal oficial</Boton></BarraAccion>
    </Pagina>
  );
}
