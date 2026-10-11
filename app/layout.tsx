import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TEXTO_APP } from "@/config/textos";
import { BarraPestanas, Cabecera, CabeceraBase, Pie } from "@/components/navegacion";
import { MovimientoGlobal } from "@/components/movimiento";
import "./globals.css";

// Tipografía: Geist (interfaz y títulos) + Geist Mono (RUC, placas, fechas). Tokens en app/globals.css.
const sans = Geist({ variable: "--fuente-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--fuente-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: TEXTO_APP.nombre,
  description: TEXTO_APP.lema,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable} h-full font-sans antialiased`}>
      <body className="flex min-h-full flex-col">
        <Suspense fallback={<CabeceraBase />}>
          <Cabecera />
        </Suspense>
        <main className="flex flex-1 flex-col"><MovimientoGlobal>{children}</MovimientoGlobal></main>
        <Pie />
        <Suspense>
          <BarraPestanas />
        </Suspense>
      </body>
    </html>
  );
}
