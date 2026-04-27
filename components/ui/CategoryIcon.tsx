'use client';

import {
  type LucideIcon,
  Car, ShoppingCart, Utensils, Gamepad2, Heart, BookOpen, Home, Shirt,
  Plane, Coffee, DollarSign, Briefcase, Music, Tv, Globe, Package,
  Gift, Fuel, Train, Dumbbell, GraduationCap, ShoppingBag, Zap,
  Camera, Laptop, Wallet, Receipt, Stethoscope, Baby, Star, Pizza,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Car, ShoppingCart, Utensils, Gamepad2, Heart, BookOpen, Home, Shirt,
  Plane, Coffee, DollarSign, Briefcase, Music, Tv, Globe, Package,
  Gift, Fuel, Train, Dumbbell, GraduationCap, ShoppingBag, Zap,
  Camera, Laptop, Wallet, Receipt, Stethoscope, Baby, Star, Pizza,
};

export function CategoryIcon({
  name,
  size = 18,
  className,
  style,
}: {
  name: string | null | undefined;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = (name && CATEGORY_ICONS[name]) || Package;
  return <Icon size={size} className={className} style={style} />;
}
