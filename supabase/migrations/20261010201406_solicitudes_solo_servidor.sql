-- Las solicitudes solo se crean desde la Server Action (valida RUC/placa y corre las capas).
-- Sin esto, un operador podía insertar directo por la API REST y saltarse la validación.
revoke insert on public.submissions from authenticated;
drop policy if exists "operador crea" on public.submissions;
