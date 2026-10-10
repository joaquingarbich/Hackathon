import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Lexend, Source_Sans_3 } from "next/font/google";
import { ShieldCheck } from "lucide-react";
import { TEXTO_APP } from "@/config/textos";
import "./globals.css";

// Cambiar tipografías aquí; los tokens --font-titulo / --font-base las toman de estas variables.
const titulo = Lexend({ variable: "--fuente-titulo", subsets: ["latin"] });
const base = Source_Sans_3({ variable: "--fuente-base", subsets: ["latin"] });

export const metadata: Metadata = {
  title: TEXTO_APP.nombre,
  description: TEXTO_APP.lema,
};

export const viewport: Viewport = { themeColor: "#0f172a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${titulo.variable} ${base.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="mx-auto w-full max-w-xl px-4 pt-6">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2">
            <ShieldCheck aria-hidden className="size-7 text-primario" />
            <span className="font-titulo text-xl font-semibold">{TEXTO_APP.nombre}</span>
          </Link>
        </header>
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
