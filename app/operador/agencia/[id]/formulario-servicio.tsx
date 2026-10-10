"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton, Campo, claseControl } from "@/components/ui";
import { CATEGORIAS, DESTINOS, IDIOMAS, TEXTO_AGENCIA, UNIDADES_PRECIO } from "@/config/textos";
import { crearServicio } from "./acciones";

const Area = ({ id, etiqueta, ayuda, filas = 3, ...p }: { id: string; etiqueta: string; ayuda?: string; filas?: number } & React.ComponentProps<"textarea">) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="font-semibold">{etiqueta}</label>
    <textarea id={id} name={id} rows={filas} className={`${claseControl} py-3`} aria-describedby={ayuda ? `${id}-ayuda` : undefined} {...p} />
    {ayuda && <p id={`${id}-ayuda`} className="text-[0.9375rem] text-texto-suave">{ayuda}</p>}
  </div>
);

export function FormularioServicio({ providerId, tipo }: { providerId: string; tipo: string }) {
  const router = useRouter();
  const categorias = CATEGORIAS.filter((c) => (c.tipos as readonly string[]).includes(tipo));
  const [estado, setEstado] = useState<{ cargando: boolean; error?: string; ok?: boolean }>({ cargando: false });

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setEstado({ cargando: true });
    const r = await crearServicio(providerId, new FormData(form));
    if (!r.ok) return setEstado({ cargando: false, error: r.error }); // los campos se conservan para corregir
    form.reset();
    setEstado({ cargando: false, ok: true });
    router.refresh();
  }

  if (!categorias.length) return <p className="text-texto-suave">Tu tipo de registro aún no admite servicios en el catálogo.</p>;
  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoria" className="font-semibold">Categoría</label>
          <select id="categoria" name="categoria" required className={claseControl}>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="destino" className="font-semibold">Destino</label>
          <select id="destino" name="destino" required defaultValue="" className={claseControl}>
            <option value="" disabled>Elige</option>
            {DESTINOS.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
        </div>
      </div>
      <Campo id="nombre" name="nombre" etiqueta="Nombre del servicio" placeholder="Avistamiento de ballenas" maxLength={120} required />
      <Area id="descripcion" etiqueta="Descripción" maxLength={1500} filas={4} required />
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo id="duracion" name="duracion" etiqueta="Duración" placeholder="3 horas" maxLength={40} />
        <Campo id="salidas" name="salidas" etiqueta="Horarios" placeholder="7:00 y 10:00" maxLength={80} />
        <Campo id="temporada" name="temporada" etiqueta="Temporada" placeholder="Todo el año" maxLength={60} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo id="precio_ref" name="precio_ref" inputMode="decimal" etiqueta="Precio referencial (S/)" maxLength={10} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="unidad_precio" className="font-semibold">Unidad</label>
          <select id="unidad_precio" name="unidad_precio" className={claseControl}>
            {UNIDADES_PRECIO.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
        <Campo id="grupo_max" name="grupo_max" inputMode="numeric" etiqueta="Grupo máximo" maxLength={4} />
      </div>
      <fieldset className="flex flex-wrap gap-x-5 gap-y-2">
        <legend className="mb-1 font-semibold">Idiomas</legend>
        {IDIOMAS.map((i) => (
          <label key={i} className="flex min-h-11 items-center gap-2"><input type="checkbox" name="idiomas" value={i} className="size-5" defaultChecked={i === "Español"} />{i}</label>
        ))}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Area id="incluye" etiqueta="Incluye" ayuda="Uno por línea." maxLength={900} />
        <Area id="no_incluye" etiqueta="No incluye" ayuda="Uno por línea." maxLength={900} />
      </div>
      <Area id="itinerario" etiqueta="Itinerario (opcional)" ayuda="Un paso por línea: «Encuentro en el muelle: charla de seguridad (15 min)»." maxLength={1700} />
      <Campo id="punto_encuentro" name="punto_encuentro" etiqueta="Punto de encuentro" maxLength={200} />
      <Area id="condiciones" etiqueta="Condiciones (cancelación, clima…)" maxLength={500} filas={2} />
      {estado.error && <p role="alert" className="text-alerta">{estado.error}</p>}
      {estado.ok && <p role="status" className="text-verificado">{TEXTO_AGENCIA.enviado}</p>}
      <Boton type="submit" disabled={estado.cargando}>{estado.cargando ? "Enviando…" : "Enviar para revisión"}</Boton>
    </form>
  );
}
