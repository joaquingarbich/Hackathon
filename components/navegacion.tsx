"use client";
// Cabecera única (escritorio: categorías + accesos) y barra de pestañas del turista (móvil).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Compass, Heart, ShieldCheck } from "lucide-react";
import { CATEGORIAS, TEXTO_APP, TEXTO_CATALOGO, TEXTO_GUARDADOS } from "@/config/textos";

export function Logo() {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2.5 no-underline">
      <span className="flex size-[2.125rem] items-center justify-center rounded-chip bg-primario text-sobre-primario">
        <Check aria-hidden className="size-5" strokeWidth={2.8} />
      </span>
      <span className="font-titulo text-[1.375rem] font-extrabold tracking-tight">
        {TEXTO_APP.nombre.replace(" Piura", "")} <span className="font-medium text-texto-suave">Piura</span>
      </span>
    </Link>
  );
}

const enlace = "flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[0.9375rem] no-underline hover:bg-relleno";

/** Con la ruta actual (aria-current). Va dentro de <Suspense> en el layout: usePathname es dato de petición. */
export function Cabecera() {
  return <CabeceraBase ruta={usePathname()} />;
}

/** Sin ruta: el fallback prerenderizado de la cabecera. */
export function CabeceraBase({ ruta = "" }: { ruta?: string }) {
  return (
    <header className="border-b border-separador bg-superficie">
      <div className="mx-auto flex max-w-[77.5rem] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 sm:px-8">
        <Logo />
        <nav aria-label="Categorías" className="hidden flex-wrap gap-1 lg:flex">
          {CATEGORIAS.map((c) => (
            <Link key={c.id} href={`/explorar?c=${c.id}`} className={`${enlace} px-3.5 text-base`}>{c.nombre}</Link>
          ))}
        </nav>
        <div className="ml-auto hidden flex-wrap items-center gap-1 md:flex">
          <Link href="/guardados" aria-current={ruta === "/guardados" ? "page" : undefined} className={`${enlace} aria-[current=page]:bg-relleno aria-[current=page]:font-bold`}>
            <Heart aria-hidden className="size-4.5" /> {TEXTO_GUARDADOS.titulo}
          </Link>
          <Link href="/verificar" aria-current={ruta === "/verificar" ? "page" : undefined} className={`${enlace} aria-[current=page]:bg-relleno aria-[current=page]:font-bold`}>
            <ShieldCheck aria-hidden className="size-4.5" /> Verificar
          </Link>
          <Link href="/operador" className={enlace}>{TEXTO_CATALOGO.publica}</Link>
        </div>
      </div>
    </header>
  );
}

const PESTANAS = [
  { href: "/", activo: (r: string) => r === "/" || r.startsWith("/explorar"), texto: "Explorar", Icono: Compass },
  { href: "/guardados", activo: (r: string) => r === "/guardados", texto: TEXTO_GUARDADOS.titulo, Icono: Heart },
  { href: "/verificar", activo: (r: string) => r === "/verificar", texto: "Verificar", Icono: ShieldCheck },
];
const CON_PESTANAS = ["/", "/explorar", "/guardados", "/verificar"];

/** Móvil: visible en las secciones del turista; seleccionado con ícono relleno + fondo, no solo color. */
export function BarraPestanas() {
  const ruta = usePathname();
  if (!CON_PESTANAS.includes(ruta)) return null;
  return (
    <nav aria-label="Secciones" className="sticky bottom-0 z-20 border-t border-separador bg-superficie pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-3">
        {PESTANAS.map(({ href, activo, texto, Icono }) => {
          const a = activo(ruta);
          return (
            <li key={href} className="p-1.5">
              <Link href={href} aria-current={a ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-control text-[0.8125rem] no-underline ${a ? "bg-relleno font-bold" : ""}`}>
                <Icono aria-hidden className={`size-6 ${a ? "fill-current/20" : ""}`} strokeWidth={a ? 2.4 : 2} />
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Pie() {
  return (
    <footer className="border-t border-separador bg-superficie">
      <div className="mx-auto flex max-w-[77.5rem] flex-wrap justify-between gap-2 px-4 py-6 text-[0.875rem] text-texto-suave sm:px-8">
        <span>{TEXTO_APP.nombre} · Hackathon Piura Innova 2026 · Reto 16</span>
        <span>Datos de muestra: nombres, notas y precios ficticios.</span>
      </div>
    </footer>
  );
}
