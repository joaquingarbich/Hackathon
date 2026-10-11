-- Datos de MUESTRA, ficticios. No corresponden a empresas reales.
-- RUC 209999999xx con dígito verificador válido; placas MUE###.
-- Cada fila lleva es_muestra = true y el sufijo "(muestra)" en el nombre.
-- Pensado para correr una sola vez sobre una BD recién migrada.

insert into public.sources (id, nombre, url, fecha_corte, n_registros) values
  ('muestra', 'Datos de muestra CheckTur (ficticios)', null, '2026-10-10', null)
on conflict (id) do update set fecha_corte = excluded.fecha_corte;

insert into public.ruc_status (ruc, razon_social, estado, condicion, ubigeo, source_id) values
  ('20999999906', 'TRANSPORTES EJEMPLO NORTE S.A.C. (MUESTRA)',  'ACTIVO', 'HABIDO', '200101', 'muestra'),
  ('20999999914', 'MOVILIDAD EJEMPLO SULLANA E.I.R.L. (MUESTRA)', 'ACTIVO', 'HABIDO', '200601', 'muestra'),
  ('20999999922', 'MAYORISTA EJEMPLO PIURA S.A.C. (MUESTRA)',    'ACTIVO', 'HABIDO', '200101', 'muestra'),
  ('20999999931', 'TOURS EJEMPLO MANCORA S.A.C. (MUESTRA)',      'ACTIVO', 'HABIDO', '200704', 'muestra'),
  ('20999999949', 'AVENTURA EJEMPLO COLAN S.A.C. (MUESTRA)',     'ACTIVO', 'HABIDO', '200501', 'muestra')
on conflict (ruc) do nothing;

-- Tours Ejemplo Máncora (20999999931) NO está en providers a propósito:
-- es el caso "No encontrado" que luego sube su constancia (demo gris → azul).

insert into public.providers (id, tipo, ruc, razon_social, nombre_comercial, clases, modalidad, actividades, direccion, distrito, provincia, telefono, redes, es_muestra, source_id) values
    ('00000000-0000-4000-a000-000000000001', 'transporte_terrestre', '20999999906', 'Transportes Ejemplo Norte S.A.C. (muestra)', 'Ejemplo Norte Traslados (muestra)', '{}', null, '{}', 'Av. Ejemplo 123', 'Piura', 'Piura', '900000001', '{}', true, 'muestra'),
    ('00000000-0000-4000-a000-000000000002', 'transporte_terrestre', '20999999914', 'Movilidad Ejemplo Sullana E.I.R.L. (muestra)', 'Movilidad Ejemplo (muestra)', '{}', null, '{}', 'Calle Ejemplo 45', 'Sullana', 'Sullana', '900000002', '{}', true, 'muestra'),
    ('00000000-0000-4000-a000-000000000003', 'agencia', '20999999922', 'Mayorista Ejemplo Piura S.A.C. (muestra)', 'Ejemplo Mayorista Travel (muestra)', '{mayorista}', 'presencial', '{city_tour}', 'Jr. Ejemplo 678', 'Piura', 'Piura', '900000003', '{"instagram": "@ejemplo.mayorista.muestra"}', true, 'muestra'),
    ('00000000-0000-4000-a000-000000000005', 'agencia', '20999999949', 'Aventura Ejemplo Colán S.A.C. (muestra)', 'Colán Aventura Ejemplo (muestra)', '{operador}', 'presencial_digital', '{aventura,playa}', 'Malecón Ejemplo s/n', 'La Huaca', 'Paita', '900000005', '{"instagram": "@colan.aventura.muestra"}', true, 'muestra')
on conflict (id) do nothing;

insert into public.authorizations (provider_id, tipo, entidad_emisora, numero, fecha_emision, fecha_vencimiento, source_id) values
  ('00000000-0000-4000-a000-000000000001', 'autorizacion_transporte', 'Municipalidad Provincial de Piura (muestra)', 'R.J. 000-2024-MUESTRA', '2024-02-01', '2034-02-01', 'muestra'),
  ('00000000-0000-4000-a000-000000000002', 'autorizacion_transporte', 'Municipalidad Provincial de Sullana (muestra)', 'R.J. 001-2020-MUESTRA', '2020-05-10', '2030-05-10', 'muestra'),
  ('00000000-0000-4000-a000-000000000003', 'constancia_dircetur', 'DIRCETUR Piura (muestra)', '000-2023-MUESTRA', '2023-08-15', null, 'muestra'),
  -- Colán Aventura: tiene constancia pero NO certificado de aventura → advertencia
  ('00000000-0000-4000-a000-000000000005', 'constancia_dircetur', 'DIRCETUR Piura (muestra)', '002-2025-MUESTRA', '2025-01-20', null, 'muestra');

insert into public.vehicles (provider_id, placa, modalidad, ambito, estado, tuc_numero, habilitacion_vencimiento, citv_vencimiento, soat_vencimiento, es_muestra, source_id) values
  -- verde: habilitada y vigente
  ('00000000-0000-4000-a000-000000000001', 'MUE001', 'turistico',    'provincial', 'habilitado', 'TUC-MUE-001', '2034-02-01', '2027-03-15', '2027-01-10', true, 'muestra'),
  -- rojo: habilitación vencida
  ('00000000-0000-4000-a000-000000000001', 'MUE002', 'turistico',    'provincial', 'habilitado', 'TUC-MUE-002', '2026-03-01', '2027-03-15', '2027-01-10', true, 'muestra'),
  -- ámbar: habilitada para otra modalidad
  ('00000000-0000-4000-a000-000000000001', 'MUE003', 'trabajadores', 'provincial', 'habilitado', 'TUC-MUE-003', '2034-02-01', '2027-03-15', '2027-01-10', true, 'muestra'),
  -- rojo: habilitación cancelada
  ('00000000-0000-4000-a000-000000000002', 'MUE004', 'turistico',    'provincial', 'cancelado',  'TUC-MUE-004', '2030-05-10', '2026-12-01', '2026-11-20', true, 'muestra'),
  -- ámbar: SOAT vencido
  ('00000000-0000-4000-a000-000000000002', 'MUE005', 'turistico',    'provincial', 'habilitado', 'TUC-MUE-005', '2030-05-10', '2027-02-01', '2026-08-31', true, 'muestra')
on conflict do nothing;
