import type { Metadata } from 'next';
// Importa todas las opciones — solo se carga la que instancies abajo
import {
  DM_Sans, // Opción 1: actual
  Inter, // Opción 2: estándar industrial
  Space_Grotesk, // Opción 3: geométrico
  Plus_Jakarta_Sans, // Opción 4: moderno
  Outfit, // Opción 5: minimalista
  Syne,
  Changa_One,
  Barlow_Condensed,
  Poppins,
} from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Toaster } from 'sonner';

// ── Fuente principal — comenta la activa y descomenta la que quieras ────────

// Opción 1: DM Sans — humanista, números redondeados (actual)
const mainFont = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

// Opción 2: Inter — estándar de apps financieras, números tabulares muy claros
// const mainFont = Inter({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

// Opción 3: Space Grotesk — geométrico con carácter, números con personalidad
// const mainFont = Space_Grotesk({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

// Opción 4: Plus Jakarta Sans — moderno y legible, excelente en mobile
// const mainFont = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

// Opción 5: Outfit — minimalista puro, números muy limpios y uniformes
// const mainFont = Outfit({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

// ───────────────────────────────────────────────────────────────────────────

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

// Fuente para números y montos — Poppins (fintech, numerales limpios y uniformes)
const numericFont = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-numeric',
  display: 'swap',
});

// Balance y brand "Kachi" — Changa One Italic
const changaOne = Changa_One({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-changa',
  display: 'swap',
});

// Títulos de sección — Barlow Condensed
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-barlow',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gastos Personales',
  description: 'Tracker de gastos personales',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${mainFont.variable} ${syne.variable} ${numericFont.variable} ${changaOne.variable} ${barlowCondensed.variable} antialiased font-sans`}>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
