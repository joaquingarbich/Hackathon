import { Suspense } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Boton, Campo, Encabezado, Pagina, Tarjeta } from "@/components/ui";
import { TEXTO_OPERADOR } from "@/config/textos";
import { registrarse } from "../ingresar/acciones";
import { Mensaje } from "../ingresar/mensaje";

export default function Registro({ searchParams }: PageProps<"/registro">) {
  return (
    <Pagina className="max-w-md">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><UserPlus aria-hidden className="size-6" /></span>
      <Encabezado eyebrow="Para empresas" titulo={TEXTO_OPERADOR.tituloRegistro} bajada={TEXTO_OPERADOR.ayudaRegistro} />
      <Suspense>
        <Mensaje searchParams={searchParams} />
      </Suspense>
      <Tarjeta>
        <form action={registrarse} className="flex flex-col gap-4">
          <Campo id="email" name="email" type="email" etiqueta="Correo" autoComplete="email" required />
          <Campo id="password" name="password" type="password" etiqueta="Contraseña" ayuda="Mínimo 8 caracteres." autoComplete="new-password" required minLength={8} />
          <Campo id="confirmar" name="confirmar" type="password" etiqueta="Confirmar contraseña" autoComplete="new-password" required minLength={8} />
          <Boton className="mt-1">Crear cuenta</Boton>
        </form>
      </Tarjeta>
      <p className="text-center">¿Ya tienes cuenta? <Link href="/ingresar" className="inline-flex min-h-11 items-center font-semibold">Ingresar</Link></p>
    </Pagina>
  );
}
