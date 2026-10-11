# Estado y pendientes — actualizado 11/10/2026 (rediseño «Claro» v1; sin escáner ni foto; FAQ)

Producción: https://checktur-piura.vercel.app · Supabase `hrycpqowvaixewbjdsbf` · deploy automático por push a `main`.
**Reenfoque hecho:** el núcleo es VERIFICAR; el directorio por destino es secundario; sin precios ni reseñas en la cara del turista.

## Rutas

| Ruta | Para qué |
|---|---|
| `/` | Solo el buscador «Verifica antes de pagar o subir» (chip con el tipo detectado) y los casos de uso, que se despliegan ahí mismo con los pasos |
| `/consulta?q=` | Resultado: empresa, placa, celular/Yape/Plin/cuenta (pertenece o NO registrado), «¿Quizás buscabas…?» con aviso de suplantación |
| `/prestador/[id]` | Ficha de empresa: estado, foto, destinos, canales oficiales, WhatsApp oficial, compartir, reportar; documentos/vehículos/personal plegados |
| `/vehiculo/[placa]` | Ficha de la unidad con foto, «¿Qué empresa te dijeron?», compartir «Estoy en la van placa…» |
| `/persona/[id]` | Guía/conductor/vendedor: foto, rol, DNI •••••123, carné |
| `/v/[id]` | Destino de los QR impresos (empresa, vehículo o persona) |
| `/destinos?d=&t=` | Directorio: elegir destino → empresas que lo declararon + «otras empresas registradas en la zona» (sin destinos declarados, por distrito); cada tarjeta abre la ficha completa |
| `/faq` | Preguntas frecuentes (textos en `TEXTO_FAQ`) |
| `/reportar` | Reporte del turista + dónde acudir |
| `/operador` · `/operador/agencia/[id]` · `/operador/agencia/[id]/qr` | Panel de la empresa: documentos, vencimientos, destinos, canales, vehículos, personal, perfil, servicios, QR imprimibles |
| `/admin` | Documentos, altas (canales/vehículos/personal), servicios, perfiles, reportes, búsquedas sin resultado por destino |

## Cómo probar los casos del seed (datos ficticios)

| Caso | Qué hacer | Qué se ve |
|---|---|---|
| Placa verificada | Buscar `MUE-001` (o `MUE-006`) | Verificado, foto de la van, empresa titular, compartir |
| Yape no registrado | Buscar `900 000 999` | «Este número NO está registrado… No pagues» |
| Yape registrado | Buscar `900 000 202` | Pertenece a Ballena Azul Tours (Yape, Plin) |
| Posible suplantación | Buscar `Ballena Asul Tours` | «¿Quizás buscabas…?» Ballena Azul Tours + «podría ser una suplantación» |
| SOAT vencido | Abrir Movilidad Ejemplo (buscar `20999999914`) o `MUE-005` | Con observaciones: «La unidad MUE005 tiene el SOAT vencido» |
| En proceso de actualización | Buscar `Sol del Norte Expediciones` | En proceso de actualización (violeta) |
| Placa de otra empresa | `MUE-001` → «¿Qué empresa te dijeron?» → `Ballena Azul Tours` | «Ojo: la placa MUE-001 pertenece a Ejemplo Norte Traslados…» |
| QR | Abrir `/v/00000000-0000-4000-b000-000000000002` (o apuntar la cámara del teléfono a su QR impreso) | Ficha de Rosa (guía de Ballena Azul) con foto y DNI •••••456 |
| Carné vencido | `/persona/00000000-0000-4000-b000-000000000004` | Jorge, con observaciones por carné vencido |
| Directorio | `/destinos?d=mancora` | Empresas que declararon Máncora + otras registradas en la zona (con aviso de destinos sin declarar) |
| Flujo en vivo (gris → azul) | Buscar RUC `20999999931`; luego subir `data/muestras/constancia-mancora.pdf` en `/operador` y aprobar en `/admin` | Tours Ejemplo Máncora pasa de No encontrado a En proceso de actualización |

## Falta
- Probar el **alta de empresa con un correo real** (Supabase rechaza dominios de prueba) y definir el **admin real** (`update auth.users set raw_app_meta_data = raw_app_meta_data || '{"rol":"admin"}' where email = '…';`).
- **Datos reales**: export MINCETUR (loader pendiente) y padrón SUNAT (`npm run load:sunat -- <archivo>`).
- Editar un canal/vehículo/persona ya aprobado (hoy: retirar y volver a registrar).
- «Ballena Asul» y otros parecidos se registran como «candidatos», no como «no encontrado»: si se quiere fiscalizarlos, sumar ese estado a la lista del admin.
- Mockups sin implementar: English, validación de RUC/SMS en el registro (P02/P04), licencia municipal en el dictamen (C03).
- Mover el proyecto fuera del Escritorio sincronizado con iCloud (crea copias «archivo 2»; ya excluidas en `tsconfig.json`).
