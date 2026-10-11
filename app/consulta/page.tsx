import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Flag, RotateCcw, ShieldAlert, Building2 } from "lucide-react";
import { CabeceraDictamen, Cargando, Datos, TituloSeccion, VistaDictamen } from "@/components/dictamen";
import { Alert, AlertDescription, AlertTitle, Mono, Pagina, claseBoton } from "@/components/ui";
import { CONSEJO, DESTINOS, NOMBRE_CANAL, NOMBRE_TIPO, TEXTO_VERIFICAR } from "@/config/textos";
import { celularVisible } from "@/lib/canales";
import { OtraEmpresa } from "@/components/otra-empresa";
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

const fila = "pulsable flex min-h-16 items-center justify-between gap-3 px-4 py-3 text-foreground no-underline hover:bg-muted";
const lista = "divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-suave";

function Acciones({ dato, reportar = "Reportar" }: { dato: string; reportar?: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Link href={`/reportar?dato=${encodeURIComponent(dato)}`} className={claseBoton("secundario", "text-alerta hover:text-alerta")}><Flag aria-hidden /> {reportar}</Link>
      <Link href="/" className={claseBoton("secundario")}><RotateCcw aria-hidden /> Hacer otra consulta</Link>
    </div>
  );
}

async function Resultado({ searchParams }: Pick<PageProps<"/consulta">, "searchParams">) {
  const sp = await searchParams;
  const q = String(sp.q ?? "").trim();
  if (!q) redirect("/");
  // De una consulta por imagen en ESTE navegador (cookie firmada); nunca de la URL.
  const { textos: anuncio, noEncontrado } = await leerAnuncio(`consulta:${q}`);
  const entrada = clasificarEntrada(q);
  const r: Resolucion = noEncontrado ? { tipo: "no_encontrado", ruc: null } : await resolver(entrada);
  const destino = DESTINOS.some((d) => d.id === sp.d) ? String(sp.d) : undefined; // búsqueda hecha desde /destinos
  if (!noEncontrado) await registrarConsulta(entrada, r, undefined, undefined, destino);

  if (r.tipo === "prestador") redirect(`/prestador/${r.id}`);
  if (r.tipo === "vehiculo") redirect(`/vehiculo/${r.placa}`);

  if (r.tipo === "canal") {
    const que = TEXTO_VERIFICAR.canalDe[r.canal];
    const visible = entrada.tipo === "banco" ? `•••• ${entrada.valor.slice(-4)}` : celularVisible(entrada.valor);
    const tipoDato = r.canal === "banco" ? "Cuenta bancaria" : "Celular · WhatsApp · Yape · Plin";
    if (!r.empresas.length)
      return (
        <Pagina className="gap-5">
          <CabeceraDictamen eyebrow={tipoDato} titulo={<Mono>{visible}</Mono>} />
          <VistaDictamen estado="no_encontrado" anuncio={anuncio} advertencias={[{ nivel: "observacion", texto: TEXTO_VERIFICAR.noRegistrado(que) }, { nivel: "observacion", texto: TEXTO_VERIFICAR.noPagues }]} fuentes={await fuentes()} consejos={CONSEJO.noEncontrado} />
          <Acciones dato={visible} reportar="Reportar este número o cuenta" />
        </Pagina>
      );
    return (
      <Pagina className="gap-5">
        <CabeceraDictamen eyebrow={tipoDato} titulo={<Mono>{visible}</Mono>} detalle={TEXTO_VERIFICAR.perteneceA(que, r.empresas.length)} />
        <ul className={`entrada ${lista}`}>
          {r.empresas.map((e) => (
            <li key={e.id}>
              <Link href={`/prestador/${e.id}`} className={fila}>
                <span className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-verificado-fondo text-verificado"><Building2 aria-hidden className="size-5" /></span>
                  <span>
                    <b className="block text-[1.0625rem] font-semibold">{e.nombre}</b>
                    <span className="block text-[0.875rem] text-muted-foreground">{NOMBRE_TIPO[e.tipo] ?? e.tipo} · {e.canales.map((c) => { const [tipo, fuente] = c.split(":"); return `${NOMBRE_CANAL[tipo] ?? tipo} ${TEXTO_VERIFICAR.fuenteCanal[fuente] ?? ""}`; }).join(" · ")}</span>
                  </span>
                </span>
                <ChevronRight aria-hidden className="size-5 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
        <OtraEmpresa accion="/consulta" dato={que.toLowerCase()} titulares={r.empresas.map((e) => e.nombre)} dicha={String(sp.empresa ?? "") || undefined} ocultos={{ q }} />
        <Link href="/" className={claseBoton("secundario", "self-start")}><RotateCcw aria-hidden /> Hacer otra consulta</Link>
      </Pagina>
    );
  }

  if (r.tipo === "candidatos")
    return (
      <Pagina>
        <CabeceraDictamen eyebrow="Varias coincidencias" titulo={TEXTO_VERIFICAR.quizas} detalle={`Hay empresas registradas con nombres parecidos a «${q}». Elige la correcta.`} />
        <Alert variant="aviso">
          <ShieldAlert aria-hidden />
          <AlertTitle>Posible suplantación</AlertTitle>
          <AlertDescription>{TEXTO_VERIFICAR.suplantacion}</AlertDescription>
        </Alert>
        <ul className={`entrada ${lista}`}>
          {r.lista.map((c) => (
            <li key={c.id}>
              <Link href={`/prestador/${c.id}`} className={fila}>
                <span>
                  <b className="block font-semibold">{c.nombre_comercial ?? c.razon_social}</b>
                  <span className="block text-[0.875rem] text-muted-foreground">
                    {NOMBRE_TIPO[c.tipo] ?? c.tipo}{c.ruc && <> · RUC <Mono>{c.ruc}</Mono></>}
                  </span>
                </span>
                <ChevronRight aria-hidden className="size-5 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
        <Acciones dato={q} reportar="Ninguno es: reportar" />
      </Pagina>
    );

  return (
    <Pagina className="gap-5">
      <CabeceraDictamen eyebrow={anuncio.length ? "Leído de la imagen consultada" : "Consulta"} titulo={q} />
      {!!r.parecidos?.length && (
        <Alert variant="aviso" className="entrada">
          <ShieldAlert aria-hidden />
          <AlertTitle>{TEXTO_VERIFICAR.quizas}</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <ul className="flex flex-wrap gap-2">
              {r.parecidos.map((c) => (
                <li key={c.id}><Link href={`/prestador/${c.id}`} className="inline-flex min-h-10 items-center rounded-full border border-observaciones-borde/40 bg-card px-3.5 font-semibold no-underline">{c.nombre_comercial ?? c.razon_social}</Link></li>
              ))}
            </ul>
            <p>{TEXTO_VERIFICAR.suplantacion}</p>
          </AlertDescription>
        </Alert>
      )}
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
      <section aria-labelledby="t-sigue" className="flex flex-col gap-2.5">
        <TituloSeccion id="t-sigue" className="sr-only">Qué hacer ahora</TituloSeccion>
        <Acciones dato={q} />
      </section>
    </Pagina>
  );
}
