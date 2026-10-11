// Formulario común de aprobar / rechazar con motivo (servicios y cambios de perfil).
import { Boton, Tarjeta, Textarea, Aviso } from "@/components/ui";

export function FormularioDecision({ accion, id, aprobar, error }: {
  accion: (f: FormData) => Promise<void>; id: string; aprobar: { valor: string; texto: string }; error?: boolean;
}) {
  return (
    <Tarjeta>
      <form action={accion} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={id} />
        <label htmlFor="motivo" className="text-[0.9375rem] font-semibold">Motivo (obligatorio para pedir corrección)</label>
        <Textarea id="motivo" name="motivo" maxLength={500} rows={2} />
        {error && <Aviso tipo="error">Indica el motivo.</Aviso>}
        <Boton name="decision" value={aprobar.valor}>{aprobar.texto}</Boton>
        <Boton name="decision" value="rechazado" variante="secundario">Pedir corrección</Boton>
      </form>
    </Tarjeta>
  );
}
