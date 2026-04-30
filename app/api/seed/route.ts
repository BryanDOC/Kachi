import { createClient } from '@/lib/supabase/server';
import { seedUserData } from '@/lib/utils/seed';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!existingProfile) {
    await supabase.from('profiles').insert({
      id: user.id,
      full_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Usuario',
    });
  }

  await seedUserData(supabase, user.id);

  return NextResponse.json({ ok: true });
}
