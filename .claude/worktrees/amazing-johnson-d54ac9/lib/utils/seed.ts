const DEFAULT_CATEGORIES = [
  { name: 'Transporte', color: '#3b82f6', icon: 'Car' },
  { name: 'Alimentación', color: '#22c55e', icon: 'Utensils' },
  { name: 'Entretenimiento', color: '#a855f7', icon: 'Gamepad2' },
  { name: 'Salud', color: '#ef4444', icon: 'Heart' },
  { name: 'Educación', color: '#f59e0b', icon: 'GraduationCap' },
  { name: 'Hogar', color: '#06b6d4', icon: 'Home' },
  { name: 'Ropa', color: '#ec4899', icon: 'Shirt' },
  { name: 'Viajes', color: '#f97316', icon: 'Plane' },
  { name: 'Otros', color: '#71717a', icon: 'Package' },
];

const DEFAULT_CURRENCIES = [
  { code: 'PEN', name: 'Sol peruano', symbol: 'S/', is_default: true },
  { code: 'USD', name: 'Dólar estadounidense', symbol: '$', is_default: false },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedUserData(supabase: any, userId: string) {
  const { count: catCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (!catCount) {
    await supabase
      .from('categories')
      .insert(DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: userId })));
  }

  const { count: currCount } = await supabase
    .from('currencies')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (!currCount) {
    await supabase
      .from('currencies')
      .insert(DEFAULT_CURRENCIES.map((c) => ({ ...c, user_id: userId })));
  }
}
