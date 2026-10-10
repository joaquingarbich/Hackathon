-- Fase 3: validación anticipada de operadores (CHECKTUR_CONTEXTO.md §4)

-- Lo que el operador declara al subir (nombre comercial, placa si es TUC, contacto).
-- Se compara con lo extraído del documento y con los padrones.
alter table public.submissions
  add column datos_declarados jsonb not null default '{}'
    check (jsonb_typeof(datos_declarados) = 'object' and pg_column_size(datos_declarados) < 2000);
alter table public.submissions add constraint submissions_ruc_formato check (ruc ~ '^[0-9]{11}$');
grant insert (datos_declarados) on public.submissions to authenticated;

-- Prestadores y unidades publicados por validación del admin (no por padrón oficial).
-- Se muestran como "En proceso de actualización" hasta esta fecha; después vuelven a revisión.
alter table public.providers add column validacion_vence date;

insert into public.sources (id, nombre, url, fecha_corte)
values ('checktur_validacion', 'Constancias validadas por CheckTur (pendientes de publicación oficial)', null, current_date)
on conflict (id) do nothing;
