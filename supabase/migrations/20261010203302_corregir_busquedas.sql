-- 1) "ejemplo" y "muestra" marcan los datos ficticios: no deben hacer parecidos a prestadores distintos.
create or replace function public.normalizar_nombre(t text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select trim(regexp_replace(
    regexp_replace(
      regexp_replace(lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(t, ''))), '[^a-z0-9]+', ' ', 'g'),
      '\m(s a c|s r l|e i r l|s a|sac|srl|eirl|sa|tours?|travel|viajes|turismo|agencia|operador|de|del|y|la|el|los|las|ejemplo|muestra)\M',
      ' ', 'g'),
    '\s+', ' ', 'g'))
$$;
-- Las columnas generadas no se recalculan solas al cambiar la función.
update public.providers set nombre_comercial = nombre_comercial;

-- 2) En funciones SQL, un nombre sin calificar que coincide con una columna apunta a la columna:
--    `telefono` era p.telefono y la condición siempre era verdadera. Se califican los parámetros.
create or replace function public.buscar_por_contacto(usuario text default '', telefono text default '')
returns table (id uuid)
language sql
stable
set search_path = ''
as $$
  select p.id
  from public.providers p
  where (length(buscar_por_contacto.usuario) >= 3
         and strpos(lower(p.redes::text), lower(buscar_por_contacto.usuario)) > 0)
     or (length(buscar_por_contacto.telefono) >= 6
         and right(regexp_replace(coalesce(p.telefono, ''), '\D', '', 'g'), 9) = right(buscar_por_contacto.telefono, 9))
  limit 3
$$;
