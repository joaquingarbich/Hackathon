# CheckTur Piura · Diseños

Abre `index.html` en tu navegador para ver todas las pantallas con miniaturas.

Cada pantalla es un archivo `.html` independiente. Los botones y enlaces entre pantallas funcionan.
Las tipografías se cargan desde Google Fonts, así que se necesita conexión a internet.

## Estructura

### `00_Sistema_de_diseno/` · Sistema de diseño v0.2
Tokens claro y oscuro, tipografía, componentes y el sello.

- `00_Sistema_de_diseno/Sistema_de_diseno_v0.2.html` · Sistema de diseño · Sello v0.2

### `01_Web_cliente/` · Web cliente (catálogo)
Interfaz principal para turistas: experiencias, agencias y opiniones.

- `01_Web_cliente/escritorio/W01_Inicio_escritorio.html` · v2 · W1 Inicio (escritorio)
- `01_Web_cliente/escritorio/W04_Experiencia_escritorio_nueva.html` · v2 · W4 Experiencia (escritorio, nueva)
- `01_Web_cliente/movil/W01_Inicio_movil.html` · v2 · W1 Inicio (móvil)
- `01_Web_cliente/movil/W02_Resultados_movil_oscuro.html` · v2 · W2 Resultados (móvil, oscuro)
- `01_Web_cliente/movil/W04_Experiencia_movil_nueva.html` · v2 · W4 Experiencia (móvil, nueva)
- `01_Web_cliente/movil/W05_Verificar_movil.html` · v2 · Pestaña Verificar (móvil)

### `02_Verificador/` · Verificador
Consulta y dictamen de formalidad.

- `02_Verificador/escritorio/C03_Dictamen_escritorio.html` · v2 · C3 Dictamen (escritorio)
- `02_Verificador/movil/C01_Consulta.html` · v2 · C1 Consulta
- `02_Verificador/movil/C01b_Leyendo_captura_nueva.html` · v2 · C1b Leyendo captura (nueva)
- `02_Verificador/movil/C03_Dictamen_claro.html` · v2 · C3 Dictamen (claro)
- `02_Verificador/movil/C04_Placa_con_alerta_oscuro.html` · v2 · C4 Placa con alerta (oscuro)
- `02_Verificador/movil/C05_No_encontrado.html` · v2 · C5 No encontrado

### `03_Proveedor/` · Proveedor
Registro, inicio y documentos del proveedor.

- `03_Proveedor/movil/P02_RUC_con_validacion.html` · v2 · P2 RUC con validación
- `03_Proveedor/movil/P04_Codigo.html` · v2 · P4 Código
- `03_Proveedor/movil/P05_Inicio_proveedor.html` · v2 · P5 Inicio proveedor
- `03_Proveedor/movil/P07-P10_Documentos.html` · v2 · P7+P10 Documentos

### `04_Administracion/` · Administración
Cola y revisión de documentos.

- `04_Administracion/movil/A02_Cola.html` · v2 · A2 Cola
- `04_Administracion/movil/A03_Revision.html` · v2 · A3 Revisión

## Convenciones de nombres

- **W**: web cliente · **C**: verificador · **P**: proveedor · **A**: administración.
- El número indica el orden dentro del flujo. `escritorio` y `movil` separan los formatos.
- Solo incluye las versiones mejoradas tras la auditoría (v2). Los enlaces a pantallas que no tienen versión v2 quedan desactivados.

Datos de muestra: todos los nombres de empresas, RUC, placas y precios son ficticios.
