# Modelo de verificación

El núcleo es **verificar un dato** (placa, celular/Yape/Plin, cuenta, RUC o nombre) y decir a qué empresa pertenece y en qué estado está. El directorio por destino es secundario.

## Lo que una empresa registra (y el turista puede verificar)

| Tabla | Qué guarda | Público ve | Alta |
|---|---|---|---|
| `providers` | RUC, razón social, nombre comercial, tipo, `foto_url`, `descripcion` | todo | padrón oficial o validación del admin |
| `canales` | WhatsApp, teléfono, Yape, Plin, cuenta bancaria, redes, web | `tipo`, `visible` (cuentas: `•••• 1234`) — **nunca `valor`** | empresa → **pendiente** → admin |
| `vehicles` | placa, `foto_url`, `autorizacion_mtc`, TUC, SOAT, revisión técnica, habilitación | solo `aprobacion = 'aprobado'` | empresa → **pendiente** → admin |
| `personal` | nombre, rol, **solo 3 últimos dígitos del DNI**, foto, carné de guía | solo `estado = 'aprobado'` | empresa → **pendiente** → admin |
| `empresa_destinos` | destinos de la lista fija `DESTINOS` | todo | empresa (directo) |
| `authorizations` | constancias, certificados, autorizaciones con vencimiento | todo | padrón / admin |

- `canales.valor`: celular = 9 dígitos; red = usuario en minúsculas; web = dominio; **banco = sha256 de los dígitos** (la cuenta completa nunca se guarda). La búsqueda la hace el servidor con service role (`empresasPorCanal`) y devuelve solo datos públicos. Un mismo número o cuenta no puede quedar aprobado para dos empresas (índice único parcial).
- Fotos: bucket público `fotos` (las sube el servidor). Documentos, comprobantes y fotos de reportes: bucket privado `documentos`.

## Estado (`lib/dictamen.ts`)

Los 5 estados de siempre. Además, `dictamenPrestador(…, { vehiculos, personal })` suma la flota y el personal: **SOAT, revisión técnica o carné vencidos ⇒ "Con observaciones" automáticamente**, también sobre "En proceso de actualización". Por vencer en 30 días: aviso.

## Búsqueda (`clasificarEntrada` → `resolver`)

11 dígitos con prefijo 10/15/17/20 → RUC · 9 dígitos que empiezan con 9 (o +51) → celular/Yape/Plin · 13–20 dígitos → cuenta bancaria · `ABC-123` / `A1B-234` → placa · resto → nombre (difuso; sin coincidencias, sugerencias con umbral bajo y aviso de posible suplantación).

## QR

`/v/[id]` abre en vivo la ficha de la empresa, el vehículo o la persona (`resolverQr`). La empresa imprime sus QR en `/operador/agencia/[id]/qr` (stickers, carnet, vitrina; PDF con la impresión del navegador). `/escanear` lee con la cámara (`BarcodeDetector` o `jsqr`) y solo abre QR de este mismo sitio.

## Datos de muestra

`supabase/seed.sql` → `seed_catalogo.sql` → `seed_verificacion.sql` (en ese orden; todos ficticios). Fotos de muestra en `public/muestras/`.
