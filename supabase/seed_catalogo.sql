-- Catálogo de MUESTRA, ficticio. Correr después de seed.sql y de la migración catalogo_servicios.
-- Proveedores de muestra nuevos (RUC 209999999xx con dígito verificador válido, sufijo "(muestra)")
-- + servicios publicados para la demo del catálogo. Nada corresponde a empresas reales.

insert into public.ruc_status (ruc, razon_social, estado, condicion, ubigeo, source_id) values
  ('20999999957', 'BALLENAS EJEMPLO ORGANOS S.A.C. (MUESTRA)', 'ACTIVO', 'HABIDO', '200704', 'muestra'),
  ('20999999965', 'HOSPEDAJE EJEMPLO MANCORA E.I.R.L. (MUESTRA)', 'ACTIVO', 'HABIDO', '200704', 'muestra'),
  ('20999999973', 'CEVICHERIA EJEMPLO PAITA S.A.C. (MUESTRA)', 'ACTIVO', 'HABIDO', '200501', 'muestra')
on conflict (ruc) do nothing;

insert into public.providers (id, tipo, ruc, razon_social, nombre_comercial, clases, modalidad, actividades, direccion, distrito, provincia, telefono, redes, es_muestra, source_id) values
  ('00000000-0000-4000-a000-000000000011', 'agencia', '20999999957', 'Ballenas Ejemplo Órganos S.A.C. (muestra)', 'Ballenas Costa Ejemplo (muestra)', '{operador}', 'presencial_digital', '{naturaleza,playa}', 'Muelle Ejemplo s/n', 'Los Órganos', 'Talara', '900000011', '{"instagram": "@ballenas.costa.muestra"}', true, 'muestra'),
  ('00000000-0000-4000-a000-000000000012', 'hospedaje', '20999999965', 'Hospedaje Ejemplo Máncora E.I.R.L. (muestra)', 'Hostal Brisa Ejemplo (muestra)', '{}', 'presencial', '{}', 'Av. Piura Ejemplo 200', 'Máncora', 'Talara', '900000012', '{}', true, 'muestra'),
  ('00000000-0000-4000-a000-000000000013', 'restaurante', '20999999973', 'Cevichería Ejemplo Paita S.A.C. (muestra)', 'Cevichería La Punta Ejemplo (muestra)', '{}', 'presencial', '{gastronomico}', 'Malecón Ejemplo 12', 'Paita', 'Paita', '900000013', '{}', true, 'muestra')
on conflict (id) do nothing;

insert into public.authorizations (provider_id, tipo, entidad_emisora, numero, fecha_emision, fecha_vencimiento, source_id) values
  ('00000000-0000-4000-a000-000000000011', 'constancia_dircetur', 'DIRCETUR Piura (muestra)', 'CONST-0011-MUESTRA', '2024-03-12', null, 'muestra'),
  ('00000000-0000-4000-a000-000000000012', 'certificado_clasificacion', 'DIRCETUR Piura (muestra)', 'CLAS-0012-MUESTRA', '2023-06-01', null, 'muestra'),
  ('00000000-0000-4000-a000-000000000013', 'constancia_dircetur', 'DIRCETUR Piura (muestra)', 'CONST-0013-MUESTRA', '2022-11-20', null, 'muestra')
on conflict do nothing;

insert into public.services (provider_id, categoria, nombre, destino, descripcion, duracion, salidas, temporada, idiomas, grupo_max, incluye, no_incluye, itinerario, punto_encuentro, condiciones, precio_ref, unidad_precio, ilustracion, estado, es_muestra) values
  ('00000000-0000-4000-a000-000000000011', 'experiencia', 'Avistamiento de ballenas jorobadas (muestra)', 'los_organos',
   'Salida en bote desde el muelle de Los Órganos para ver ballenas jorobadas en su temporada de reproducción. El guía explica su comportamiento y la embarcación mantiene la distancia recomendada.',
   '3 horas', '7:00 y 10:00', 'Julio a octubre', '{Español,Inglés}', 12,
   '{"Guía bilingüe","Chaleco salvavidas para cada persona","Agua y snack"}', '{"Traslado desde Máncora (opcional, S/ 20)","Fotos profesionales"}',
   '[{"titulo":"Encuentro en el muelle","detalle":"charla de seguridad y entrega de chalecos (15 min)."},{"titulo":"Navegación","detalle":"mar adentro con el guía (2 h 15 min)."},{"titulo":"Regreso al muelle","detalle":"(30 min)."}]',
   'Muelle de Los Órganos, caseta de la agencia. Llega 15 minutos antes.',
   'Si el oleaje impide salir, la agencia reprograma o devuelve el pago. Avistamiento no garantizado: depende de la naturaleza.',
   120, 'por persona', 'ballenas', 'publicado', true),
  ('00000000-0000-4000-a000-000000000011', 'experiencia', 'Nado con tortugas en El Ñuro (muestra)', 'los_organos',
   'Visita al muelle de El Ñuro para nadar junto a tortugas marinas con chaleco y guía, respetando la distancia y sin alimentarlas.',
   '2 horas', '8:00, 11:00 y 14:00', 'Todo el año', '{Español}', 15,
   '{"Guía","Chaleco salvavidas"}', '{"Snorkel (alquiler S/ 10)","Traslado"}',
   '[{"titulo":"Encuentro en El Ñuro","detalle":"indicaciones de cuidado de las tortugas (10 min)."},{"titulo":"Nado guiado","detalle":"junto al muelle (1 h 30 min)."}]',
   'Entrada al muelle de El Ñuro.', 'Se suspende con mar movido; se reprograma sin costo.',
   60, 'por persona', 'tortuga', 'publicado', true),
  ('00000000-0000-4000-a000-000000000005', 'experiencia', 'Clase de surf en Colán (muestra)', 'colan_paita',
   'Clase para principiantes con tabla y traje incluidos, en la playa de Colán. Grupos pequeños y un instructor por cada cuatro personas.',
   '2 horas', '9:00 y 15:00', 'Todo el año', '{Español}', 8,
   '{"Tabla y traje","Instructor","Agua"}', '{"Traslado desde Paita"}',
   '[{"titulo":"Teoría en la arena","detalle":"seguridad y postura (20 min)."},{"titulo":"Práctica en el mar","detalle":"con el instructor (1 h 30 min)."}]',
   'Malecón de Colán, frente a la caseta de la agencia.', 'Si no hay olas aptas, se reprograma.',
   80, 'por persona', 'surf', 'publicado', true),
  ('00000000-0000-4000-a000-000000000012', 'hospedaje', 'Habitación doble frente al mar (muestra)', 'mancora',
   'Habitación con baño propio y terraza, a una cuadra de la playa de Máncora. Desayuno incluido.',
   null, 'Ingreso 14:00 · salida 12:00', 'Todo el año', '{Español,Inglés}', 2,
   '{"Desayuno","Wifi","Toallas de playa"}', '{"Estacionamiento"}', '[]',
   'Av. Piura Ejemplo 200, Máncora.', 'Cancelación sin costo hasta 48 h antes, según coordine el hospedaje.',
   180, 'por noche', 'hospedaje', 'publicado', true),
  ('00000000-0000-4000-a000-000000000013', 'restaurante', 'Ceviche de mero y chicharrón mixto (muestra)', 'colan_paita',
   'Cevichería familiar en el malecón de Paita con pesca del día.',
   null, 'Almuerzos de 11:00 a 16:00', 'Todo el año', '{Español}', null,
   '{"Pesca del día"}', '{}', '[]',
   'Malecón Ejemplo 12, Paita.', null,
   45, 'por plato', 'restaurante', 'publicado', true),
  ('00000000-0000-4000-a000-000000000001', 'transporte', 'Traslado aeropuerto de Piura – Máncora (muestra)', 'piura',
   'Traslado privado en unidad con autorización de transporte turístico.',
   '3 horas', 'A coordinar', 'Todo el año', '{Español}', 4,
   '{"Conductor","Equipaje de mano y bodega"}', '{"Paradas adicionales"}', '[]',
   'Salida del aeropuerto de Piura.', 'Pago y horario se coordinan con la empresa.',
   250, 'por unidad', 'transporte', 'publicado', true);
