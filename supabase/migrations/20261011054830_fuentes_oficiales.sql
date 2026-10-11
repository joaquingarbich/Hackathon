-- Fuentes oficiales (MINCETUR, MTC) como base de la verificación.
-- canales.fuente: 'mincetur' = teléfono del Directorio MINCETUR (oficial); 'empresa' = declarado por la empresa en CheckTur.
alter table public.canales add column fuente text not null default 'empresa' check (fuente in ('empresa', 'mincetur'));
grant select (fuente) on public.canales to anon, authenticated;
-- Enlace al documento oficial (p. ej. PDF de la resolución directoral del MTC en gob.pe).
alter table public.authorizations add column url_fuente text check (url_fuente ~ '^https://');

insert into public.sources (id, nombre, url, fecha_corte) values
  ('mincetur_directorio', 'Directorio Nacional de Prestadores de Servicios Turísticos (MINCETUR)', 'https://consultasenlinea.mincetur.gob.pe/directoriodeserviciosturisticos/DirPrestadores/DirBusquedaPrincipal/AgenciaViajes?IdGrupo=2', '2026-10-10'),
  ('mtc_resoluciones', 'Resoluciones de autorización de transporte turístico (MTC, GORE Piura - DRTC, Municipalidad Provincial de Piura)', 'https://www.gob.pe/mtc', '2026-10-11')
on conflict (id) do update set nombre = excluded.nombre, url = excluded.url, fecha_corte = excluded.fecha_corte;
