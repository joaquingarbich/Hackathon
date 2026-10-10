# Catálogo de servicios (web cliente)

La web del turista es un **catálogo tipo booking**: experiencias, hospedajes, restaurantes y transporte de Piura. Lo principal son las agencias y proveedores. Si un servicio está publicado, el proveedor ya pasó el control de formalidad. El verificador (`/verificar`) queda para lo que se ofrece fuera de CheckTur.

No hay reservas ni pagos: la ficha arma un mensaje de WhatsApp o una llamada al **teléfono registrado** del proveedor.

## Modelo: `public.services`

Migración: `supabase/migrations/20261011000000_catalogo_servicios.sql`. **Todavía no está aplicada**; ver `PENDIENTE.md`, prioridad 1.

| Columna | Uso |
|---|---|
| `provider_id` | FK a `providers`; solo proveedores registrados |
| `categoria` | `experiencia` · `hospedaje` · `restaurante` · `transporte` (= `CATEGORIAS` en `config/textos.ts`) |
| `destino` | id de `DESTINOS` (`mancora`, `los_organos`, `colan_paita`, `catacaos`, `chulucanas`, `piura`) |
| `nombre`, `descripcion`, `duracion`, `salidas`, `temporada`, `idiomas`, `grupo_max` | Ficha |
| `incluye`, `no_incluye` (`text[]`), `itinerario` (`jsonb [{titulo, detalle}]`) | Ficha |
| `punto_encuentro`, `condiciones` | Ficha |
| `precio_ref`, `unidad_precio` | Precio referencial ("por persona", "por noche", "por plato", "por unidad") |
| `ilustracion`, `fotos` | Clave de `components/ilustracion.tsx` mientras no haya fotos |
| `estado` | `pendiente` · `publicado` · `rechazado`. El público solo ve `publicado` |

**Seguridad:** sigue el mismo patrón que el resto. `revoke all`, `grant select` y la política `estado = 'publicado' or es_admin()`. Anon y authenticated no tienen INSERT ni UPDATE: hoy las altas las hace el admin o el SQL con service role. El formulario de la agencia, con validación previa, está pendiente.

**Datos de muestra:** `supabase/seed_catalogo.sql` crea 3 proveedores ficticios nuevos (RUC `2099999995x`–`2099999997x`, "(muestra)") y 6 servicios publicados. Se corre una vez, después de `seed.sql` y de la migración.

## Reglas de publicación (`lib/catalogo.ts`)

- Cada servicio se muestra con el estado del dictamen de su proveedor, calculado con `dictamenPrestador`, la misma regla del verificador.
- **Se excluyen** los proveedores en `alerta` y los `no_encontrado` (validación caducada). Solo quedan `verificado`, `observaciones` y `actualizacion`.
- Etiqueta en la tarjeta solo si no es "Verificado" (`ETIQUETA_CATALOGO`).
- La valoración es el promedio de las opiniones publicadas **del proveedor**, porque las reseñas son por proveedor y no por servicio. Se muestra desde `REGLAS.minimoResenasParaPromedio` opiniones.

## Respaldo mientras la tabla no exista

Si PostgREST responde `PGRST205` (o Postgres `42P01`), `listarServicios` devuelve `{ disponible: false, proveedores }`. Entonces:

- `/` y `/explorar` muestran los **proveedores registrados** como tarjetas, filtrados por categoría (`CATEGORIAS[].tipos`), con un aviso de que el catálogo se está cargando.
- `/experiencia/[id]` responde 404, y `/prestador/[id]` no muestra la sección "Servicios publicados".

Así producción no se rompe antes de aplicar la migración. El respaldo se probó en local con un stub de PostgREST, con la tabla y sin ella.

## Rutas

- `/`: portada (W01). Buscador por destino y texto, destinos con conteo y mejor valorados.
- `/explorar?c=&d=&q=&o=precio`: resultados (W02). Funciona sin JS.
- `/experiencia/[id]`: ficha (W04). El panel de consulta (`components/consulta-proveedor.tsx`) arma el texto para `wa.me/51…`.
- `/guardados`: favoritos en `localStorage` (`components/guardados.tsx`), sin cuenta.
