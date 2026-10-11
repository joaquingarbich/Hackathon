"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton, Campo, NativeSelect, Aviso } from "@/components/ui";
import { CATEGORIAS, DESTINOS, TEXTO_AGENCIA } from "@/config/textos";
import { crearServicio } from "./acciones";

// Solo lo que ve el turista: el nombre del servicio y el destino donde se ofrece (la categoría sale del tipo).
// ids con prefijo "s-": la misma página tiene el formulario de perfil.
export function FormularioServicio({ providerId, tipo }: { providerId: string; tipo: string }) {
  const router = useRouter();
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

  if (!CATEGORIAS.some((c) => (c.tipos as readonly string[]).includes(tipo))) return <p className="text-muted-foreground">Tu tipo de registro aún no admite servicios.</p>;
  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="s-nombre" name="nombre" etiqueta="Nombre del servicio" placeholder="Avistamiento de ballenas" maxLength={120} required />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="s-destino" className="text-[0.9375rem] font-semibold">Destino</label>
          <NativeSelect id="s-destino" name="destino" required defaultValue="">
            <option value="" disabled>Elige</option>
            {DESTINOS.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </NativeSelect>
        </div>
      </div>
      <p className="text-[0.9375rem] text-muted-foreground">El turista lo verá solo en ese destino. Si lo ofreces en varios, regístralo una vez por destino.</p>
      {estado.error && <Aviso tipo="error">{estado.error}</Aviso>}
      {estado.ok && <Aviso tipo="ok">{TEXTO_AGENCIA.enviado}</Aviso>}
      <Boton type="submit" disabled={estado.cargando}>{estado.cargando ? "Enviando…" : "Enviar para revisión"}</Boton>
    </form>
  );
}
