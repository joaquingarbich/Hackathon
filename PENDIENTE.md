# Pendiente (próxima sesión) — 10/10/2026

Producción: https://checktur-piura.vercel.app · Supabase `hrycpqowvaixewbjdsbf` · deploy automático por push a `main`.

## Visión aclarada por el equipo: 3 interfaces, todo gira en torno a las agencias

1. **Cliente final (turista)** — HECHO: búsqueda por nombre/RUC/placa/foto → dictamen; opiniones con comprobante.
   **FALTA: explorar por servicio.** Página `/explorar` con filtros por categoría (tours, actividades/aventura, transporte, estadía/hospedaje, gastronomía…) y zona, que liste agencias/prestadores que lo ofrecen, cada uno con su estado de formalidad. Requiere un catálogo de servicios por agencia (ver 3). Sin reservas ni pagos (fuera de alcance).
2. **Administración** — HECHO: `/admin` cola de documentos (8 capas) y de opiniones; aprobar/rechazar con motivo.
   FALTA: aprobar/editar perfiles y servicios de agencias (ver 3), gestionar usuarios/roles desde UI, métricas básicas (consultas en `lookups`).
3. **Agencias** — HECHO a medias: `/operador` sube constancia o TUC y ve el estado.
   **FALTA: registro completo de la agencia**: vincular cuenta ↔ agencia (RUC), perfil (nombre comercial, descripción, dirección, contacto, redes, fotos), **servicios/tours ofrecidos** (nombre, categoría, descripción, precio referencial, fotos), editar todo, y que los cambios pasen por validación del admin antes de publicarse.

Propuesta de modelo: tabla `services` (id, provider_id, categoria, nombre, descripcion, precio_ref, fotos, estado pendiente|publicado|rechazado) + `providers.owner_user_id` y perfil editable con cambios en estado pendiente. Reusar `lib/checks`, `/admin` y el design system.

## Bugs / ajustes detectados en la verificación manual (playwright-cli, producción)
- `/ingresar`: errores de Supabase Auth salen crudos y en inglés ("Email address … is invalid"). Mapear a español en `app/ingresar/acciones.ts`.
- El registro público valida el dominio del correo: probar el alta de operador con un correo real.
- Verificado OK en producción: búsqueda por texto (10 casos), foto (2), operador→admin→azul. **Opiniones: quedó a medias** (interrumpido); el e2e local `scripts/e2e-resenas.mjs` sí pasó 14/14.

## Limpieza pendiente en la base (datos de la verificación manual)
- Usuarios `operador.manual@checktur.test` y `admin.manual@checktur.test`.
- Prestador publicado "Tours Ejemplo Máncora" (source `checktur_validacion`, RUC 20999999931), su autorización y la solicitud aprobada + archivo en Storage. Devolverlo a gris para la demo en vivo.
- Posibles opiniones "(verificación manual)" en Colán Aventura.

## Otros pendientes
- Correo del admin real → `update auth.users set raw_app_meta_data = raw_app_meta_data || '{"rol":"admin"}' where email = '…';`
- Export MINCETUR (Piura) + padrón SUNAT (`npm run load:sunat`) para tener prestadores reales en verde.
- Límite de frecuencia en consultas por foto y opiniones (cuota de Gemini).
- Mover el proyecto fuera del Escritorio sincronizado con iCloud (crea copias "archivo 2").
