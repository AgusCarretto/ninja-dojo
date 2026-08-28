-- Escudo de Racha + compra segura de tienda.
-- Ver docs/superpowers/specs/2026-08-28-streak-shield-design.md

-- 1. Tabla de catalogo server-side (fuente de verdad de precio/nivel/tipo)
CREATE TABLE IF NOT EXISTS public.shop_items (
    id text PRIMARY KEY,
    name text NOT NULL,
    price integer NOT NULL DEFAULT 0,
    required_level integer NOT NULL DEFAULT 1,
    category text NOT NULL CHECK (category IN ('cosmetic', 'consumable')),
    slot text
);

ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_items son publicos" ON public.shop_items;
CREATE POLICY "shop_items son publicos"
    ON public.shop_items FOR SELECT
    TO authenticated, anon
    USING (true);

INSERT INTO public.shop_items (id, name, price, required_level, category, slot) VALUES
    ('bg_mountain', 'Amanecer en la Montaña', 0, 1, 'cosmetic', 'background'),
    ('bg_forest', 'Bosque de Bambú Nocturno', 300, 5, 'cosmetic', 'background'),
    ('bg_temple_fire', 'Templo en Llamas', 1000, 10, 'cosmetic', 'background'),
    ('mat_default', 'Madera de Roble', 0, 1, 'cosmetic', 'mat'),
    ('mat_jade', 'Losa de Jade', 400, 3, 'cosmetic', 'mat'),
    ('mat_obsidian', 'Cráter de Obsidiana', 1200, 7, 'cosmetic', 'mat'),
    ('relic_katanas', 'Katanas del Novato', 150, 2, 'cosmetic', 'relic'),
    ('relic_katana_onehanded', 'Katana de una mano', 220, 4, 'cosmetic', 'relic'),
    ('relic_mask', 'Máscara Oni', 600, 6, 'cosmetic', 'relic'),
    ('relic_dragon', 'Estandarte Dorado', 1500, 10, 'cosmetic', 'relic'),
    ('artifact_lantern', 'Farol de Papel', 100, 2, 'cosmetic', 'artifact'),
    ('artifact_bonsai', 'Bonsái Milenario', 350, 4, 'cosmetic', 'artifact'),
    ('artifact_incense', 'Incensario Místico', 800, 8, 'cosmetic', 'artifact'),
    ('streak_shield', 'Amuleto de Persistencia', 500, 1, 'consumable', NULL)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    required_level = EXCLUDED.required_level,
    category = EXCLUDED.category,
    slot = EXCLUDED.slot;

-- 2. Columna de escudos poseídos (separada de purchased_items: se consume y se recompra)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_shields integer NOT NULL DEFAULT 0;

-- 3. buy_item: reemplaza la version rota (recibia el precio del cliente sin validar)
CREATE OR REPLACE FUNCTION public.buy_item(item_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_uid uuid := auth.uid();
    v_price integer;
    v_required_level integer;
    v_category text;
    v_gold integer;
    v_level integer;
    v_purchased text[];
    v_shields integer;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'No autenticado';
    END IF;

    SELECT price, required_level, category
    INTO v_price, v_required_level, v_category
    FROM public.shop_items
    WHERE id = item_id;

    IF v_price IS NULL THEN
        RAISE EXCEPTION 'Ítem inexistente';
    END IF;

    SELECT gold, level, purchased_items, streak_shields
    INTO v_gold, v_level, v_purchased, v_shields
    FROM public.profiles
    WHERE id = v_uid;

    IF v_level < v_required_level THEN
        RAISE EXCEPTION 'Nivel insuficiente';
    END IF;

    IF v_gold < v_price THEN
        RAISE EXCEPTION 'Oro insuficiente';
    END IF;

    IF v_category = 'consumable' THEN
        IF v_shields >= 1 THEN
            RAISE EXCEPTION 'Ya tienes un amuleto activo';
        END IF;

        UPDATE public.profiles
        SET gold = gold - v_price, streak_shields = streak_shields + 1
        WHERE id = v_uid;
    ELSE
        IF item_id = ANY(v_purchased) THEN
            RAISE EXCEPTION 'Ya posees este objeto';
        END IF;

        UPDATE public.profiles
        SET gold = gold - v_price, purchased_items = array_append(purchased_items, item_id)
        WHERE id = v_uid;
    END IF;

    RETURN json_build_object('success', true);
END;
$function$;

-- 4. equip_item: reescrita contra purchased_items (la vieja usaba `inventory`, columna sin uso real)
CREATE OR REPLACE FUNCTION public.equip_item(slot text, item_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_uid uuid := auth.uid();
    v_purchased text[];
    v_is_free boolean;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'No autenticado';
    END IF;

    SELECT purchased_items INTO v_purchased FROM public.profiles WHERE id = v_uid;

    SELECT EXISTS(SELECT 1 FROM public.shop_items WHERE id = item_id AND price = 0)
    INTO v_is_free;

    IF NOT (item_id = ANY(v_purchased) OR v_is_free) THEN
        RAISE EXCEPTION 'No posees este objeto';
    END IF;

    UPDATE public.profiles
    SET equipped = jsonb_set(equipped, ARRAY[slot], to_jsonb(item_id))
    WHERE id = v_uid;
END;
$function$;

-- 5. check_streak_lost: ahora consume un escudo en vez de resetear la racha, si hay uno disponible.
-- Cambia el tipo de retorno (boolean -> json), por eso hace falta el DROP primero.
DROP FUNCTION IF EXISTS public.check_streak_lost();

CREATE FUNCTION public.check_streak_lost()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_uid uuid := auth.uid();
    v_last_active date;
    v_streak integer;
    v_shields integer;
BEGIN
    IF v_uid IS NULL THEN
        RETURN json_build_object('lost', false, 'shielded', false);
    END IF;

    SELECT last_active_date, streak_count, streak_shields
    INTO v_last_active, v_streak, v_shields
    FROM public.profiles
    WHERE id = v_uid;

    IF v_last_active IS NULL THEN
        RETURN json_build_object('lost', false, 'shielded', false);
    END IF;

    IF v_last_active < (CURRENT_DATE - 1) AND v_streak > 0 THEN
        IF v_shields > 0 THEN
            -- El amuleto absorbe el golpe: se consume y se "perdona" el día faltante
            -- corriendo last_active_date a ayer, para que complete_task siga la racha con normalidad.
            UPDATE public.profiles
            SET streak_shields = streak_shields - 1,
                last_active_date = CURRENT_DATE - 1
            WHERE id = v_uid;

            RETURN json_build_object('lost', false, 'shielded', true);
        ELSE
            UPDATE public.profiles SET streak_count = 0 WHERE id = v_uid;
            RETURN json_build_object('lost', true, 'shielded', false);
        END IF;
    END IF;

    RETURN json_build_object('lost', false, 'shielded', false);
END;
$function$;
