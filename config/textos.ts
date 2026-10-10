// Todo el texto del sistema que ve el turista. Reglas de redacción (CHECKTUR_CONTEXTO.md §6):
// nunca "informal", "ilegal", "estafa" ni "fraude"; el sistema informa lo que consta, no acusa.

export const ESTADOS = ["verificado", "observaciones", "actualizacion", "no_encontrado", "alerta"] as const;
export type Estado = (typeof ESTADOS)[number];

export const TEXTO_ESTADO: Record<Estado, { titulo: string; resumen: string }> = {
  verificado: {
    titulo: "Verificado",
    resumen: "Figura en el registro oficial y su RUC está activo.",
  },
  observaciones: {
    titulo: "Verificado con observaciones",
    resumen: "Figura en el registro oficial, pero hay datos que conviene que conozcas.",
  },
  actualizacion: {
    titulo: "En proceso de actualización",
    resumen: "Presentó su constancia y fue validada; está pendiente de publicación en el padrón oficial.",
  },
  no_encontrado: {
    titulo: "No encontrado",
    resumen: "No pudimos verificar a este prestador en los registros oficiales con corte al {fecha}.",
  },
  alerta: {
    titulo: "Alerta",
    resumen: "Un registro oficial indica una situación que debes revisar antes de contratar.",
  },
};

export const TEXTO_APP = {
  nombre: "CheckTur Piura",
  lema: "Verifica agencias, transporte y servicios turísticos antes de contratar.",
  campoBusqueda: "Nombre, RUC o placa",
  ejemploBusqueda: "Ej.: Vaca Loca Tours, 20123456789 o ABC-123",
  botonBuscar: "Verificar",
  botonFoto: "Usar foto o captura",
} as const;

// Advertencias: hechos comprobables de fuente oficial, redactados sin acusar.
export const ADVERTENCIA = {
  rucNoActivo: (estado: string) => `Según SUNAT, el RUC figura con estado "${estado}".`,
  rucNoHabido: (condicion: string) => `Según SUNAT, la condición de domicilio del RUC es "${condicion}".`,
  rucSinDato: "No pudimos contrastar el RUC con el padrón de SUNAT a la fecha de corte.",
  sinRuc: "El registro no consigna un RUC para contrastar con SUNAT.",
  inscripcionSuspendida: "Su inscripción en el Directorio figura como suspendida.",
  mayorista:
    "Es una agencia de clase mayorista: según el D.S. 005-2020-MINCETUR no puede vender directamente al turista. Contrata a través de una agencia minorista u operador.",
  aventuraSinCertificado:
    "Ofrece actividades de aventura, pero no consta un certificado de autorización para turismo de aventura (art. 17.4, D.S. 005-2020-MINCETUR).",
  guiaSinCarne: "No consta el carné de guía oficial en los registros consultados.",
  autorizacionVencida: (tipo: string, fecha: string) => `La ${tipo} venció el ${fecha}.`,
  autorizacionPorVencer: (tipo: string, fecha: string) => `La ${tipo} vence el ${fecha}.`,
  vehiculoCancelado: "La habilitación de esta unidad figura como cancelada.",
  habilitacionVencida: (fecha: string) => `La habilitación de esta unidad para el servicio venció el ${fecha}.`,
  habilitacionPorVencer: (fecha: string) => `La habilitación de esta unidad vence el ${fecha}.`,
  otraModalidad: (modalidad: string) =>
    `Esta unidad está habilitada para la modalidad "${modalidad}", no para transporte turístico.`,
  citvVencido: (fecha: string) => `La inspección técnica vehicular (CITV) venció el ${fecha}.`,
  soatVencido: (fecha: string) => `El SOAT venció el ${fecha}.`,
} as const;

export const NOMBRE_AUTORIZACION: Record<string, string> = {
  constancia_dircetur: "constancia de inscripción (DIRCETUR)",
  certificado_clasificacion: "certificado de clasificación",
  autorizacion_transporte: "autorización de transporte turístico",
  carne_guia: "carné de guía oficial",
  certificado_aventura: "certificado de turismo de aventura",
};

export const NOMBRE_TIPO: Record<string, string> = {
  agencia: "Agencia de viajes y turismo",
  hospedaje: "Hospedaje",
  restaurante: "Restaurante",
  guia: "Guía de turismo",
  transporte_terrestre: "Transporte turístico terrestre",
};

export const CONSEJO = {
  noEncontrado: [
    "Pídele su RUC o su constancia de inscripción y vuelve a consultar.",
    "Consulta en iPerú (www.iperu.org) o en la DIRCETUR Piura.",
    "Un prestador recién acreditado puede tardar en aparecer en el padrón oficial.",
  ],
  vehiculo: "Confirma que la empresa que contrataste sea la que figura aquí como titular de la unidad.",
  ambulatorio: "La venta de tours en la calle, playas o terminales está prohibida: contrata en un local o canal oficial.",
} as const;
