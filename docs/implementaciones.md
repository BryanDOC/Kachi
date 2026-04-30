# Implementaciones Kachi

## 1. Fix divisas — Error 403 al agregar

**Problema:** Al intentar agregar una divisa en `/dashboard/settings` daba `403 Forbidden`.

**Causa:** El insert a la tabla `currencies` no enviaba `user_id`, pero la política RLS exige `user_id = auth.uid()`.

**Fix:** En `app/(dashboard)/dashboard/settings/page.tsx`, función `addCurrency`, se agregó:
```ts
const { data: { user } } = await supabase.auth.getUser();
// ...
user_id: user.id,
```

---

## 2. Select de divisas comunes

**Problema:** El modal para agregar divisas tenía 3 campos libres (código, nombre, símbolo), lo cual era engorroso y propenso a errores.

**Cambio:** Se reemplazó el formulario libre por un `<select>` con 3 divisas predefinidas:
- `USD` — Dólar estadounidense — `$`
- `EUR` — Euro — `€`
- `PEN` — Sol peruano — `S/`

**Comportamiento:**
- Las divisas ya agregadas no aparecen en el select.
- El botón "Agregar" se oculta cuando ya están las 3 divisas.
- Las divisas existentes no se ven afectadas.

**Archivo:** `app/(dashboard)/dashboard/settings/page.tsx`

---

## 3. Cobro automático de gastos fijos

**Contexto:** La sección "Gastos Fijos" / "Próximos cobros" era puramente visual. El usuario tenía que registrar manualmente cada transacción cuando llegaba el día de cobro.

**Solución:** Supabase Edge Function con cron diario que detecta qué gastos fijos tienen `billing_day = hoy` y crea la transacción automáticamente.

### Archivo de la función
`supabase/functions/process-fixed-expenses/index.ts`

**Lógica:**
1. Valida el `CRON_SECRET` en el header `Authorization`.
2. Obtiene todos los `fixed_expenses` con `is_active = true`.
3. Filtra los que tienen `billing_day = día de hoy` (o `billing_day > último día del mes` si hoy es el último día).
4. Por cada uno, verifica si ya existe una transacción con `fixed_expense_id = id` en el mes actual.
5. Si no existe, inserta la transacción con `type = 'expense'`.

**Deduplicación:** Usa `fixed_expense_id` + rango de fechas del mes actual para evitar cobros duplicados.

**Meses cortos:** Si `billing_day = 31` y el mes tiene 30 días, cobra el último día del mes.

### Configuración deployada

| Parámetro | Valor |
|-----------|-------|
| Project ref | `dzfflbvathzgdzpegrfw` |
| Función | `process-fixed-expenses` |
| JWT verification | Desactivada (`--no-verify-jwt`) |
| Cron schedule | `0 6 * * *` (6am UTC diario) |

### Comandos de deploy

```bash
supabase login
supabase link --project-ref dzfflbvathzgdzpegrfw
supabase secrets set CRON_SECRET=tu_secret
supabase functions deploy process-fixed-expenses --no-verify-jwt
```

### Cron job SQL (ejecutado en Supabase SQL Editor)

```sql
select cron.schedule(
  'process-fixed-expenses-daily',
  '0 6 * * *',
  $$
  select net.http_post(
    url := 'https://dzfflbvathzgdzpegrfw.supabase.co/functions/v1/process-fixed-expenses',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer TU_CRON_SECRET'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

**Extensiones requeridas en Supabase:** `pg_cron` y `pg_net` (activar en Database → Extensions).

### Probar manualmente (PowerShell)

```powershell
Invoke-WebRequest -Uri "https://dzfflbvathzgdzpegrfw.supabase.co/functions/v1/process-fixed-expenses" -Method POST -Headers @{ "Authorization" = "Bearer TU_CRON_SECRET"; "Content-Type" = "application/json" } -Body "{}"
```

Respuesta esperada:
```json
{ "date": "2026-04-30", "results": [{ "name": "Netflix", "status": "created" }] }
```

- `created` → transacción generada
- `skipped` → ya existía para este mes
- `error` → falló el insert (ver campo `error`)

### Notas importantes
- La Edge Function está deployada **directamente en Supabase**, independiente del deploy de la app Next.js.
- El `CRON_SECRET` debe coincidir entre `supabase secrets set` y el SQL del cron job.
- `supabase secrets list` solo muestra nombres, no valores. Si se pierde el secret, hay que generar uno nuevo con `supabase secrets set` y actualizar el cron job en SQL Editor.
- Para generar un nuevo secret en PowerShell: `-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })`
