# Seed Data para Supabase

Ejecuta este SQL en **SQL Editor** de Supabase después de registrarte para tener categorías y monedas por defecto.

**IMPORTANTE:** Reemplaza `'tu-user-id-aqui'` con tu ID de usuario real. Para obtenerlo:
1. Regístrate en la app
2. Ve a Supabase Dashboard > Authentication > Users
3. Copia tu User ID (UUID)

```sql
-- Reemplaza este valor con tu user_id real
DO $$
DECLARE
  my_user_id uuid := '24ab1b01-f2cc-423a-b96c-97dbbd0801bd'; -- CAMBIA ESTO

  -- IDs de monedas
  pen_id uuid := gen_random_uuid();
  usd_id uuid := gen_random_uuid();

  -- IDs de categorías
  transporte_id uuid := gen_random_uuid();
  alimentacion_id uuid := gen_random_uuid();
  entretenimiento_id uuid := gen_random_uuid();
  salud_id uuid := gen_random_uuid();
  educacion_id uuid := gen_random_uuid();
  hogar_id uuid := gen_random_uuid();
  ropa_id uuid := gen_random_uuid();
  viajes_id uuid := gen_random_uuid();
  otros_id uuid := gen_random_uuid();
BEGIN
  -- Insertar monedas
  INSERT INTO currencies (id, code, name, symbol, is_default, user_id) VALUES
    (pen_id, 'PEN', 'Sol Peruano', 'S/', true, my_user_id),
    (usd_id, 'USD', 'Dólar Estadounidense', '$', false, my_user_id);

  -- Insertar categorías con colores
  INSERT INTO categories (id, user_id, name, color, icon) VALUES
    (transporte_id, my_user_id, 'Transporte', '#3B82F6', 'bus'),
    (alimentacion_id, my_user_id, 'Alimentación', '#10B981', 'utensils'),
    (entretenimiento_id, my_user_id, 'Entretenimiento', '#8B5CF6', 'tv'),
    (salud_id, my_user_id, 'Salud', '#EF4444', 'heart-pulse'),
    (educacion_id, my_user_id, 'Educación', '#F59E0B', 'book-open'),
    (hogar_id, my_user_id, 'Hogar', '#6366F1', 'home'),
    (ropa_id, my_user_id, 'Ropa', '#EC4899', 'shirt'),
    (viajes_id, my_user_id, 'Viajes', '#14B8A6', 'plane'),
    (otros_id, my_user_id, 'Otros', '#64748B', 'more-horizontal');

  -- Insertar subcategorías de ejemplo
  INSERT INTO subcategories (category_id, user_id, name) VALUES
    (transporte_id, my_user_id, 'Taxi/Uber'),
    (transporte_id, my_user_id, 'Gasolina'),
    (transporte_id, my_user_id, 'Bus'),
    (alimentacion_id, my_user_id, 'Supermercado'),
    (alimentacion_id, my_user_id, 'Restaurante'),
    (alimentacion_id, my_user_id, 'Delivery'),
    (entretenimiento_id, my_user_id, 'Cine'),
    (entretenimiento_id, my_user_id, 'Conciertos'),
    (entretenimiento_id, my_user_id, 'Suscripciones');
END $$;
```

## Verificación

Después de ejecutar el script, verifica que los datos se insertaron correctamente:

```sql
-- Ver tus monedas
SELECT * FROM currencies WHERE user_id = '24ab1b01-f2cc-423a-b96c-97dbbd0801bd';

-- Ver tus categorías
SELECT * FROM categories WHERE user_id = '24ab1b01-f2cc-423a-b96c-97dbbd0801bd';

-- Ver tus subcategorías
SELECT * FROM subcategories WHERE user_id = '24ab1b01-f2cc-423a-b96c-97dbbd0801bd';
```
