// Panel de la empresa: lo que el turista puede verificar. Altas en revisión hasta que el admin aprueba.
import { CalendarClock, OctagonAlert } from "lucide-react";
import { Campo, ChipProceso, Mono, Tarjeta, claseBoton, claseControl } from "@/components/ui";
import { DESTINOS, NOMBRE_CANAL, TEXTO_FICHA } from "@/config/textos";
import { TIPOS_CANAL } from "@/lib/canales";
import { fechaLegible, vencimientos } from "@/lib/dictamen";
import { crearCanal, crearPersonal, crearVehiculo, guardarDestinos, retirar } from "./acciones";
import { FormularioAlta } from "./formulario-alta";

const CHIP = { pendiente: "revision", aprobado: "aprobado", rechazado: "corregir" } as const;
const Chip = ({ estado }: { estado: string }) => <ChipProceso tipo={CHIP[estado as keyof typeof CHIP] ?? "revision"} texto={{ pendiente: "En revisión", aprobado: "Aprobado", rechazado: "Por corregir" }[estado]} />;
const titulo = "text-[1.375rem] font-bold";
const lista = "overflow-hidden rounded-tarjeta border border-separador bg-superficie";
const fila = "flex flex-col gap-1 border-b border-separador p-4 last:border-0";

type Datos = {
  providerId: string; hoy: string; destinos: string[];
  canales: { id: string; tipo: string; visible: string; estado: string; motivo: string | null }[];
  vehiculos: { id: string; placa: string; aprobacion: string; motivo: string | null; soat_vencimiento: string | null; citv_vencimiento: string | null; habilitacion_vencimiento: string | null }[];
  personal: { id: string; nombre: string; rol: string; dni_ultimos3: string; estado: string; motivo: string | null; carne_vence: string | null }[];
  autorizaciones: { tipo: string; fecha_vencimiento: string | null }[];
};

const Retirar = ({ providerId, que, id }: { providerId: string; que: "canales" | "vehiculos" | "personal"; id: string }) => (
  <form action={retirar.bind(null, providerId, que, id)}><button className="min-h-11 cursor-pointer text-[0.9375rem] text-texto-suave underline">Retirar</button></form>
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
    <Tarjeta aria-labelledby="t-venc" className="flex flex-col gap-2 border-observaciones-borde p-5">
      <h2 id="t-venc" className={titulo}>Documentos vencidos o por vencer</h2>
      <p className="text-[0.9375rem] text-texto-suave">Mientras algo esté vencido, tu ficha muestra «Con observaciones» a los turistas.</p>
      <ul className="flex flex-col gap-1.5">
        {v.map((x) => (
          <li key={x.que} className={`flex items-center gap-2 font-semibold ${x.estado === "vencido" ? "text-alerta" : "text-observaciones"}`}>
            {x.estado === "vencido" ? <OctagonAlert aria-hidden className="size-5 shrink-0" /> : <CalendarClock aria-hidden className="size-5 shrink-0" />}
            <span>{x.que}: {x.estado === "vencido" ? "venció" : "vence"} el <Mono>{fechaLegible(x.fecha)}</Mono></span>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}

export function SeccionesVerificables({ providerId, destinos, canales, vehiculos, personal }: Datos) {
  return (
    <>
      <section id="destinos" className="flex flex-col gap-2">
        <h2 className={titulo}>{TEXTO_FICHA.destinos}</h2>
        <form action={guardarDestinos.bind(null, providerId)} className="flex flex-col gap-2">
          <fieldset className="flex flex-wrap gap-x-5 gap-y-1">
            <legend className="sr-only">Destinos</legend>
            {DESTINOS.map((d) => (
              <label key={d.id} className="flex min-h-11 items-center gap-2"><input type="checkbox" name="destino" value={d.id} defaultChecked={destinos.includes(d.id)} className="size-5" />{d.nombre}</label>
            ))}
          </fieldset>
          <button className={claseBoton("secundario", "self-start")}>Guardar destinos</button>
        </form>
      </section>

      <section id="canales" className="flex flex-col gap-2">
        <h2 className={titulo}>{TEXTO_FICHA.canales}</h2>
        <p className="text-[0.9375rem] text-texto-suave">WhatsApp, Yape, Plin, cuentas y redes con los que cobras o atiendes. Los turistas podrán comprobar que son tuyos. Las cuentas se guardan sin mostrar el número completo.</p>
        {!!canales.length && (
          <ul className={lista}>
            {canales.map((c) => (
              <li key={c.id} className={fila}>
                <div className="flex flex-wrap items-center justify-between gap-2"><b>{NOMBRE_CANAL[c.tipo]} · <Mono>{c.visible}</Mono></b><Chip estado={c.estado} /></div>
                {c.estado === "rechazado" && c.motivo && <p className="text-[0.9375rem] text-observaciones">{c.motivo}</p>}
                <Retirar providerId={providerId} que="canales" id={c.id} />
              </li>
            ))}
          </ul>
        )}
        <Tarjeta className="p-5">
          <FormularioAlta accion={crearCanal.bind(null, providerId)} boton="Agregar canal">
            <div className="grid gap-3 sm:grid-cols-[12rem_1fr_12rem]">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-tipo" className="font-semibold">Tipo</label>
                <select id="c-tipo" name="tipo" className={claseControl}>{TIPOS_CANAL.map((t) => <option key={t} value={t}>{NOMBRE_CANAL[t]}</option>)}</select>
              </div>
              <Campo id="c-valor" name="valor" etiqueta="Número, cuenta, @usuario o web" required maxLength={80} />
              <Campo id="c-etiqueta" name="etiqueta" etiqueta="Banco (si es cuenta)" maxLength={30} />
            </div>
          </FormularioAlta>
        </Tarjeta>
      </section>

      <section id="vehiculos" className="flex flex-col gap-2">
        <h2 className={titulo}>{TEXTO_FICHA.vehiculos}</h2>
        {!!vehiculos.length && (
          <ul className={lista}>
            {vehiculos.map((v) => (
              <li key={v.id} className={fila}>
                <div className="flex flex-wrap items-center justify-between gap-2"><Mono className="font-bold">{v.placa.slice(0, 3)}-{v.placa.slice(3)}</Mono><Chip estado={v.aprobacion} /></div>
                <span className="text-[0.9375rem] text-texto-suave">SOAT <Mono>{v.soat_vencimiento ? fechaLegible(v.soat_vencimiento) : "—"}</Mono> · Rev. técnica <Mono>{v.citv_vencimiento ? fechaLegible(v.citv_vencimiento) : "—"}</Mono></span>
                {v.aprobacion === "rechazado" && v.motivo && <p className="text-[0.9375rem] text-observaciones">{v.motivo}</p>}
                <Retirar providerId={providerId} que="vehiculos" id={v.id} />
              </li>
            ))}
          </ul>
        )}
        <Tarjeta className="p-5">
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

      <section id="personal" className="flex flex-col gap-2">
        <h2 className={titulo}>{TEXTO_FICHA.personal}</h2>
        {!!personal.length && (
          <ul className={lista}>
            {personal.map((x) => (
              <li key={x.id} className={fila}>
                <div className="flex flex-wrap items-center justify-between gap-2"><b>{x.nombre} · {TEXTO_FICHA.rol[x.rol]}</b><Chip estado={x.estado} /></div>
                <span className="text-[0.9375rem] text-texto-suave">DNI <Mono>•••••{x.dni_ultimos3}</Mono></span>
                {x.estado === "rechazado" && x.motivo && <p className="text-[0.9375rem] text-observaciones">{x.motivo}</p>}
                <Retirar providerId={providerId} que="personal" id={x.id} />
              </li>
            ))}
          </ul>
        )}
        <Tarjeta className="p-5">
          <FormularioAlta accion={crearPersonal.bind(null, providerId)} boton="Agregar persona">
            <div className="grid gap-3 sm:grid-cols-3">
              <Campo id="x-nombre" name="nombre" etiqueta="Nombre completo" required maxLength={80} />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="x-rol" className="font-semibold">Rol</label>
                <select id="x-rol" name="rol" className={claseControl}>{Object.entries(TEXTO_FICHA.rol).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
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
