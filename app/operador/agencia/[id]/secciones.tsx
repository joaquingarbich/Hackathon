// Panel de la empresa: lo que el turista puede verificar. Altas en revisión hasta que el admin aprueba.
import { BusFront, CalendarClock, Check, MapPin, OctagonAlert, UserRound, Wallet } from "lucide-react";
import { Button, Campo, ChipProceso, Label, Mono, NativeSelect, Tarjeta } from "@/components/ui";
import { cn } from "@/lib/utils";
import { DESTINOS, NOMBRE_CANAL, TEXTO_FICHA } from "@/config/textos";
import { fechaLegible, vencimientos } from "@/lib/dictamen";
import { crearCanal, crearPersonal, crearVehiculo, guardarDestinos, retirar } from "./acciones";
import { FormularioAlta } from "./formulario-alta";
import { CamposCanal } from "./campos-canal";

const CHIP = { pendiente: "revision", aprobado: "aprobado", rechazado: "corregir" } as const;
const Chip = ({ estado }: { estado: string }) => <ChipProceso tipo={CHIP[estado as keyof typeof CHIP] ?? "revision"} texto={{ pendiente: "En revisión", aprobado: "Aprobado", rechazado: "Por corregir" }[estado]} />;
const titulo = "text-[1.1875rem] font-semibold tracking-tight";
const lista = "divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-suave";
const fila = "flex flex-col gap-1.5 p-4";

type Datos = {
  providerId: string; hoy: string; destinos: string[];
  canales: { id: string; tipo: string; visible: string; estado: string; motivo: string | null }[];
  vehiculos: { id: string; placa: string; aprobacion: string; motivo: string | null; source_id: string; soat_vencimiento: string | null; citv_vencimiento: string | null; habilitacion_vencimiento: string | null }[];
  personal: { id: string; nombre: string; rol: string; dni_ultimos3: string; estado: string; motivo: string | null; carne_vence: string | null }[];
  autorizaciones: { tipo: string; fecha_vencimiento: string | null }[];
};

const Retirar = ({ providerId, que, id }: { providerId: string; que: "canales" | "vehiculos" | "personal"; id: string }) => (
  <form action={retirar.bind(null, providerId, que, id)} className="-ml-3"><Button variant="ghost" size="sm" className="text-muted-foreground">Retirar</Button></form>
);

export function Vencimientos({ hoy, vehiculos, personal, autorizaciones }: Pick<Datos, "hoy" | "vehiculos" | "personal" | "autorizaciones">) {
  const v = vencimientos([
    ...vehiculos.flatMap((x) => [
      { que: `SOAT · ${x.placa}`, fecha: x.soat_vencimiento }, { que: `Revisión técnica · ${x.placa}`, fecha: x.citv_vencimiento },
      { que: `Habilitación · ${x.placa}`, fecha: x.habilitacion_vencimiento },
    ]),
    ...personal.map((x) => ({ que: `Carné de guía · ${x.nombre}`, fecha: x.carne_vence })),
    ...autorizaciones.map((a) => ({ que: `Autorización · ${a.tipo.replaceAll("_", " ")}`, fecha: a.fecha_vencimiento })),
  ], hoy);
  if (!v.length) return null;
  return (
    <Tarjeta aria-labelledby="t-venc" className="flex flex-col gap-3 border-observaciones-borde/40 bg-observaciones-fondo/60">
      <h2 id="t-venc" className={cn(titulo, "flex items-center gap-2 text-observaciones")}><CalendarClock aria-hidden className="size-5" />Documentos vencidos o por vencer</h2>
      <p className="text-[0.9375rem] text-foreground/80">Mientras algo esté vencido, tu ficha muestra «Con observaciones» a los turistas.</p>
      <ul className="flex flex-col gap-2">
        {v.map((x) => (
          <li key={x.que} className={cn("flex items-center gap-2.5 rounded-xl bg-card px-3.5 py-2.5 font-medium shadow-suave", x.estado === "vencido" ? "text-alerta" : "text-observaciones")}>
            {x.estado === "vencido" ? <OctagonAlert aria-hidden className="size-5 shrink-0" /> : <CalendarClock aria-hidden className="size-5 shrink-0" />}
            <span className="flex-1">{x.que}</span><span className="text-[0.875rem] font-semibold whitespace-nowrap">{x.estado === "vencido" ? "Venció" : "Vence"} <Mono>{fechaLegible(x.fecha)}</Mono></span>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}

export function SeccionesVerificables({ providerId, destinos, canales, vehiculos, personal }: Datos) {
  return (
    <>
      <section id="destinos" className="flex flex-col gap-3">
        <h2 className={cn(titulo, "flex items-center gap-2")}><MapPin aria-hidden className="size-5 text-primary" />{TEXTO_FICHA.destinos}</h2>
        <form action={guardarDestinos.bind(null, providerId)} className="flex flex-col gap-3">
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Destinos</legend>
            {DESTINOS.map((d) => (
              <label key={d.id} className="pulsable group flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 font-medium shadow-suave has-checked:border-primary has-checked:bg-secondary has-checked:text-secondary-foreground has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring">
                <input type="checkbox" name="destino" value={d.id} defaultChecked={destinos.includes(d.id)} className="peer sr-only" />
                <Check aria-hidden className="hidden size-4 peer-checked:block" strokeWidth={3} />{d.nombre}
              </label>
            ))}
          </fieldset>
          <Button type="submit" variant="outline" className="self-start">Guardar destinos</Button>
        </form>
      </section>

      <section id="canales" className="flex flex-col gap-3">
        <h2 className={cn(titulo, "flex items-center gap-2")}><Wallet aria-hidden className="size-5 text-primary" />{TEXTO_FICHA.canales}</h2>
        <p className="text-[0.9375rem] text-muted-foreground">WhatsApp, Yape, Plin, cuentas y redes con los que cobras o atiendes. Los turistas podrán comprobar que son tuyos. Las cuentas se guardan sin mostrar el número completo.</p>
        {!!canales.length && (
          <ul className={lista}>
            {canales.map((c) => (
              <li key={c.id} className={fila}>
                <div className="flex flex-wrap items-center justify-between gap-2"><b>{NOMBRE_CANAL[c.tipo]} · <Mono>{c.visible}</Mono></b><Chip estado={c.estado} /></div>
                {c.estado === "rechazado" && c.motivo && <p className="rounded-lg bg-observaciones-fondo px-3 py-2 text-[0.9375rem] text-observaciones">{c.motivo}</p>}
                <Retirar providerId={providerId} que="canales" id={c.id} />
              </li>
            ))}
          </ul>
        )}
        <Tarjeta className="bg-muted/40 shadow-none">
          <FormularioAlta accion={crearCanal.bind(null, providerId)} boton="Agregar canal">
            <CamposCanal />
          </FormularioAlta>
        </Tarjeta>
      </section>

      <section id="vehiculos" className="flex flex-col gap-3">
        <h2 className={cn(titulo, "flex items-center gap-2")}><BusFront aria-hidden className="size-5 text-primary" />{TEXTO_FICHA.vehiculos}</h2>
        {!!vehiculos.length && (
          <ul className={lista}>
            {vehiculos.map((v) => (
              <li key={v.id} className={fila}>
                <div className="flex flex-wrap items-center justify-between gap-2"><Mono className="rounded-md border border-foreground/70 px-2 py-0.5 font-semibold">{v.placa.slice(0, 3)}-{v.placa.slice(3)}</Mono><Chip estado={v.aprobacion} /></div>
                <span className="text-[0.9375rem] text-muted-foreground">SOAT <Mono>{v.soat_vencimiento ? fechaLegible(v.soat_vencimiento) : "—"}</Mono> · Rev. técnica <Mono>{v.citv_vencimiento ? fechaLegible(v.citv_vencimiento) : "—"}</Mono></span>
                {v.aprobacion === "rechazado" && v.motivo && <p className="rounded-lg bg-observaciones-fondo px-3 py-2 text-[0.9375rem] text-observaciones">{v.motivo}</p>}
                {v.source_id === "checktur_validacion"
                  ? <Retirar providerId={providerId} que="vehiculos" id={v.id} />
                  : <span className="text-[0.875rem] text-muted-foreground">Registrada en el padrón oficial: los cambios se hacen ante la autoridad que la habilitó.</span>}
              </li>
            ))}
          </ul>
        )}
        <Tarjeta className="bg-muted/40 shadow-none">
          <FormularioAlta accion={crearVehiculo.bind(null, providerId)} boton="Agregar vehículo">
            <div className="grid gap-3 sm:grid-cols-3">
              <Campo id="v-placa" name="placa" etiqueta="Placa" placeholder="ABC-123" required maxLength={7} />
              <Campo id="v-mtc" name="autorizacion_mtc" etiqueta="Autorización MTC / resolución" maxLength={60} />
              <Campo id="v-tuc" name="tuc_numero" etiqueta="N.° de TUC" maxLength={40} />
              <Campo id="v-soat" name="soat_vencimiento" type="date" etiqueta="SOAT vence" required />
              <Campo id="v-citv" name="citv_vencimiento" type="date" etiqueta="Revisión técnica vence" required />
              <Campo id="v-hab" name="habilitacion_vencimiento" type="date" etiqueta="Habilitación vence" />
            </div>
            <Campo id="v-foto" name="foto" type="file" accept="image/*" etiqueta="Foto de la unidad (con la placa visible)" />
          </FormularioAlta>
        </Tarjeta>
      </section>

      <section id="personal" className="flex flex-col gap-3">
        <h2 className={cn(titulo, "flex items-center gap-2")}><UserRound aria-hidden className="size-5 text-primary" />{TEXTO_FICHA.personal}</h2>
        {!!personal.length && (
          <ul className={lista}>
            {personal.map((x) => (
              <li key={x.id} className={fila}>
                <div className="flex flex-wrap items-center justify-between gap-2"><b>{x.nombre} · {TEXTO_FICHA.rol[x.rol]}</b><Chip estado={x.estado} /></div>
                <span className="text-[0.9375rem] text-muted-foreground">DNI <Mono>•••••{x.dni_ultimos3}</Mono></span>
                {x.estado === "rechazado" && x.motivo && <p className="rounded-lg bg-observaciones-fondo px-3 py-2 text-[0.9375rem] text-observaciones">{x.motivo}</p>}
                <Retirar providerId={providerId} que="personal" id={x.id} />
              </li>
            ))}
          </ul>
        )}
        <Tarjeta className="bg-muted/40 shadow-none">
          <FormularioAlta accion={crearPersonal.bind(null, providerId)} boton="Agregar persona">
            <div className="grid gap-3 sm:grid-cols-3">
              <Campo id="x-nombre" name="nombre" etiqueta="Nombre completo" required maxLength={80} />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="x-rol">Rol</Label>
                <NativeSelect id="x-rol" name="rol">{Object.entries(TEXTO_FICHA.rol).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</NativeSelect>
              </div>
              <Campo id="x-dni" name="dni_ultimos3" inputMode="numeric" etiqueta="DNI: solo los 3 últimos dígitos" required maxLength={3} />
              <Campo id="x-carne" name="carne_numero" etiqueta="Carné de guía (si aplica)" maxLength={30} />
              <Campo id="x-carne-vence" name="carne_vence" type="date" etiqueta="Carné vence" />
            </div>
            <Campo id="x-foto" name="foto" type="file" accept="image/*" etiqueta="Foto de rostro" />
          </FormularioAlta>
        </Tarjeta>
      </section>
    </>
  );
}
