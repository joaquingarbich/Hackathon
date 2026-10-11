import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { Campo, Encabezado, Pagina, Tarjeta } from "@/components/ui";
import { ingresarAdmin } from "../../ingresar/acciones";
import { Mensaje } from "../../ingresar/mensaje";
import { FormularioSesion } from "../../ingresar/formulario";

// Login del panel de revisión, separado del de empresas.
export default function IngresarAdmin({ searchParams }: PageProps<"/admin/ingresar">) {
  return (
    <Pagina className="max-w-md">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><ShieldCheck aria-hidden className="size-6" /></span>
      <Encabezado eyebrow="Revisores" titulo="Panel de validación" bajada="Acceso solo para cuentas de revisor." />
      <Suspense>
        <Mensaje searchParams={searchParams} />
      </Suspense>
      <Tarjeta>
        <FormularioSesion accion={ingresarAdmin} boton="Ingresar">
          <Campo id="email" name="email" type="email" etiqueta="Correo" autoComplete="email" required />
          <Campo id="password" name="password" type="password" etiqueta="Contraseña" autoComplete="current-password" required />
        </FormularioSesion>
      </Tarjeta>
    </Pagina>
  );
}
