import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // El catálogo con precios se retiró: el directorio ahora es /destinos (la query, p. ej. ?d=mancora, se conserva).
  // Escáner, verificación por foto y páginas de caso se retiraron: todo se busca a mano desde la home.
  redirects: async () => [
    { source: "/explorar", destination: "/destinos", permanent: false },
    { source: "/escanear", destination: "/", permanent: false },
    { source: "/verificar", destination: "/", permanent: false },
    { source: "/caso/:id", destination: "/", permanent: false },
  ],
  experimental: {
    serverActions: { bodySizeLimit: "2mb" }, // fotos ya reducidas en el navegador (consulta por imagen)
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
