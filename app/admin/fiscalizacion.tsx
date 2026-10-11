// Panel del admin / fiscalizador: altas por aprobar, reportes de turistas y búsquedas sin resultado.
// Lecturas con service role: quien renderiza esto ya pasó exigirAdmin().
import Link from "next/link";
import { Boton, Mono, Tarjeta, claseControl, Aviso } from "@/components/ui";
import { DESTINOS, NOMBRE_CANAL, TEXTO_FICHA, nombreDestino } from "@/config/textos";
import { fechaLegible } from "@/lib/dictamen";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { marcarReporte, resolverAlta } from "./agencias";

const titulo = "mt-2 text-[1.1875rem] font-semibold tracking-tight";
const haceDias = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

function Decision({ tipo, id }: { tipo: string; id: string }) {
  return (
    <form action={resolverAlta} className="flex flex-col gap-2">
      <input type="hidden" name="tipo" value={tipo} /><input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`m-${id}`}>Motivo</label>
      <input id={`m-${id}`} name="motivo" maxLength={500} placeholder="Motivo (obligatorio para rechazar)" className={claseControl} />
      <div className="flex flex-wrap gap-2">
        <Boton name="decision" value="aprobado">Aprobar</Boton>
        <Boton name="decision" value="rechazado" variante="secundario">Rechazar</Boton>
      </div>
    </form>
  );
}

export async function Fiscalizacion({ destino, error }: { destino?: string; error?: string }) {
  const db = supabaseAdmin();
  const [{ data: canales }, { data: vehiculos }, { data: personal }, { data: reportes }, { data: busquedas }] = await Promise.all([
    db.from("canales").select("id, provider_id, tipo, visible, created_at").eq("estado", "pendiente").order("created_at"),
    db.from("vehicles").select("id, provider_id, placa, foto_url, autorizacion_mtc, soat_vencimiento, citv_vencimiento").eq("aprobacion", "pendiente"),
    db.from("personal").select("id, provider_id, nombre, rol, dni_ultimos3, foto_url, carne_numero").eq("estado", "pendiente"),
    db.from("reportes").select("*").order("created_at", { ascending: false }).limit(30),
    (() => {
      let q = db.from("lookups").select("tipo_entrada, entrada_normalizada, destino").eq("estado_resultado", "no_encontrado").gte("created_at", haceDias(30)).limit(5000);
      if (destino) q = q.eq("destino", destino);
      return q;
    })(),
  ]);
  const ids = [...new Set([...(canales ?? []), ...(vehiculos ?? []), ...(personal ?? []), ...(reportes ?? [])].map((x) => x.provider_id).filter((x): x is string => !!x))];
  const { data: nombres } = ids.length ? await db.from("providers").select("id, nombre_comercial, razon_social").in("id", ids) : { data: [] };
  const empresa = (id: string | null) => { const p = nombres?.find((n) => n.id === id); return p ? p.nombre_comercial ?? p.razon_social : null; };
  const fotos = await Promise.all((reportes ?? []).map(async (r) => r.foto_path ? (await db.storage.from("documentos").createSignedUrl(r.foto_path, 600)).data?.signedUrl ?? null : null));
  const frecuentes = Object.entries((busquedas ?? []).reduce<Record<string, number>>((m, b) => {
    const k = `${b.tipo_entrada}|${b.entrada_normalizada ?? ""}`; return { ...m, [k]: (m[k] ?? 0) + 1 };
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 15);
  const nAltas = (canales?.length ?? 0) + (vehiculos?.length ?? 0) + (personal?.length ?? 0);

  return (
    <>
      <h2 id="altas" className={titulo}>Altas por aprobar {nAltas}</h2>
      {error === "duplicado" && <Aviso tipo="error">No se aprobó: ese número o cuenta ya está aprobado para otra empresa.</Aviso>}
      {error === "motivo" && <Aviso tipo="error">Indica el motivo del rechazo.</Aviso>}
      {!nAltas && <p className="text-muted-foreground">No hay canales, vehículos ni personal pendientes.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {canales?.map((c) => (
          <Tarjeta key={c.id} className="flex flex-col gap-2 p-4">
            <b>{NOMBRE_CANAL[c.tipo]} · <Mono>{c.visible}</Mono></b>
            <span className="text-[0.9375rem] text-muted-foreground">{empresa(c.provider_id)} · pide registrarlo como canal oficial</span>
            <p className="text-[0.875rem] text-muted-foreground">Confirma con la empresa (por su teléfono ya registrado) que el número o la cuenta es suya.</p>
            <Decision tipo="canal" id={c.id} />
          </Tarjeta>
        ))}
        {vehiculos?.map((v) => (
          <Tarjeta key={v.id} className="flex flex-col gap-2 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- foto de Storage público */}
            {v.foto_url && <img src={v.foto_url} alt={`Foto de la unidad ${v.placa}`} className="aspect-[4/3] w-full rounded-xl object-cover" />}
            <b>Vehículo <Mono>{v.placa.slice(0, 3)}-{v.placa.slice(3)}</Mono></b>
            <span className="text-[0.9375rem] text-muted-foreground">{empresa(v.provider_id)} · MTC {v.autorizacion_mtc ?? "—"} · SOAT <Mono>{v.soat_vencimiento ? fechaLegible(v.soat_vencimiento) : "—"}</Mono> · Rev. técnica <Mono>{v.citv_vencimiento ? fechaLegible(v.citv_vencimiento) : "—"}</Mono></span>
            <p className="text-[0.875rem] text-muted-foreground">Contrasta la placa con el registro del MTC y que la foto muestre la placa.</p>
            <Decision tipo="vehiculo" id={v.id} />
          </Tarjeta>
        ))}
        {personal?.map((x) => (
          <Tarjeta key={x.id} className="flex flex-col gap-2 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- foto de Storage público */}
            {x.foto_url && <img src={x.foto_url} alt={`Foto de ${x.nombre}`} className="aspect-[4/3] w-full rounded-xl object-cover" />}
            <b>{x.nombre} · {TEXTO_FICHA.rol[x.rol]}</b>
            <span className="text-[0.9375rem] text-muted-foreground">{empresa(x.provider_id)} · DNI <Mono>•••••{x.dni_ultimos3}</Mono>{x.carne_numero && <> · carné <Mono>{x.carne_numero}</Mono></>}</span>
            <Decision tipo="persona" id={x.id} />
          </Tarjeta>
        ))}
      </div>

      <h2 id="reportes" className={titulo}>Reportes de turistas {reportes?.filter((r) => r.estado === "nuevo").length ?? 0} nuevos</h2>
      {!reportes?.length && <p className="text-muted-foreground">Sin reportes.</p>}
      <ul className="overflow-hidden rounded-2xl border border-border bg-card empty:hidden">
        {reportes?.map((r, i) => (
          <li key={r.id} className={`flex flex-col gap-1 border-b border-border p-4 last:border-0 ${r.estado === "revisado" ? "opacity-60" : ""}`}>
            <b>{r.que_paso}</b>
            <span className="text-[0.9375rem] text-muted-foreground">
              {r.dato && <>Dato: <Mono>{r.dato}</Mono> · </>}{empresa(r.provider_id) && <>Empresa: {empresa(r.provider_id)} · </>}
              {r.destino && <>{nombreDestino(r.destino)} · </>}<Mono>{fechaLegible(r.created_at.slice(0, 10))}</Mono>
              {fotos[i] && <> · <a href={fotos[i]!} target="_blank" rel="noreferrer">ver foto</a></>}
            </span>
            {r.estado === "nuevo" && <form action={marcarReporte.bind(null, r.id)}><button className="min-h-11 cursor-pointer text-[0.9375rem] underline">Marcar como revisado</button></form>}
          </li>
        ))}
      </ul>

      <h2 id="no-encontrados" className={titulo}>Búsquedas sin resultado · últimos 30 días</h2>
      <p className="text-[0.9375rem] text-muted-foreground">Placas, números y nombres que los turistas buscaron y no existen en el registro: posibles informales o suplantaciones a fiscalizar.</p>
      <nav aria-label="Filtrar por destino" className="flex flex-wrap gap-2">
        <Link href="/admin#no-encontrados" className={`inline-flex min-h-11 items-center rounded-full border px-4 text-[0.9375rem] no-underline ${!destino ? "bg-muted font-semibold" : "border-border"}`}>Todos</Link>
        {DESTINOS.map((d) => (
          <Link key={d.id} href={`/admin?d=${d.id}#no-encontrados`} className={`inline-flex min-h-11 items-center rounded-full border px-4 text-[0.9375rem] no-underline ${destino === d.id ? "bg-muted font-semibold" : "border-border"}`}>{d.nombre}</Link>
        ))}
      </nav>
      {!frecuentes.length && <p className="text-muted-foreground">Sin búsquedas sin resultado{destino ? ` en ${nombreDestino(destino)}` : ""}.</p>}
      <ol className="overflow-hidden rounded-2xl border border-border bg-card empty:hidden">
        {frecuentes.map(([k, n]) => {
          const [tipo, valor] = k.split("|");
          return (
            <li key={k} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
              <span><span className="text-[0.9375rem] text-muted-foreground">{tipo}</span> · <Mono className="font-semibold">{valor || "—"}</Mono></span>
              <Mono>{n}×</Mono>
            </li>
          );
        })}
      </ol>
    </>
  );
}
