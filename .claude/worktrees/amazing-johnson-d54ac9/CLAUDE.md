# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Setup

Copy `.env.local.example` to `.env.local` and add Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Architecture Overview

### Tech Stack
- **Next.js 14** with App Router and TypeScript (strict mode enabled)
- **Supabase** for authentication and database (SSR-compatible)
- **Zustand** for state management
- **TailwindCSS** for styling
- **React Hook Form + Zod** for form validation
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Sonner** for toast notifications

### Route Groups
The app uses Next.js route groups for organization:
- `app/(auth)/` - Unauthenticated routes (login, register)
- `app/(dashboard)/` - Protected routes requiring authentication
- Each route group has its own layout

### Authentication & Middleware
Authentication is handled via Supabase with middleware-based route protection (middleware.ts:1):
- Middleware runs on all routes except static files, images, and favicon
- `/dashboard/*` routes redirect to `/login` if user is not authenticated
- `/login` and `/register` redirect to `/dashboard` if user is already authenticated
- Session is automatically refreshed on each request

### Supabase Client Pattern
The project uses separate client creation patterns for browser vs server:

**Browser Components (Client Components):**
```tsx
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

**Server Components/Actions:**
```tsx
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient(); // Note: async
```

**Middleware:**
Uses `createServerClient` from `@supabase/ssr` directly with custom cookie handling.

### Import Aliases
TypeScript is configured with `@/*` pointing to the root directory for cleaner imports.

### Styling Utilities
Use the `cn()` utility (lib/utils/cn.ts:1) for className merging:
```tsx
import { cn } from '@/lib/utils';
<div className={cn('base-class', condition && 'conditional-class')} />
```
This combines `clsx` and `tailwind-merge` to handle conditional classes and resolve Tailwind conflicts.

## Code Style

### Prettier Configuration
- Single quotes, semicolons required
- 2-space indentation (no tabs)
- 100 character line width
- Trailing commas (ES5)
- LF line endings

### ESLint
- Extends Next.js, TypeScript, and Prettier configs
- Prettier violations are warnings (not errors)
- Run `npm run lint` to check

## Project Structure

```
app/
├── (auth)/          # Unauthenticated routes
├── (dashboard)/     # Protected routes with dashboard layout
├── api/             # API routes
├── layout.tsx       # Root layout
└── page.tsx         # Home page

lib/
├── supabase/
│   ├── client.ts    # Browser Supabase client
│   └── server.ts    # Server Supabase client (async)
├── hooks/           # Custom React hooks
└── utils/
    ├── cn.ts        # className utility (clsx + tailwind-merge)
    └── index.ts     # General utilities

store/               # Zustand stores
types/               # TypeScript type definitions
middleware.ts        # Route protection & session management
```

## Key Patterns

### Server vs Client Components
- Prefer Server Components by default (Next.js 14 App Router default)
- Use Client Components (`'use client'`) only when needed for:
  - Interactive elements (onClick, onChange, etc.)
  - React hooks (useState, useEffect, etc.)
  - Browser-only APIs
  - Zustand stores

### Form Handling
Use React Hook Form with Zod for validation:
- Define Zod schemas in the component or types directory
- Use `@hookform/resolvers` to connect Zod with React Hook Form
- Leverage type inference from Zod schemas

### State Management
- Use Zustand for global state (store/ directory)
- Create separate store files and export them from store/index.ts
- Keep stores focused and single-purpose

### Supabase Usage
- Always use the appropriate client (browser vs server)
- Server client is async - must await createClient()
- Middleware handles session refresh automatically
- Use Row Level Security (RLS) policies in Supabase for data access control

## Reglas de Trabajo

### 1. No programar sin contexto
- ANTES de escribir codigo: lee los archivos relevantes, revisa git log, entiende la arquitectura.
- Si no tienes contexto suficiente, pregunta. No asumas.

### 2. Respuestas cortas
- Responde en 1-3 oraciones. Sin preambulos, sin resumen final.
- No repitas lo que el usuario dijo. No expliques lo obvio.
- Codigo habla por si mismo: no narres cada linea que escribes.

### 3. No reescribir archivos completos
- Usa Edit (reemplazo parcial), NUNCA Write para archivos existentes salvo que el cambio sea >80% del archivo.
- Cambia solo lo necesario. No "limpies" codigo alrededor del cambio.

### 4. No releer archivos ya leidos
- Si ya leiste un archivo en esta conversacion, no lo vuelvas a leer salvo que haya cambiado.
- Toma notas mentales de lo importante en tu primera lectura.

### 5. Validar antes de declarar hecho
- Despues de un cambio: compila, corre tests, o verifica que funciona.
- Nunca digas "listo" sin evidencia de que funciona.

### 6. Cero charla aduladora
- No digas "Excelente pregunta", "Gran idea", "Perfecto", etc.
- No halagues al usuario. Ve directo al trabajo.

### 7. Soluciones simples
- Implementa lo minimo que resuelve el problema. Nada mas.
- No agregues abstracciones, helpers, tipos, validaciones, ni features que no se pidieron.
- 3 lineas repetidas > 1 abstraccion prematura.

### 8. No pelear con el usuario
- Si el usuario dice "hazlo asi", hazlo asi. No debatas salvo riesgo real de seguridad o perdida de datos.
- Si discrepas, menciona tu concern en 1 oracion y procede con lo que pidio.

### 9. Leer solo lo necesario
- No leas archivos completos si solo necesitas una seccion. Usa offset y limit.
- Si sabes la ruta exacta, usa Read directo. No hagas Glob + Grep + Read cuando Read basta.

### 10. No narrar el plan antes de ejecutar
- No digas "Voy a leer el archivo, luego modificar la funcion, luego compilar...". Solo hazlo.
- El usuario ve tus tool calls. No necesita un preview en texto.

### 11. Paralelizar tool calls
- Si necesitas leer 3 archivos independientes, lee los 3 en un solo mensaje, no uno por uno.
- Menos roundtrips = menos tokens de contexto acumulado.

### 12. No duplicar codigo en la respuesta
- Si ya editaste un archivo, no copies el resultado en tu respuesta. El usuario lo ve en el diff.
- Si creaste un archivo, no lo muestres entero en texto tambien.

### 13. No usar Agent cuando Grep/Read basta
- Agent duplica todo el contexto en un subproceso. Solo usalo para busquedas amplias o tareas complejas.
- Para buscar una funcion o archivo especifico, usa Grep o Glob directo.
