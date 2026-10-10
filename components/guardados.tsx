"use client";
// Guardados: solo en este navegador (localStorage), sin cuenta. Se guarda una copia mínima para listar sin consultar la BD.
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { TEXTO_GUARDADOS } from "@/config/textos";

export type Guardado = { href: string; nombre: string; detalle: string };

const CLAVE = "checktur:guardados";
const oyentes = new Set<() => void>();
let cache: { crudo: string | null; lista: Guardado[] } = { crudo: null, lista: [] };

function leer(): Guardado[] {
  let crudo: string | null = null;
  try {
    crudo = localStorage.getItem(CLAVE);
  } catch {
    return cache.lista;
  }
  if (crudo === cache.crudo) return cache.lista; // misma referencia: useSyncExternalStore no re-renderiza en vano
  let lista: Guardado[] = [];
  try {
    const v = JSON.parse(crudo ?? "[]");
    if (Array.isArray(v)) lista = v.filter((g) => typeof g?.href === "string" && g.href.startsWith("/"));
  } catch {}
  cache = { crudo, lista };
  return lista;
}

function escribir(lista: Guardado[]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {}
  oyentes.forEach((f) => f());
}

function suscribir(f: () => void) {
  oyentes.add(f);
  const otraPestana = (e: StorageEvent) => e.key === CLAVE && f();
  window.addEventListener("storage", otraPestana);
  return () => {
    oyentes.delete(f);
    window.removeEventListener("storage", otraPestana);
  };
}

const VACIO: Guardado[] = [];
const useGuardados = () => useSyncExternalStore(suscribir, leer, () => VACIO);

/** Corazón para guardar o quitar. `flotante`: sobre la ilustración de una tarjeta. */
export function BotonGuardar({ item, flotante = false }: { item: Guardado; flotante?: boolean }) {
  const lista = useGuardados();
  const activo = lista.some((g) => g.href === item.href);
  const alternar = (e: React.MouseEvent) => {
    e.preventDefault(); // dentro de un <a> de tarjeta: no navegar
    escribir(activo ? lista.filter((g) => g.href !== item.href) : [item, ...lista].slice(0, 100));
  };
  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={activo}
      aria-label={`${activo ? TEXTO_GUARDADOS.quitar : TEXTO_GUARDADOS.guardar}: ${item.nombre}`}
      className={
        flotante
          ? "absolute top-2 right-2 flex size-11 cursor-pointer items-center justify-center rounded-full bg-superficie text-texto shadow-sm"
          : "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-borde bg-superficie px-4 font-bold"
      }
    >
      <Heart aria-hidden className={`size-5 ${activo ? "fill-current" : ""}`} />
      {!flotante && (activo ? TEXTO_GUARDADOS.guardado : TEXTO_GUARDADOS.guardar)}
    </button>
  );
}

export function ListaGuardados() {
  const lista = useGuardados();
  if (!lista.length) return <p className="text-texto-suave">{TEXTO_GUARDADOS.vacio}</p>;
  return (
    <ul className="flex flex-col gap-3">
      {lista.map((g) => (
        <li key={g.href} className="flex items-center justify-between gap-3 rounded-tarjeta border border-separador bg-superficie p-4">
          <Link href={g.href} className="flex min-w-0 flex-col no-underline">
            <b className="truncate text-lg">{g.nombre}</b>
            <span className="text-[0.9375rem] text-texto-suave">{g.detalle}</span>
          </Link>
          <button
            type="button"
            onClick={() => escribir(lista.filter((x) => x.href !== g.href))}
            className="min-h-11 shrink-0 cursor-pointer px-2 font-bold underline"
          >
            {TEXTO_GUARDADOS.quitar}
          </button>
        </li>
      ))}
    </ul>
  );
}
