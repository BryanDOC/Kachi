# 📊 Planning — App de Gastos Personales
> Stack: Next.js 14 (TypeScript) · Supabase · Vercel · TailwindCSS · Recharts · PWA + Offline

---

## 🧱 Stack Definitivo

| Capa | Tecnología | Versión | Notas |
|------|-----------|---------|-------|
| Framework | Next.js (App Router) | 14.x | TypeScript estricto |
| Estilos | TailwindCSS | 3.x | + clsx, tailwind-merge |
| Auth | Supabase Auth | latest | Google OAuth + email/password |
| Base de datos | Supabase PostgreSQL | latest | Row Level Security habilitado |
| Storage | Supabase Storage | latest | Imágenes de tarjetas de viaje |
| Gráficas | Recharts | 2.x | Libre, React-native |
| Animaciones | Framer Motion | 11.x | Transiciones suaves |
| Íconos | Lucide React | latest | Consistente con diseño |
| Formularios | React Hook Form + Zod | latest | Validación TypeScript-first |
| Estado global | Zustand | 4.x | Liviano, simple |
| Notificaciones UI | Sonner | latest | Toasts elegantes |
| PWA | next-pwa | 5.x | Manifest, service worker, ícono en home screen |
| Offline DB local | Dexie.js | 3.x | IndexedDB wrapper — cola de sync offline |
| Deploy Frontend | Vercel | — | Plan Free (hobby) |
| Deploy Backend | Supabase | — | Plan Free (500MB DB, 1GB storage) |

---

## 🗄️ Modelo de Base de Datos (Supabase PostgreSQL)

### Tabla: `profiles`
```sql
id          uuid  PRIMARY KEY REFERENCES auth.users(id)
full_name   text
avatar_url  text
created_at  timestamptz DEFAULT now()
```

### Tabla: `currencies`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
code        text UNIQUE NOT NULL  -- 'PEN', 'USD'
name        text NOT NULL         -- 'Sol Peruano', 'Dólar'
symbol      text NOT NULL         -- 'S/', '$'
is_default  boolean DEFAULT false
user_id     uuid REFERENCES profiles(id)
created_at  timestamptz DEFAULT now()
```

### Tabla: `categories`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id     uuid REFERENCES profiles(id)
name        text NOT NULL         -- 'Pasajes', 'Entretenimiento'
color       text                  -- '#FF5733' (para gráficas)
icon        text                  -- nombre de ícono Lucide
budget_limit numeric(12,2)        -- tope mensual (nullable)
created_at  timestamptz DEFAULT now()
```

### Tabla: `subcategories`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
category_id  uuid REFERENCES categories(id) ON DELETE CASCADE
user_id      uuid REFERENCES profiles(id)
name         text NOT NULL         -- 'Ir a ver a mi novia'
created_at   timestamptz DEFAULT now()
```

### Tabla: `fixed_expenses`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES profiles(id)
name            text NOT NULL           -- 'Netflix', 'Luz'
amount          numeric(12,2) NOT NULL
currency_id     uuid REFERENCES currencies(id)
category_id     uuid REFERENCES categories(id)
billing_day     int                      -- día del mes que se cobra
is_active       boolean DEFAULT true     -- permite "quitar" sin borrar
last_updated    timestamptz DEFAULT now()
notes           text
created_at      timestamptz DEFAULT now()
```

### Tabla: `trips`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id      uuid REFERENCES profiles(id)
name         text NOT NULL              -- 'Huaraz 2025'
description  text
cover_image  text                       -- URL de Supabase Storage
status       text DEFAULT 'active'      -- 'active' | 'completed' | 'cancelled'
start_date   date
end_date     date
created_at   timestamptz DEFAULT now()
```

### Tabla: `transactions`
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id          uuid REFERENCES profiles(id)
type             text NOT NULL        -- 'expense' | 'income'
amount           numeric(12,2) NOT NULL
currency_id      uuid REFERENCES currencies(id)
category_id      uuid REFERENCES categories(id)  -- nullable para ingresos
subcategory_id   uuid REFERENCES subcategories(id)  -- nullable
trip_id          uuid REFERENCES trips(id)       -- nullable (gastos del viaje)
fixed_expense_id uuid REFERENCES fixed_expenses(id) -- nullable (si viene de un fijo)
description      text NOT NULL
date             date NOT NULL DEFAULT CURRENT_DATE
notes            text
created_at       timestamptz DEFAULT now()
```

> **Nota RLS:** Todas las tablas tienen Row Level Security activado con política `user_id = auth.uid()`.

---

## 🗂️ Estructura del Proyecto Next.js

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  ← sidebar + navbar
│   │   ├── page.tsx                    ← Dashboard principal
│   │   ├── transactions/
│   │   │   ├── page.tsx                ← Listado de transacciones
│   │   │   └── new/page.tsx            ← Formulario nuevo gasto/ingreso
│   │   ├── trips/
│   │   │   ├── page.tsx                ← Grid de cards de viajes
│   │   │   └── [id]/page.tsx           ← Detalle de viaje + sus transacciones
│   │   ├── fixed/
│   │   │   └── page.tsx                ← Gastos fijos
│   │   ├── categories/
│   │   │   └── page.tsx                ← Gestión de categorías + presupuestos
│   │   ├── reports/
│   │   │   └── page.tsx                ← Gráficas y reportes
│   │   └── settings/
│   │       └── page.tsx                ← Divisas, perfil, preferencias
│   ├── api/
│   │   ├── transactions/route.ts
│   │   ├── trips/route.ts
│   │   └── budgets/alerts/route.ts
│   └── layout.tsx                      ← Root layout (dark mode, fonts)
├── components/
│   ├── ui/                             ← Componentes base (Button, Input, Modal…)
│   ├── transactions/
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   └── TransactionCard.tsx
│   ├── trips/
│   │   ├── TripCard.tsx
│   │   ├── TripForm.tsx
│   │   └── TripDetail.tsx
│   ├── charts/
│   │   ├── SpendingByCategory.tsx
│   │   ├── MonthlyBalance.tsx
│   │   └── TrendLine.tsx
│   ├── budget/
│   │   └── BudgetAlert.tsx
│   ├── fixed/
│   │   └── FixedExpenseCard.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Navbar.tsx
│       └── ThemeProvider.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts                    ← Tipos generados de Supabase
│   ├── hooks/
│   │   ├── useTransactions.ts
│   │   ├── useTrips.ts
│   │   ├── useBudgets.ts
│   │   └── useCurrencies.ts
│   ├── utils/
│   │   ├── currency.ts                 ← Formateo de monedas
│   │   ├── date.ts
│   │   └── calculations.ts
│   └── validations/
│       ├── transaction.schema.ts
│       └── trip.schema.ts
├── store/
│   └── useAppStore.ts                  ← Zustand store global
├── types/
│   └── index.ts
├── middleware.ts                        ← Protección de rutas auth
└── .env.local
```

---

## 📅 Sprints

---

### 🚀 Sprint 0 — Setup y Scaffolding
**Duración estimada:** 1–2 horas
**Objetivo:** Proyecto corriendo localmente con auth funcional

#### Prompt de inicialización del proyecto (vibe coding)

Usar este prompt exacto al iniciar con tu IA de preferencia (Cursor, GitHub Copilot, etc.):

```
Create a new Next.js 14 project with the following specifications:
- TypeScript strict mode enabled
- App Router (not Pages Router)
- TailwindCSS configured
- ESLint + Prettier configured
- Folder structure:
  /app/(auth)/login
  /app/(auth)/register
  /app/(dashboard)/page.tsx
  /app/(dashboard)/layout.tsx
  /app/api
  /components/ui
  /components/layout
  /lib/supabase
  /lib/hooks
  /lib/utils
  /store
  /types

Install these dependencies:
- @supabase/supabase-js @supabase/ssr
- framer-motion
- recharts
- react-hook-form @hookform/resolvers zod
- zustand
- sonner
- lucide-react
- clsx tailwind-merge
- date-fns

Create /lib/supabase/client.ts with browser Supabase client
Create /lib/supabase/server.ts with server Supabase client using cookies
Create middleware.ts that protects all routes under /dashboard and redirects unauthenticated users to /login
Create .env.local.example with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY variables
```

#### Tareas manuales en Supabase Dashboard:
- [ ] Crear proyecto en supabase.com
- [ ] Habilitar Google OAuth en Authentication > Providers
- [ ] Configurar redirect URL: `https://tu-dominio.vercel.app/auth/callback`
- [ ] Ejecutar el SQL del modelo de datos (sección anterior)
- [ ] Activar RLS en todas las tablas
- [ ] Crear políticas RLS por tabla
- [ ] Crear bucket `trip-covers` en Storage (público)

#### Variables de entorno:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

---

### 🔐 Sprint 1 — Autenticación
**Duración estimada:** 3–4 horas
**Objetivo:** Login con Google y email/password funcionando

#### Prompt Sprint 1:

```
Build the authentication system for a Next.js 14 App Router app using Supabase Auth.

Requirements:
1. /app/(auth)/login/page.tsx
   - Sign in with Google button (OAuth)
   - Email + password form using React Hook Form + Zod
   - Validation: email format, password min 8 chars
   - Show loading state while submitting
   - Redirect to /dashboard on success
   - Error messages displayed inline

2. /app/(auth)/register/page.tsx  
   - Full name, email, password, confirm password
   - Same validation approach
   - On success: redirect to /dashboard

3. /app/auth/callback/route.ts
   - Handle OAuth callback from Supabase

4. /components/layout/ThemeProvider.tsx
   - Detects system dark/light preference via prefers-color-scheme
   - No toggle needed — purely automatic

5. Design requirements:
   - Dark background (#0A0A0A or similar)
   - Minimalist but striking — large centered card
   - Smooth fade-in animation with Framer Motion on mount
   - Font: use a distinctive Google Font (NOT Inter, NOT Roboto)
   - Accent color: amber/gold (#F59E0B) or electric green (#22C55E)
   - Google OAuth button styled elegantly
   - Fully responsive

6. middleware.ts:
   - Protect /dashboard/* routes
   - Redirect to /login if not authenticated
   - Redirect to /dashboard if already authenticated and trying to access /login
```

#### Checklist de verificación:
- [ ] Login con Google redirige correctamente
- [ ] Login con email/password funciona
- [ ] Registro crea usuario en Supabase Auth y en tabla `profiles`
- [ ] Rutas protegidas redirigen a /login
- [ ] Dark mode activa automáticamente

---

### 💰 Sprint 2 — Transacciones (core)
**Duración estimada:** 6–8 horas
**Objetivo:** Registrar gastos e ingresos diarios con categorías y subcategorías

#### Prompt Sprint 2 — Parte A (Dashboard base + formulario):

```
Build the main dashboard and transaction form for a personal expense tracker.

Context:
- Next.js 14 App Router + TypeScript + TailwindCSS + Supabase
- Supabase tables: transactions, categories, subcategories, currencies (see schema)
- User is already authenticated via Supabase Auth

Build these components:

1. /app/(dashboard)/layout.tsx
   - Sidebar with navigation: Dashboard, Transactions, Trips, Fixed Expenses, Reports, Settings
   - Each nav item has a Lucide icon
   - User avatar in bottom of sidebar (from profiles table)
   - Collapse/expand sidebar on mobile
   - Smooth slide animation with Framer Motion

2. /app/(dashboard)/page.tsx — Dashboard
   - Top summary cards: Total Income this month, Total Expenses this month, Balance (income - expenses)
   - Balance card changes color: green if positive, red if negative
   - Recent transactions list (last 10)
   - Quick "Add expense" floating button

3. /app/(dashboard)/transactions/new/page.tsx — New Transaction Form
   - Type selector: Expense | Income (tab/toggle, not dropdown)
   - Amount input (large, prominent — the star of the form)
   - Currency selector: shows all currencies from user's currencies table
   - Description text input
   - Date picker (defaults to today)
   - Category selector (only shown for expenses) — fetches from categories table
   - Subcategory selector — appears after category is selected, fetches subcategories by category_id
   - Notes textarea (optional, collapsible)
   - Submit button with loading state
   - On success: show toast notification (Sonner) and redirect to /transactions

4. TypeScript types in /types/index.ts:
   - Transaction, Category, Subcategory, Currency, Profile, Trip types matching the DB schema

5. /lib/hooks/useTransactions.ts
   - Fetch transactions for current user
   - Filter by date range, category, subcategory
   - Returns: transactions, isLoading, error, refetch

6. /lib/utils/currency.ts
   - formatCurrency(amount: number, currencyCode: string): string
   - Formats as 'S/ 25.50' or '$ 10.00'
```

#### Prompt Sprint 2 — Parte B (listado y filtros):

```
Build the transactions list page for the expense tracker.

1. /app/(dashboard)/transactions/page.tsx
   - Search bar (filter by description)
   - Filter by: category, subcategory, date range (this month | last month | this quarter | this year | custom)
   - Filter by: type (expense | income | all)
   - Sorted by date descending by default
   - Each transaction row shows: date, description, category badge (colored), subcategory, amount (red for expense, green for income), currency
   - Click on row opens edit modal
   - Delete button with confirmation dialog

2. Edit modal for transactions:
   - Same fields as creation form
   - Pre-populated with existing data
   - Save changes updates Supabase record

3. Budget alerts:
   - When rendering categories in the form, fetch budget_limit from categories
   - If current month spending in that category >= 80% of budget_limit: show yellow warning
   - If >= 100%: show red alert with message "Has alcanzado el límite de tu presupuesto en [categoría]"
   - Show this alert as a banner at top of /transactions/new when applicable
```

#### Checklist de verificación:
- [ ] Crear gasto con categoría y subcategoría funciona
- [ ] Crear ingreso funciona (sin categoría)
- [ ] Filtros de transacciones funcionan
- [ ] Editar y eliminar funcionan
- [ ] Alerta de presupuesto aparece en rojo/amarillo
- [ ] Balance en dashboard se actualiza

---

### 🧾 Sprint 3 — Gastos Fijos
**Duración estimada:** 3–4 horas
**Objetivo:** Gestionar gastos recurrentes (Netflix, Luz, Spotify, etc.)

#### Prompt Sprint 3:

```
Build the fixed expenses management page for the expense tracker.

Context: Supabase table `fixed_expenses` with fields: id, user_id, name, amount, currency_id, category_id, billing_day, is_active, notes

1. /app/(dashboard)/fixed/page.tsx
   - Grid of cards, each representing a fixed expense
   - Card shows: name, amount + currency, category, billing day ("Se cobra el día 15 de cada mes"), status badge (active/inactive)
   - Total sum of active fixed expenses shown at top
   - "Add fixed expense" button

2. Each fixed expense card:
   - Edit button: opens modal to edit name, amount, currency, category, billing_day, notes
   - Toggle active/inactive: soft delete (sets is_active = false). Inactive cards shown grayed out, can be re-activated
   - The amount field is editable because bills like electricity vary each month

3. "Add fixed expense" modal:
   - Fields: name, amount, currency, category, billing day (1-31), notes
   - React Hook Form + Zod validation

4. Monthly impact:
   - Show card at top: "Tus gastos fijos activos suman S/ XXX al mes"
   - When user registers a transaction for the current month and that fixed expense already has a transaction, show subtle indicator

5. Smooth enter/exit animations on cards with Framer Motion (AnimatePresence)
```

#### Checklist:
- [ ] Crear gasto fijo funciona
- [ ] Editar monto (para facturas variables como luz) funciona
- [ ] Desactivar/activar funciona sin borrar registro
- [ ] Total mensual se calcula correctamente

---

### 🗺️ Sprint 4 — Viajes / Eventos
**Duración estimada:** 5–6 horas
**Objetivo:** Cards de viajes con gastos internos, imagen de portada, estados

#### Prompt Sprint 4:

```
Build the trips/events feature for the expense tracker. This is inspired by airline "upcoming trips" cards UI.

Context: Supabase tables `trips` and `transactions` (with trip_id nullable FK)
Supabase Storage bucket: 'trip-covers' (public)

1. /app/(dashboard)/trips/page.tsx
   - Masonry or horizontal scroll grid of trip cards
   - Each card has:
     * Cover image (uploaded by user to Supabase Storage, or default gradient placeholder)
     * Trip name (large, overlaid on image)
     * Date range
     * Status badge: 'Activo' (green) | 'Completado' (blue) | 'Cancelado' (gray)
     * Total spent (sum of all transactions with this trip_id)
     * Hover effect: subtle scale + overlay reveal with "Ver detalle" CTA
   - "New trip" button opens creation modal

2. Trip creation/edit modal:
   - Name, description, start date, end date, status
   - Cover image upload: drag & drop or click to select, previews before saving, uploads to Supabase Storage

3. /app/(dashboard)/trips/[id]/page.tsx — Trip Detail
   - Large hero image at top (cover image)
   - Trip name, dates, description, status
   - Summary: total spent in this trip, broken down by category (small pie chart)
   - Transaction list: all transactions with this trip_id
   - "Add expense to this trip" button — opens same transaction form but pre-selects this trip_id
   - Edit trip button (name, dates, image, status)

4. In the main transaction form (/transactions/new):
   - Add optional "Trip" selector: dropdown showing active trips
   - If user selects a trip, the transaction gets linked to it (trip_id set)

5. On the main /trips page:
   - Separate sections: "Viajes activos" and "Viajes completados"
   - Completed trips shown smaller, still accessible
```

#### Checklist:
- [ ] Crear viaje con imagen funciona
- [ ] Imagen se sube a Supabase Storage correctamente
- [ ] Total de gasto del viaje se calcula
- [ ] Transacciones se pueden ligar a un viaje
- [ ] Detalle del viaje muestra breakdown por categoría

---

### 📈 Sprint 5 — Reportes y Gráficas
**Duración estimada:** 4–5 horas
**Objetivo:** Visualización de gastos por período con filtros

#### Prompt Sprint 5:

```
Build the reports and analytics page for the expense tracker using Recharts.

1. /app/(dashboard)/reports/page.tsx

   Period selector at the top:
   - Buttons: Este mes | Último trimestre | Este año | Personalizado
   - Custom range: date range picker

   Charts to implement (all using Recharts):

   A. Monthly Balance Bar Chart
   - X axis: months
   - Two bars per month: Income (green) and Expenses (red)
   - Line overlay showing net balance

   B. Expenses by Category — Donut Chart
   - Each slice = one category (use category.color)
   - Center shows total amount
   - Hover shows category name + amount + percentage
   - Legend below

   C. Category Trend — Line Chart
   - Multi-line chart: one line per category
   - X axis: weeks or months depending on selected period
   - Toggle lines on/off by clicking legend

   D. Top Subcategories Table
   - Table showing: subcategory name | parent category | total spent | % of total
   - Sorted by amount descending
   - Highlights row if it exceeds 20% of total

   E. Fixed vs Variable Expenses
   - Simple stat cards: "Gastos fijos: S/ XXX" vs "Gastos variables: S/ XXX"

2. All charts must:
   - Animate on mount (Recharts built-in)
   - Show currency-formatted tooltips (using formatCurrency util)
   - Respect dark mode (adjust stroke/fill colors)
   - Be fully responsive (ResponsiveContainer)

3. Budget progress bars:
   - For each category with a budget_limit set:
   - Show: category name | progress bar | "S/ spent / S/ limit"
   - Bar color: green < 60%, yellow 60-90%, red > 90%
```

#### Checklist:
- [ ] Donut chart de categorías renderiza correctamente
- [ ] Filtros de período funcionan y actualizan todos los charts
- [ ] Progress bars de presupuesto muestran colores correctos
- [ ] Charts son responsivos en mobile

---

### ⚙️ Sprint 6 — Configuración y Categorías
**Duración estimada:** 3–4 horas
**Objetivo:** Gestionar categorías, subcategorías, divisas, presupuestos

#### Prompt Sprint 6:

```
Build the settings and categories management pages.

1. /app/(dashboard)/categories/page.tsx
   - List of categories with name, color swatch, icon, budget_limit (if set)
   - Expand category to see subcategories list
   - Add/edit/delete category (modal)
   - Add/edit/delete subcategory (inline or modal)
   - Set budget limit per category (input with currency selector)
   - Color picker for category (simple palette of 12 colors)
   - Icon picker: grid of Lucide icons to choose from

2. /app/(dashboard)/settings/page.tsx
   - Profile section: edit full_name, avatar upload
   - Currencies section:
     * List active currencies with symbol and code
     * Toggle default currency
     * Add new currency: code + name + symbol
     * Cannot delete currency if used in transactions
   - Danger zone: delete account (with confirmation)

3. Seed default categories on first login:
   - Automatically create these categories for new users:
     Transporte, Alimentación, Entretenimiento, Salud, Educación, 
     Hogar, Ropa, Viajes, Otros
   - Default currencies: PEN (S/) set as default, USD ($)
   - This seeding happens in the auth callback via Supabase Edge Function or API route
```

#### Checklist:
- [ ] Categorías por defecto se crean al registrarse
- [ ] Divisas PEN y USD disponibles desde el inicio
- [ ] Presupuesto por categoría se puede configurar
- [ ] Subcategorías se pueden crear dentro de categorías

---

### 🔔 Sprint 7 — Notificaciones y Pulido Final
**Duración estimada:** 3–4 horas
**Objetivo:** Sistema de alertas y refinamiento de UX/UI

#### Prompt Sprint 7:

```
Implement notifications, budget alerts, and UI polish for the expense tracker.

1. Budget alerts system:
   - On every page load, check all categories with budget_limit set
   - For current month: if spending >= 80% of limit, create alert object
   - Show alerts as dismissible banners at top of dashboard
   - Yellow banner: "Estás al 85% de tu presupuesto de [Categoría] este mes"
   - Red banner: "¡Superaste el presupuesto de [Categoría]! (S/ X gastado de S/ Y)"
   - Store dismissed alerts in localStorage to not show again same day

2. Notification bell in navbar:
   - Badge count showing active budget alerts
   - Dropdown showing all active warnings
   - Mark all as read clears badge

3. Fixed expense reminders:
   - On dashboard, show a card: "Gastos fijos pendientes este mes"
   - List fixed expenses where billing_day is within next 5 days
   - Example: "💡 Luz — vence en 3 días — S/ ~X"

4. UI Polish pass:
   - Ensure all animations use Framer Motion consistently
   - Page transitions: fade + slight upward slide
   - Loading skeletons for all data-fetching states (not just spinners)
   - Empty states with illustrations/icons and helpful CTAs
   - Mobile responsiveness audit: test sidebar, forms, charts on 375px viewport
   - Ensure all money amounts use formatCurrency consistently
   - Keyboard navigation working (Tab order correct in forms)

5. Error handling:
   - Global error boundary component
   - Toast notifications (Sonner) for all mutations: success + error states
   - Network error handling with retry option
```

#### Checklist:
- [ ] Alertas de presupuesto aparecen en dashboard
- [ ] Campana de notificaciones muestra conteo
- [ ] Recordatorios de gastos fijos próximos
- [ ] Loading skeletons en lugar de spinners
- [ ] App funciona bien en mobile (375px)

---

### 🚢 Sprint 8 — Deploy
**Duración estimada:** 1–2 horas
**Objetivo:** App corriendo en producción

#### Pasos en Vercel:
1. Conectar repositorio GitHub a Vercel
2. Framework preset: Next.js (auto-detectado)
3. Agregar environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
4. Deploy → obtener URL de producción (ej: `gastos-app.vercel.app`)

#### Pasos en Supabase:
1. En Authentication > URL Configuration:
   - Site URL: `https://gastos-app.vercel.app`
   - Redirect URLs: `https://gastos-app.vercel.app/auth/callback`
2. Verificar que todas las políticas RLS estén activas

#### Prompt de verificación post-deploy:
```
Review this Next.js app for production readiness:
- Check all environment variables are accessed correctly (NEXT_PUBLIC_ prefix for client, no prefix for server)
- Verify no secrets are exposed in client components
- Check that all Supabase queries have error handling
- Verify middleware.ts correctly protects all dashboard routes
- Check next.config.js has proper image domains for Supabase Storage URLs
```

---

## 🎨 Guía de Diseño

### Paleta de colores
```css
/* Dark mode (default cuando el sistema lo active) */
--bg-primary:     #0C0C0E;   /* fondo principal casi negro */
--bg-secondary:   #161618;   /* cards, sidebar */
--bg-elevated:    #1E1E22;   /* modales, inputs */
--border:         #2A2A30;   /* bordes sutiles */
--text-primary:   #F0F0F5;   /* texto principal */
--text-muted:     #70707A;   /* texto secundario */
--accent:         #F59E0B;   /* amber/gold — acción principal */
--positive:       #22C55E;   /* ingresos, balance positivo */
--negative:       #EF4444;   /* gastos, balance negativo */
--warning:        #F97316;   /* alertas de presupuesto */
```

### Tipografía sugerida (Google Fonts)
- Display / Montos grandes: **DM Serif Display** — elegante, diferente
- UI / Cuerpo: **DM Sans** — compañera perfecta de DM Serif

### Principios de animación
- Duración estándar: 200–300ms
- Easing: `easeOut` para entradas, `easeIn` para salidas
- Hover en cards: `scale(1.02)` + `shadow-lg`
- Page transitions: `opacity 0→1` + `translateY 8px→0`
- Nunca animar más de 2 propiedades simultáneamente en elementos pequeños

---

## ✅ Checklist Global antes de Sprint 1

- [ ] Node.js 18+ instalado localmente
- [ ] Cuenta en Supabase creada (supabase.com)
- [ ] Cuenta en Vercel creada (vercel.com)
- [ ] Proyecto en GitHub creado (privado)
- [ ] Google OAuth configurado en Google Cloud Console
  - Crear proyecto en console.cloud.google.com
  - Habilitar Google+ API
  - Crear credenciales OAuth 2.0
  - Agregar authorized redirect URI de Supabase
- [ ] Editor: VS Code con extensiones (Tailwind CSS IntelliSense, Prisma, ESLint)

---

---

### 📱 Sprint 9 — PWA (Instalar como App en Android)
**Duración estimada:** 2–3 horas
**Objetivo:** La web se comporta como una app instalable en Android con ícono en pantalla de inicio

#### Prompt Sprint 9:

```
Convert this Next.js 14 app into a fully installable PWA optimized for Android.

1. Install and configure next-pwa:
   - npm install next-pwa
   - Configure next.config.js to enable PWA in production only (disable in dev)
   - Set dest: 'public' for service worker output

2. Create /public/manifest.json:
   {
     "name": "Mis Gastos",
     "short_name": "Gastos",
     "description": "Tracker de gastos personales",
     "start_url": "/dashboard",
     "display": "standalone",
     "background_color": "#0C0C0E",
     "theme_color": "#0C0C0E",
     "orientation": "portrait",
     "icons": [
       { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
       { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
     ]
   }

3. Generate app icons:
   - Create a simple SVG icon representing money/expenses (coin, wallet, or chart)
   - Use accent color #F59E0B on dark background #0C0C0E
   - Export as PNG in sizes: 192x192, 512x512, and maskable 512x512
   - Place in /public/icons/

4. Add to root layout.tsx:
   - <link rel="manifest" href="/manifest.json" />
   - <meta name="theme-color" content="#0C0C0E" />
   - <meta name="mobile-web-app-capable" content="yes" />
   - <meta name="apple-mobile-web-app-capable" content="yes" />
   - <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

5. Install prompt component /components/ui/InstallPrompt.tsx:
   - Listens for 'beforeinstallprompt' event (Android Chrome)
   - Shows a subtle bottom banner after 30 seconds: "¿Instalar Gastos como app? [Instalar] [Ahora no]"
   - Animate in from bottom with Framer Motion
   - On "Instalar": trigger the native install prompt
   - On "Ahora no": dismiss and don't show again for 7 days (localStorage)
   - Show only if app is not already installed (check display-mode: standalone)

6. Splash screen:
   - Background color matching --bg-primary (#0C0C0E)
   - Centered app icon
   - Configured via manifest background_color

7. Verify PWA score:
   - Run Lighthouse audit in Chrome DevTools
   - Target: PWA score >= 90
   - Fix any manifest or service worker issues flagged
```

#### Checklist:
- [ ] Lighthouse PWA score >= 90
- [ ] Ícono aparece correctamente en pantalla de inicio Android
- [ ] App abre sin barra del navegador (standalone mode)
- [ ] Splash screen con fondo oscuro al abrir
- [ ] Banner de instalación aparece después de 30s
- [ ] `display: standalone` detectado correctamente (no muestra banner si ya está instalada)

---

### 🔌 Sprint 10 — Modo Offline (Para viajes sin señal)
**Duración estimada:** 5–6 horas
**Objetivo:** Registrar gastos sin internet → sincronización automática al volver la señal

#### Prompt Sprint 10 — Parte A (Base de datos local con Dexie):

```
Implement offline-first data layer for the expense tracker using Dexie.js (IndexedDB).

Install: npm install dexie

1. Create /lib/offline/db.ts — Dexie database definition:

import Dexie, { Table } from 'dexie'

interface PendingTransaction {
  id?: number           // auto-increment local ID
  tempId: string        // UUID generado localmente
  type: 'expense' | 'income'
  amount: number
  currencyCode: string  // 'PEN' | 'USD' — guardamos el código, no el FK
  categoryId: string | null
  subcategoryId: string | null
  tripId: string | null
  description: string
  date: string          // ISO date string
  notes: string | null
  syncStatus: 'pending' | 'synced' | 'error'
  createdAt: string
  errorMessage?: string
}

interface CachedData {
  key: string           // 'categories' | 'currencies' | 'trips' | 'fixed_expenses'
  data: string          // JSON stringified
  cachedAt: string
}

class OfflineDB extends Dexie {
  pendingTransactions!: Table<PendingTransaction>
  cachedData!: Table<CachedData>

  constructor() {
    super('GastosOfflineDB')
    this.version(1).stores({
      pendingTransactions: '++id, syncStatus, createdAt',
      cachedData: 'key'
    })
  }
}

export const offlineDB = new OfflineDB()

2. Create /lib/offline/sync.ts — sync engine:
   - syncPendingTransactions(): iterates all pending transactions, posts to Supabase
   - On success: marks as 'synced', removes from IndexedDB
   - On error: marks as 'error', stores errorMessage
   - Returns: { synced: number, failed: number }

3. Create /lib/offline/cache.ts — cache manager:
   - cacheData(key: string, data: unknown): saves to IndexedDB
   - getCachedData<T>(key: string): retrieves cached data
   - isCacheStale(key: string, maxAgeMinutes: number): checks if cache is old

4. Create /lib/hooks/useOnlineStatus.ts:
   - Listens to window 'online' and 'offline' events
   - Returns: { isOnline: boolean }
   - On going online: automatically triggers syncPendingTransactions()
```

#### Prompt Sprint 10 — Parte B (Integración en la UI):

```
Integrate the offline layer into the expense tracker UI.

1. Modify /lib/hooks/useTransactions.ts:
   - On mount: if online, fetch from Supabase AND cache in IndexedDB
   - If offline: load from IndexedDB cache
   - Merge: show cached Supabase data + pending local transactions together
   - Pending transactions shown with a subtle "⏳ pendiente" badge

2. Modify transaction creation (TransactionForm):
   - On submit:
     * If online → save to Supabase directly (existing flow)
     * If offline → save to offlineDB.pendingTransactions with syncStatus: 'pending'
     * Either way → show success toast
   - Offline save toast: "Gasto guardado localmente. Se sincronizará cuando tengas señal. 📶"

3. Create /components/ui/OfflineIndicator.tsx:
   - Fixed banner at very top of screen when offline
   - Dark amber/orange color: "Sin conexión — tus gastos se guardarán localmente"
   - Animated sync icon when syncing
   - Shows count of pending transactions: "3 gastos pendientes de sincronizar"
   - Disappears with animation when back online after sync completes
   - Never blocks the UI

4. Create /components/ui/SyncStatus.tsx (for navbar):
   - Small icon in navbar showing sync state
   - States: all_synced (checkmark), pending (clock with count badge), syncing (spinner), error (warning)
   - Tap opens mini panel: list of pending transactions waiting to sync

5. Cache on first load:
   - When user opens app with internet, cache these for offline use:
     * categories (with subcategories)
     * currencies
     * active trips
     * fixed expenses
     * last 100 transactions
   - Use /lib/offline/cache.ts

6. Add to service worker (via next-pwa runtimeCaching):
   - Cache all static assets (fonts, icons, JS chunks)
   - Cache API routes with NetworkFirst strategy (try network, fall back to cache)
   - Cache Supabase Storage images with CacheFirst strategy
```

#### Checklist:
- [ ] Activar modo avión en Android → app sigue abriendo
- [ ] Registrar gasto sin internet → aparece en la lista con badge "pendiente"
- [ ] Banner naranja "Sin conexión" aparece al perder señal
- [ ] Al volver la señal → sync automático sin hacer nada
- [ ] Gasto pendiente desaparece el badge después de sincronizar
- [ ] Categorías y viajes cargan sin internet (desde caché)
- [ ] Toast correcto según si hay o no internet al guardar

---

## 🎨 Guía de Diseño

### Paleta de colores
```css
/* Dark mode (default cuando el sistema lo active) */
--bg-primary:     #0C0C0E;   /* fondo principal casi negro */
--bg-secondary:   #161618;   /* cards, sidebar */
--bg-elevated:    #1E1E22;   /* modales, inputs */
--border:         #2A2A30;   /* bordes sutiles */
--text-primary:   #F0F0F5;   /* texto principal */
--text-muted:     #70707A;   /* texto secundario */
--accent:         #F59E0B;   /* amber/gold — acción principal */
--positive:       #22C55E;   /* ingresos, balance positivo */
--negative:       #EF4444;   /* gastos, balance negativo */
--warning:        #F97316;   /* alertas de presupuesto */
--offline:        #EA580C;   /* banner sin conexión */
```

### Tipografía sugerida (Google Fonts)
- Display / Montos grandes: **DM Serif Display** — elegante, diferente
- UI / Cuerpo: **DM Sans** — compañera perfecta de DM Serif

### Principios de animación
- Duración estándar: 200–300ms
- Easing: `easeOut` para entradas, `easeIn` para salidas
- Hover en cards: `scale(1.02)` + `shadow-lg`
- Page transitions: `opacity 0→1` + `translateY 8px→0`
- Nunca animar más de 2 propiedades simultáneamente en elementos pequeños

---

## ✅ Checklist Global antes de Sprint 1

- [ ] Node.js 18+ instalado localmente
- [ ] Cuenta en Supabase creada (supabase.com)
- [ ] Cuenta en Vercel creada (vercel.com)
- [ ] Proyecto en GitHub creado (privado)
- [ ] Google OAuth configurado en Google Cloud Console
  - Crear proyecto en console.cloud.google.com
  - Habilitar Google+ API
  - Crear credenciales OAuth 2.0
  - Agregar authorized redirect URI de Supabase
- [ ] Editor: VS Code con extensiones (Tailwind CSS IntelliSense, Prisma, ESLint)

---

*Planning generado para el MVP — versión 1.1 (PWA + Offline)*
*Funcionalidades futuras reservadas: exportar datos, múltiples perfiles familiares*
