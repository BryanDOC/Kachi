'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FixedExpenseWithRelations } from '@/types';
import { formatCurrency } from '@/lib/utils/currency';

// ── Cambia esto para ver los 3 diseños ─────────────────────────────────────
export const CARD_VARIANT: 'blur' | 'gradient' | 'glass' = 'glass';
// ──────────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.slice(0, 2), 16) || 0,
    g: parseInt(c.slice(2, 4), 16) || 0,
    b: parseInt(c.slice(4, 6), 16) || 0,
  };
}

function darken(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  return '#' + [r, g, b]
    .map((v) => Math.max(0, Math.round(v * factor)).toString(16).padStart(2, '0'))
    .join('');
}

function Toggle({ on, onClick, disabled, dark }: { on: boolean; onClick: () => void; disabled?: boolean; dark?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={on ? { background: 'var(--card-bg)' } : undefined}
      className={cn(
        'w-9 h-[22px] rounded-full relative transition-all flex-shrink-0 focus:outline-none disabled:opacity-50',
        !on && (dark ? 'bg-white/25' : 'bg-bg-input border border-border')
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all',
          on ? 'left-[16px]' : 'left-[2px]'
        )}
      />
    </button>
  );
}

function LogoBadge({ logoUrl, name, brandColor, size = 34 }: {
  logoUrl?: string | null;
  name: string;
  brandColor?: string | null;
  size?: number;
}) {
  const [broken, setBroken] = useState(false);

  if (logoUrl && !broken) {
    return (
      <img
        src={logoUrl}
        alt={name}
        onError={() => setBroken(true)}
        className="rounded-[10px] object-contain bg-white/10 flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-[10px] flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.42, backgroundColor: brandColor || '#6366F1' }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export interface FixedExpenseCardProps {
  expense: FixedExpenseWithRelations;
  index: number;
  onEdit: () => void;
  onToggle: () => void;
  isToggling: boolean;
  inactive?: boolean;
}

export function FixedExpenseCard(props: FixedExpenseCardProps) {
  if (CARD_VARIANT === 'blur') return <BlurCard {...props} />;
  if (CARD_VARIANT === 'glass') return <GlassCard {...props} />;
  return <GradientCard {...props} />;
}

// ── Variant 1: Logo blureado de fondo ─────────────────────────────────────
function BlurCard({ expense, index, onEdit, onToggle, isToggling, inactive }: FixedExpenseCardProps) {
  const brandColor = expense.brand_color || '#1A1A2E';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      className={cn('rounded-[18px] relative overflow-hidden flex flex-col', inactive && 'opacity-55')}
      style={{ minHeight: 164 }}
    >
      {/* Background */}
      {expense.logo_url ? (
        <img
          src={expense.logo_url}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-125 pointer-events-none"
          style={{ filter: 'blur(24px) saturate(1.5) brightness(0.45)' }}
        />
      ) : (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: darken(brandColor, 0.3) }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between">
          <LogoBadge logoUrl={expense.logo_url} name={expense.name} brandColor={brandColor} />
          <button onClick={onEdit} className="p-1 text-white/50 hover:text-white transition-colors -mr-1 -mt-1">
            <Edit2 size={13} />
          </button>
        </div>
        <div className="mt-auto pt-3">
          <div className='flex flex-col gap-2'>
          <p className="text-[12px] font-medium text-white/55 mb-1 truncate">{expense.name}</p>
          <p className="font-sans text-[18px] font-semibold text-white tabular-nums leading-none mb-2">
            {formatCurrency(expense.amount, expense.currencies?.code || 'PEN')}
          </p>
          {expense.categories && (
            <span className="inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full mb-2 bg-white/15 text-white border border-white/20 truncate w-fit">
              {expense.categories.name}
            </span>
          )}
          </div>
          <div className="flex items-center justify-between">
            {expense.billing_day ? (
              <div className="flex items-center gap-1 text-[11px] text-white/45">
                <Calendar size={10} />
                Día {expense.billing_day}
              </div>
            ) : <span />}
            <Toggle on={expense.is_active} onClick={onToggle} disabled={isToggling} dark />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Variant 2: Degradado extraído del logo + borde con glow ───────────────
function GradientCard({ expense, index, onEdit, onToggle, isToggling, inactive }: FixedExpenseCardProps) {
  const brandColor = expense.brand_color || '#3B82F6';
  const { r, g, b } = hexToRgb(brandColor);

  const bg = `linear-gradient(135deg, ${darken(brandColor, 0.2)} 0%, ${darken(brandColor, 0.4)} 45%, ${darken(brandColor, 0.28)} 100%)`;
  const circle1 = `radial-gradient(circle, rgba(${r},${g},${b},0.3) 0%, transparent 70%)`;
  const circle2 = `radial-gradient(circle, rgba(${r},${g},${b},0.13) 0%, transparent 70%)`;
  const glow = `0 0 0 1px rgba(${r},${g},${b},0.38), 0 6px 28px rgba(${r},${g},${b},0.22)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      className={cn('rounded-[18px] relative overflow-hidden flex flex-col', inactive && 'opacity-55')}
      style={{ background: bg, minHeight: 164, boxShadow: glow }}
    >
      {/* Decorative circles */}
      <div className="absolute w-[140px] h-[140px] rounded-full -top-[45px] -right-[35px] pointer-events-none" style={{ background: circle1 }} />
      <div className="absolute w-[100px] h-[100px] rounded-full -bottom-[30px] left-1 pointer-events-none" style={{ background: circle2 }} />

      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between">
          <LogoBadge logoUrl={expense.logo_url} name={expense.name} brandColor={brandColor} />
          <button onClick={onEdit} className="p-1 text-white/45 hover:text-white transition-colors -mr-1 -mt-1">
            <Edit2 size={13} />
          </button>
        </div>
        <div className="mt-auto pt-3 ">
          <div className='flex flex-col gap-2'>
          <p className="text-[12px] font-medium text-white/55 mb-0.5 truncate">{expense.name}</p>
          <p className="font-sans text-[18px] font-semibold text-white tabular-nums leading-none mb-2">
            {formatCurrency(expense.amount, expense.currencies?.code || 'PEN')}
          </p>
          {expense.categories && (
            <span className="inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full mb-2 bg-white/15 text-white border border-white/15 truncate w-fit">
              {expense.categories.name}
            </span>
          )}
          </div>
          <div className="flex items-center justify-between">
            {expense.billing_day ? (
              <div className="flex items-center gap-1 text-[11px] text-white/45">
                <Calendar size={10} />
                Día {expense.billing_day}
              </div>
            ) : <span />}
            <Toggle on={expense.is_active} onClick={onToggle} disabled={isToggling} dark />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Variant 3: Glass estilo iOS ────────────────────────────────────────────
function GlassCard({ expense, index, onEdit, onToggle, isToggling, inactive }: FixedExpenseCardProps) {
  const brandColor = expense.brand_color || '#6366F1';
  const { r, g, b } = hexToRgb(brandColor);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      className={cn('rounded-[18px] relative overflow-hidden flex flex-col', inactive && 'opacity-55')}
      style={{
        background: `rgba(${r},${g},${b},0.07)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid rgba(${r},${g},${b},0.22)`,
        minHeight: 164,
      }}
    >
      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${r},${g},${b},0.7), transparent)` }}
      />

      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between">
          <LogoBadge logoUrl={expense.logo_url} name={expense.name} brandColor={brandColor} />
          <button onClick={onEdit} className="p-1 text-text3 hover:text-text1 transition-colors -mr-1 -mt-1">
            <Edit2 size={13} />
          </button>
        </div>
        <div className="mt-auto pt-3">
          <div className='flex flex-col gap-2'>
          <p className="text-[12px] font-medium text-text2 mb-0.5 truncate">{expense.name}</p>
          <p className="font-sans text-[18px] font-semibold text-text1 tabular-nums leading-none mb-2">
            {formatCurrency(expense.amount, expense.currencies?.code || 'PEN')}
          </p>
          {expense.categories && (
            <span
              className="inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full mb-2 truncate w-fit text-text2"
              style={{ backgroundColor: `rgba(${r},${g},${b},0.15)`, border: `1px solid rgba(${r},${g},${b},0.25)` }}
            >
              {expense.categories.name}
            </span>
          )}
          </div>
          <div className="flex items-center justify-between">
            {expense.billing_day ? (
              <div className="flex items-center gap-1 text-[11px] text-text2">
                <Calendar size={10} />
                Día {expense.billing_day}
              </div>
            ) : <span />}
            <Toggle on={expense.is_active} onClick={onToggle} disabled={isToggling} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
