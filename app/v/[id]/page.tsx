import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Cargando } from "@/components/dictamen";
import { registrarConsulta, resolverQr } from "@/lib/consultas";

// Destino de todos los QR impresos: abre la ficha EN VIVO (si algo vence o se suspende, el QR ya lo muestra).
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
