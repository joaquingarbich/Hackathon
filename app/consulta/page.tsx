import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Cargando, Datos, VistaDictamen } from "@/components/dictamen";
import { Tarjeta } from "@/components/ui";
import { CONSEJO, NOMBRE_TIPO } from "@/config/textos";
import { clasificarEntrada } from "@/lib/normalizacion";
import { fuentes, registrarConsulta, resolver, type Resolucion } from "@/lib/consultas";
import { observacionesDe } from "@/lib/dictamen";
import { firmaValida } from "@/lib/firma";

export default function Consulta({ searchParams }: PageProps<"/consulta">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Resultado searchParams={searchParams} />
    </Suspense>
  );
}

async function Resultado({ searchParams }: Pick<PageProps<"/consulta">, "searchParams">) {
  const sp = await searchParams;
  const q = String(sp.q ?? "").trim();
  if (!q) redirect("/");
  // obs y nf solo valen si los firmó el servidor (consulta por imagen); si no, se ignoran.
  const firmado = firmaValida(`consulta:${q}:${sp.nf === "1" ? "1" : ""}:${String(sp.obs ?? "")}`, sp.f);
  const obs = firmado ? observacionesDe(sp.obs) : [];
  const noEncontrado = firmado && sp.nf === "1"; // la imagen ya resolvió que no hay coincidencia
  const entrada = clasificarEntrada(q);
  const r: Resolucion = noEncontrado ? { tipo: "no_encontrado", ruc: null } : await resolver(entrada);
  if (!noEncontrado) await registrarConsulta(entrada, r);

  if (r.tipo === "prestador") redirect(`/prestador/${r.id}`);
  if (r.tipo === "vehiculo") redirect(`/vehiculo/${r.placa}`);

  if (r.tipo === "candidatos")
    return (
      <section className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">¿Cuál de estos buscas?</h1>
        <p className="text-texto-suave">Encontramos nombres parecidos a «{q}». Elige el correcto.</p>
        <ul className="flex flex-col gap-2">
          {r.lista.map((c) => (
            <li key={c.id}>
              <Link href={`/prestador/${c.id}`} className="block">
                <Tarjeta className="flex items-center justify-between gap-3 transition-colors duration-200 hover:bg-fondo">
                  <span>
                    <span className="block font-semibold">{c.nombre_comercial ?? c.razon_social}</span>
                    <span className="block text-sm text-texto-suave">
                      {NOMBRE_TIPO[c.tipo] ?? c.tipo}{c.ruc && ` · RUC ${c.ruc}`}
                    </span>
                  </span>
                  <ChevronRight aria-hidden className="size-5 shrink-0" />
                </Tarjeta>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/" className="underline">Ninguno es el que busco</Link>
      </section>
    );

  return (
    <VistaDictamen estado="no_encontrado" advertencias={obs.map((texto) => ({ nivel: "observacion" as const, texto }))} fuentes={await fuentes()} consejos={CONSEJO.noEncontrado}>
      <Datos
        titulo="Lo que consultaste"
        filas={[
          ["Búsqueda", q],
          ...(r.ruc
            ? ([
                ["Razón social (SUNAT)", r.ruc.razon_social],
                ["Estado RUC", `${r.ruc.estado} · ${r.ruc.condicion}`],
              ] as [string, string][])
            : []),
        ]}
      />
    </VistaDictamen>
  );
}
