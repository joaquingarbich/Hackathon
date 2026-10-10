# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

CheckTur Piura — hackathon web app (Spanish UI). The tourist side is a **booking-style catalog** of experiences, lodging, restaurants and transport offered by registered (= formal) providers in Piura; a secondary **verifier** tells whether a provider found outside the catalog is formal, from text or a photo. Read `CHECKTUR_CONTEXTO.md` (legal domain + product rules), `BLUEPRINT.md` (decisions), `docs/DISENO.md` (design system "Sello" v0.2 + mockup→route map), `docs/CATALOGO.md` (catalog model) and **`PENDIENTE.md` (what's next — priority 1: apply the `services` migration)** before working. `AGENTS.md` applies: this is Next.js 16 — check `node_modules/next/dist/docs/` before using Next APIs.

## Commands

```bash
npm run dev                       # local dev
npm run build                     # also type-checks; run `npx next typegen` if PageProps types are missing
npm run lint
npm test                          # node:test via tsx: lib/*.test.ts lib/**/*.test.ts
npx tsx --test lib/dictamen.test.ts   # single test file
npm run e2e                       # operator→admin→tourist flow against the REAL Supabase project; needs `npx next start -p 3456` running; creates and deletes its own data
npm run load:sunat -- <padron.txt> [AAAA-MM-DD]   # load SUNAT padrón reducido (needs SUPABASE_SERVICE_ROLE_KEY)
```

Deploy: Vercel project `checktur-piura`, auto-deploys on push to `main` (https://checktur-piura.vercel.app). Env vars (`.env.example`): Supabase URL + publishable key, `SUPABASE_SERVICE_ROLE_KEY` (server only; also the HMAC key source in `lib/firma.ts`), `GEMINI_API_KEY`.

## Architecture

- **Stack**: Next.js 16 App Router with `cacheComponents: true` → every page that reads `params`/`searchParams`/cookies/DB is a thin shell + an async component inside `<Suspense>`; call `await connection()` before `new Date()`. Middleware is `proxy.ts` (only refreshes Supabase session on `/operador`, `/admin`, `/ingresar`).
- **Supabase is the backend.** Schema lives only in `supabase/migrations/` (applied to the remote project via the Supabase MCP `apply_migration`; after applying, rename the local file to the version reported by `list_migrations`). `lib/database.types.ts` is generated — regenerate after migrations. Seed data (`supabase/seed.sql`) is fictitious: RUC `209999999xx`, plates `MUE###`, names with "(muestra)"; never invent data about real companies.
- **Security model (non-obvious, enforced in SQL):** Supabase grants ALL on new tables by default, so migrations `revoke all` then grant per column. Tourists (anon) only read registries and public review columns. `submissions` and `reviews` are **inserted only by server actions with the service-role client** after validation (no INSERT grant). `review_contactos` has no grants at all. Admin = `app_metadata.rol = 'admin'` (`es_admin()` in SQL, `exigirAdmin()` in `lib/sesion.ts`); pages that read with service role must call `exigirAdmin()` first.
- **Dictamen (verdict)**: `lib/dictamen.ts` pure rules → estado `verificado | observaciones | actualizacion | no_encontrado | alerta`. All tourist-facing text lives in `config/textos.ts` (wording rules: never "informal/ilegal/estafa/fraude"); tunable values in `config/reglas.ts`. Data access for the tourist flow in `lib/consultas.ts` (input → `clasificarEntrada` → `resolver`; name search is the SQL RPC `buscar_prestadores` using `normalizar_nombre`).
- **Image/AI seam**: `lib/vision/gemini.ts` is the only provider-specific file (REST + JSON Schema). `lib/vision/index.ts` defines schemas and sanitizes model output (treat it as untrusted). Used for: photo search (`lib/consulta-imagen.ts`, priority RUC > plate > social account/phone > name), operator documents, and review receipts.
- **Ad observations** (from a photo search) never go in the URL and never change the official estado: stored in a signed httpOnly cookie (`lib/anuncio.ts`) and shown in a separate block.
- **Operator flow**: browser uploads straight to Storage bucket `documentos/<user_id>/…` (avoids Vercel body limit) → `app/operador/acciones.ts` validates and inserts → `lib/validacion.ts` hashes, extracts and runs the 8 verification layers in `lib/checks/` (pure) → admin approves in `/admin` → `publicarValidacion` publishes the provider as "En proceso de actualización" for 60 days using only SUNAT/document data (never operator-declared name/phone).
- **Reviews**: only with a payment receipt whose issuer RUC equals the provider's (`lib/resenas.ts`), one receipt = one review (unique index), pending until admin publishes; shown in a block separate from the verdict.
- **Catalog** (`lib/catalogo.ts`, `docs/CATALOGO.md`): table `services` (migration `20261011000000_catalogo_servicios.sql`, **not yet applied remotely**; its type in `database.types.ts` was hand-added). Only providers whose dictamen is `verificado | observaciones | actualizacion` are listed (reuses `dictamenPrestador`). If the table is missing (PostgREST `PGRST205`), `listarServicios` returns `{disponible:false, proveedores}` and pages fall back to provider cards — keep that fallback until the migration is live. Routes: `/` (W01), `/explorar?c&d&q&o` (W02), `/experiencia/[id]` (W04, WhatsApp/llamada panel, no bookings/payments), `/verificar` (verifier entry), `/guardados` (localStorage only). Every catalog read calls `await connection()` first.
- **Design system "Sello" v0.2** (`docs/DISENO.md`, mockups in `docs/disenos/`): tokens only in `app/globals.css` (light + dark via `prefers-color-scheme`, no toggle), fonts Bricolage Grotesque / Atkinson Hyperlegible / JetBrains Mono (`<Mono>` only for RUC, plates, n.°, dates), base components in `components/ui.tsx` (`Sello`, `InsigniaEstado`, `ChipProceso`, `Boton`/`claseBoton`, `Campo`/`claseControl`, `Pagina`, `Contenedor`, `BarraAccion`), nav in `components/navegacion.tsx` (client, wrapped in `<Suspense>` in the layout), showcase at `/estilos`. Components must use semantic tokens, not raw colors (illustrations in `components/ilustracion.tsx` are the only exception). UI glossary: "proveedor" (never "prestador"/"operador" in visible text; routes/code names unchanged); no first-person voice ("No pudimos…").
- Demo/test fixtures: `data/muestras/` (see its `LEEME.md`).
