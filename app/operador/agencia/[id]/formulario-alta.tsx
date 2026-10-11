"use client";
// Formulario genérico de alta (canal, vehículo, persona): reduce la foto en el navegador y conserva los campos si hay error.
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Boton, Aviso } from "@/components/ui";
import { reducirImagen } from "@/lib/imagen";
import { TEXTO_AGENCIA } from "@/config/textos";
import type { Resultado } from "./acciones";

export function FormularioAlta({ accion, children, boton }: { accion: (f: FormData) => Promise<Resultado>; children: ReactNode; boton: string }) {
  const router = useRouter();
  const [estado, setEstado] = useState<{ cargando: boolean; error?: string; ok?: boolean }>({ cargando: false });
  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setEstado({ cargando: true });
    const foto = f.get("foto");
    if (foto instanceof File && foto.size) f.set("foto", await reducirImagen(foto, 1200), "foto.jpg"); else f.delete("foto");
    const r = await accion(f);
    if (!r.ok) return setEstado({ cargando: false, error: r.error });
    form.reset();
    setEstado({ cargando: false, ok: true });
    router.refresh();
  }
  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      {children}
      {estado.error && <Aviso tipo="error">{estado.error}</Aviso>}
      {estado.ok && <Aviso tipo="ok">{TEXTO_AGENCIA.enviado}</Aviso>}
      <Boton type="submit" disabled={estado.cargando} className="self-start"><Plus aria-hidden /> {estado.cargando ? "Enviando…" : boton}</Boton>
    </form>
  );
}
