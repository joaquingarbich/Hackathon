-- Datos de MUESTRA, ficticios (correr después de seed.sql, seed_catalogo.sql y la migración verificacion_central).
-- Empresas, personas, placas y números inventados; RUC 209999999xx con dígito verificador válido; celulares 900 000 xxx.
-- Casos preparados para el demo (ver PENDIENTE.md → "Cómo probar"):
--   · Placa verificada ............ MUE-001 / MUE-006
--   · Yape NO registrado .......... 900 000 999 (no pertenece a ninguna empresa)
--   · Posible suplantación ........ buscar "Ballena Asul Tours" (la registrada es "Ballena Azul Tours (muestra)")
--   · SOAT vencido ................ Movilidad Ejemplo (MUE-005) → la empresa pasa sola a "Con observaciones"
--   · En proceso de actualización . Sol del Norte Expediciones (muestra)
--   · Yape registrado ............. 900 000 202 → Ballena Azul Tours

-- ---------- empresas nuevas ----------
insert into public.ruc_status (ruc, razon_social, estado, condicion, ubigeo, source_id) values
  ('20999999981', 'BALLENA AZUL TOURS S.A.C. (MUESTRA)', 'ACTIVO', 'HABIDO', '200704', 'muestra'),
  ('20999999990', 'SOL DEL NORTE EXPEDICIONES E.I.R.L. (MUESTRA)', 'ACTIVO', 'HABIDO', '200701', 'muestra')
on conflict (ruc) do nothing;

insert into public.providers (id, tipo, ruc, razon_social, nombre_comercial, clases, modalidad, actividades, direccion, distrito, provincia, telefono, redes, descripcion, foto_url, es_muestra, source_id, validacion_vence) values
  ('00000000-0000-4000-a000-000000000021', 'agencia', '20999999981', 'Ballena Azul Tours S.A.C. (muestra)', 'Ballena Azul Tours (muestra)', '{operador,minorista}', 'presencial_digital', '{naturaleza,playa}',
   'Av. Grau Ejemplo 450', 'Máncora', 'Talara', '900000201', '{"instagram": "@ballenaazul.muestra"}',
   'Operador de avistamiento de ballenas y tours de playa en Máncora y Los Órganos. Empresa ficticia de muestra.', '/muestras/logo-ballena-azul.svg', true, 'muestra', null),
  ('00000000-0000-4000-a000-000000000022', 'agencia', '20999999990', 'Sol del Norte Expediciones E.I.R.L. (muestra)', 'Sol del Norte Expediciones (muestra)', '{operador}', 'presencial', '{}',
   'Calle Ejemplo 77', 'Talara', 'Talara', '900000301', '{}',
   'Agencia recién acreditada: presentó su constancia y fue validada; aún no figura en el padrón oficial. Empresa ficticia de muestra.', null, true, 'checktur_validacion', '2026-12-31')
on conflict (id) do nothing;

insert into public.authorizations (provider_id, tipo, entidad_emisora, numero, fecha_emision, fecha_vencimiento, source_id) values
  ('00000000-0000-4000-a000-000000000021', 'constancia_dircetur', 'DIRCETUR Piura (muestra)', 'CONST-0021-MUESTRA', '2024-05-10', null, 'muestra'),
  ('00000000-0000-4000-a000-000000000021', 'certificado_aventura', 'DIRCETUR Piura (muestra)', 'AVEN-0021-MUESTRA', '2024-05-10', null, 'muestra'),
  ('00000000-0000-4000-a000-000000000022', 'constancia_dircetur', 'DIRCETUR Piura (constancia presentada, muestra)', 'CONST-0022-MUESTRA', '2026-09-20', null, 'checktur_validacion');

-- ---------- vehículos: fotos y una unidad nueva verificada ----------
update public.vehicles set foto_url = '/muestras/van-' || lower(placa) || '.svg', autorizacion_mtc = 'R.D. 000-2024-MUESTRA' where es_muestra and placa like 'MUE%';
insert into public.vehicles (provider_id, placa, modalidad, ambito, estado, tuc_numero, habilitacion_vencimiento, citv_vencimiento, soat_vencimiento, es_muestra, source_id, foto_url, autorizacion_mtc) values
  ('00000000-0000-4000-a000-000000000021', 'MUE006', 'turistico', 'regional', 'habilitado', 'TUC-MUE-006', '2033-06-30', '2027-05-20', '2027-04-15', true, 'muestra', '/muestras/van-mue006.svg', 'R.D.R. 021-2024-MUESTRA')
on conflict (placa) do nothing;

-- ---------- personal (DNI: solo últimos 3) ----------
insert into public.personal (id, provider_id, nombre, rol, dni_ultimos3, foto_url, carne_numero, carne_vence, estado) values
  ('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000001', 'Luis Ejemplo Ramos (muestra)', 'conductor', '123', '/muestras/persona-luis.svg', null, null, 'aprobado'),
  ('00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000021', 'Rosa Ejemplo Silva (muestra)', 'guia', '456', '/muestras/persona-rosa.svg', 'GT-0021-MUESTRA', '2027-12-31', 'aprobado'),
  ('00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000021', 'Carla Ejemplo Núñez (muestra)', 'vendedor', '789', '/muestras/persona-carla.svg', null, null, 'aprobado'),
  ('00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000005', 'Jorge Ejemplo Paz (muestra)', 'guia', '321', '/muestras/persona-jorge.svg', 'GT-0005-MUESTRA', '2026-06-30', 'aprobado') -- carné vencido
on conflict (id) do nothing;

-- ---------- canales oficiales (celular = clave de 9 dígitos; banco = sha256 de los dígitos) ----------
insert into public.canales (provider_id, tipo, valor, visible, estado) values
  ('00000000-0000-4000-a000-000000000021', 'whatsapp', '900000201', '900 000 201', 'aprobado'),
  ('00000000-0000-4000-a000-000000000021', 'yape', '900000202', '900 000 202', 'aprobado'),
  ('00000000-0000-4000-a000-000000000021', 'plin', '900000202', '900 000 202', 'aprobado'),
  ('00000000-0000-4000-a000-000000000021', 'banco', encode(sha256('19100000000201'::bytea), 'hex'), '•••• 0201 · Banco de muestra', 'aprobado'),
  ('00000000-0000-4000-a000-000000000021', 'instagram', 'ballenaazul.muestra', '@ballenaazul.muestra', 'aprobado'),
  ('00000000-0000-4000-a000-000000000001', 'whatsapp', '900000001', '900 000 001', 'aprobado'),
  ('00000000-0000-4000-a000-000000000001', 'yape', '900000001', '900 000 001', 'aprobado'),
  ('00000000-0000-4000-a000-000000000002', 'whatsapp', '900000002', '900 000 002', 'aprobado'),
  ('00000000-0000-4000-a000-000000000005', 'whatsapp', '900000005', '900 000 005', 'aprobado'),
  ('00000000-0000-4000-a000-000000000005', 'instagram', 'colan.aventura.muestra', '@colan.aventura.muestra', 'aprobado'),
  ('00000000-0000-4000-a000-000000000011', 'whatsapp', '900000011', '900 000 011', 'aprobado'),
  ('00000000-0000-4000-a000-000000000012', 'whatsapp', '900000012', '900 000 012', 'aprobado'),
  ('00000000-0000-4000-a000-000000000013', 'whatsapp', '900000013', '900 000 013', 'aprobado'),
  ('00000000-0000-4000-a000-000000000022', 'whatsapp', '900000301', '900 000 301', 'aprobado')
on conflict do nothing;

-- ---------- destinos que atiende cada empresa ----------
insert into public.empresa_destinos (provider_id, destino) values
  ('00000000-0000-4000-a000-000000000001', 'piura'), ('00000000-0000-4000-a000-000000000001', 'mancora'),
  ('00000000-0000-4000-a000-000000000002', 'piura'), ('00000000-0000-4000-a000-000000000002', 'chulucanas'),
  ('00000000-0000-4000-a000-000000000003', 'piura'),
  ('00000000-0000-4000-a000-000000000005', 'colan_paita'),
  ('00000000-0000-4000-a000-000000000011', 'los_organos'),
  ('00000000-0000-4000-a000-000000000012', 'mancora'),
  ('00000000-0000-4000-a000-000000000013', 'colan_paita'),
  ('00000000-0000-4000-a000-000000000021', 'mancora'), ('00000000-0000-4000-a000-000000000021', 'los_organos'),
  ('00000000-0000-4000-a000-000000000022', 'mancora'), ('00000000-0000-4000-a000-000000000022', 'los_organos')
on conflict do nothing;
