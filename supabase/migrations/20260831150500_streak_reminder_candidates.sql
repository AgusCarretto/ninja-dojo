-- RPC de solo lectura para el cron job de recordatorios de racha.
-- Usa CURRENT_DATE (mismo reloj que check_streak_lost) para no desincronizar
-- "a quién avisar" de "a quién realmente se le vence la racha".
-- Solo service_role puede llamarla: expone username + streak_count de gente
-- que hoy todavía no completó nada, más granular que el leaderboard público.
CREATE OR REPLACE FUNCTION public.get_streak_reminder_candidates()
RETURNS TABLE (id uuid, username text, streak_count integer)
LANGUAGE sql
STABLE
AS $function$
    SELECT id, username, streak_count
    FROM public.profiles
    WHERE streak_count > 0
      AND last_active_date < CURRENT_DATE;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_streak_reminder_candidates() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_streak_reminder_candidates() TO service_role;
