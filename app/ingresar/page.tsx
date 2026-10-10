import { Suspense } from "react";
import { Boton, Campo, Pagina, Tarjeta } from "@/components/ui";
import { TEXTO_OPERADOR } from "@/config/textos";
import { ingresar, registrarse } from "./acciones";

export default function Ingresar({ searchParams }: PageProps<"/ingresar">) {
  return (
    <Pagina className="max-w-lg">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2.125rem] leading-[1.05] font-extrabold">{TEXTO_OPERADOR.tituloIngreso}</h1>
        <p className="text-texto-suave">{TEXTO_OPERADOR.ayudaIngreso}</p>
      </div>
      <Suspense>
        <Mensaje searchParams={searchParams} />
      </Suspense>
      <Tarjeta className="p-5">
      <form className="flex flex-col gap-3.5">
        <Campo id="email" name="email" type="email" etiqueta="Correo" autoComplete="email" required />
        <Campo id="password" name="password" type="password" etiqueta="Contraseña" ayuda="Mínimo 8 caracteres." autoComplete="current-password" required minLength={8} />
        <Boton formAction={ingresar}>Ingresar</Boton>
        <Boton formAction={registrarse} variante="secundario">Crear cuenta</Boton>
      </form>
      </Tarjeta>
      <Tarjeta className="flex flex-col gap-1 bg-relleno">
        <h2 className="font-base text-lg font-bold tracking-normal">¿Cómo se protege tu empresa?</h2>
        <p className="text-[0.9375rem] text-texto-suave">Crear una cuenta no cambia lo que ve el turista. Solo un documento oficial validado por un revisor lo hace.</p>
      </Tarjeta>
    </Pagina>
  );
}

async function Mensaje({ searchParams }: Pick<PageProps<"/ingresar">, "searchParams">) {
  const { error, aviso } = await searchParams;
  if (error) return <p role="alert" className="rounded-control border-[1.5px] border-alerta-borde bg-alerta-fondo p-3 text-alerta">{String(error)}</p>;
  if (aviso) return <p role="status" className="rounded-control border-[1.5px] border-actualizacion-borde bg-actualizacion-fondo p-3 text-actualizacion">{String(aviso)}</p>;
  return null;
}
