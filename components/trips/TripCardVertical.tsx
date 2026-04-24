import Link from 'next/link';

interface TripCardVerticalProps {
  name: string;
  dates: string;
  total: string;
  emoji: string;
  gradient: string;
  href: string;
}

export function TripCardVertical({ name, dates, total, emoji, gradient, href }: TripCardVerticalProps) {
  return (
    <Link
      href={href}
      className="block w-[158px] h-[220px] rounded-[20px] overflow-hidden relative flex-shrink-0"
    >
      <div
        className="absolute inset-0 flex items-center justify-center text-[64px]"
        style={{ background: gradient }}
      >
        {emoji}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <p className="font-display text-[15px] font-extrabold text-white tracking-tight leading-tight mb-0.5">
          {name}
        </p>
        <p className="text-[11px] text-white/55 mb-2">{dates}</p>
        <p className="font-numeric text-[13px] font-bold text-white/85">{total}</p>
      </div>
    </Link>
  );
}
