-- Las solicitudes solo se crean desde la Server Action (valida RUC/placa y corre las capas).
-- Sin esto, un operador podía insertar directo por la API REST y saltarse la validación.
-- (La política "operador crea" queda sin efecto al no haber privilegio INSERT; se puede borrar luego.)
revoke insert on public.submissions from authenticated;
