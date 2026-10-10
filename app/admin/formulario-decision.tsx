// Formulario común de aprobar / rechazar con motivo (servicios y cambios de perfil).
import { Boton, Tarjeta, claseControl } from "@/components/ui";

export function FormularioDecision({ accion, id, aprobar, error }: {
  accion: (f: FormData) => Promise<void>; id: string; aprobar: { valor: string; texto: string }; error?: boolean;
}) {
  return (
    <Tarjeta>
      <form action={accion} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={id} />
        <label htmlFor="motivo" className="font-semibold">Motivo (obligatorio para pedir corrección)</label>
        <textarea id="motivo" name="motivo" maxLength={500} rows={2} className={`${claseControl} py-3`} />
        {error && <p role="alert" className="text-alerta">Indica el motivo.</p>}
        <Boton name="decision" value={aprobar.valor}>{aprobar.texto}</Boton>
        <Boton name="decision" value="rechazado" variante="secundario">Pedir corrección</Boton>
      </form>
    </Tarjeta>
  );
}
