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
  flotaVencida: (placa: string, doc: string, fecha: string) => `La unidad ${placa} tiene ${doc} vencido desde el ${fecha}.`,
  flotaPorVencer: (placa: string, doc: string, fecha: string) => `A la unidad ${placa} se le vence ${doc} el ${fecha}.`,
  carneVencido: (nombre: string, fecha: string) => `El carné de guía de ${nombre} venció el ${fecha}.`,
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
// distritos: dónde puede tener su local una empresa de la zona (sin tildes, en minúsculas). Sirve para mostrar
// las empresas registradas que aún no declararon sus destinos en CheckTur (p. ej. las del Directorio MINCETUR).
export const DESTINOS = [
  { id: "mancora", nombre: "Máncora", distritos: ["mancora"] },
  { id: "los_organos", nombre: "Los Órganos y El Ñuro", distritos: ["los organos", "el alto"] },
  { id: "colan_paita", nombre: "Colán y Paita", distritos: ["paita", "colan", "la huaca"] },
  { id: "catacaos", nombre: "Catacaos", distritos: ["catacaos"] },
  { id: "chulucanas", nombre: "Chulucanas", distritos: ["chulucanas"] },
  { id: "piura", nombre: "Piura ciudad", distritos: ["piura", "castilla", "veintiseis de octubre"] },
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

// Verificación centrada en el dato (celular, Yape/Plin, cuenta, placa, nombre).
export const TEXTO_VERIFICAR = {
  titulo: "Verifica antes de pagar o subir",
  placeholder: "RUC, celular, placa o nombre",
  chip: { ruc: "Buscando RUC…", celular: "Buscando celular / WhatsApp / Yape / Plin…", banco: "Buscando cuenta bancaria…", placa: "Buscando placa…", nombre: "Buscando nombre de empresa…" } as Record<string, string>,
  canalDe: { celular: "Este número", banco: "Esta cuenta" } as Record<string, string>,
  perteneceA: (que: string, n: number) => `${que} pertenece a ${n === 1 ? "esta empresa registrada" : "estas empresas registradas"}`,
  noRegistrado: (que: string) => `${que} NO está registrado por ninguna empresa en CheckTur.`,
  noPagues: "No pagues ni envíes dinero a este número o cuenta hasta confirmar con la empresa por su canal oficial registrado.",
  quizas: "¿Quizás buscabas…?",
  suplantacion: "Ojo: si te dieron un nombre parecido pero no igual, podría ser una suplantación. Contacta solo por el canal oficial de la empresa registrada.",
  empresaDicha: "¿Qué empresa te dijeron?",
  empresaDichaAyuda: "Escribe el nombre que te dieron y lo comparamos con el titular registrado.",
  otraEmpresa: (dato: string, titular: string, dicha: string) => `Ojo: ${dato} pertenece a «${titular}», no a «${dicha}».`,
  mismaEmpresa: (dato: string, titular: string) => `Coincide: ${dato} pertenece a «${titular}».`,
} as const;

export const NOMBRE_CANAL: Record<string, string> = {
  whatsapp: "WhatsApp", telefono: "Teléfono", yape: "Yape", plin: "Plin", banco: "Cuenta bancaria",
  instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", web: "Web",
};

export const TEXTO_FICHA = {
  whatsappOficial: "Contactar por WhatsApp oficial",
  llamarOficial: "Llamar al número oficial",
  compartir: "Compartir verificación",
  reportar: "Reportar",
  canales: "Canales oficiales",
  canalesAyuda: "Paga y escribe solo a estos números y cuentas. Si te piden pagar a otro, desconfía.",
  destinos: "Destinos que atiende",
  vehiculos: "Vehículos",
  personal: "Personal",
  documentos: "Documentos y autorizaciones",
  servicios: "Servicios",
  queSignifica: "«Verificado» significa que figura en un registro oficial vigente y que sus datos registrados coinciden. No mide la calidad del servicio.",
  compartirEmpresa: (empresa: string, estado: string, url: string) => `Verifiqué a ${empresa} en CheckTur Piura: ${estado}. ${url}`,
  compartirVehiculo: (placa: string, empresa: string, estado: string, url: string) => `Estoy en la van placa ${placa} de ${empresa}, ${estado.toLowerCase()} en CheckTur Piura: ${url}`,
  compartirPersona: (nombre: string, rol: string, empresa: string, url: string) => `${nombre} (${rol} de ${empresa}) figura en CheckTur Piura: ${url}`,
  rol: { guia: "Guía", conductor: "Conductor", vendedor: "Vendedor", otro: "Personal" } as Record<string, string>,
} as const;

export const TEXTO_REPORTE = {
  titulo: "Reportar un problema",
  ayuda: "Tu reporte llega a los revisores de CheckTur. No reemplaza una denuncia: si hubo un delito o perdiste dinero, acude también a las autoridades.",
  motivos: ["Me cobraron y no prestaron el servicio", "Me pidieron pagar a un Yape/cuenta que no es de la empresa", "La placa o el vehículo no coincide", "Se hacen pasar por otra empresa", "Venta de tours en la calle", "Otro"],
  enviado: "Gracias. Tu reporte fue recibido y un revisor lo verá.",
  dondeAcudir: [
    { quien: "Emergencias o robo: Policía Nacional del Perú", como: "Llama al 105 o acude a la comisaría más cercana (Policía de Turismo si la hay en el destino)." },
    { quien: "Cobros o servicios no prestados: INDECOPI", como: "Presenta un reclamo en gob.pe/indecopi o en el Libro de Reclamaciones de la empresa." },
    { quien: "Agencias y prestadores turísticos: DIRCETUR Piura", como: "Dirección Regional de Comercio Exterior y Turismo del Gobierno Regional Piura (gob.pe/regionpiura)." },
    { quien: "Orientación al turista: iPerú", como: "www.iperu.org" },
  ],
} as const;

// Accesos rápidos de la home: cada caso de uso con sus pasos y el buscador adaptado.
export const CASOS = {
  calle: {
    titulo: "Me ofrecieron un tour en la calle",
    pasos: [
      "La venta de tours en la calle, playas o terminales está prohibida (D.S. 005-2020-MINCETUR, art. 15.2).",
      "Pide el nombre comercial o el RUC de la agencia y verifícalo aquí antes de pagar.",
      "Contrata solo en su local o por su canal oficial registrado.",
    ],
    placeholder: "Nombre o RUC de la agencia",
  },
  yape: {
    titulo: "Voy a pagar por Yape o Plin",
    pasos: [
      "Escribe el número de Yape o Plin (o la cuenta) que te dieron, antes de pagar.",
      "Si no está registrado por ninguna empresa, no pagues: confirma por el canal oficial de la empresa.",
      "Si pertenece a otra empresa distinta a la que te dijeron, desconfía.",
    ],
    placeholder: "Número de Yape / Plin o cuenta",
  },
  van: {
    titulo: "Ya estoy en la van",
    pasos: [
      "Escribe la placa (o apunta la cámara de tu teléfono al QR pegado en la unidad).",
      "Compara la foto y la placa de la ficha con la van que tienes enfrente.",
      "Comparte la verificación con alguien de confianza.",
    ],
    placeholder: "Placa, p. ej. ABC-123",
  },
} as const;
export type Caso = keyof typeof CASOS;

export const TEXTO_HOME = {
  bajada: "Escribe el RUC, el celular o Yape, la placa o el nombre de la empresa. Se contrasta con los registros oficiales de Piura y con los datos que cada empresa registró.",
  casos: "¿Qué estás por hacer?",
  casosAyuda: "Toca tu caso para ver qué revisar antes de pagar o subir.",
  destinoCaso: "Busco empresa para ir a un destino",
  destinoPasos: [
    "En «Destinos» verás las empresas registradas que declararon atender ese lugar, con su estado y su WhatsApp oficial.",
    "También aparecen otras empresas registradas con local en la zona que aún no declararon sus destinos: puede que sí atiendan ese lugar.",
    "Contrata por el canal oficial que figura en su ficha, no por números que te pasen en la calle.",
  ],
  verDestinos: "Ver empresas por destino",
  porDestino: "Empresas por destino",
  porDestinoAyuda: "Empresas con registro vigente que atienden cada destino. Sin precios ni publicidad: solo su estado y su contacto oficial.",
  empresas: (n: number) => `${n} ${n === 1 ? "empresa" : "empresas"}`,
} as const;

export const TEXTO_DESTINOS = {
  elegir: "¿A dónde vas?",
  cambiar: "Cambiar destino",
  declararon: (destino: string) => `Declararon atender ${destino}`,
  declararonAyuda: "Estas empresas registradas indicaron en CheckTur que ofrecen servicios en este destino.",
  sinDeclarar: (destino: string) => `Aún no hay empresas que hayan declarado atender ${destino}.`,
  zona: "Otras empresas registradas en la zona",
  zonaAyuda: (distritos: string) =>
    `Figuran en los registros oficiales con local en ${distritos}, pero todavía no declararon en CheckTur a qué destinos llevan. Puede que sí ofrezcan servicios aquí: consúltales por su canal oficial.`,
  aviso: "No ver a una empresa en esta lista no significa que no atienda este destino.",
  avisoCorto: "Aquí aparecen los destinos que cada empresa declaró en CheckTur; muchas agencias registradas aún no lo han hecho. Si te ofrecen un servicio, búscala por su nombre o RUC.",
  avisoDetalle:
    "Aquí aparecen los destinos que cada empresa declaró en CheckTur. Las agencias del Directorio MINCETUR figuran como registradas aunque todavía no hayan declarado sus destinos. Si te ofrecen un servicio, busca la empresa por su nombre o RUC.",
  verDetalle: "Ver ficha completa",
  buscarOtra: (destino: string) => `¿Te ofrecieron algo en ${destino} que no está aquí?`,
} as const;

export const TEXTO_FAQ = {
  titulo: "Preguntas frecuentes",
  bajada: "Qué es CheckTur Piura, qué significa cada resultado y qué hacer si algo no cuadra.",
  preguntas: [
    {
      p: "¿Qué es CheckTur Piura?",
      r: "Una herramienta gratuita para comprobar, antes de pagar o subir, si una agencia, transporte, hospedaje, restaurante o guía de Piura figura en los registros oficiales, y si el número, la cuenta o la placa que te dieron le pertenece.",
    },
    {
      p: "¿Qué puedo buscar?",
      r: "Escribe en el buscador el RUC (11 dígitos), un celular de WhatsApp, Yape o Plin (9 dígitos), una cuenta bancaria, la placa del vehículo (por ejemplo ABC-123) o el nombre comercial. El tipo de dato se detecta solo; no necesitas elegir nada.",
    },
    {
      p: "¿De dónde salen los datos?",
      r: "Del Directorio de Prestadores de Servicios Turísticos de MINCETUR y DIRCETUR Piura, del padrón de SUNAT (estado del RUC), de los registros de transporte (MTC y municipalidades) y de los canales, vehículos y personal que cada empresa registró y que un revisor aprobó. Cada resultado muestra su fuente y la fecha de corte.",
    },
    {
      p: "¿Qué significa cada resultado?",
      r: "«Verificado»: figura en un registro oficial vigente. «Con observaciones»: figura, pero hay algo que conviene saber, como un documento vencido. «En proceso de actualización»: presentó su constancia y fue validada, pero aún no aparece en el padrón. «No encontrado»: no hay coincidencias a la fecha de corte. «Alerta»: un registro oficial muestra un hecho importante, como un RUC de baja o una habilitación vencida.",
    },
    {
      p: "Si sale «No encontrado», ¿la empresa es informal?",
      r: "No necesariamente. Los padrones oficiales se publican con retraso y una empresa puede operar hasta 30 días antes de inscribirse. Pídele su RUC o su constancia, vuelve a consultar y, ante la duda, contrata solo por canales oficiales.",
    },
    {
      p: "¿Por qué una empresa no aparece en un destino?",
      r: "Porque en «Destinos» se muestran los lugares que cada empresa declaró en CheckTur. Muchas agencias del Directorio MINCETUR figuran como registradas, pero aún no han declarado a qué destinos llevan. Por eso también ves «Otras empresas registradas en la zona». Si te ofrecen un servicio, búscala por su nombre o RUC.",
    },
    {
      p: "Me pidieron pagar por Yape o Plin, ¿cómo lo compruebo?",
      r: "Escribe el número antes de pagar. Si pertenece a una empresa registrada, verás cuál. Si no está registrado por ninguna, no pagues hasta confirmar con la empresa por su canal oficial. Si pertenece a otra empresa distinta a la que te dijeron, desconfía.",
    },
    {
      p: "¿Cómo compruebo la van o al guía?",
      r: "Escribe la placa del vehículo o el nombre de la empresa. En la ficha verás la foto de la unidad y los datos del personal registrado: compáralos con lo que tienes enfrente. Las empresas también pueden pegar un código QR que abre esa misma ficha con la cámara del teléfono.",
    },
    {
      p: "¿Qué hago si tuve un problema?",
      r: "Usa «Reportar» en la ficha o en el resultado: llega a los revisores de CheckTur. Si perdiste dinero o hubo un delito, acude también a la Policía Nacional (105), a INDECOPI o a la DIRCETUR Piura.",
    },
    {
      p: "¿CheckTur guarda lo que busco?",
      r: "Solo se registra el dato consultado y el resultado, sin tu identidad, para saber qué se busca y no existe. No se guardan fotos ni datos personales de los turistas.",
    },
    {
      p: "Tengo una empresa, ¿cómo aparezco o actualizo mis datos?",
      r: "Entra a «Para empresas», crea una cuenta con tu correo y sube tu constancia de DIRCETUR o la TUC de tu unidad. Cuando un revisor la valida, puedes declarar tus destinos, canales oficiales, vehículos y personal.",
    },
  ],
} as const;

export const nombreDestino = (id: string | null | undefined) => DESTINOS.find((d) => d.id === id)?.nombre ?? id ?? "";
