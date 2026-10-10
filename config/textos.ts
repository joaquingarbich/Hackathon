// Todo el texto del sistema que ve el turista. Reglas de redacción (CHECKTUR_CONTEXTO.md §6):
// nunca "informal", "ilegal", "estafa" ni "fraude"; el sistema informa lo que consta, no acusa.

export const ESTADOS = ["verificado", "observaciones", "actualizacion", "no_encontrado", "alerta"] as const;
export type Estado = (typeof ESTADOS)[number];

export const TEXTO_ESTADO: Record<Estado, { titulo: string; resumen: string }> = {
  verificado: {
    titulo: "Verificado",
    resumen: "Figura en un registro oficial vigente y su RUC está activo y habido.",
  },
  observaciones: {
    titulo: "Verificado con observaciones",
    resumen: "Figura en el registro oficial, pero hay datos que conviene que conozcas.",
  },
  actualizacion: {
    titulo: "En proceso de actualización",
    resumen: "Presentó su constancia oficial y CheckTur la validó; aún no aparece en el padrón, que se publica con retraso.",
  },
  no_encontrado: {
    titulo: "No encontrado",
    resumen: "Sin coincidencias en los registros oficiales con corte al {fecha}. No es una conclusión negativa: los padrones se publican con retraso.",
  },
  alerta: {
    titulo: "Alerta",
    resumen: "Un registro oficial indica una situación que debes revisar antes de contratar.",
  },
};

export const TEXTO_APP = {
  nombre: "CheckTur Piura",
  lema: "Experiencias, hospedajes y restaurantes de Piura con registro oficial verificado.",
  campoBusqueda: "Nombre, RUC o placa",
  ejemploBusqueda: "Ej.: Colán Aventura, 20123456789 o ABC-123",
  botonBuscar: "Verificar",
  botonFoto: "Tomar foto o elegir captura",
} as const;

// Advertencias: hechos comprobables de fuente oficial, redactados sin acusar.
export const ADVERTENCIA = {
  rucNoActivo: (estado: string) => `Según SUNAT, el RUC figura con estado "${estado}".`,
  rucNoHabido: (condicion: string) => `Según SUNAT, la condición de domicilio del RUC es "${condicion}".`,
  rucSinDato: "El RUC no se pudo contrastar con el padrón de SUNAT a la fecha de corte.",
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
    "Un proveedor recién acreditado puede tardar en aparecer en el padrón oficial.",
  ],
  vehiculo: "Confirma que la empresa que contrataste sea la que figura aquí como titular de la unidad.",
  ambulatorio: "La venta de tours en la calle, playas o terminales está prohibida: contrata en un local o canal oficial.",
} as const;

export const TEXTO_OPERADOR = {
  invitacion: "¿Eres un proveedor recién acreditado y aún no apareces?",
  enlaceInvitacion: "Sube tu constancia",
  tituloIngreso: "Acceso para proveedores",
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
    "Los datos del anuncio (teléfono, cuenta o RUC) no coinciden con los registrados para este proveedor. Contáctalo solo por el canal oficial que figura aquí.",
} as const;
export type CodigoObs = keyof typeof OBS_IMAGEN;

export const TEXTO_FOTO = {
  leyendo: "Leyendo la imagen…",
  ilegible: "No se identificaron datos en la imagen. Prueba con una foto más nítida o escribe el nombre, RUC o placa.",
  error: "La imagen no se pudo procesar. Intenta de nuevo o escribe el nombre, RUC o placa.",
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
  sinRuc: "Este proveedor no tiene RUC registrado: no se pueden verificar comprobantes para opinar sobre él.",
  tituloFormulario: "Tu opinión",
  ayudaFormulario:
    "Para evitar opiniones falsas, solo se publican opiniones con un comprobante de pago (boleta, factura o ticket) emitido por este proveedor. Un revisor la valida antes de publicarla.",
  consentimiento:
    "Acepto que CheckTur trate mis datos de contacto solo para verificar esta opinión (Ley N.° 29733). No se publican: solo se muestra el alias.",
  enviado: "¡Gracias! Tu opinión y tu comprobante llegaron. Un revisor la validará antes de publicarla.",
  comprobanteUsado: "Este comprobante ya se usó para una opinión.",
  error: "La opinión no se pudo procesar. Intenta de nuevo.",
} as const;

// Catálogo (web cliente). Categoría de `services.categoria` → tipos de proveedor (respaldo sin tabla services).
export const CATEGORIAS = [
  { id: "experiencia", nombre: "Experiencias", singular: "experiencia", tipos: ["agencia", "guia"] },
  { id: "hospedaje", nombre: "Hospedajes", singular: "hospedaje", tipos: ["hospedaje"] },
  { id: "restaurante", nombre: "Restaurantes", singular: "restaurante", tipos: ["restaurante"] },
  { id: "transporte", nombre: "Transporte", singular: "traslado", tipos: ["transporte_terrestre"] },
] as const;
export type Categoria = (typeof CATEGORIAS)[number]["id"];

// Destinos de Piura: `services.destino` guarda el id. `ilustracion` elige la escena de components/ilustracion.tsx.
export const DESTINOS = [
  { id: "mancora", nombre: "Máncora" },
  { id: "los_organos", nombre: "Los Órganos y El Ñuro" },
  { id: "colan_paita", nombre: "Colán y Paita" },
  { id: "catacaos", nombre: "Catacaos" },
  { id: "chulucanas", nombre: "Chulucanas" },
  { id: "piura", nombre: "Piura ciudad" },
] as const;

export const TEXTO_CATALOGO = {
  titular: "Ballenas, tallanes y playas del norte",
  bajada: "Experiencias, hospedajes y restaurantes de Piura, con opiniones de viajeros y contacto directo con cada proveedor.",
  destino: "Destino",
  todoPiura: "Toda la región Piura",
  queHacer: "¿Qué quieres hacer?",
  queHacerEjemplo: "Ballenas, artesanía, surf…",
  buscar: "Buscar",
  garantia: "Cada proveedor publicado tiene registro oficial verificado o documentos validados.",
  comoSeRevisa: "Cómo se revisa",
  comoSeRevisaTexto:
    "Se contrasta su RUC con SUNAT y su inscripción con MINCETUR o el MTC. Si ya presentó su constancia y aún no aparece en el padrón oficial, lo verás con la etiqueta “Registro en actualización”.",
  destinos: "Destinos de Piura",
  mejorValoradas: "Mejor valoradas",
  verTodas: "Ver todo el catálogo",
  verificarTitulo: "¿Te ofrecieron un tour fuera de CheckTur?",
  verificarTexto: "En la calle, en la playa o por redes: verifica su registro con el nombre, RUC, placa o una foto antes de pagar.",
  verificarBoton: "Verificar un proveedor",
  precioNota: "Precios referenciales; la reserva y el pago se coordinan directamente con cada proveedor.",
  porPersona: "por persona",
  sinResultados: "Sin resultados con esos filtros. Prueba con otro destino o categoría.",
  ofrecidoPor: "Ofrecido por",
  verDictamen: "Ver dictamen",
  queEs: "¿Qué es?",
  incluye: "Incluye",
  noIncluye: "No incluye",
  itinerario: "Itinerario",
  puntoEncuentro: "Punto de encuentro",
  abrirMapa: "Abrir en el mapa",
  condiciones: "Condiciones del proveedor",
  tuConsulta: "Tu consulta",
  mensajeSeEnviara: "Mensaje que se enviará",
  whatsapp: "Consultar por WhatsApp",
  llamar: "Llamar al proveedor",
  notaContacto: "Número registrado por el proveedor. La reserva y el pago se coordinan directamente con él.",
  sinTelefono: "Este proveedor no registró un teléfono. Revisa su dictamen para ver sus canales oficiales.",
  mensaje: (servicio: string, personas: string, fecha: string) =>
    `Hola, quiero consultar por ${servicio} para ${personas}${fecha ? ` el ${fecha}` : ""}. Lo vi en CheckTur.`,
  experienciasDelProveedor: "Servicios publicados",
  respaldoAviso: "El catálogo de servicios se está cargando. Mientras tanto, estos son los proveedores registrados.",
  verProveedor: "Ver proveedor",
  publica: "Publica tus servicios",
} as const;

// Etiqueta en tarjetas del catálogo: solo cuando el estado no es "Verificado" (la publicación ya implica formalidad).
export const ETIQUETA_CATALOGO: Partial<Record<Estado, string>> = {
  actualizacion: "Registro en actualización",
  observaciones: "Con observaciones",
};

export const TEXTO_GUARDADOS = {
  titulo: "Guardados",
  ayuda: "Se guardan solo en este dispositivo, sin cuenta.",
  vacio: "Aún no guardaste nada. Toca el corazón en una experiencia o proveedor para tenerlo a mano.",
  guardar: "Guardar",
  guardado: "Guardado",
  quitar: "Quitar",
} as const;

// Registro de agencias (cara del proveedor): perfil y servicios, siempre con revisión del admin.
export const IDIOMAS = ["Español", "Inglés", "Portugués", "Francés", "Alemán"] as const;
export const UNIDADES_PRECIO = ["por persona", "por grupo", "por noche", "por plato", "por unidad"] as const;
export const REDES = ["instagram", "facebook", "tiktok"] as const;

export const TEXTO_AGENCIA = {
  tuAgencia: "Tu agencia",
  sinAgencia: "Cuando un revisor apruebe tu constancia o TUC, aquí podrás completar el perfil de tu agencia y publicar tus servicios.",
  perfil: "Perfil",
  ayudaPerfil: "Datos de contacto y presentación que verán los turistas. Los cambios se publican cuando un revisor los aprueba: así nadie puede cambiar tu teléfono o tus redes sin control.",
  servicios: "Servicios",
  ayudaServicios: "Tours, actividades, hospedaje, comida o traslados que ofreces. Cada servicio se publica en el catálogo cuando un revisor lo aprueba.",
  enviado: "Enviado. Un revisor lo revisará antes de publicarlo.",
  cambioPendiente: "Tienes un cambio de perfil en revisión.",
  estadoServicio: { pendiente: "En revisión", publicado: "Publicado", rechazado: "Por corregir" } as Record<string, string>,
} as const;

export const TEXTO_LIMITE = "Hiciste muchas consultas seguidas. Espera unos minutos e intenta de nuevo.";
