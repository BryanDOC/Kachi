# Kachi — Auditoría de App

> Generado el 2026-04-30

---

## 1. CRUD Críticos Faltantes

### Transacciones — sin edición
El gap más grave. El usuario solo puede eliminar y crear de nuevo. Una transacción con error de monto o categoría no tiene solución limpia.

### Viajes — sin edición ni eliminación
Una vez creado un viaje, no se puede cambiar nombre, fechas, estado ni imagen. La página `/dashboard/trips/completed` usa **datos mock hardcodeados**, no la base de datos real.

### Forgot password — botón muerto
El link existe en el login pero no hace nada. No hay flujo de recuperación de contraseña implementado.

---

## 2. Funcionalidades Básicas Olvidadas

### Budget limits
La categoría ya tiene el campo `budget_limit` en la DB pero nunca se usa. Está siendo desperdiciado — podría mostrar alertas visuales cuando el usuario se acerca al límite mensual.

### Transacciones — solo mes actual
En `/transactions` el date range está hardcodeado al mes actual. No se puede ver historial de meses anteriores desde esa pantalla.

### Gastos fijos no generan transacciones
Los gastos fijos son decorativos. El usuario los carga pero luego tiene que crear la transacción manualmente cuando paga. El flujo natural sería: "marcar como pagado" → registra la transacción automáticamente.

### Ingresos sin categoría
Solo los gastos tienen categorías. Si el usuario quiere saber de dónde vienen sus ingresos (salario, freelance, venta) no puede rastrearlo.

---

## 3. UX/UI — Pasos de Más

### El botón `+` no aparece en el header de /transactions
El FAB del footer funciona desde cualquier página, pero en `/transactions` el usuario ve la lista y para agregar tiene que bajar al footer. Podría haber un botón `+` en el PageHeader de esa página directamente.

### Crear categoría requiere salir de la pantalla
Al crear una transacción, si la categoría no existe el usuario tiene que salir, ir a `/categories`, crearla, y volver. Los tags sí se pueden crear on-the-fly pero las categorías no.

### Viaje no se puede completar desde su detalle
Para cambiar el estado de un viaje hay que ir a la lista, buscar el viaje, y editarlo (que actualmente no funciona). El flujo ideal: botón "Completar viaje" directamente en `/trips/[id]`.

### Dashboard muestra balance total histórico
El balance actual suma todas las transacciones desde el inicio de los tiempos. El usuario no tiene contexto de si ese número es bueno o malo para el mes. Debería mostrar el balance del mes actual por defecto.

### Settings — página larga en móvil
Perfil + divisas + zona de peligro en una sola página vertical. Para móvil se siente pesado. Podría dividirse con acordeones o secciones con navegación interna.

---

## 4. Funcionalidades Extra de Valor

### Presupuesto mensual por categoría
Ya existe el campo `budget_limit` en la tabla `categories`. Solo falta activarlo: mostrar "Gastaste S/80 de S/100 en Salidas este mes" con alerta visual cuando el usuario se acerca al límite. Complementa perfectamente los reportes.

### Comparación mes actual vs mes anterior
En el dashboard, una línea simple: "Este mes S/850 — el anterior S/920 (−9%)". Sin charts adicionales, solo números con flecha de tendencia.

### Marcar gasto fijo como pagado → genera transacción
Botón "Pagar" en la card de gasto fijo que abre el sheet pre-llenado con el monto, categoría y descripción del gasto fijo. Le ahorra al usuario 4–5 toques por gasto recurrente.

### Resumen semanal
Vista simple en el dashboard o reportes: esta semana gastaste X, la semana pasada Y. Sin charts complejos, solo números comparativos.

### Ingresos con categoría
Permitir asignar categorías a los ingresos (Salario, Freelance, Venta, etc.) para que los reportes muestren también de dónde viene el dinero, no solo a dónde va.

---

## 5. Matriz de Estado Actual

| Página | Ruta | Crear | Leer | Editar | Eliminar | Notas |
|--------|------|:-----:|:----:|:------:|:--------:|-------|
| Login | `/login` | — | — | — | — | OAuth + email. Forgot password sin implementar |
| Dashboard | `/dashboard` | ✓* | ✓ | — | — | *Vía sheet. Balance es total histórico |
| Transacciones | `/transactions` | ✓ | ✓ | ✗ | ✓ | **Sin edición**. Solo mes actual |
| Categorías | `/categories` | ✓ | ✓ | ✓ | ✓ | Checks de integridad referencial |
| Tags | `/categories` | ✓ | ✓ | ✓ | ✓ | Gestionados dentro de categorías |
| Gastos Fijos | `/fixed` | ✓ | ✓ | ✓ | †  | †Solo soft delete (toggle activo/inactivo) |
| Viajes | `/trips` | ✓ | ✓ | ✗ | ✗ | **Sin edición ni eliminación** |
| Detalle viaje | `/trips/[id]` | ✓* | ✓ | ✗ | ✗ | *Solo transacciones. Sin editar/eliminar viaje |
| Viajes completados | `/trips/completed` | — | ✓ | — | — | **Datos mock hardcodeados** |
| Reportes | `/reports` | — | ✓ | — | — | Solo lectura/análisis |
| Configuración | `/settings` | — | ✓ | ✓ | ✓ | Perfil, divisas, eliminar cuenta |

---

## 6. Prioridad de Implementación

| Prioridad | Qué |
|-----------|-----|
| 🔴 Crítico | Editar transacción |
| 🔴 Crítico | Editar y eliminar viaje |
| 🔴 Crítico | Conectar `/trips/completed` a datos reales |
| 🔴 Crítico | Forgot password / reset flow |
| 🟡 Importante | Date range configurable en `/transactions` |
| 🟡 Importante | Budget limits activos (campo ya existe en DB) |
| 🟡 Importante | "Pagar" gasto fijo → crea transacción pre-llenada |
| 🟡 Importante | Crear categoría inline desde el sheet de transacción |
| 🟢 Valor extra | Balance del mes actual en dashboard (no histórico) |
| 🟢 Valor extra | Comparación mes actual vs mes anterior |
| 🟢 Valor extra | Ingresos con categoría |
| 🟢 Valor extra | Marcar viaje completado desde su página de detalle |
| 🟢 Valor extra | Resumen semanal en dashboard o reportes |
