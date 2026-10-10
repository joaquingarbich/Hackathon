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

export const TEXTO_OPERADOR = {
  invitacion: "¿Eres un operador recién acreditado y aún no apareces?",
  enlaceInvitacion: "Sube tu constancia",
  tituloIngreso: "Acceso para operadores",
  ayudaIngreso: "Crea una cuenta con tu correo para subir tu constancia o TUC. Un revisor la validará.",
  tituloPanel: "Actualización anticipada de tu registro",
  ayudaPanel:
    "Sube tu constancia de inscripción (DIRCETUR) o la TUC de tu unidad. Un revisor la validará y, si es correcta, los turistas te verán como «En proceso de actualización» hasta que aparezcas en el padrón oficial.",
  estadoSolicitud: { pendiente: "En revisión", aprobado: "Aprobada", rechazado: "Rechazada" } as Record<string, string>,
  privacidad: "Tu documento es privado: solo lo ven tú y el revisor.",
} as const;

export const TIPO_DOCUMENTO: Record<string, string> = {
  constancia_agencia: "Constancia de inscripción de agencia (DIRCETUR)",
  tuc: "Tarjeta Única de Circulación (TUC) de una unidad",
};

// Advertencias que salen de la imagen consultada (no del registro). Se pasan por código en la URL.
export const OBS_IMAGEN = {
  sin_ruc:
    "El anuncio o perfil no muestra RUC ni n.° de constancia. Las agencias deben mostrarlos en sus canales digitales (art. 22, D.S. 005-2020-MINCETUR).",
  datos_distintos:
    "Los datos del anuncio (teléfono, cuenta o RUC) no coinciden con los registrados para este prestador. Contáctalo solo por el canal oficial que figura aquí.",
} as const;
export type CodigoObs = keyof typeof OBS_IMAGEN;

export const TEXTO_FOTO = {
  leyendo: "Leyendo la imagen…",
  ilegible: "No pudimos identificar datos en la imagen. Prueba con una foto más nítida o escribe el nombre, RUC o placa.",
  error: "No pudimos procesar la imagen. Intenta de nuevo o escribe el nombre, RUC o placa.",
  ayuda: "Foto de un letrero, logo o unidad, o captura de un anuncio en redes.",
} as const;

export const SERVICIOS = ["City tour", "Tour de playa", "Aventura (sandboarding, kayak, surf…)", "Avistamiento de ballenas", "Gastronómico", "Traslado / transporte", "Hospedaje", "Restaurante", "Guiado", "Otro"] as const;

export const TEXTO_RESENA = {
  tituloBloque: "Opiniones de usuarios",
  aclaracion: "Opiniones de personas que contrataron el servicio. No son un dato oficial y no cambian el dictamen.",
  sello: "Compra verificada con comprobante",
  sinResenas: "Aún no hay opiniones verificadas.",
  pocasParaPromedio: (n: number, min: number) => `${n} ${n === 1 ? "opinión" : "opiniones"} (el promedio se muestra desde ${min}).`,
  dejar: "Dejar una opinión",
  reportar: "Reportar",
  reportada: "Gracias: un revisor la evaluará.",
  sinRuc: "Este prestador no tiene RUC registrado, así que no podemos verificar comprobantes para opinar sobre él.",
  tituloFormulario: "Tu opinión",
  ayudaFormulario:
    "Para evitar opiniones falsas, solo publicamos opiniones con un comprobante de pago (boleta, factura o ticket) emitido por este prestador. Un revisor la valida antes de publicarla.",
  consentimiento:
    "Acepto que CheckTur trate mis datos de contacto solo para verificar esta opinión (Ley N.° 29733). No se publican: solo se muestra el alias.",
  enviado: "¡Gracias! Recibimos tu opinión y tu comprobante. Un revisor la validará antes de publicarla.",
  comprobanteUsado: "Este comprobante ya se usó para una opinión.",
  error: "No pudimos procesar tu opinión. Intenta de nuevo.",
} as const;

// Explorar por servicio: categoría → filtro sobre providers (tipo y/o actividades).
export const CATEGORIAS = [
  { id: "tours", nombre: "Tours y agencias", tipo: "agencia" },
  { id: "aventura", nombre: "Aventura", actividad: "aventura" },
  { id: "playa", nombre: "Playa", actividad: "playa" },
  { id: "city_tour", nombre: "City tour", actividad: "city_tour" },
  { id: "transporte", nombre: "Transporte turístico", tipo: "transporte_terrestre" },
  { id: "estadia", nombre: "Estadía / hospedaje", tipo: "hospedaje" },
  { id: "gastronomia", nombre: "Restaurantes", tipo: "restaurante" },
  { id: "guias", nombre: "Guías de turismo", tipo: "guia" },
] as const;
