'use client';

import { TripCardVertical } from '@/components/trips/TripCardVertical';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const MOCK_COMPLETED = [
  { id: 'mock-lima', name: 'Lima — Navidad', dates: 'Dic 2025 · 8 días', total: 'S/ 1,240', emoji: '🌇', gradient: 'linear-gradient(135deg, #1a1a2e, #2d2d5e)' },
  { id: 'mock-nazca', name: 'Nazca', dates: 'Oct 2025 · 3 días', total: 'S/ 520', emoji: '🏜️', gradient: 'linear-gradient(135deg, #2d1b00, #6b3f00)' },
  { id: 'mock-cusco', name: 'Cusco', dates: 'Jul 2025 · 5 días', total: 'S/ 890', emoji: '🏛️', gradient: 'linear-gradient(135deg, #3a1000, #6b2200)' },
  { id: 'mock-areq', name: 'Arequipa', dates: 'Mar 2025 · 4 días', total: 'S/ 650', emoji: '🌋', gradient: 'linear-gradient(135deg, #1a0a2e, #3a1a60)' },
  { id: 'mock-iqui', name: 'Iquitos', dates: 'Ene 2025 · 6 días', total: 'S/ 1,100', emoji: '🌿', gradient: 'linear-gradient(135deg, #0a2e0a, #1a601a)' },
  { id: 'mock-puno', name: 'Puno — Lago Titicaca', dates: 'Nov 2024 · 4 días', total: 'S/ 730', emoji: '🌊', gradient: 'linear-gradient(135deg, #0e1a3a, #1a3a7a)' },
  { id: 'mock-parac', name: 'Paracas', dates: 'Sep 2024 · 2 días', total: 'S/ 380', emoji: '🦅', gradient: 'linear-gradient(135deg, #2e1a00, #6b3e00)' },
];

export default function CompletedTripsPage() {
  return (
    <div className="max-w-lg mx-auto lg:max-w-none">
      {/* Back */}
      <Link
        href="/dashboard/trips"
        className="inline-flex items-center gap-1.5 text-sm text-text2 hover:text-text1 transition-colors mb-5"
      >
        <ArrowLeft size={16} />
        Volver a viajes
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-[26px] font-extrabold text-text1 tracking-tight">
          Viajes completados
        </h1>
        <p className="text-[13px] text-text3 mt-0.5">
          {MOCK_COMPLETED.length} viajes
        </p>
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {MOCK_COMPLETED.map((t) => (
          <TripCardVertical
            key={t.id}
            name={t.name}
            dates={t.dates}
            total={t.total}
            emoji={t.emoji}
            gradient={t.gradient}
            href={`/dashboard/trips/${t.id}`}
          />
        ))}
      </div>
    </div>
  );
}
