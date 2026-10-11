import { Suspense } from "react";
import { Info, LockKeyhole, OctagonAlert, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, Boton, Campo, Encabezado, Pagina, Tarjeta } from "@/components/ui";
import { TEXTO_OPERADOR } from "@/config/textos";
import { ingresar, registrarse } from "./acciones";

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
          <Campo id="password" name="password" type="password" etiqueta="Contraseña" ayuda="Mínimo 8 caracteres." autoComplete="current-password" required minLength={8} />
          <div className="flex flex-col gap-2 pt-1">
            <Boton formAction={ingresar}>Ingresar</Boton>
            <Boton formAction={registrarse} variante="secundario">Crear cuenta</Boton>
          </div>
        </form>
      </Tarjeta>
      <Alert variant="info">
        <ShieldCheck aria-hidden />
        <AlertDescription><b>¿Cómo se protege tu empresa?</b> Crear una cuenta no cambia lo que ve el turista. Solo un documento oficial validado por un revisor lo hace.</AlertDescription>
      </Alert>
    </Pagina>
  );
}

async function Mensaje({ searchParams }: Pick<PageProps<"/ingresar">, "searchParams">) {
  const { error, aviso } = await searchParams;
  if (error) return <Alert role="alert" variant="peligro"><OctagonAlert aria-hidden /><AlertDescription>{String(error)}</AlertDescription></Alert>;
  if (aviso) return <Alert role="status" variant="info"><Info aria-hidden /><AlertDescription>{String(aviso)}</AlertDescription></Alert>;
  return null;
}
