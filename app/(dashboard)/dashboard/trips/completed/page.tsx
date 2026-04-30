'use client';

import { useTrips } from '@/lib/hooks/useTrips';
import { TripCardVertical } from '@/components/trips/TripCardVertical';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const GRADIENTS = [
  'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
  'linear-gradient(135deg, #0e2a3a, #1a5a7a)',
  'linear-gradient(135deg, #1a1a2e, #2d2d5e)',
  'linear-gradient(135deg, #2d1b00, #6b3f00)',
  'linear-gradient(135deg, #3a1000, #6b2200)',
  'linear-gradient(135deg, #1a0a2e, #3a1a60)',
  'linear-gradient(135deg, #0a2e0a, #1a601a)',
];

function formatDates(start: string | null, end: string | null): string {
  if (!start) return '—';
  const s = new Date(start + 'T00:00:00');
  if (!end) return format(s, 'MMM yyyy', { locale: es });
  const e = new Date(end + 'T00:00:00');
  const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return `${format(s, 'MMM yyyy', { locale: es })} · ${days} día${days !== 1 ? 's' : ''}`;
}

export default function CompletedTripsPage() {
  const { completedTrips, isLoading } = useTrips();

  return (
    <div className="max-w-lg mx-auto lg:max-w-none">
      <Link
        href="/dashboard/trips"
        className="inline-flex items-center gap-1.5 text-[13px] text-text2 hover:text-text1 transition-colors mb-5"
      >
        <ArrowLeft size={15} />
        Volver a viajes
      </Link>

      <div className="mb-6">
        <h1 className="font-sans text-[20px] font-bold text-text1">Viajes completados</h1>
        <p className="text-[13px] text-text3 mt-0.5">
          {isLoading ? '...' : `${completedTrips.length} viaje${completedTrips.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[220px] rounded-[20px] bg-bg-input animate-pulse" />
          ))}
        </div>
      ) : completedTrips.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[14px] text-text3">Sin viajes completados</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {completedTrips.map((t, i) => (
            <TripCardVertical
              key={t.id}
              name={t.name}
              dates={formatDates(t.start_date, t.end_date)}
              total="—"
              emoji="✈️"
              gradient={GRADIENTS[i % GRADIENTS.length]}
              href={`/dashboard/trips/${t.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
