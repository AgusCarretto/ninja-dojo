-- Suscripciones Web Push para recordatorios de racha.
-- Cada fila es un endpoint de navegador (un mismo usuario puede tener varios:
-- celular, notebook, etc). El endpoint es único: si el mismo dispositivo se
-- vuelve a suscribir, se actualizan las claves en vez de duplicar la fila.

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint text NOT NULL UNIQUE,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios gestionan sus propias suscripciones" ON public.push_subscriptions;
CREATE POLICY "usuarios gestionan sus propias suscripciones"
    ON public.push_subscriptions FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Sin policy para anon/service_role explícita: service_role bypassea RLS
-- (así es como el cron job de recordatorios lee todas las suscripciones).
