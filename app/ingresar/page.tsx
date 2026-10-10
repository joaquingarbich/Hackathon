import { Suspense } from "react";
import { Boton, Campo } from "@/components/ui";
import { TEXTO_OPERADOR } from "@/config/textos";
import { ingresar, registrarse } from "./acciones";

export default function Ingresar({ searchParams }: PageProps<"/ingresar">) {
  return (
    <>
      <h1 className="text-2xl font-semibold">{TEXTO_OPERADOR.tituloIngreso}</h1>
      <p className="text-texto-suave">{TEXTO_OPERADOR.ayudaIngreso}</p>
      <Suspense>
        <Mensaje searchParams={searchParams} />
      </Suspense>
      <form className="flex flex-col gap-3">
        <Campo id="email" name="email" type="email" etiqueta="Correo" autoComplete="email" required />
        <Campo id="password" name="password" type="password" etiqueta="Contraseña" ayuda="Mínimo 8 caracteres." autoComplete="current-password" required minLength={8} />
        <Boton formAction={ingresar}>Ingresar</Boton>
        <Boton formAction={registrarse} variante="secundario">Crear cuenta</Boton>
      </form>
    </>
  );
}

async function Mensaje({ searchParams }: Pick<PageProps<"/ingresar">, "searchParams">) {
  const { error, aviso } = await searchParams;
  if (error) return <p role="alert" className="rounded-control border border-alerta-borde bg-alerta-fondo p-3 text-alerta">{String(error)}</p>;
  if (aviso) return <p role="status" className="rounded-control border border-actualizacion-borde bg-actualizacion-fondo p-3 text-actualizacion">{String(aviso)}</p>;
  return null;
}
