import { Suspense } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Cargando } from "@/components/dictamen";
import { Mono, Pagina } from "@/components/ui";
import { TEXTO_FICHA } from "@/config/textos";
import { exigirDueno } from "@/lib/agencia";
import { urlAbsoluta } from "@/components/verificacion";
import { BotonImprimir } from "./imprimir";

// QR imprimibles (sticker de la van, carnet del guía, vitrina). PDF = "Guardar como PDF" del navegador.
export default function QrEmpresa({ params }: PageProps<"/operador/agencia/[id]/qr">) {
  return <Suspense fallback={<Cargando />}><Contenido params={params} /></Suspense>;
}

async function Contenido({ params }: Pick<PageProps<"/operador/agencia/[id]/qr">, "params">) {
  const { id } = await params;
  const { proveedor: p, db } = await exigirDueno(id);
  const [{ data: vehiculos }, { data: personal }] = await Promise.all([
    db.from("vehicles").select("id, placa, foto_url").eq("provider_id", id).eq("aprobacion", "aprobado").order("placa"),
    db.from("personal").select("id, nombre, rol, foto_url").eq("provider_id", id).eq("estado", "aprobado").order("nombre"),
  ]);
  const nombre = p.nombre_comercial ?? p.razon_social ?? "Empresa";
  const items = [
    { id: p.id, tipo: "Vitrina / local", titulo: nombre, sub: `RUC ${p.ruc ?? ""}`, foto: p.foto_url },
    ...(vehiculos ?? []).map((v) => ({ id: v.id, tipo: "Sticker de la unidad", titulo: `${v.placa.slice(0, 3)}-${v.placa.slice(3)}`, sub: nombre, foto: v.foto_url })),
    ...(personal ?? []).map((x) => ({ id: x.id, tipo: `Carnet · ${TEXTO_FICHA.rol[x.rol]}`, titulo: x.nombre, sub: nombre, foto: x.foto_url })),
  ];
  const tarjetas = await Promise.all(items.map(async (it) => {
    const url = await urlAbsoluta(`/v/${it.id}`);
    return { ...it, url, svg: await QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M" }) };
  }));

  return (
    <Pagina>
      <div className="flex flex-col gap-2 print:hidden">
        <Link href={`/operador/agencia/${id}`} className="inline-flex min-h-11 items-center gap-1.5 self-start font-medium text-muted-foreground no-underline hover:text-foreground">← {nombre}</Link>
        <h1 className="text-[1.875rem] leading-[1.1] font-bold sm:text-[2.25rem]">Códigos QR para imprimir</h1>
        <p className="text-muted-foreground">Cada QR abre la ficha en vivo: si un documento vence, el turista lo ve al instante. Pega el de cada unidad en la van, el del personal en su carnet y el de la empresa en tu vitrina.</p>
        <BotonImprimir />
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 print:grid-cols-2 print:gap-3">
        {tarjetas.map((t) => (
          <li key={t.id} className="flex break-inside-avoid flex-col items-center gap-2 rounded-2xl border-2 border-foreground bg-card p-4 text-center">
            <span className="text-[0.8125rem] font-semibold tracking-wide text-muted-foreground uppercase">{t.tipo}</span>
            <b className="text-xl">{t.titulo}</b>
            <span className="text-[0.9375rem] text-muted-foreground">{t.sub}</span>
            <div className="w-44" dangerouslySetInnerHTML={{ __html: t.svg }} /> {/* SVG generado por qrcode a partir de nuestra URL */}
            <span className="text-[0.8125rem]">Verifica en vivo en <b>CheckTur Piura</b></span>
            <Mono className="text-[0.6875rem] break-all text-muted-foreground">{t.url}</Mono>
          </li>
        ))}
      </ul>
    </Pagina>
  );
}
