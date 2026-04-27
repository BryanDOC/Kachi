# Inventario UX/UI — Gastos Personales

> Documento de referencia para el rediseño. Describe todas las pantallas, componentes y flujos actuales del sistema tal como están implementados hoy.

---

## Contexto general del sistema

**Nombre del producto:** Gastos (Gestor personal de finanzas)  
**Audiencia:** Un solo usuario autenticado (app personal)  
**Idioma de la interfaz:** Español  
**Tema visual actual:** Dark mode exclusivo — fondo casi negro `#0A0A0A`, superficies zinc oscuras, acento principal ámbar/dorado  
**Tipografía:** Serif para títulos y montos destacados; sans-serif para el resto  
**Moneda base:** Soles peruanos (PEN / S/), con soporte para múltiples divisas  

---

## Mapa de pantallas

```
/ (raíz)
├── /login               → Inicio de sesión
├── /register            → Registro de cuenta
└── /dashboard           → Layout principal con sidebar
    ├── /dashboard                        → Inicio / Resumen del mes
    ├── /dashboard/transactions           → Lista de transacciones
    ├── /dashboard/transactions/new       → Formulario nueva transacción
    ├── /dashboard/trips                  → Lista de viajes/eventos
    ├── /dashboard/trips/[id]             → Detalle de un viaje
    ├── /dashboard/fixed                  → Gastos fijos recurrentes
    ├── /dashboard/reports                → Reportes y gráficas
    ├── /dashboard/categories             → Gestión de categorías
    └── /dashboard/settings               → Configuración de cuenta
```

---

## Layout global del dashboard

Todas las pantallas del área autenticada comparten este layout:

```
┌──────────────┬─────────────────────────────────────────────┐
│              │  [campana de notificaciones]  (top-right)   │
│   SIDEBAR    │─────────────────────────────────────────────│
│   (fijo,     │  [banners de alerta de presupuesto]         │
│   270px)     │─────────────────────────────────────────────│
│              │                                             │
│              │         CONTENIDO DE LA PÁGINA              │
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

### Sidebar
- Logo/nombre de la app en ámbar: "Gastos" + subtítulo "Gestor personal"
- Navegación con 7 ítems, cada uno con ícono + etiqueta
- Ítem activo: fondo ámbar, texto negro
- Ítem inactivo: texto gris, hover fondo zinc-900
- Botón "Cerrar sesión" al fondo del sidebar
- En móvil: oculto por defecto, se abre con botón hamburguesa + overlay semitransparente con blur

### Campana de notificaciones (top-right)
- Ícono de campana; si hay alertas activas muestra un badge rojo con conteo
- Al hacer clic abre un dropdown (280px de ancho) con lista de alertas de presupuesto
- Cada alerta indica categoría, monto gastado vs. límite
- Estados: amarillo = cercano al límite, rojo = límite superado
- Acciones: descartar alerta individual (X) o "Marcar todo leído"
- Estado vacío: mensaje "Sin notificaciones pendientes"

### Banners de alerta de presupuesto
- Se muestran debajo del top bar, encima del contenido
- Amarillo: al 80%+ del presupuesto de una categoría
- Rojo: presupuesto superado (100%+)
- Cada banner es descartable con X
- Animación de entrada/salida suave

---

## Pantallas de autenticación

### 1. Login `/login`

**Propósito:** Que el usuario acceda a su cuenta  
**Layout:** Pantalla centrada, fondo negro, tarjeta única al centro (max-width 448px)

**Elementos:**
- Título "Bienvenido" (serif grande) + subtítulo
- Botón primario: "Continuar con Google" (con logo de Google)
- Separador visual "O continúa con email"
- Campo: Email
- Campo: Contraseña
- Botón primario: "Iniciar sesión" (con estado de carga)
- Link al final: "¿No tienes cuenta? Regístrate"

**Comportamiento:**
- Redirecciona a `/dashboard` si ya hay sesión activa
- Muestra toast de error si las credenciales son incorrectas
- Google OAuth redirige a `/auth/callback` y luego al dashboard

---

### 2. Registro `/register`

**Propósito:** Crear una cuenta nueva  
**Layout:** Igual al login — pantalla centrada, tarjeta única

**Elementos:**
- Título "Crear cuenta" + subtítulo
- Botón: "Continuar con Google"
- Separador
- Campo: Nombre completo
- Campo: Email
- Campo: Contraseña
- Botón primario: "Crear cuenta"
- Link al final: "¿Ya tienes cuenta? Inicia sesión"

**Comportamiento:**
- Al registrarse con email ejecuta un seed automático (categorías por defecto)
- Redirecciona al dashboard tras crear la cuenta

---

## Pantallas del dashboard

### 3. Dashboard / Inicio `/dashboard`

**Propósito:** Resumen rápido de la situación financiera del mes actual

**Secciones:**

#### Header
- Título "Dashboard" + subtítulo "Resumen del mes actual"
- Botón CTA ámbar: "+ Nuevo gasto" → navega a `/dashboard/transactions/new`

#### Tarjetas de resumen (3 columnas en desktop, 1 en móvil)
Cada tarjeta tiene: ícono en círculo de color, etiqueta, monto grande en serif

| Tarjeta | Color borde/fondo | Ícono | Dato |
|---|---|---|---|
| Ingresos | Verde | TrendingUp | Total ingresos del mes |
| Gastos | Rojo | TrendingDown | Total gastos del mes |
| Balance | Ámbar (positivo) / Zinc (negativo) | DollarSign | Ingresos − Gastos |

#### Widget "Gastos fijos próximos" (condicional)
- Aparece solo si hay gastos fijos con cobro en los próximos 5 días
- Header con ícono de calendario + conteo en badge ámbar
- Lista de ítems: nombre del gasto fijo, días restantes, monto
- Urgencia visual: rojo = hoy, ámbar = 1-2 días, zinc = 3-5 días
- Link al pie: "Ver todos los gastos fijos →"

#### Lista "Transacciones recientes"
- Muestra las últimas 10 transacciones del mes
- Cada fila: descripción, fecha, badge de categoría (color de la categoría), monto (verde si ingreso, rojo si gasto)
- Estado vacío: mensaje + link "Crear primera transacción"

**Estados de carga:**
- Skeleton de 3 tarjetas rectangulares mientras carga

---

### 4. Transacciones `/dashboard/transactions`

**Propósito:** Ver, filtrar y eliminar todas las transacciones del mes

**Secciones:**

#### Header
- Título "Transacciones" + contador dinámico ("N transacciones")
- Botón CTA ámbar: "+ Nueva" → navega a `/dashboard/transactions/new`

#### Barra de filtros (tarjeta)
4 controles en grid (1 col móvil, 4 cols desktop):
1. **Búsqueda por texto** — campo con ícono de lupa, filtra por descripción
2. **Tipo** — dropdown: Todos / Gastos / Ingresos
3. **Categoría** — dropdown con todas las categorías disponibles
4. **Período** — dropdown: Este mes / Personalizado *(nota: el modo personalizado existe en el selector pero no implementa cambio de rango aún)*

#### Lista de transacciones
Cada ítem es una tarjeta con:
- Descripción (texto principal)
- Badge de categoría (fondo con color de la categoría al 12% de opacidad, texto del color)
- Fecha
- Subcategoría (si existe)
- Notas (si existen)
- Monto: grande, serif, verde (+) o rojo (−) según tipo
- Botón de eliminar (ícono papelera, visible en hover o siempre visible)

**Modal de confirmación de borrado:**
- Se abre al hacer clic en papelera
- Muestra descripción y monto de la transacción a eliminar
- Dos botones: "Cancelar" (secundario) y "Eliminar" (rojo, con estado de carga)

**Estado vacío:** Tarjeta con mensaje + link a crear transacción

---

### 5. Nueva transacción `/dashboard/transactions/new`

**Propósito:** Registrar un ingreso o gasto nuevo  
**Layout:** Formulario centrado, ancho máximo 672px, tarjeta con borde redondeado

**Flujo del formulario:**

#### Selector de tipo (toggle)
- Dos botones de igual tamaño: "Gasto" y "Ingreso"
- Activo Gasto: fondo rojo
- Activo Ingreso: fondo verde
- Inactivo: fondo zinc oscuro

#### Campos del formulario
| Campo | Tipo | Notas |
|---|---|---|
| Monto | Número (decimal) | Input grande, serif, obligatorio |
| Moneda | Dropdown | Lista de divisas configuradas por el usuario |
| Descripción | Texto | Placeholder "¿En qué gastaste?" |
| Fecha | Date picker | Por defecto: hoy |
| Categoría | Dropdown | Solo visible si el tipo es "Gasto" |
| Subcategoría | Dropdown | Solo visible si se seleccionó una categoría con subcategorías |
| Viaje | Dropdown | Solo visible si hay viajes activos; opcional |
| Notas | Textarea | Siempre opcional |

**Botones al pie:** "Cancelar" (secundario, vuelve atrás) y "Crear transacción" (primario ámbar)

**Comportamiento especial:**
- Si la URL trae `?trip=ID`, el campo viaje se pre-selecciona y al guardar redirige de vuelta al detalle del viaje

---

### 6. Viajes `/dashboard/trips`

**Propósito:** Organizar gastos agrupados por viaje o evento (ej: "Huaraz", "Cumpleaños")

**Secciones:**

#### Header
- Título "Viajes" + subtítulo "Organiza tus gastos por viaje o evento"
- Botón CTA ámbar: "+ Nuevo viaje"

#### Secciones de la lista
- **Viajes activos** — grid de tarjetas (1 col móvil, 2 col tablet, 3 col desktop)
- **Viajes completados** — misma estructura, opacidad reducida al 75%

#### Tarjeta de viaje
Tarjeta visual de tipo "cover card":
- Imagen de portada a pantalla completa (si no hay imagen: gradiente zinc)
- Overlay oscuro de gradiente (de abajo hacia arriba)
- Badge de estado (esquina superior derecha): Verde=Activo, Azul=Completado, Zinc=Cancelado
- En overlay inferior: nombre del viaje (serif), rango de fechas (si existe), total gastado en ámbar
- Botón "Editar" (esquina superior izquierda, visible solo en hover)
- Click en la tarjeta → navega al detalle del viaje

**Estado vacío:** Ícono de pin de mapa + mensaje + botón para crear primer viaje

#### Modal de creación/edición de viaje
- Área de upload de imagen de portada (zona dashed clickeable, preview con botón de remover)
- Nombre del viaje (obligatorio)
- Descripción (textarea, opcional)
- Fechas inicio y fin (2 date pickers en grid de 2 columnas)
- Estado: dropdown Activo / Completado / Cancelado
- Botones: Cancelar / Crear (o Guardar si es edición)

---

### 7. Detalle de viaje `/dashboard/trips/[id]`

**Propósito:** Ver el resumen financiero y las transacciones de un viaje específico

**Secciones:**

#### Link "Volver a viajes"

#### Hero del viaje
- Imagen de portada a ancho completo (altura 256px / 320px en desktop)
- Overlay gradiente oscuro
- Badge de estado
- Nombre del viaje (serif grande)
- Rango de fechas
- Descripción (si existe)

#### Tarjetas de stats (3 columnas)
| Stat | Descripción |
|---|---|
| Total gastado | Suma de todos los gastos del viaje (en ámbar) |
| Transacciones | Conteo de transacciones registradas |
| Categorías | Número de categorías distintas usadas |

#### Distribución por categoría (condicional — solo si hay gastos)
Dos columnas:
- **Izquierda:** Gráfica donut (PieChart) coloreada por categoría
- **Derecha:** Lista de categorías con color, nombre, monto y porcentaje del total

#### Lista de transacciones del viaje
- Header con título + botón "+ Agregar gasto" (pre-selecciona el viaje en el formulario)
- Misma estructura de ítem que la lista general de transacciones
- Sin opción de eliminar directamente desde aquí

---

### 8. Gastos fijos `/dashboard/fixed`

**Propósito:** Gestionar gastos recurrentes mensuales (Netflix, luz, suscripciones, etc.)

**Secciones:**

#### Header
- Título "Gastos Fijos" + subtítulo
- Botón CTA ámbar: "+ Nuevo"

#### Tarjeta resumen total
- Fondo ámbar oscuro
- "Total de gastos fijos activos al mes": suma de todos los activos
- Subtítulo con conteo de gastos activos

#### Grid de tarjetas activas (1/2/3 columnas según breakpoint)

Cada tarjeta de gasto fijo:
- Nombre del gasto (texto grande)
- Monto mensual (serif, grande)
- Día de cobro: "Se cobra el día X de cada mes" (con ícono de calendario)
- Categoría: badge con color de la categoría (si tiene)
- Notas (si existen)
- **Botón editar** (ícono lápiz, arriba derecha)
- **Toggle activo/inactivo** (ícono toggle verde si activo, zinc si inactivo)

#### Sección "Inactivos" (condicional)
- Misma estructura de tarjetas pero con opacidad al 60%

**Modal de creación/edición:**
| Campo | Tipo |
|---|---|
| Nombre | Texto |
| Monto | Número decimal |
| Moneda | Dropdown |
| Categoría | Dropdown (opcional) |
| Día de cobro | Número 1-31 |
| Notas | Textarea (opcional) |

---

### 9. Reportes `/dashboard/reports`

**Propósito:** Visualizar tendencias y distribución de gastos e ingresos

**Secciones:**

#### Header
- Título "Reportes" + subtítulo

#### Selector de período
4 botones tipo toggle (activo: ámbar, inactivo: zinc):
- Este mes
- Último trimestre
- Este año
- Personalizado → aparecen 2 date pickers (fecha inicio y fin)

#### Tarjetas "Gastos fijos vs Variables" (2 columnas)
- Gastos fijos del período (transacciones vinculadas a un gasto fijo)
- Gastos variables del período (el resto)

#### Gráfica A — Balance mensual
- Tipo: **ComposedChart** (barras + línea)
- Barras: Ingresos (verde) y Gastos (rojo) por mes
- Línea: Balance mensual (ámbar)
- Tooltips personalizados con formato de moneda
- Eje Y con prefijo "S/"
- Ocupa ancho completo, altura 300px

#### Gráficas B y C — 2 columnas (desktop)

**B. Gastos por categoría (Donut)**
- Tipo: PieChart con innerRadius (donut)
- Cada segmento: color de la categoría
- Centro del donut: total de gastos en texto
- Leyenda de colores debajo del gráfico
- Tooltip: nombre, monto, % del total

**C. Tendencia por categoría**
- Tipo: LineChart
- Una línea por categoría (colores de cada categoría)
- Eje X: semanas (períodos cortos) o meses (períodos largos)
- Las líneas se pueden mostrar/ocultar haciendo clic en su leyenda debajo del gráfico

#### Tabla D — Top subcategorías
Columnas: Subcategoría | Categoría | Total | % del total  
- Filas con >20% del total se marcan con fondo ámbar sutil y ícono ▲

#### Barras de progreso de presupuesto (condicional)
- Solo visible si hay categorías con límite de presupuesto configurado
- Una barra por categoría
- Header: nombre + "gastado / límite"
- Color de la barra: Verde (<60%), Amarillo (60-90%), Rojo (>90%)

---

### 10. Categorías `/dashboard/categories`

**Propósito:** Crear y gestionar las categorías y subcategorías usadas para clasificar gastos

**Secciones:**

#### Header
- Título "Categorías"
- Botón CTA ámbar: "+ Nueva categoría"

#### Lista de categorías (acordeón expandible)

Cada fila de categoría:
- Flecha expand/collapse (izquierda)
- Ícono de la categoría (sobre fondo coloreado al 20% de opacidad)
- Punto de color de la categoría
- Nombre de la categoría
- Conteo de subcategorías
- Límite de presupuesto mensual (en ámbar, si está configurado)
- Botón editar (lápiz)
- Botón eliminar (papelera roja)

**Estado expandido (acordeón abierto):**
- Lista de subcategorías con edición inline al hover (ícono lápiz/papelera)
- Al hacer clic en editar una subcat: input inline con teclas Enter/Escape para confirmar/cancelar
- Botón "+ Agregar subcategoría" al pie de la lista: abre input inline

#### Modal de creación/edición de categoría
Campos:
- **Nombre** — input de texto
- **Color** — paleta de 12 colores como botones circulares; el seleccionado tiene un check blanco
- **Ícono** — grid de ~30 íconos; el seleccionado tiene fondo ámbar
- **Límite de presupuesto mensual** — campo numérico (opcional), prefijo "S/"
- **Preview en vivo** — muestra cómo se verá la categoría con el ícono, color y nombre seleccionados

#### Modal de confirmación de eliminación
- Advierte que la acción no se puede deshacer
- Previene eliminar si la categoría tiene transacciones asociadas (muestra error con conteo)

---

### 11. Configuración `/dashboard/settings`

**Propósito:** Gestionar perfil personal, divisas disponibles y opciones de cuenta  
**Layout:** Ancho máximo 672px, secciones verticales separadas

#### Sección "Perfil"
- Avatar circular (64px): muestra foto si existe, sino ícono placeholder
- Botón "Cambiar foto" → input file oculto (acepta imágenes, máx 2MB)
- Campo "Nombre completo"
- Botón "Guardar cambios" (ámbar)

#### Sección "Divisas"
- Lista de divisas configuradas: símbolo en cuadro, código, nombre, badge "Predeterminada" si aplica
- Por divisa: botón estrella (establecer como predeterminada) + botón eliminar
- No se puede eliminar la divisa predeterminada
- No se puede eliminar una divisa que tenga transacciones asociadas
- Botón "+ Agregar" abre modal con 3 campos: código (ej: EUR), nombre (ej: Euro), símbolo (ej: €)

#### Sección "Zona de peligro"
- Fondo con borde rojo sutil
- Título en rojo con ícono de advertencia
- Botón "Eliminar cuenta" → abre modal de confirmación

**Modal "Eliminar cuenta":**
- Advierte que se borran todos los datos permanentemente
- Requiere escribir literalmente la palabra **ELIMINAR** para habilitar el botón de confirmar
- Botón de confirmar solo se activa cuando el texto coincide exactamente

---

## Patrones de UI recurrentes

### Botones
| Variante | Descripción visual |
|---|---|
| Primario | Fondo ámbar `#f59e0b`, texto negro, hover más claro |
| Secundario | Fondo zinc-800, texto zinc-300, hover zinc-700 |
| Destructivo | Fondo rojo-600, texto blanco |
| Outline | Sin fondo, borde visible |
| Icon-only | Solo ícono, fondo transparente, hover fondo zinc |

### Inputs y selects
- Fondo zinc-800/900, borde zinc-700
- Foco: ring ámbar + borde transparente
- Placeholder: zinc-500
- Error: mensaje debajo en rojo

### Tarjetas (cards)
- Fondo zinc-900, borde zinc-800
- Hover sutil: borde zinc-700
- Bordes redondeados `rounded-xl` (12px)
- Algunas tarjetas de stats tienen gradiente de fondo con color temático

### Modales
- Overlay negro semitransparente (backdrop-blur)
- Tarjeta centrada con borde zinc-800
- Título + contenido + botones de acción al pie
- Tamaños: sm / md / lg

### Estados de carga
- Skeleton animation (`animate-pulse`) con bloques zinc-900 del tamaño aproximado del contenido final

### Estados vacíos
- Ícono grande en zinc-600
- Mensaje descriptivo en zinc-500
- Link/botón de acción para crear el primer ítem

### Toasts (notificaciones flotantes)
- Aparecen en esquina (librería Sonner)
- Verde: éxito
- Rojo: error

### Animaciones de entrada
- La mayoría de elementos usan `motion.div` de Framer Motion
- Patrón: `opacity: 0, y: 20` → `opacity: 1, y: 0`
- Delay escalonado para listas (cada ítem: +50ms)
- Transiciones de página: fade suave

---

## Flujos principales

### Flujo 1: Registrar un gasto
1. Desde Dashboard o Transacciones → clic "+ Nuevo gasto"
2. Seleccionar tipo: Gasto
3. Ingresar monto, moneda, descripción, fecha
4. (Opcional) Categoría → subcategoría, viaje, notas
5. Clic "Crear transacción" → toast de éxito → redirige a lista de transacciones

### Flujo 2: Crear un viaje y agregar gastos
1. Ir a Viajes → "+ Nuevo viaje"
2. Subir imagen de portada (opcional), nombrar el viaje, fechas
3. El viaje aparece en la sección "Viajes activos"
4. Entrar al detalle del viaje → "+ Agregar gasto"
5. El formulario se abre con el viaje pre-seleccionado
6. Al guardar, vuelve al detalle del viaje y actualiza los totales

### Flujo 3: Configurar presupuesto de categoría
1. Ir a Categorías → editar una categoría existente o crear una nueva
2. En el modal, ingresar un valor en "Límite de presupuesto mensual"
3. Guardar
4. A partir de ese mes, la campana y los banners mostrarán alertas cuando se supere el 80% o el 100%

### Flujo 4: Gestionar gasto fijo
1. Ir a Gastos Fijos → "+ Nuevo"
2. Ingresar nombre, monto, moneda, día de cobro
3. El gasto aparece en el grid de activos
4. En el Dashboard aparecerá en el widget "Próximos gastos fijos" cuando falten ≤5 días para su cobro
5. Se puede desactivar con el toggle sin eliminar el registro

---

## Notas para el rediseño

- **Sin modo claro:** La app es 100% dark mode. No existe toggle de tema.
- **Color de acento único:** El ámbar (`#f59e0b`) es el único color de acción y marca. Verde y rojo son exclusivos para datos financieros (ingresos/gastos).
- **Densidad de información:** Las páginas de listado (transacciones, gastos fijos) muestran bastante info por fila — el rediseño debería considerar si simplificar o mantener la densidad.
- **Responsive actual:** Sidebar se oculta en móvil (hamburger). Grids colapsan a 1 columna. Las gráficas ocupan ancho completo.
- **Sin edición de transacciones:** Las transacciones solo se pueden crear o eliminar — no hay pantalla de edición.
- **Sin paginación:** Las listas de transacciones muestran todas las del mes sin paginación ni infinite scroll.
