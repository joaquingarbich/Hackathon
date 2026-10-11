import { Escaner } from "@/components/escaner";
import { Pagina } from "@/components/ui";

export default function Escanear() {
  return (
    <Pagina>
      <div className="flex flex-col gap-1">
        <h1 className="text-[2.125rem] leading-[1.05] font-extrabold">Escanear QR</h1>
        <p className="text-texto-suave">Abre la ficha en vivo. Después compara la foto y la placa o el nombre con lo que tienes enfrente: un QR puede estar fotocopiado.</p>
      </div>
      <Escaner />
    </Pagina>
  );
}
