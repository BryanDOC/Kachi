import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = new Date();
  const dayOfMonth = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

  const { data: expenses, error } = await supabase
    .from('fixed_expenses')
    .select('*')
    .eq('is_active', true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const toProcess = (expenses || []).filter((fe) => {
    if (fe.billing_day === null) return false;
    if (fe.billing_day === dayOfMonth) return true;
    // billing_day > días del mes (ej: día 31 en abril) → cobrar el último día del mes
    if (fe.billing_day > lastDayOfMonth && dayOfMonth === lastDayOfMonth) return true;
    return false;
  });

  const results = [];

  for (const fe of toProcess) {
    const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
    const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('fixed_expense_id', fe.id)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth);

    if (count && count > 0) {
      results.push({ name: fe.name, status: 'skipped' });
      continue;
    }

    const { error: insertError } = await supabase.from('transactions').insert({
      user_id: fe.user_id,
      type: 'expense',
      amount: fe.amount,
      currency_id: fe.currency_id,
      category_id: fe.category_id ?? null,
      trip_id: null,
      fixed_expense_id: fe.id,
      description: fe.name,
      date: today.toISOString().split('T')[0],
      notes: fe.notes ?? null,
    });

    results.push({
      name: fe.name,
      status: insertError ? 'error' : 'created',
      ...(insertError && { error: insertError.message }),
    });
  }

  return new Response(JSON.stringify({ date: today.toISOString().split('T')[0], results }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
