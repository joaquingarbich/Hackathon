# CheckTur Piura — Blueprint

> Decisiones cerradas el 10/10/2026 sobre `CHECKTUR_CONTEXTO.md`. Si algo choca, manda este archivo; las secciones 4, 5 y 6 del contexto (verificación, entradas, dictamen) siguen siendo la especificación funcional.

## 1. Restricciones

- 24 h, 3 personas con nivel parejo.
- Compromiso: **Fases 0–3**. Fase 4 (reseñas) solo versión mínima si sobra tiempo. Fase 5 = pulido.
- Solo español. Todo intercambiable: costuras explícitas (sección 4).

## 2. Stack

| Pieza | Elección |
|---|---|
| App + API | Next.js (App Router) + TypeScript + Tailwind |
| BD / Auth / Archivos | Supabase: Postgres + `pg_trgm` + `unaccent`, Auth (email), Storage privado |
| Deploy | Vercel conectado al repo de GitHub (deploy por push desde la hora 1) |
| Visión | Gemini (nivel gratuito, key de Google AI Studio) detrás de `lib/vision/` |
| QR | `jsQR` en el navegador (no el modelo) |
| PWA | Solo `manifest.json` + íconos. Sin service worker. |

## 3. Alcance de prestadores

| Tipo | Nivel |
|---|---|
| Agencia | Reglas completas + constancia subible + advertencias (mayorista, art. 22, aventura) |
| Transporte terrestre | Reglas completas: placa, TUC, vencimientos, modalidad, empresa distinta. TUC subible |
| Guía | Regla completa: carné en padrón |
| Hospedaje, restaurante | Dictamen genérico: figura en padrón + RUC activo/habido |
| Transporte acuático | **Fuera** |

**Actividades:** campo `providers.actividades text[]` (city tour, aventura, vivencial, gastronómico…) tomado de "modalidades y tipo de turismo" del Directorio. Nueva advertencia: *ofrece aventura y no consta certificado de aventura* (art. 17.4 D.S. 005-2020). No hay catálogo de tours ni reservas.

## 4. Costuras (lo que se puede cambiar sin tocar el resto)

```
config/reglas.ts      valores [VERIFICAR]: caducidad validación (60 d), mín. reseñas (3),
                      dominios oficiales QR, umbral trigramas, n.º candidatos (3)
config/textos.ts      TODOS los textos del dictamen y advertencias (reglas de redacción, sección 6)
lib/vision/           extract(file, tipo) → JSON con certeza por campo. Hoy: gemini.ts
lib/checks/           una función por capa de verificación (2–8). Devuelven {capa, ok, detalle}
lib/dictamen.ts       entidad + ruc_status + vehículos + submissions → {estado, advertencias, fuentes}
scripts/load-*.ts     un loader por fuente → tablas normalizadas
app/globals.css       design tokens (@theme). Componentes solo usan tokens semánticos
components/ui.tsx     Boton, Tarjeta, InsigniaEstado, Campo, Plegable (vitrina en /estilos)
supabase/migrations/  único lugar donde cambia el esquema
```

## 5. Datos

1. **Directorio MINCETUR**: export manual filtrado a Piura (agencias, hospedajes, restaurantes, guías). Datos reales, sin modificar → casos verdes.
2. **SUNAT padrón reducido**: `npm run load:sunat -- <archivo.txt>` carga **todo ubigeo de Piura (20…) + los RUC de `providers`**. Hace falta todo Piura para cruzar RUC de operadores nuevos (capa 4).
3. **Transporte**: 5–10 vehículos ficticios "muestra": vigente, TUC vencida, modalidad trabajadores, otra empresa.
4. **Operador demo**: "Tours Ejemplo Máncora S.A.C. (muestra)" + constancia ficticia con formato Anexo III.
5. Cada fuente registra `fecha_corte` en `sources` y se muestra en el dictamen.

**Regla dura:** empresas reales solo con sus datos oficiales tal cual. Estados negativos, reseñas y casos de demo solo sobre entidades ficticias marcadas como "muestra".

## 6. Identidad y roles

- **Turista:** sin login. Reseñas por `device_hash`.
- **Operador:** Supabase Auth (email). Declara RUC. Sin verificación de identidad en el registro; nada se publica sin admin. Segunda solicitud del mismo RUC desde otra cuenta → advertencia al admin.
- **Admin:** `app_metadata.rol = 'admin'` (el usuario no puede editarlo). Asignar en el SQL editor:
  `update auth.users set raw_app_meta_data = raw_app_meta_data || '{"rol":"admin"}' where email = '...';`
- Storage de documentos privado: solo el dueño y el admin (RLS).

## 7. Diseño

Construir con `/ui-ux-pro-max`. Móvil primero, sobrio, tipo "servicio público confiable".
- Pantalla de consulta: un campo + botón grande de cámara.
- Dictamen: tarjeta de estado arriba con **color + ícono + palabra**; debajo, plegables: datos, autorizaciones, advertencias, fuentes y fecha de corte; "Opiniones de usuarios" separado.
- Sin logos del Estado ni distintivo MINCETUR. Wordmark "CheckTur Piura" + escudo con check.

## 8. Fases (cada una demostrable)

| Fase | Entregable |
|---|---|
| 0 | Repo + Next.js + Supabase + Vercel. Migraciones, loaders, datos semilla, design tokens |
| 1 | Nombre / RUC / placa → candidatos → dictamen completo |
| 2 | Foto de logo y captura de redes → `extract` → mismo flujo |
| 3 | Operador sube constancia/TUC → capas → panel admin → estado azul |
| 4 | Reseñas mínimas: estrellas + comentario, promedio desde 3, reportar, ocultar |
| 5 | Manifest, estados vacíos/error, página de fuentes |

**Guion de demo:** agencia real → verde · placa muestra con TUC vencida → rojo · captura de un operador muestra → gris · el operador sube constancia, el admin aprueba → azul.

## 9. Setup pendiente (humano)

- [x] Repo: https://github.com/joaquingarbich/Hackathon
- [x] Proyecto Supabase `checktur-piura` (ref `hrycpqowvaixewbjdsbf`, sa-east-1) con migración y seed aplicados. Falta: `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`
- [ ] Conectar Vercel al repo y cargar las env vars
- [ ] Key de Gemini → `GEMINI_API_KEY` (necesaria recién en la Fase 2)
- [ ] Export del Directorio MINCETUR (Piura) → `data/raw/` (su loader se escribe al ver el formato real)
- [ ] Padrón reducido SUNAT → `data/raw/` (no se sube al repo)

## 10. Para la mentora (sin bloquear)

Preguntas 1–5 y 8 de la sección 12 del contexto. Las respuestas solo tocan `config/` y `scripts/`.
