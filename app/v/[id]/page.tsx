import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Cargando } from "@/components/dictamen";
import { registrarConsulta, resolverQr } from "@/lib/consultas";

// Enlace corto para compartir una ficha: abre la empresa, el vehículo o la persona EN VIVO.
export default function Qr({ params }: PageProps<"/v/[id]">) {
  return <Suspense fallback={<Cargando />}><Redirigir params={params} /></Suspense>;
}

async function Redirigir({ params }: Pick<PageProps<"/v/[id]">, "params">) {
  const { id } = await params;
  const destino = await resolverQr(id);
  if (!destino) notFound();
  await registrarConsulta({ tipo: "nombre", valor: id }, { tipo: "no_encontrado", ruc: null }, "qr_abierto", "qr");
  return redirect(destino);
}
