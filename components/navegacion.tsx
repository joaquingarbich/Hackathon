"use client";
// Cabecera (fija, translúcida: es la capa funcional que flota sobre el contenido) y barra de pestañas del turista (móvil).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, MapPin, QrCode, ShieldCheck } from "lucide-react";
import { TEXTO_APP } from "@/config/textos";
import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <Link href="/" className="pulsable flex min-h-11 items-center gap-2.5 rounded-xl text-foreground no-underline" aria-label={`${TEXTO_APP.nombre}, inicio`}>
      <span className="flex size-9 items-center justify-center rounded-[0.7rem] bg-primary text-primary-foreground shadow-marca">
        <ShieldCheck aria-hidden className="size-5" strokeWidth={2.4} />
      </span>
      <span className="text-[1.1875rem] font-bold tracking-tight">
        CheckTur <span className="font-medium text-muted-foreground">Piura</span>
      </span>
    </Link>
  );
}

const PESTANAS = [
  { href: "/", activo: (r: string) => r === "/" || r.startsWith("/caso") || r === "/verificar", texto: "Verificar", Icono: ShieldCheck },
  { href: "/escanear", activo: (r: string) => r === "/escanear", texto: "Escanear", Icono: QrCode },
  { href: "/destinos", activo: (r: string) => r.startsWith("/destinos"), texto: "Destinos", Icono: MapPin },
];
const CON_PESTANAS = ["/", "/verificar", "/escanear", "/destinos"];

/** Con la ruta actual (aria-current). Va dentro de <Suspense> en el layout: usePathname es dato de petición. */
export function Cabecera() {
  return <CabeceraBase ruta={usePathname()} />;
}

/** Sin ruta: el fallback prerenderizado de la cabecera. */
export function CabeceraBase({ ruta = "" }: { ruta?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-lg print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Secciones" className="ml-auto hidden items-center gap-1 md:flex">
          {PESTANAS.map(({ href, activo, texto, Icono }) => (
            <Link key={href} href={href} aria-current={activo(ruta) ? "page" : undefined}
              className="pulsable flex h-10 items-center gap-2 rounded-full px-4 text-[0.9375rem] font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground aria-[current=page]:bg-secondary aria-[current=page]:text-secondary-foreground">
              <Icono aria-hidden className="size-4.5" /> {texto}
            </Link>
          ))}
          <span aria-hidden className="mx-2 h-5 w-px bg-border" />
          <Link href="/operador" className="pulsable flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-[0.9375rem] font-medium text-foreground no-underline shadow-suave hover:bg-muted">
            <Building2 aria-hidden className="size-4.5" /> Para empresas
          </Link>
        </nav>
        <Link href="/operador" className="ml-auto flex min-h-11 items-center rounded-full px-3 text-[0.875rem] font-medium text-muted-foreground no-underline md:hidden">Empresas</Link>
      </div>
    </header>
  );
}

/** Móvil: visible en las secciones del turista; la pestaña activa lleva fondo de marca + ícono más grueso (no solo color). */
export function BarraPestanas() {
  const ruta = usePathname();
  if (!CON_PESTANAS.includes(ruta)) return null;
  return (
    <nav aria-label="Secciones" className="sticky bottom-0 z-20 border-t border-border/80 bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden print:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-3 gap-1 px-3 py-2">
        {PESTANAS.map(({ href, activo, texto, Icono }) => {
          const a = activo(ruta);
          return (
            <li key={href}>
              <Link href={href} aria-current={a ? "page" : undefined}
                className={cn(
                  "pulsable flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.8125rem] font-medium no-underline",
                  a ? "bg-secondary text-secondary-foreground" : "text-muted-foreground",
                )}>
                <Icono aria-hidden className="size-6" strokeWidth={a ? 2.4 : 1.9} />
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
    <footer className="border-t border-border bg-card print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-[0.875rem] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <ShieldCheck aria-hidden className="size-4 text-primary" />
          <span>{TEXTO_APP.nombre} · Hackathon Piura Innova 2026 · Reto 16</span>
        </div>
        <span>Datos de muestra: empresas, personas, placas y números ficticios.</span>
      </div>
    </footer>
  );
}
