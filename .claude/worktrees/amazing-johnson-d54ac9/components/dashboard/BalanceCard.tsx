'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export interface BalanceCardProps {
  balance: string;
  period: string;
  userName?: string;
}

export function BalanceCard({ balance, period, userName = 'K' }: BalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full aspect-[1.586] rounded-[26px] p-5 overflow-hidden border border-accent/15"
      style={{ background: 'var(--card-bg)' }}
    >
      {/* Shine overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
        }}
      />
      {/* Decorative circles */}
      <div
        className="absolute w-[220px] h-[220px] rounded-full -top-[70px] -right-[50px] pointer-events-none"
        style={{ background: 'var(--card-circle-1)' }}
      />
      <div
        className="absolute w-[160px] h-[160px] rounded-full -bottom-[40px] left-5 pointer-events-none"
        style={{ background: 'var(--card-circle-2)' }}
      />

      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Top: Avatar + Chip + Brand */}
        <div className="flex items-center justify-between">
          <div className="w-[38px] h-[38px] rounded-full bg-white/18 border-2 border-white/22 flex items-center justify-center font-display text-[15px] font-bold text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-[34px] h-[26px] rounded-[5px] relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #c8a030 0%, #f0c050 50%, #b08020 100%)',
              }}
            >
              <div className="absolute top-1/2 left-0 right-0 h-px bg-black/18 -translate-y-1/2" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/18" />
            </div>
            <span className="font-display text-xl font-extrabold text-white tracking-wide italic">
              Kachi
            </span>
          </div>
        </div>

        {/* Middle: Balance */}
        <div>
          <p className="text-[10px] font-medium tracking-wider uppercase text-white/60 mb-0.5">
            Balance disponible
          </p>
          <p className="font-display text-2xl font-extrabold text-white tracking-tight">{balance}</p>
          <p className="text-[11px] text-white/50 mt-1 capitalize">{period}</p>
        </div>

        {/* Bottom: Register button */}
        <div className="flex justify-end">
          <Link
            href="/dashboard/transactions/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 border border-white/26 text-white text-[13px] font-semibold transition-opacity hover:opacity-80 active:scale-[0.97]"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M6.5 1v11M1 6.5h11"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            Movimiento
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
