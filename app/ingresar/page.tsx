import { Suspense } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, Boton, Campo, Encabezado, Pagina, Tarjeta } from "@/components/ui";
import { TEXTO_OPERADOR } from "@/config/textos";
import Link from "next/link";
import { ingresar } from "./acciones";
import { Mensaje } from "./mensaje";

export default function Ingresar({ searchParams }: PageProps<"/ingresar">) {
  return (
    <Pagina className="max-w-md">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><LockKeyhole aria-hidden className="size-6" /></span>
      <Encabezado eyebrow="Para empresas" titulo={TEXTO_OPERADOR.tituloIngreso} bajada={TEXTO_OPERADOR.ayudaIngreso} />
      <Suspense>
        <Mensaje searchParams={searchParams} />
      </Suspense>
      <Tarjeta>
        <form className="flex flex-col gap-4">
          <Campo id="email" name="email" type="email" etiqueta="Correo" autoComplete="email" required />
          <Campo id="password" name="password" type="password" etiqueta="Contraseña" autoComplete="current-password" required />
          <Boton formAction={ingresar} className="mt-1">Ingresar</Boton>
        </form>
      </Tarjeta>
      <p className="text-center">¿Aún no tienes cuenta? <Link href="/registro" className="inline-flex min-h-11 items-center font-semibold">Crear cuenta</Link></p>
      <Alert variant="info">
        <ShieldCheck aria-hidden />
        <AlertDescription><b>¿Cómo se protege tu empresa?</b> Crear una cuenta no cambia lo que ve el turista. Solo un documento oficial validado por un revisor lo hace.</AlertDescription>
      </Alert>
    </Pagina>
  );
}
