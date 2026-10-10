# Pendiente (próxima sesión) — 10/10/2026

Producción: https://checktur-piura.vercel.app · Supabase `hrycpqowvaixewbjdsbf` · deploy automático por push a `main`.

## ⚠️ PRIORIDAD 1 — Base de datos del catálogo (hacer desde la PC con acceso a Supabase)

El catálogo nuevo (`/`, `/explorar`, `/experiencia/[id]`) necesita la tabla `services`, y **todavía no está aplicada**. Mientras falte, producción muestra la lista de proveedores registrados como respaldo y `/experiencia/*` responde 404 (`docs/CATALOGO.md`).

1. Aplicar `supabase/migrations/20261011000000_catalogo_servicios.sql` con el MCP de Supabase (`apply_migration`, nombre `catalogo_servicios`).
2. Renombrar el archivo local a la versión que reporte `list_migrations` (regla de `CLAUDE.md`).
3. Correr `supabase/seed_catalogo.sql` (`execute_sql`). Crea 3 proveedores "(muestra)" y 6 servicios publicados. Se corre una sola vez.
4. Regenerar `lib/database.types.ts` (`generate_typescript_types`). El bloque `services` se añadió a mano y debe quedar igual.
5. Revisar con `get_advisors` (security) que `services` no tenga avisos de RLS.
6. Verificar en producción: `/` muestra "Mejor valoradas", `/explorar?c=hospedaje` filtra, la ficha de ballenas abre el panel de WhatsApp y `/prestador/…0011` lista "Servicios publicados".

## Visión aclarada por el equipo: 3 interfaces, todo gira en torno a las agencias

1. **Cliente final (turista)**:
   - **HECHO (10/10, rediseño Sello v0.2):** web tipo catálogo con portada, resultados por categoría/destino/texto, ficha de experiencia con consulta por WhatsApp o llamada, Guardados (localStorage) y verificador en `/verificar`. Ver `docs/CATALOGO.md` y `docs/DISENO.md`. Solo falta aplicar la BD (prioridad 1).
   - FALTA: fotos reales por servicio (bucket público + `services.fotos`), opiniones por servicio (hoy son por proveedor), mapa en resultados y filtro por fecha o disponibilidad. Sin reservas ni pagos (fuera de alcance).
2. **Administración**:
   - HECHO: `/admin` cola de documentos (8 capas) y de opiniones; aprobar o pedir corrección con motivo. Rediseñado con A02/A03.
   - FALTA: alta, edición y publicación de servicios (`services.estado`) desde la UI; aprobar/editar perfiles de agencias; gestionar usuarios y roles; métricas básicas (consultas en `lookups`); sección "Padrones" del mockup.
3. **Agencias (proveedor)**:
   - HECHO a medias: `/operador` sube constancia o TUC, ve "Lo que ve hoy un turista" y el estado de sus documentos (rediseño P05/P07).
   - **FALTA: registro completo de la agencia**:
     - vincular cuenta ↔ agencia (`providers.owner_user_id`);
     - perfil (nombre comercial, descripción, dirección, contacto, redes, fotos);
     - **formulario de servicios** que escriba en `services` con `estado = 'pendiente'` y que el admin publique (necesita grants o server action con service role).

### No implementado de los mockups (docs/disenos)
- Botón **English** (i18n).
- Registro del proveedor: paso del RUC con validación contra SUNAT (P02) y **código de verificación por SMS** (P04).
- Pestañas del proveedor **Unidades** y **Perfil** (barra de pestañas P05); matrícula de embarcaciones y permiso de transporte acuático (P07).
- **Licencia de funcionamiento** municipal en el dictamen (C03).
- Galería "Ver las N fotos", "Compartir dictamen", "Reportar un problema con este dictamen".
- C01b "Leyendo captura" con pasos y certeza por campo (hoy solo "Leyendo la imagen…").

## Bugs / ajustes detectados en la verificación manual (playwright-cli, producción)
- HECHO: errores de Supabase Auth en `/ingresar` traducidos a español.
- El registro público valida el dominio del correo: probar el alta de operador con un correo real.
- Verificado OK en producción: búsqueda por texto (10 casos), foto (2), operador→admin→azul. **Opiniones: quedó a medias** (interrumpido); el e2e local `scripts/e2e-resenas.mjs` sí pasó 14/14.

## Limpieza de la base — HECHA 10/10 (Máncora vuelve a gris, usuarios de prueba borrados)
- Usuarios `operador.manual@checktur.test` y `admin.manual@checktur.test`.
- Prestador publicado "Tours Ejemplo Máncora" (source `checktur_validacion`, RUC 20999999931), su autorización y la solicitud aprobada + archivo en Storage. Devolverlo a gris para la demo en vivo.
- Posibles opiniones "(verificación manual)" en Colán Aventura.

## Otros pendientes
- Correo del admin real → `update auth.users set raw_app_meta_data = raw_app_meta_data || '{"rol":"admin"}' where email = '…';`
- Export MINCETUR (Piura) + padrón SUNAT (`npm run load:sunat`) para tener prestadores reales en verde.
- Límite de frecuencia en consultas por foto y opiniones (cuota de Gemini).
- Mover el proyecto fuera del Escritorio sincronizado con iCloud (crea copias "archivo 2").
