import { Escaner } from "@/components/escaner";
import { Encabezado, Pagina } from "@/components/ui";

export default function Escanear() {
  return (
    <Pagina>
      <Encabezado eyebrow="Código QR" titulo="Escanear QR" bajada="Abre la ficha en vivo. Después compara la foto y la placa o el nombre con lo que tienes enfrente: un QR puede estar fotocopiado." />
      <Escaner />
    </Pagina>
  );
}
