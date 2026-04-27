import type { Metadata } from 'next';
// Importa todas las opciones — solo se carga la que instancies abajo
import { DM_Sans, Syne, Changa_One, Barlow_Condensed, Poppins } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Toaster } from 'sonner';
import InstallPrompt from '@/components/ui/InstallPrompt';

const mainFont = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

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
  title: 'Kachi',
  description: 'Tracker de gastos personales',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0C0C0E" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Kachi" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${mainFont.variable} ${syne.variable} ${numericFont.variable} ${changaOne.variable} ${barlowCondensed.variable} antialiased font-sans`}>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors />
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
