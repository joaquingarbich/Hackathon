import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { TEXTO_APP } from "@/config/textos";
import { BarraPestanas, Cabecera, CabeceraBase, Pie } from "@/components/navegacion";
import "./globals.css";

// Cambiar tipografías aquí; los tokens --font-titulo / --font-base / --font-mono las toman de estas variables.
const titulo = Bricolage_Grotesque({ variable: "--fuente-titulo", subsets: ["latin"], weight: ["500", "700", "800"] });
const base = Atkinson_Hyperlegible({ variable: "--fuente-base", subsets: ["latin"], weight: ["400", "700"] });
const mono = JetBrains_Mono({ variable: "--fuente-mono", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: TEXTO_APP.nombre,
  description: TEXTO_APP.lema,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b141b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${titulo.variable} ${base.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Suspense fallback={<CabeceraBase />}>
          <Cabecera />
        </Suspense>
        <main className="flex flex-1 flex-col">{children}</main>
        <Pie />
        <Suspense>
          <BarraPestanas />
        </Suspense>
      </body>
    </html>
  );
}
