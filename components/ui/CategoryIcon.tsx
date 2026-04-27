'use client';

import {
  type LucideIcon,
  // Already existing
  Car, ShoppingCart, Utensils, Gamepad2, Heart, BookOpen, Home, Shirt,
  Plane, Coffee, DollarSign, Briefcase, Music, Tv, Globe, Package,
  Gift, Fuel, Train, Dumbbell, GraduationCap, ShoppingBag, Zap,
  Camera, Laptop, Wallet, Receipt, Stethoscope, Baby, Star, Pizza,
  // Food & Drink
  Wine, Beer, Apple, Sandwich, Soup, IceCream, UtensilsCrossed, Salad,
  // Transport
  Bus, Bike, Ship, Truck,
  // Health & Fitness
  Pill, Activity, HeartPulse, Syringe, Thermometer, Microscope,
  // Entertainment
  Film, Headphones, Mic, Popcorn, Clapperboard, Gamepad,
  // Finance & Shopping
  Store, Tag, CreditCard, Coins, Banknote, PiggyBank, ShoppingBasket, Percent,
  // Home & Maintenance
  Sofa, Lamp, Wrench, Hammer, Paintbrush, Drill,
  // Work & Tech
  Monitor, Printer, BarChart2, Smartphone, Keyboard,
  // Personal care & beauty
  Scissors, Sparkles, Palette, Gem, Glasses,
  // Nature & Utilities
  Sun, Moon, TreePine, Leaf, Droplets, Wifi, Phone, Flame, Umbrella, Wind,
  // Finance & banking
  TrendingUp, TrendingDown, Landmark, Building2, BarChart,
  // Travel
  MapPin, Compass, Tent, Hotel, Map, Navigation,
  // Education
  Backpack, BookMarked, PenTool,
  // Pets & family
  PawPrint, Users,
  // Misc
  Newspaper, Radio, Award, Ticket,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Food & Drink
  Utensils, Pizza, Coffee, Wine, Beer, Apple, Sandwich, Soup, IceCream,
  UtensilsCrossed, Salad,
  // Shopping
  ShoppingCart, ShoppingBag, ShoppingBasket, Store, Tag, Percent,
  // Transport
  Car, Plane, Train, Bus, Bike, Ship, Truck, Fuel, Navigation,
  // Health & Fitness
  Heart, Stethoscope, Pill, Activity, HeartPulse, Syringe, Thermometer,
  Microscope, Dumbbell,
  // Entertainment & Hobbies
  Gamepad2, Gamepad, Film, Music, Headphones, Mic, Popcorn, Clapperboard,
  Camera, Tv,
  // Finance & Banking
  DollarSign, Wallet, CreditCard, Coins, Banknote, PiggyBank, Receipt,
  TrendingUp, TrendingDown, Landmark, BarChart, BarChart2,
  // Work & Tech
  Briefcase, Laptop, Monitor, Printer, Smartphone, Keyboard, Globe,
  // Home & Maintenance
  Home, Sofa, Lamp, Wrench, Hammer, Paintbrush, Drill, Zap, Droplets, Wifi,
  // Personal care
  Scissors, Sparkles, Palette, Gem, Glasses,
  // Education
  GraduationCap, BookOpen, BookMarked, Backpack, PenTool,
  // Travel & Outdoors
  MapPin, Compass, Tent, Hotel, Map, TreePine, Leaf, Sun, Moon, Flame,
  Umbrella, Wind,
  // Family & Pets
  Baby, PawPrint, Users, Gift,
  // Clothing
  Shirt,
  // Work & Finance
  Building2,
  // Misc
  Newspaper, Radio, Award, Ticket, Phone, Package, Star,
};

export const ICON_KEYWORD_MAP: Record<string, string[]> = {
  // Food
  comida: ['Utensils', 'Pizza', 'ShoppingCart'],
  alimento: ['Utensils', 'Apple', 'ShoppingCart'],
  alimentacion: ['Utensils', 'Apple', 'ShoppingCart'],
  restaurante: ['Utensils', 'Coffee', 'UtensilsCrossed'],
  cafe: ['Coffee', 'Utensils'],
  café: ['Coffee', 'Utensils'],
  bebida: ['Coffee', 'Wine', 'Beer'],
  vino: ['Wine'],
  cerveza: ['Beer'],
  pizza: ['Pizza'],
  almuerzo: ['Utensils', 'Salad', 'Sandwich'],
  desayuno: ['Coffee', 'Apple', 'Sandwich'],
  cena: ['Utensils', 'Wine', 'UtensilsCrossed'],
  helado: ['IceCream'],
  dulce: ['IceCream', 'Gift'],
  snack: ['Sandwich', 'Salad'],
  // Shopping
  supermercado: ['ShoppingCart', 'Store', 'ShoppingBasket'],
  mercado: ['ShoppingCart', 'Store'],
  compras: ['ShoppingCart', 'ShoppingBag', 'Store'],
  tienda: ['Store', 'ShoppingBag'],
  ropa: ['Shirt', 'ShoppingBag'],
  vestimenta: ['Shirt', 'ShoppingBag'],
  moda: ['Shirt', 'Gem', 'ShoppingBag'],
  calzado: ['ShoppingBag', 'Shirt'],
  accesorios: ['Gem', 'ShoppingBag'],
  // Transport
  transporte: ['Car', 'Bus', 'Train'],
  auto: ['Car', 'Fuel'],
  carro: ['Car', 'Fuel'],
  coche: ['Car', 'Fuel'],
  gasolina: ['Fuel', 'Car'],
  combustible: ['Fuel', 'Car'],
  bus: ['Bus', 'Train'],
  metro: ['Train', 'Bus'],
  tren: ['Train', 'Bus'],
  taxi: ['Car', 'MapPin'],
  moto: ['Bike', 'Fuel'],
  bicicleta: ['Bike'],
  avion: ['Plane', 'MapPin'],
  avión: ['Plane', 'MapPin'],
  // Health
  salud: ['Heart', 'Stethoscope', 'Pill'],
  medico: ['Stethoscope', 'HeartPulse', 'Pill'],
  médico: ['Stethoscope', 'HeartPulse', 'Pill'],
  doctor: ['Stethoscope', 'HeartPulse'],
  farmacia: ['Pill', 'Stethoscope'],
  medicina: ['Pill', 'Thermometer'],
  hospital: ['Stethoscope', 'HeartPulse', 'Syringe'],
  clinica: ['Stethoscope', 'HeartPulse'],
  clínica: ['Stethoscope', 'HeartPulse'],
  dental: ['Stethoscope', 'Pill'],
  // Fitness
  gym: ['Dumbbell', 'Activity'],
  gimnasio: ['Dumbbell', 'Activity'],
  deporte: ['Dumbbell', 'Activity'],
  ejercicio: ['Dumbbell', 'Activity'],
  // Entertainment
  entretenimiento: ['Gamepad2', 'Film', 'Music'],
  juegos: ['Gamepad2', 'Gamepad'],
  videojuegos: ['Gamepad2', 'Gamepad'],
  musica: ['Music', 'Headphones'],
  música: ['Music', 'Headphones'],
  cine: ['Film', 'Popcorn'],
  pelicula: ['Film', 'Popcorn'],
  película: ['Film', 'Popcorn'],
  concierto: ['Music', 'Mic', 'Ticket'],
  streaming: ['Tv', 'Clapperboard', 'Film'],
  suscripcion: ['Tv', 'Globe', 'Smartphone'],
  suscripción: ['Tv', 'Globe', 'Smartphone'],
  // Home
  hogar: ['Home', 'Sofa', 'Wrench'],
  casa: ['Home', 'Sofa'],
  alquiler: ['Home', 'Building2'],
  renta: ['Home', 'Building2'],
  muebles: ['Sofa', 'Lamp'],
  mantenimiento: ['Wrench', 'Hammer', 'Drill'],
  reparacion: ['Wrench', 'Hammer'],
  reparación: ['Wrench', 'Hammer'],
  limpieza: ['Sparkles', 'Droplets'],
  // Utilities
  servicios: ['Zap', 'Droplets', 'Wifi'],
  luz: ['Zap', 'Lamp'],
  electricidad: ['Zap', 'Lamp'],
  agua: ['Droplets', 'Zap'],
  internet: ['Wifi', 'Globe'],
  telefono: ['Phone', 'Wifi'],
  teléfono: ['Phone', 'Wifi'],
  celular: ['Smartphone', 'Phone'],
  gas: ['Flame', 'Zap'],
  // Work
  trabajo: ['Briefcase', 'Monitor', 'BarChart'],
  oficina: ['Briefcase', 'Monitor', 'Printer'],
  negocio: ['Briefcase', 'BarChart2', 'Building2'],
  empresa: ['Building2', 'Briefcase'],
  // Tech
  tecnologia: ['Laptop', 'Monitor', 'Smartphone'],
  tecnología: ['Laptop', 'Monitor', 'Smartphone'],
  computadora: ['Laptop', 'Monitor'],
  equipo: ['Monitor', 'Laptop', 'Keyboard'],
  // Education
  educacion: ['GraduationCap', 'BookOpen', 'Backpack'],
  educación: ['GraduationCap', 'BookOpen', 'Backpack'],
  estudios: ['GraduationCap', 'BookOpen'],
  colegio: ['Backpack', 'BookOpen', 'GraduationCap'],
  universidad: ['GraduationCap', 'BookMarked'],
  curso: ['BookOpen', 'BookMarked', 'PenTool'],
  libro: ['BookOpen', 'BookMarked'],
  // Finance
  ahorros: ['PiggyBank', 'DollarSign', 'Wallet'],
  ahorro: ['PiggyBank', 'DollarSign'],
  banco: ['Landmark', 'CreditCard'],
  inversion: ['TrendingUp', 'BarChart2'],
  inversión: ['TrendingUp', 'BarChart2'],
  impuesto: ['Receipt', 'DollarSign'],
  deuda: ['CreditCard', 'TrendingDown'],
  prestamo: ['Banknote', 'Landmark'],
  préstamo: ['Banknote', 'Landmark'],
  ingreso: ['DollarSign', 'TrendingUp', 'Wallet'],
  sueldo: ['DollarSign', 'Briefcase'],
  salario: ['DollarSign', 'Briefcase'],
  // Travel
  viaje: ['Plane', 'MapPin', 'Compass'],
  turismo: ['MapPin', 'Compass', 'Camera'],
  hotel: ['Hotel', 'MapPin'],
  camping: ['Tent', 'TreePine'],
  // Family & Personal
  familia: ['Users', 'Baby', 'Heart'],
  bebe: ['Baby', 'Heart'],
  bebé: ['Baby', 'Heart'],
  nino: ['Baby', 'Backpack'],
  niño: ['Baby', 'Backpack'],
  mascota: ['PawPrint', 'Heart'],
  mascotas: ['PawPrint', 'Heart'],
  perro: ['PawPrint'],
  gato: ['PawPrint'],
  // Personal care
  belleza: ['Scissors', 'Sparkles', 'Gem'],
  peluqueria: ['Scissors', 'Sparkles'],
  peluquería: ['Scissors', 'Sparkles'],
  cosmeticos: ['Sparkles', 'Palette'],
  cosméticos: ['Sparkles', 'Palette'],
  // Art & Hobbies
  arte: ['Paintbrush', 'Palette', 'Camera'],
  fotografia: ['Camera'],
  fotografía: ['Camera'],
  museos: ['Landmark', 'Ticket'],
  teatro: ['Ticket', 'Mic'],
  // Misc
  regalo: ['Gift', 'Star'],
  donacion: ['Heart', 'DollarSign'],
  donación: ['Heart', 'DollarSign'],
  seguro: ['Shield', 'Heart'],
  otros: ['Package', 'Globe'],
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

export function getSuggestedIcons(query: string): string[] {
  if (!query.trim()) return [];
  const words = query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/);
  const scores: Record<string, number> = {};
  for (const word of words) {
    for (const [keyword, icons] of Object.entries(ICON_KEYWORD_MAP)) {
      const normalizedKey = keyword.normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (normalizedKey.includes(word) || word.includes(normalizedKey)) {
        icons.forEach((icon, i) => {
          scores[icon] = (scores[icon] || 0) + (icons.length - i);
        });
      }
    }
  }
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([icon]) => icon)
    .filter((icon) => icon in CATEGORY_ICONS);
}
