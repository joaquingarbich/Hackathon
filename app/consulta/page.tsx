import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CabeceraDictamen, Cargando, Datos, VistaDictamen } from "@/components/dictamen";
import { Mono, Pagina, claseBoton } from "@/components/ui";
import { CONSEJO, NOMBRE_TIPO } from "@/config/textos";
import { clasificarEntrada } from "@/lib/normalizacion";
import { fuentes, registrarConsulta, resolver, type Resolucion } from "@/lib/consultas";
import { leerAnuncio } from "@/lib/anuncio";

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
  if (!q) redirect("/verificar");
  // De una consulta por imagen en ESTE navegador (cookie firmada); nunca de la URL.
  const { textos: anuncio, noEncontrado } = await leerAnuncio(`consulta:${q}`);
  const entrada = clasificarEntrada(q);
  const r: Resolucion = noEncontrado ? { tipo: "no_encontrado", ruc: null } : await resolver(entrada);
  if (!noEncontrado) await registrarConsulta(entrada, r);

  if (r.tipo === "prestador") redirect(`/prestador/${r.id}`);
  if (r.tipo === "vehiculo") redirect(`/vehiculo/${r.placa}`);

  if (r.tipo === "candidatos")
    return (
      <Pagina>
        <CabeceraDictamen titulo="¿Cuál de estos buscas?" detalle={`Hay nombres parecidos a «${q}». Elige el correcto.`} />
        <ul className="overflow-hidden rounded-tarjeta border border-separador bg-superficie">
          {r.lista.map((c) => (
            <li key={c.id} className="border-b border-separador last:border-0">
              <Link href={`/prestador/${c.id}`} className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 no-underline hover:bg-relleno">
                <span>
                  <b className="block">{c.nombre_comercial ?? c.razon_social}</b>
                  <span className="block text-[0.9375rem] text-texto-suave">
                    {NOMBRE_TIPO[c.tipo] ?? c.tipo}{c.ruc && <> · RUC <Mono>{c.ruc}</Mono></>}
                  </span>
                </span>
                <ChevronRight aria-hidden className="size-5 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/verificar" className={claseBoton("secundario", "self-start")}>Ninguno es el que busco</Link>
      </Pagina>
    );

  return (
    <Pagina className="gap-5">
    <CabeceraDictamen titulo={q} detalle={anuncio.length ? "Leído de la imagen consultada" : "Consulta"} />
    <VistaDictamen estado="no_encontrado" anuncio={anuncio} fuentes={await fuentes()} consejos={CONSEJO.noEncontrado}>
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
    <Link href="/verificar" className={claseBoton("secundario", "self-start")}>Hacer otra consulta</Link>
    </Pagina>
  );
}
