// Reglas para aceptar una reseña: comprobante de pago emitido por el MISMO RUC del prestador (decisión del equipo).
// Puras. El admin revisa igual antes de publicar.
import { REGLAS } from "@/config/reglas";
import type { CamposComprobante } from "@/lib/vision";

export type Chequeo = { ok: boolean; texto: string };
export type Veredicto = { aceptado: true; chequeos: Chequeo[] } | { aceptado: false; motivo: string };

const dias = (a: string, b: string) => (Date.parse(a) - Date.parse(b)) / 86_400_000;

export function verificarComprobante(c: CamposComprobante, rucPrestador: string, fechaServicio: string, hoy: string): Veredicto {
  if (!c.es_comprobante) return { aceptado: false, motivo: "La imagen no parece un comprobante de pago (boleta, factura o ticket)." };
  if (!c.ruc_emisor) return { aceptado: false, motivo: "No se lee el RUC del emisor. Toma una foto más nítida del comprobante completo." };
  if (c.ruc_emisor !== rucPrestador)
    return { aceptado: false, motivo: `El comprobante fue emitido por el RUC ${c.ruc_emisor}, que no es el de este prestador.` };
  if (!c.serie_numero) return { aceptado: false, motivo: "No se lee la serie y el número del comprobante. Toma una foto más nítida." };
  if (!c.fecha_emision) return { aceptado: false, motivo: "No se lee la fecha de emisión del comprobante." };
  if (c.fecha_emision > hoy) return { aceptado: false, motivo: "La fecha del comprobante es posterior a hoy." };
  if (dias(hoy, c.fecha_emision) > REGLAS.resenas.maxDiasComprobante)
    return { aceptado: false, motivo: `El comprobante tiene más de ${REGLAS.resenas.maxDiasComprobante} días.` };

  // Lo que no rechaza pero el admin debe ver
  const separacion = Math.abs(dias(fechaServicio, c.fecha_emision));
  return {
    aceptado: true,
    chequeos: [
      { ok: true, texto: `RUC emisor ${c.ruc_emisor} = RUC del prestador.` },
      { ok: true, texto: `${c.tipo} ${c.serie_numero} del ${c.fecha_emision}${c.total ? ` por ${c.total}` : ""}.` },
      separacion <= REGLAS.resenas.maxDiasEntreCompraYServicio
        ? { ok: true, texto: "La fecha del servicio es coherente con la del comprobante." }
        : { ok: false, texto: `La fecha del servicio declarada está a ${Math.round(separacion)} días del comprobante.` },
    ],
  };
}
