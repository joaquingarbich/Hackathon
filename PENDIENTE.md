# Pendiente (próxima sesión) — actualizado 10/10/2026, noche

Producción: https://checktur-piura.vercel.app · Supabase `hrycpqowvaixewbjdsbf` · deploy automático por push a `main`.
Base limpia para la demo: Tours Ejemplo Máncora en gris, 6 servicios de muestra publicados, sin cuentas ni usuarios de prueba.

## Hecho y verificado en producción (playwright-cli, 10/10)
- **Catálogo** (cara del turista): migración `services` aplicada y seed cargado. Portada con «Mejor valoradas», `/explorar` por categoría y destino, ficha con itinerario y WhatsApp al celular registrado, «Servicios publicados» en el proveedor.
- **Verificador**: texto (10 casos), foto (2), dictamen con sus 5 estados.
- **Agencias** (cara del proveedor): documento aprobado ⇒ la cuenta administra la agencia (`proveedor_cuentas`); `/operador/agencia/[id]` con perfil (cambios en revisión) y alta de servicios (en revisión). Recorrido completo probado: constancia → aprobación → perfil → servicio → publicado en el catálogo.
- **Administración**: documentos, opiniones, **servicios** (publicar / pedir corrección con motivo), **cambios de perfil** (comparación antes → después), métricas de consultas de 7 días.
- **Opiniones** con comprobante: probadas en producción (RUC ajeno rechazado, publicación con sello, sin datos privados).
- **Límite de frecuencia** en foto, opiniones y documentos (`lib/limite.ts`, Postgres).

## Falta
1. **Fotos reales** por servicio y de la agencia (bucket público + `services.fotos`; hoy hay ilustraciones).
2. **Editar** un servicio ya creado (hoy: retirar y volver a crear) y responder opiniones desde la agencia (`respuesta_prestador` existe en la BD).
3. Admin: gestión de usuarios/roles desde la UI, reasignar dueño de una agencia (hoy por SQL en `proveedor_cuentas`), sección «Padrones» del mockup.
4. Opiniones por servicio (hoy por proveedor), mapa en resultados, filtro por fecha.
5. Mockups sin implementar (`docs/disenos`): botón English (i18n), registro con validación de RUC contra SUNAT (P02) y código por SMS (P04), pestañas Unidades/Perfil del proveedor, licencia municipal en el dictamen (C03), galería de fotos, compartir y reportar dictamen, pasos de «Leyendo captura» (C01b).

## Necesita al equipo
- **Correo del admin real** → `update auth.users set raw_app_meta_data = raw_app_meta_data || '{"rol":"admin"}' where email = '…';`
- **Datos reales**: export MINCETUR (Piura) → falta su loader; padrón SUNAT → `npm run load:sunat -- <archivo>`.
- Probar el **alta de proveedor con un correo real** (Supabase rechaza dominios de prueba como `example.com`).
- Mover el proyecto fuera del Escritorio sincronizado con iCloud (crea copias «archivo 2» en `.next`; si `tsc` falla con «Duplicate identifier», borrar `find .next -name "* [0-9]*" -delete`).
