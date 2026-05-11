import Link from 'next/link';
import Image from 'next/image';

interface TripCardVerticalProps {
  name: string;
  dates: string;
  total: string;
  emoji: string;
  gradient: string;
  coverImage?: string | null;
  href: string;
}

export function TripCardVertical({ name, dates, total, emoji, gradient, coverImage, href }: TripCardVerticalProps) {
  return (
    <Link
      href={href}
      className="block w-[158px] h-[220px] rounded-[20px] overflow-hidden relative flex-shrink-0"
    >
      {coverImage ? (
        <Image src={coverImage} alt={name} fill className="object-cover" />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center text-[64px]"
          style={{ background: gradient }}
        >
          {emoji}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <p className="font-sans text-[14px] font-semibold text-white leading-tight mb-0.5">
          {name}
        </p>
        <p className="text-[11px] text-white/55 mb-2">{dates}</p>
        <p className="font-sans text-[12px] font-medium text-white/85 tabular-nums">{total}</p>
      </div>
    </Link>
  );
}
