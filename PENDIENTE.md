# Estado y pendientes — actualizado 11/10/2026

Producción: https://checktur-piura.vercel.app · Supabase `hrycpqowvaixewbjdsbf` · deploy automático por push a `main`.

## Modelo actual: verificar contra registros OFICIALES
- **Deciden el estado:** Directorio MINCETUR (100 agencias de Piura, corte 10/10/2026) y resoluciones de transporte turístico MTC / GORE Piura / Municipalidad (98 placas, corte 11/10/2026). Carga: `npm run load:padrones -- mincetur_agencias_piura_20261010.csv placas_turismo_piura_20261011.csv` (idempotente).
- **SUNAT:** solo suma advertencias si hay dato (no está cargado: no penaliza).
- **Declarado por la empresa** (WhatsApp, Yape, vehículos, personal): sale asociado a ella, marcado como declarado. Placas: manda el MTC (una placa solo declarada sale «Con observaciones»). Número no registrado: «no descarta que sea de una empresa formal; toma precauciones».
- **Empresas que aún no figuran en MINCETUR:** se registran en `/operador`, suben su constancia y salen «En proceso de actualización».
- **/destinos:** extra del verificador; solo empresas registradas en CheckTur (hoy, ninguna).
- **Sin semilla:** se borraron los datos ficticios de la base y los archivos `seed*.sql`.

## Cómo probar con datos reales
| Caso | Buscar | Se ve |
|---|---|---|
| Placa turística vigente | `A6J-720` | Verificado · Turismo Costa del Sol (resolución con PDF) |
| Placa de otra modalidad | `A1K-969` | Con observaciones: habilitada para «trabajadores» |
| Habilitación vencida | `B6A-702` | Alerta: venció el 27/12/2022 |
| Celular del Directorio MINCETUR | `905 984 477` | Pertenece a Andina Eco Tours (en el Directorio MINCETUR) |
| Número no registrado | `900 000 999` | No encontrado: no descarta que sea de una empresa formal; precaución |
| Agencia (RUC) | `20604249296` | Verificado · Ideas Piura Tours, con su placa y documentos oficiales |
| Agencia mayorista | `20609289318` | Con observaciones: no vende directo al turista |

## Falta
- **CSV del MTC completo / actualizado** cuando llegue: re-correr `load:padrones`. 3 placas del extracto vienen sin empresa (GORE 1236-2015, 0598-2017) y se omiten.
- **Scraping periódico:** el directorio MINCETUR tiene botón «Exportar» y las resoluciones MTC están en gob.pe (PDF). Automatizarlo sin evadir captchas ni simular navegadores ante portales del Estado (regla de `CHECKTUR_CONTEXTO.md`): descargar exports/PDF públicos y re-correr el loader.
- Probar el alta de empresa con un correo real y definir el admin real.
- SUNAT (opcional): `npm run load:sunat` para sumar advertencias de RUC de baja / no habido.
- Mover el proyecto fuera del Escritorio sincronizado con iCloud.
