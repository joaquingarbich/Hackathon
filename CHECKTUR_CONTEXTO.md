# CheckTur Piura — Contexto para Claude Code

> Documento de arranque. Léelo completo antes de escribir código.
> Glosario de interfaz (docs/DISENO.md): en el texto visible se dice **proveedor** (no "prestador" ni "operador"); este documento conserva los términos legales.
> Fecha de investigación: 10 de octubre de 2026. Las normas y URLs se verificaron ese día; lo marcado con **[VERIFICAR]** no se pudo confirmar y debe validarse con la mentora o con los archivos de muestra.

---

## 1. Qué estamos construyendo

**Hackathon:** Piura Innova 2026 (Hackathon Regional de Innovación). **Reto 16**, presentado por **La Vaca Loca Tours** (agencia de viajes y operadora receptiva de Piura). **Equipo:** Trifuerza. **Mentora:** Daniela Acuña Carrasco, Gerente General de La Vaca Loca Tours.

**Producto:** *CheckTur Piura: Escáner Inteligente de Confianza y Formalidad Turística.*

**Problema:** un turista no tiene una forma rápida de saber si una agencia, restaurante, hospedaje o unidad de transporte turístico es formal antes de contratar. Hoy necesita conocer la razón social o el RUC exactos y consultar varios portales estatales distintos, poco usables en el celular. Además, los padrones oficiales se actualizan con retraso, lo que perjudica a operadores que ya obtuvieron su autorización pero aún no aparecen. El transporte turístico es el mayor vacío: no está en el directorio de MINCETUR.

**Usuarios:** turistas nacionales e internacionales (principal), usuarios locales, agencias receptoras, y fiscalizadores/orientadores turísticos.

### Criterios de éxito (textuales del brief, son lo que se evalúa)

1. Aplicación web progresiva o multiplataforma ligera, accesible desde cualquier navegador móvil o PC, sin instalación.
2. Consulta rápida con **entradas no estructuradas**: placa vehicular digitada, foto/escaneo de logo comercial, captura de perfil o anuncio de redes sociales, o nombre comercial.
3. Contrastar la entrada contra los padrones (prestadores y registros vehiculares) y entregar un **dictamen visual claro**: estado de formalidad, datos del establecimiento, autorizaciones vigentes y advertencias de riesgo.
4. Un **flujo para operadores formales en trámite o recién acreditados**: suben constancias/autorizaciones oficiales para validación y actualización anticipada del registro.

### Alcance adicional definido por el equipo

- **Reseñas y calificaciones de usuarios** sobre los prestadores. No está en el brief, pero el equipo lo incluye. Detalle en la sección 6 ("Reseñas y calificaciones").

### Fuera de alcance

- Reservas, pagos o contratación. El alcance termina en el dictamen o la ficha del servicio, con a lo sumo un enlace de contacto (WhatsApp o llamada) al proveedor verificado. **Actualizado 10/10:** la web del turista es un catálogo de servicios de proveedores registrados (`docs/CATALOGO.md`).
- Cualquier automatización que evada captchas de portales del Estado.

---

## 2. Marco legal: qué hace "formal" a cada prestador

Marco general: **Ley N.° 32392, Nueva Ley General de Turismo** (2025) y su reglamento, **D.S. N.° 002-2026-MINCETUR**. El propio directorio de MINCETUR los cita como base vigente. Los reglamentos sectoriales de abajo son los que se encontraron; **[VERIFICAR]** con la mentora si el reglamento de 2026 cambió algún requisito.

Requisitos comunes a todos: **RUC** (estado *activo*, condición *habido*) y **licencia municipal de funcionamiento** del local.

### 2.1 Agencias de viajes y turismo — D.S. N.° 005-2020-MINCETUR

Es la norma mejor documentada y la más relevante para el reto.

- **Autoridad:** la DIRCETUR del gobierno regional (art. 4). En Piura, DIRCETUR Piura. Ella expide la constancia y mantiene el directorio (art. 5).
- **Clases** (art. 6): Minorista, Mayorista, Operador de Turismo. Una agencia puede tener más de una.
  - El **mayorista no puede vender directo al turista** (art. 3.1.f). Si un mayorista le vende a un turista, es una observación.
- **Para iniciar actividades** (art. 8): RUC + licencia de funcionamiento. Las agencias 100 % digitales solo necesitan RUC.
- **Inscripción** (arts. 9 y 10):
  - Presenta una **Declaración Jurada** de condiciones mínimas ante DIRCETUR **dentro de los 30 días de iniciadas sus actividades**. Aprobación automática.
  - DIRCETUR la inscribe en el Directorio y emite la **constancia en un máximo de 5 días hábiles**. Trámite gratuito.
  - **Implicancia clave para el dictamen:** una agencia puede operar legalmente hasta ~30 días antes de presentar la DJ, más los días de inscripción, más el retraso de publicación. *No aparecer en el padrón no equivale a ser informal.*
- **Actualización** (art. 11): si cambia un dato, nueva DJ en 15 días calendario; DIRCETUR emite nueva constancia.
- **Suspensión** (art. 20): si la agencia suspende actividades, su inscripción en el Directorio queda suspendida.
- **Vigencia de la constancia:** el reglamento no fija fecha de vencimiento; se mantiene mientras cumpla condiciones y no suspenda. **[VERIFICAR]**
- **Señales visibles de formalidad** (art. 15):
  - Debe usar el **distintivo oficial** de MINCETUR en el exterior del local y en sus canales digitales (aprobado por R.M. N.° 061-2021-MINCETUR, distinto según clase).
  - La denominación "Agencia de Viajes y Turismo" y el distintivo están reservados a inscritos (art. 15.7).
  - **Está prohibido vender tours de forma ambulatoria** en plazas, terminales, playas o exteriores de hoteles y restaurantes (art. 15.2). Es una advertencia útil para el turista.
- **Canales digitales** (art. 22): la web o red social de la agencia debe mostrar teléfono, dirección, **RUC, razón social, nombre comercial, constancia de inscripción**, política de datos y términos (cobro, cancelación, reembolso). Esto sirve para validar una captura de redes: si el perfil no muestra RUC ni constancia, es una observación.
- **Transporte propio** (art. 17.3): si la agencia ofrece transporte turístico con unidades propias o de terceros, debe cumplir las normas del sector Transportes (ver 2.5).
- **Aventura y canotaje** (art. 17.4): requieren certificado de autorización específico del operador.

**Campos que el Directorio consigna por agencia** (art. 12.2) — úsalos como esquema de datos:
razón social o nombre, RUC, n.° de licencia municipal, **nombre comercial**, dirección, **n.° de constancia**, **fecha de expedición**, fecha de inicio de operaciones, **clasificación**, modalidades y tipo de turismo, asociación gremial, calificaciones de calidad, teléfono, correo, página web, **cuentas de redes sociales**.

**Formato de la constancia** (Anexo III aprobado por el Viceministerio de Turismo). Campos a extraer por OCR:
- `CONSTANCIA N°` (número)
- Nombre comercial de la agencia
- Dirección, distrito, provincia, departamento (no aplica a las exclusivamente digitales)
- Clase (minorista / mayorista / operador de turismo)
- Modalidad (presencial / presencial y digital / exclusivamente digital)
- Razón social y **N.° de RUC**
- Ciudad y fecha de emisión
- Referencia textual a "Decreto Supremo N° 005-2020-MINCETUR"

El formato oficial **no exige QR ni código de verificación**. Si la constancia de DIRCETUR Piura trae firma digital o QR es algo que hay que mirar en las muestras. **[VERIFICAR]**

### 2.2 Establecimientos de hospedaje — D.S. N.° 001-2015-MINCETUR

- Autoridad: DIRCETUR.
- Dos situaciones: (a) hospedaje **clasificado y/o categorizado** (hotel, apart-hotel, hostal, albergue; 1 a 5 estrellas) con **Certificado de Clasificación y/o Categorización**; (b) hospedaje **sin clase ni categoría**, que presenta una **Declaración Jurada** de condiciones mínimas.
- El certificado tiene **vigencia indeterminada**.
- Suele exigirse certificado de seguridad en edificaciones (Defensa Civil / ITSE) vigente. **[VERIFICAR]** el nombre exacto del documento actual.
- Aparecen en el Directorio de MINCETUR.

### 2.3 Restaurantes — D.S. N.° 011-2019-MINCETUR

- Autoridad: DIRCETUR.
- (a) Restaurantes **categorizados** (1 a 5 tenedores) o **turísticos**, con **Certificado de categorización y/o calificación**; (b) restaurantes sin categoría, con **Declaración Jurada** de condiciones mínimas.
- Vigencia del certificado: **[VERIFICAR]** (bajo el reglamento anterior era indeterminada).
- Aparecen en el Directorio de MINCETUR.
- Nota: muchos restaurantes locales legítimos no figuran en el Directorio. Para restaurantes, "no encontrado" es todavía menos concluyente que para agencias.

### 2.4 Guías de turismo — Ley N.° 28529 y D.S. N.° 004-2010-MINCETUR

- Solo puede guiar quien tenga **carné de guía oficial**, de uso obligatorio y visible durante el servicio.
- Se registran en la DIRCETUR de su región y figuran en el Directorio de MINCETUR.

### 2.5 Transporte turístico terrestre — D.S. N.° 017-2009-MTC (RNAT)

El vacío principal del reto. No lo regula MINCETUR sino el sector Transportes, en tres niveles:

| Ámbito | Quién autoriza | Ejemplo |
|---|---|---|
| Nacional | MTC, Dirección de Servicios de Transporte Terrestre | Resoluciones Directorales "…-MTC/17.02" |
| Regional | Gobierno Regional, DRTC Piura **[VERIFICAR]** | — |
| Provincial | Municipalidad Provincial (en Piura: Oficina de Transportes y Circulación Vial) | R.J. N.° 33-2023-OTYCV-MPP, "transporte turístico terrestre modalidad traslado" |

Según las resoluciones del MTC, la autorización nacional de transporte turístico también faculta a operar en ámbitos menores (D.S. N.° 018-2017-MTC). **[VERIFICAR]** el alcance exacto.

**Documentos que acreditan formalidad de una unidad:**

1. **Resolución de autorización** para prestar "servicio de transporte terrestre público especial de personas en la modalidad de transporte turístico", a nombre de la empresa (RUC). Las del MTC tienen **vigencia de 10 años**.
2. **Tarjeta Única de Circulación (TUC)**: una por vehículo; acredita que *esa placa* está habilitada para *ese servicio*. La habilitación dura hasta el término de la autorización.
   - El MTC emite **TUC electrónica** (D.S. N.° 026-2020-MTC), con **código de verificación** comprobable en el sistema del MTC (SINARETT). El formato de TUC electrónica de la ATU incluye **código QR** con datos de la habilitación.
   - Las TUC regionales y provinciales pueden ser físicas y de formato distinto. **[VERIFICAR]** con muestras de Piura.
   - Campos típicos: RUC y razón social del transportista, modalidad de servicio, n.° de resolución, fechas de inicio y caducidad de la autorización, placa, año de fabricación, emisión y vencimiento de la habilitación.
3. **CITV** (inspección técnica vehicular) vigente.
4. **SOAT** vigente.
5. Conductores inscritos en la **Nómina de Conductores** del MTC, con licencia de la categoría correspondiente.
6. **Hoja de Ruta Electrónica** por viaje (obligación operativa, no visible para el turista).
7. Rotulado "Transporte Turístico" en la unidad (lo mencionan las resoluciones de inspección).

**Fiscaliza:** SUTRAN en vías nacionales; la municipalidad o el gobierno regional en su ámbito.

### 2.6 Transporte turístico acuático — D.S. N.° 006-2011-MTC

Muy relevante en Piura (avistamiento de ballenas en Los Órganos, El Ñuro, Máncora).

- **Permiso de Operación** para transporte turístico acuático de ámbito regional, otorgado por el **Gobierno Regional de Piura** (Resoluciones Directorales Regionales) con opinión de la Dirección de Autorizaciones de Transporte Acuático del MTC.
- La nave necesita **Certificado de Matrícula** de **DICAPI** (Marina de Guerra) y cumplir sus requisitos de seguridad.
- Vigencia del permiso: originalmente 5 años; en 2025 hay resoluciones que lo adecuan a plazo indeterminado. Leer la resolución concreta.

---

## 3. Fuentes de datos oficiales

| # | Fuente | Qué da | Cómo se consulta | Notas |
|---|---|---|---|---|
| 1 | **Directorio Nacional de Prestadores de Servicios Turísticos Calificados** (MINCETUR) | Agencias, hospedajes, restaurantes, guías | Web. Agencias: búsqueda por **RUC, razón social o nombre comercial**, o por criterio (ubicación, servicios, modalidades). Tiene botón **Exportar**. | Fuente principal. Los datos los cargan los gobiernos regionales. |
| 2 | **Padrones de DIRCETUR Piura** | Prestadores de la región | Enlaces y muestras que entrega la organización | Formato **[VERIFICAR]** al recibirlos. |
| 3 | **Registro de datos de transporte de personas** (MTC) | Empresa y vehículos habilitados | Web. Búsqueda por **razón social, RUC, código de inscripción o placa** | Es la fuente a la que el propio directorio de MINCETUR enlaza para transporte terrestre. Cubre el registro nacional; regional/provincial **[VERIFICAR]**. |
| 4 | **Permisos de operación de transporte acuático** (MTC, Portal DTA) | Permisos acuáticos | Web (reporte) | Bloquea peticiones automatizadas. |
| 5 | **Padrón reducido del RUC** (SUNAT) | RUC, razón social, **estado**, **condición de domicilio**, ubigeo, domicilio fiscal | **Descarga masiva** (archivo grande, >11 M de registros) | Ideal para validar RUC sin captcha. Filtrar por ubigeo de Piura (departamento 20). No trae nombre comercial. |
| 6 | Consulta RUC en línea (SUNAT) | Igual + nombre comercial y actividad | Web con captcha | Solo consulta manual. |
| 7 | Consulta CITV por placa (MTC) | Vigencia de la revisión técnica | Web con captcha **[VERIFICAR URL]** | |
| 8 | Consulta SOAT por placa (APESEG / aseguradoras) | Vigencia del SOAT | Web | |
| 9 | Récord de infracciones (SUTRAN) | Papeletas por placa | Web con captcha | Posible fuente de "advertencias". |
| 10 | Resoluciones publicadas en gob.pe (MTC, Municipalidad Provincial de Piura, GORE Piura) | Autorizaciones individuales en PDF | Búsqueda documental | Útil para armar datos semilla reales de transporte y acuático. |

**URLs**

- Directorio MINCETUR (inicio): https://consultasenlinea.mincetur.gob.pe/directoriodeserviciosturisticos/DirPrestadores/DirBusquedaPrincipal
  - Hospedajes: `…/DirBusquedaPrincipal/EstablecimientoHospedaje?IdGrupo=1`
  - Agencias: `…/DirBusquedaPrincipal/AgenciaViajes?IdGrupo=2`
  - Restaurantes: `…/DirBusquedaPrincipal/Restaurantes?IdGrupo=3`
  - Guías: `…/DirBusquedaPrincipal/GuiasTurismo?IdGrupo=4`
- MTC, registro de transporte de personas: https://www.mtc.gob.pe/tramitesenlinea/tweb_tLinea/tw_consultadgtt/ntransporte_pasajeros.aspx
- MTC, permisos de transporte acuático: https://portaldta.mtc.gob.pe/PortalDTA/reportes/permisosoperacion
- SUNAT, padrón reducido: http://www.sunat.gob.pe/descargaPRR/mrc137_padron_reducido.html
- Firma Perú (validador de firmas digitales): https://www.gob.pe/22271

**Estrategia de datos para el hackathon**

1. **Snapshot local**, no consultas en vivo. Exportar manualmente desde el Directorio (botón Exportar, filtrando Piura) y cargar los padrones de muestra que entregue la organización. Guardar la **fecha de corte** de cada fuente y mostrarla siempre en el dictamen.
2. Para transporte, cargar las muestras de MTC/SUTRAN que den y, si faltan, complementar con placas tomadas de resoluciones públicas.
3. Consulta en vivo solo como mejora opcional, y solo contra fuentes sin captcha. **No evadir captchas.**
4. Si aún no hay datos reales, usar datos semilla **claramente ficticios** y etiquetados como "muestra". No inventar datos sobre empresas reales.

---

## 4. Cómo comprobar la veracidad de un documento subido

Un operador sube una constancia, resolución o TUC. Ninguna verificación aislada es concluyente; se combinan en capas y **la decisión final la toma una persona** (administrador).

| Capa | Qué se comprueba | Cómo |
|---|---|---|
| 1. Extracción | Leer los campos del documento | Modelo multimodal u OCR sobre la imagen o PDF. Salida en JSON según el tipo de documento (ver campos en sección 2). |
| 2. Estructura | ¿Tiene la forma de un documento oficial de ese tipo? | Checklist por tipo: n.° de constancia presente, cita del decreto correcto, nombre de la entidad emisora, clase válida, fecha plausible (no futura; posterior a la norma que cita). |
| 3. Coherencia interna | ¿Los datos cuadran entre sí? | RUC con 11 dígitos y dígito verificador válido; prefijo 10/20 acorde a persona natural/jurídica; formato de placa peruano; departamento = Piura. |
| 4. Cruce con SUNAT | ¿El RUC existe y coincide? | Buscar el RUC en el padrón reducido: razón social coincide con la del documento (comparación difusa), estado **ACTIVO**, condición **HABIDO**, ubigeo en Piura. |
| 5. Cruce con padrones | ¿Ya figura oficialmente? | Si el RUC ya está en el Directorio o en el registro MTC, el documento solo confirma. Si los datos difieren (otra clase, otro nombre), marcar inconsistencia. |
| 6. Firma digital | ¿El PDF está firmado digitalmente por la entidad? | Si el archivo es un PDF con firma digital, validar la firma y que el certificado pertenezca a la entidad emisora. El Estado ofrece el validador de **Firma Perú**; en código se puede inspeccionar la firma del PDF. Una firma válida es la prueba más fuerte de autenticidad e integridad. |
| 7. QR o código de verificación | ¿El documento trae un código comprobable? | Decodificar el QR. Si apunta a un dominio `.gob.pe`, mostrar el enlace al administrador para que lo abra. La TUC electrónica del MTC tiene código de verificación. **Aceptar solo dominios oficiales**; un QR hacia otro dominio es señal de alerta. |
| 8. Señales de manipulación | ¿Hay indicios de edición? | Metadatos del PDF (software de creación, fecha de modificación posterior a la emisión), duplicados (hash del archivo o mismo n.° de constancia ya usado por otro RUC). |
| 9. Revisión humana | Decisión | Panel de administrador con el documento, los campos extraídos y el resultado de cada capa. Aprueba o rechaza con motivo. |

**Reglas de producto derivadas**

- El sistema calcula un **nivel de confianza del documento** (alto / medio / bajo) a partir de las capas 2 a 8 y se lo muestra al administrador. No aprueba solo.
- Un operador aprobado por esta vía se muestra al turista como **"Constancia presentada y validada — pendiente de publicación en el padrón oficial"**, nunca igual que uno que ya figura en el padrón.
- La validación anticipada **caduca** (propuesta: 60 días). Si para entonces no aparece en el padrón oficial, vuelve a revisión.
- Guardar quién validó, cuándo y con qué evidencia (auditoría).
- Quién cumple el rol de administrador (DIRCETUR, Cámara de Comercio, la agencia promotora) está **por definir** con la mentora. Para la demo basta un usuario administrador.

---

## 5. Entradas y cómo resolverlas

Todas las entradas terminan en el mismo paso: **identificar a un prestador o a un vehículo** y calcular su dictamen.

| Entrada | Procesamiento |
|---|---|
| **Placa digitada** | Normalizar (mayúsculas, quitar guion y espacios; formato peruano de 6 caracteres alfanuméricos). Buscar en registros vehiculares → empresa (RUC) → buscar esa empresa en el Directorio por si además es agencia. |
| **Nombre comercial** | Búsqueda difusa (trigramas) contra nombre comercial y razón social, sin tildes ni mayúsculas, ignorando sufijos societarios (S.A.C., E.I.R.L., S.R.L.) y palabras genéricas ("tours", "travel", "viajes", "turismo", "agencia"). Mostrar hasta 3 candidatos si no hay coincidencia clara; **nunca elegir en silencio** entre nombres parecidos. |
| **RUC** | Coincidencia exacta. No está en el brief pero es gratis y es la clave más confiable. |
| **Foto de logo** | Modelo multimodal: extraer el texto del logo (nombre, eslogan) y cualquier dato visible (teléfono, RUC, placa si es la foto de una unidad). Con ese texto, seguir el flujo de nombre comercial. No intentar reconocimiento visual puro del logo en la primera versión. |
| **Captura de perfil o anuncio de redes** | Modelo multimodal: extraer nombre de la cuenta, usuario (@), teléfonos, RUC si aparece, web, y si menciona constancia o muestra el distintivo de MINCETUR. Buscar por RUC > usuario de red social (el Directorio registra las cuentas) > teléfono > nombre. Si el perfil no muestra RUC ni constancia, añadir observación (art. 22 del D.S. 005-2020). |

La extracción multimodal debe devolver JSON estricto y un nivel de certeza por campo. Si la imagen no permite identificar nada, decirlo y pedir otro dato; no adivinar.

---

## 6. Dictamen

### Estados

| Estado | Color | Cuándo |
|---|---|---|
| **Verificado** | Verde | Figura en un padrón oficial vigente y el RUC está activo y habido. En vehículos: placa habilitada para transporte turístico y habilitación no vencida. |
| **Verificado con observaciones** | Ámbar | Figura, pero hay un hecho objetivo que el turista debe saber (ver advertencias). |
| **En proceso de actualización** | Violeta (el azul es el color de marca) | No figura aún en el padrón oficial, pero presentó constancia y un administrador la validó (sección 4). |
| **No encontrado** | Gris | No se halló coincidencia. Texto (voz del sistema de diseño, sin "nosotros"): "Sin coincidencias en los registros oficiales con corte al [fecha]. No es una conclusión negativa". Incluir qué hacer: pedirle su RUC o constancia, consultar a iPerú. |
| **Alerta** | Rojo | Solo ante hechos objetivos de fuente oficial: RUC de baja, inscripción suspendida, habilitación vehicular vencida o cancelada. |

### Reglas de redacción (importantes)

- **Nunca** usar "informal", "ilegal", "estafa" ni "fraude" para describir a un prestador. El sistema informa lo que consta en registros; no acusa.
- Cada dato muestra **fuente y fecha de corte**.
- "No encontrado" no es una conclusión negativa; el retraso de los padrones es parte del problema que el reto quiere resolver, y la norma permite operar hasta 30 días antes de presentar la declaración jurada.
- Cuando haya varios candidatos, el usuario elige.

### Qué muestra el dictamen

- Estado y explicación en una frase.
- Datos del prestador: nombre comercial, razón social, RUC, tipo y clase, dirección, contacto oficial.
- **Autorizaciones**: lista con entidad emisora, número, fecha y vigencia.
- **Advertencias** (si aplican).
- Fuentes consultadas y fecha de corte.
- Reseñas: calificación promedio, número de reseñas y las más recientes, en un bloque separado del estado de formalidad.
- Acciones: contactar por el canal oficial registrado; dejar una reseña; reportar un problema.

### Reseñas y calificaciones

- Calificación de 1 a 5 estrellas y comentario opcional, sobre un prestador ya identificado en el sistema (no sobre búsquedas sin resultado).
- **La formalidad y la reputación son cosas distintas y se muestran por separado.** Las reseñas no cambian el estado del dictamen: un prestador con malas reseñas sigue "Verificado" si figura en el padrón, y uno con buenas reseñas no pasa a "Verificado" por eso. Rotular el bloque como "Opiniones de usuarios", no como dato oficial.
- Mostrar el promedio solo a partir de un mínimo de reseñas (propuesta: 3); antes de eso, mostrar las reseñas sin promedio.
- Control de abuso mínimo para la demo: una reseña por dispositivo y prestador, límite de longitud, botón "reportar reseña" y ocultamiento por el administrador. Las reglas de redacción del dictamen aplican al texto del sistema; las reseñas son contenido de terceros y deben poder moderarse.
- El prestador validado puede responder a una reseña (opcional, si alcanza el tiempo).
- **[VERIFICAR]** con el equipo: si se exige login para reseñar y si se pide evidencia de haber usado el servicio.

### Catálogo de advertencias (todas basadas en hechos comprobables)

- RUC no activo o condición no habido (SUNAT).
- Inscripción suspendida en el Directorio.
- Habilitación vehicular (TUC) vencida, o autorización próxima a vencer.
- CITV o SOAT vencidos (si se dispone del dato).
- La placa está habilitada para otra modalidad (por ejemplo, transporte de trabajadores) y no para turístico.
- La placa pertenece a una empresa distinta de la que el usuario dice estar contratando.
- La agencia es de clase mayorista (no puede vender directo al turista).
- Los datos del anuncio (teléfono, cuenta, dirección) no coinciden con los registrados: posible suplantación de un prestador formal.
- El perfil de redes no muestra RUC ni constancia.
- Consejo general, no ligado a un prestador: la venta ambulatoria de tours está prohibida.

---

## 7. Flujos

1. **Turista — consulta.** Pantalla única: un campo de texto (nombre, placa o RUC) y un botón de cámara/galería. → resultado o lista de candidatos → dictamen. Sin registro ni login.
2. **Operador — actualización anticipada.** Registro con RUC → sube constancia/resolución/TUC (foto o PDF) → ve el estado de su solicitud.
3. **Administrador — validación.** Cola de solicitudes → detalle con documento, campos extraídos y resultado de cada capa de verificación → aprobar o rechazar con motivo.
4. **Turista — reseña.** Desde el dictamen de un prestador: estrellas + comentario opcional → se publica en el bloque de opiniones. El administrador puede ocultar reseñas reportadas.
5. **Fiscalizador / turista — reporte** (opcional, si alcanza el tiempo): reportar a un prestador desde el dictamen. Solo se registra; no cambia el estado público.

---

## 8. Modelo de datos sugerido

- `providers`: id, tipo (agencia | hospedaje | restaurante | guía | transporte_terrestre | transporte_acuático), ruc, razon_social, nombre_comercial, nombre_normalizado, clase, direccion, distrito, provincia, telefono, correo, web, redes (json), estado_inscripcion, fuente, fecha_corte.
- `authorizations`: id, provider_id, tipo (constancia_dircetur | certificado_clasificacion | autorizacion_transporte | permiso_operacion_acuatico | carne_guia), entidad_emisora, numero, fecha_emision, fecha_vencimiento (nullable), fuente, fecha_corte.
- `vehicles`: id, provider_id, placa, modalidad, ambito (nacional | regional | provincial), tuc_numero, habilitacion_vencimiento, citv_vencimiento, soat_vencimiento, fuente, fecha_corte.
- `ruc_status`: ruc, razon_social, estado, condicion, ubigeo, fecha_corte (subconjunto Piura del padrón reducido).
- `submissions`: id, ruc, tipo_documento, archivo, hash, campos_extraidos (json), resultado_capas (json), confianza, estado (pendiente | aprobado | rechazado), revisor, motivo, fecha, vence_el.
- `lookups`: id, tipo_entrada, entrada_normalizada, provider_id o vehicle_id, estado_resultado, fecha. Sin datos personales del turista.
- `reviews`: id, provider_id, estrellas (1–5), comentario, alias (opcional), device_hash, estado (visible | reportada | oculta), respuesta_prestador (nullable), fecha.
- `reports` (opcional): id, provider_id, motivo, detalle, fecha.
- `sources`: nombre, url, fecha_corte, n_registros.

Clave de cruce entre fuentes: **RUC**. La placa enlaza vehículo → RUC.

---

## 9. Propuesta técnica (confirmar con el equipo antes de crear el proyecto)

No se ha definido el stack. Propuesta por defecto, pensada para un hackathon:

- **Frontend y API:** Next.js (App Router) + TypeScript + Tailwind, configurado como PWA (manifest + service worker). Diseño móvil primero.
- **Base de datos:** Postgres gestionado (por ejemplo Supabase) con la extensión `pg_trgm` para la búsqueda difusa de nombres; almacenamiento de archivos para los documentos subidos.
- **Visión/OCR:** un modelo multimodal vía API, con la clave en variables de entorno. Encapsularlo detrás de una función (`extractFromImage`) para poder cambiar de proveedor.
- **Carga de datos:** scripts que lean los Excel/CSV de los padrones y los normalicen a las tablas de arriba.

Si el equipo prefiere otra cosa (Python, Firebase, etc.), adaptar; lo que no debe cambiar son las secciones 4, 5 y 6.

---

## 10. Plan de construcción por fases

Cada fase debe quedar demostrable antes de pasar a la siguiente.

- **Fase 0 — Datos.** Esquema, scripts de carga, normalización de nombres y placas, datos semilla. Pedir al equipo los archivos reales antes de inventar nada.
- **Fase 1 — Consulta por texto.** Nombre, RUC y placa → dictamen completo. Es el corazón de la demo.
- **Fase 2 — Consulta por imagen.** Logo y captura de redes → extracción → mismo flujo.
- **Fase 3 — Operador y administrador.** Subida de documentos, capas de verificación, panel de validación, estado "En proceso de actualización".
- **Fase 4 — Reseñas.** Dejar y ver reseñas en el dictamen, promedio, reporte y ocultamiento desde el panel de administrador.
- **Fase 5 — Pulido.** PWA instalable, estados vacíos y de error, textos en español claro (y en inglés si alcanza, por los turistas extranjeros), página con fuentes y fechas de corte.

**Guion de demo sugerido:** (1) nombre de una agencia formal → verde; (2) placa de una unidad con habilitación vencida → rojo con explicación; (3) captura de un anuncio de Instagram de un operador que no figura → gris con orientación; (4) ese operador sube su constancia, el administrador la valida → azul.

---

## 11. Instrucciones de trabajo para Claude Code

- Antes de crear el proyecto, pregunta al equipo: stack preferido, qué archivos de padrones ya tienen, y qué proveedor de modelo multimodal usarán.
- Toda la interfaz en **español**, lenguaje sencillo.
- Respeta las reglas de redacción del dictamen (sección 6). Son un requisito, no una sugerencia de estilo.
- No hagas scraping que evada captchas ni simules ser un navegador ante portales del Estado.
- No inventes datos de empresas reales. Datos semilla ficticios y marcados como muestra.
- No guardes datos personales del turista, salvo el alias opcional y el texto de una reseña. Los documentos subidos por operadores son privados: solo el operador y el administrador los ven.
- Prioriza que la Fase 1 funcione de punta a punta antes de añadir nada.
- Lo marcado **[VERIFICAR]** no debe quedar codificado como regla dura; déjalo configurable.

---

## 12. Preguntas abiertas para la mentora

1. ¿En qué formato llegan los padrones de DIRCETUR y de MTC/SUTRAN, y qué columnas traen?
2. ¿El transporte turístico en Piura lo autoriza sobre todo el MTC, la DRTC o la Municipalidad Provincial? ¿Hay un padrón regional o provincial de unidades habilitadas?
3. ¿La constancia que emite DIRCETUR Piura es un PDF con firma digital o QR, o un documento físico escaneado? (Pedir 2 o 3 ejemplos reales.)
4. ¿Quién validaría las constancias subidas: DIRCETUR, la Cámara de Comercio u otro?
5. ¿El D.S. 002-2026-MINCETUR cambió algún requisito de inscripción respecto de los reglamentos sectoriales?
6. Si solo alcanzan dos tipos de entrada bien hechos, ¿cuáles prefiere? (Propuesta: nombre comercial y placa.)
7. ¿Incluimos transporte acuático (avistamiento de ballenas) en la demo?
8. ¿Qué señales de informalidad ve ella con más frecuencia en la práctica?

---

## 13. Fuentes

**Turismo**
- D.S. N.° 005-2020-MINCETUR, Reglamento de Agencias de Viajes y Turismo: https://busquedas.elperuano.pe/dispositivo/NL/1866352-4
- Anexo III, formato de constancia de inscripción: https://cdn.www.gob.pe/uploads/document/file/861980/ANEXO_III.pdf
- R.M. N.° 061-2021-MINCETUR, distintivo de agencias: https://busquedas.elperuano.pe/dispositivo/NL/1947877-1
- D.S. N.° 001-2015-MINCETUR, Reglamento de Establecimientos de Hospedaje: https://elperuano.pe/normaselperuano/2015/06/09/1248181-2.html
- Vigencia indeterminada del certificado de hospedaje (INDECOPI, Res. 364-2015/SC1): https://vlex.com.pe/vid/resolucion-n-364-2015-1042037350
- R.M. N.° 098 (procedimientos estandarizados; cita D.S. 011-2019-MINCETUR para restaurantes): https://cdn.www.gob.pe/uploads/document/file/864189/RM_N__098.pdf
- Guías de turismo acreditados (Andina/MINCETUR): https://andina.pe/ingles/noticia-fin-semana-largo-si-buscas-un-guia-asegurate-este-acreditado-747812.aspx
- Ley N.° 32392, Nueva Ley General de Turismo: https://lpderecho.pe/ley-32392-nueva-ley-general-turismo/
- D.S. N.° 002-2026-MINCETUR, Reglamento de la Ley 32392: https://www.congreso.gob.pe/Docs/DGP/DIDP/files/ds_002-2026_mincetur.pdf
- Directorio Nacional de Prestadores (MINCETUR): https://consultasenlinea.mincetur.gob.pe/directoriodeserviciosturisticos/DirPrestadores/DirBusquedaPrincipal

**Transporte**
- Autorización de transporte terrestre público de personas (gob.pe): https://www.gob.pe/13427
- Autorización de transporte privado/turístico, requisitos CITV y SOAT (gob.pe): https://www.gob.pe/13428-solicitar-autorizacion-para-prestar-transporte-privado-de-personas
- Ejemplo de resolución MTC de transporte turístico (vigencia 10 años, TUC): https://cdn.www.gob.pe/uploads/document/file/8074693/6774515-resolucion-directoral-n-2384-2025-mtc-17-02.pdf
- Ejemplo de autorización provincial en Piura (R.J. 33-2023-OTYCV-MPP): https://cdn.www.gob.pe/uploads/document/file/4831288/R.J.%2033-2023-OTYCV-MPP.pdf
- D.S. N.° 026-2020-MTC, TUC electrónica con código de verificación: https://lpderecho.pe/implementan-licencia-conducir-tarjeta-unica-circulacion-certificado-habilitacion-vehicular-especial-version-electronica-decreto-supremo-026-2020-mtc/
- Formato de TUC electrónica con QR (ATU, Anexo I): https://cdn.www.gob.pe/uploads/document/file/7426649/6326749-anexo-i.pdf
- Registro de transporte de personas (MTC): https://www.mtc.gob.pe/tramitesenlinea/tweb_tLinea/tw_consultadgtt/ntransporte_pasajeros.aspx
- Permiso de operación de transporte turístico acuático, GORE Piura (ejemplo): https://cdn.www.gob.pe/uploads/document/file/5749086/5107929-rdr-n-034-2023-18-01-2024.pdf
- Formalización de transporte marítimo turístico en Piura (Andina): https://andina.pe/ingles/noticia-visite-las-playas-los-organos-mancora-y-los-nuros-transporte-seguro-776519.aspx

**Verificación**
- Padrón reducido del RUC (SUNAT): https://orientacion.sunat.gob.pe/padron-reducido-del-ruc-para-descarga
- Plataforma Nacional de Firma Digital, Firma Perú: https://www.gob.pe/22271
