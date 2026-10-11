import { Info, Search } from "lucide-react";
import {
  Alert, AlertDescription, AlertTitle, Aviso, Badge, BarraAccion, Boton, Button, Campo, ChipProceso, Encabezado, InsigniaEstado,
  Mono, NativeSelect, NativeSelectOption, Pagina, Plegable, Sello, Skeleton, Tarjeta, Textarea, Label,
} from "@/components/ui";
import { Placa } from "@/components/verificacion";
import { TituloSeccion } from "@/components/dictamen";
import { ESTADOS, TEXTO_ESTADO } from "@/config/textos";

// Vitrina del sistema "Claro" v1 (docs/DISENO.md): revisar aquí después de cambiar tokens. Probar en claro y oscuro.
const NEUTROS = [
  ["background", "bg-background"], ["card", "bg-card"], ["muted", "bg-muted"], ["secondary", "bg-secondary"],
  ["foreground", "bg-foreground"], ["muted-foreground", "bg-muted-foreground"], ["input (borde)", "bg-input"], ["border", "bg-border"],
  ["primary #056CF2", "bg-primary"], ["primary-hover", "bg-primary-hover"],
] as const;

export default function Estilos() {
  return (
    <Pagina>
      <Encabezado eyebrow="Sistema de diseño" titulo="CheckTur «Claro» v1" bajada="Azul #056CF2 para las acciones, blancos fríos de fondo, una paleta propia para los estados y el sello como elemento de firma. Componentes de shadcn/ui adaptados." />

      <section className="flex flex-col gap-3">
        <TituloSeccion>El sello del dictamen</TituloSeccion>
        {ESTADOS.map((e) => (
          <Sello key={e} estado={e} resumen={TEXTO_ESTADO[e].resumen.replace("{fecha}", "05/10/2026")} fuentes="MINCETUR · SUNAT" corte="05/10/2026" />
        ))}
      </section>

      <Tarjeta className="flex flex-col gap-3">
        <TituloSeccion>Estados en línea</TituloSeccion>
        <div className="flex flex-wrap gap-2">{ESTADOS.map((e) => <InsigniaEstado key={e} estado={e} />)}</div>
        <TituloSeccion className="mt-2">Chips de proceso (no son estados públicos)</TituloSeccion>
        <div className="flex flex-wrap gap-2"><ChipProceso tipo="revision" /><ChipProceso tipo="aprobado" /><ChipProceso tipo="corregir" /></div>
        <TituloSeccion className="mt-2">Insignias</TituloSeccion>
        <div className="flex flex-wrap gap-2"><Badge>Marca</Badge><Badge variant="secondary">Secundaria</Badge><Badge variant="outline">Contorno</Badge><Badge variant="muted">Neutra</Badge></div>
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-3">
        <TituloSeccion>Neutros y marca</TituloSeccion>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {NEUTROS.map(([n, c]) => (
            <li key={n} className="flex items-center gap-2 text-[0.875rem]"><span className={`size-9 shrink-0 rounded-lg border border-border ${c}`} />{n}</li>
          ))}
        </ul>
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-2">
        <TituloSeccion>Tipografía · Geist</TituloSeccion>
        <p className="text-[2.25rem] leading-none font-bold tracking-[-0.035em]">Título · 36 bold</p>
        <p className="text-[1.1875rem] font-semibold tracking-tight">Sección · 19 semibold</p>
        <p className="text-[1.0625rem]">Cuerpo destacado · 17</p>
        <p>Cuerpo · 16</p>
        <p className="text-[0.875rem] text-muted-foreground">Secundario · 14</p>
        <p className="text-[0.8125rem] font-semibold tracking-wide text-enlace uppercase">Antetítulo · 13 (mínimo)</p>
        <p><Mono className="font-semibold">20600000001 · Z9X-482</Mono> <span className="text-muted-foreground">· Geist Mono solo para RUC, placas, n.° y fechas</span></p>
        <Placa placa="MUE001" className="mt-2" />
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-4">
        <TituloSeccion>Controles</TituloSeccion>
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <input aria-label="Buscar (ejemplo)" placeholder="RUC, celular, placa o nombre" className="h-14 w-full rounded-2xl border border-input bg-card pl-12 text-[1.0625rem] outline-none focus-visible:border-ring" />
        </div>
        <Campo id="d1" etiqueta="Normal" placeholder="20600000001" />
        <Campo id="d2" etiqueta="Error" defaultValue="2060000" error="Escribe los 11 dígitos del RUC (faltan 4)." />
        <Campo id="d3" etiqueta="Con ayuda" ayuda="11 dígitos · formato válido" />
        <div className="flex flex-col gap-1.5"><Label htmlFor="d4">Lista</Label><NativeSelect id="d4"><NativeSelectOption>Máncora</NativeSelectOption><NativeSelectOption>Los Órganos</NativeSelectOption></NativeSelect></div>
        <div className="flex flex-col gap-1.5"><Label htmlFor="d5">Texto largo</Label><Textarea id="d5" rows={2} /></div>
        <div className="flex flex-wrap gap-2">
          <Boton>Verificar</Boton>
          <Boton variante="secundario">Contactar</Boton>
          <Button variant="ghost" size="lg">Fantasma</Button>
          <Button variant="destructive" size="lg">Reportar</Button>
          <Boton disabled>Falta un dato</Boton>
        </div>
        <Aviso tipo="ok">Documento enviado.</Aviso>
        <Aviso tipo="error">Adjunta el documento.</Aviso>
      </Tarjeta>

      <Alert variant="info"><Info aria-hidden /><AlertTitle>Información</AlertTitle><AlertDescription>Alerta con el tinte de marca.</AlertDescription></Alert>
      <Alert variant="aviso"><Info aria-hidden /><AlertDescription>Aviso (tono de observaciones).</AlertDescription></Alert>

      <Plegable titulo="Plegable" extra={<Badge variant="muted">3</Badge>}>Contenido del bloque.</Plegable>

      <Tarjeta className="flex flex-col gap-3">
        <TituloSeccion>Cargando</TituloSeccion>
        <Skeleton className="h-6 w-1/2" /><Skeleton className="h-24 rounded-2xl" />
      </Tarjeta>

      <BarraAccion><Boton className="w-full sm:w-auto">Contactar por canal oficial</Boton></BarraAccion>
    </Pagina>
  );
}
