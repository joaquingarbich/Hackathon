import type { Metadata, Viewport } from "next";
import { Lexend, Source_Sans_3 } from "next/font/google";
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
