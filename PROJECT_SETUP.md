# Next.js 14 Project Setup Guide

This project was created with the following specifications:

## Features

- **Next.js 14** with App Router
- **TypeScript** with strict mode enabled
- **TailwindCSS** for styling
- **ESLint + Prettier** for code quality
- **Supabase** for authentication and database
- **Zustand** for state management
- **React Hook Form + Zod** for form validation
- **Framer Motion** for animations
- **Recharts** for charts/data visualization
- **Sonner** for toast notifications
- **Lucide React** for icons
- **date-fns** for date utilities

## Project Structure

```
my-nextjs-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   └── layout/
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Browser Supabase client
│   │   └── server.ts      # Server Supabase client
│   ├── hooks/
│   │   └── index.ts
│   └── utils/
│       ├── cn.ts          # clsx + tailwind-merge utility
│       └── index.ts
├── store/
│   └── index.ts           # Zustand stores
├── types/
│   └── index.ts           # TypeScript types
├── middleware.ts          # Route protection
├── .env.local.example     # Environment variables template
└── ...config files
```

## Getting Started

### 1. Install Dependencies

All dependencies have been installed. If you need to reinstall:

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

The project includes middleware that:
- Protects all `/dashboard` routes
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login` and `/register` to `/dashboard`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Utility Functions

### `cn()` - Class Name Merger

Combines `clsx` and `tailwind-merge` for optimal className handling:

```tsx
import { cn } from '@/lib/utils';

<div className={cn('base-class', condition && 'conditional-class')} />
```

## Supabase Clients

### Browser Client

```tsx
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
```

### Server Client

```tsx
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
```

## Folder Conventions

- **`app/(auth)/`** - Authentication pages (login, register)
- **`app/(dashboard)/`** - Protected dashboard pages
- **`app/api/`** - API routes
- **`components/ui/`** - Reusable UI components
- **`components/layout/`** - Layout components
- **`lib/hooks/`** - Custom React hooks
- **`lib/utils/`** - Utility functions
- **`store/`** - Zustand state stores
- **`types/`** - TypeScript type definitions

## Next Steps

1. Set up your Supabase project at [supabase.com](https://supabase.com)
2. Add your environment variables
3. Create your database schema in Supabase
4. Build out your authentication forms in `/app/(auth)/login` and `/app/(auth)/register`
5. Create your dashboard features in `/app/(dashboard)`
6. Add reusable UI components to `/components/ui`
7. Create Zustand stores in `/store` as needed
8. Add custom hooks to `/lib/hooks`

## TypeScript Configuration

TypeScript strict mode is enabled in `tsconfig.json`. This ensures:
- No implicit any types
- Strict null checks
- Strict function types
- And more strict type checking

## Code Quality

- **ESLint** - Configured with Next.js and Prettier rules
- **Prettier** - Configured for consistent code formatting
- Run `npm run lint` to check for issues

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [React Hook Form Documentation](https://react-hook-form.com)
