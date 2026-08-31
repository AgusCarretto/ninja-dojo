import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

export const dynamic = 'force-dynamic'

interface Candidate {
    id: string
    username: string
    streak_count: number
}

interface Subscription {
    id: string
    user_id: string
    endpoint: string
    p256dh: string
    auth: string
}

export async function GET(request: NextRequest) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT!,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
    )

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: candidates, error: candidatesError } = await supabase.rpc('get_streak_reminder_candidates')
    if (candidatesError) {
        return NextResponse.json({ error: candidatesError.message }, { status: 500 })
    }
    if (!candidates?.length) {
        return NextResponse.json({ candidates: 0, sent: 0, pruned: 0 })
    }

    const byUserId = new Map<string, Candidate>(candidates.map((c: Candidate) => [c.id, c]))

    const { data: subscriptions, error: subsError } = await supabase
        .from('push_subscriptions')
        .select('id, user_id, endpoint, p256dh, auth')
        .in('user_id', Array.from(byUserId.keys()))

    if (subsError) {
        return NextResponse.json({ error: subsError.message }, { status: 500 })
    }

    let sent = 0
    const toPrune: string[] = []

    for (const sub of (subscriptions ?? []) as Subscription[]) {
        const candidate = byUserId.get(sub.user_id)
        if (!candidate) continue

        const days = candidate.streak_count
        try {
            await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                JSON.stringify({
                    title: '🔥 Tu racha corre peligro',
                    body: `Llevás ${days} día${days === 1 ? '' : 's'} de racha y hoy todavía no completaste nada. No dejes que se apague.`,
                    url: '/',
                    tag: 'streak-reminder',
                })
            )
            sent++
        } catch (err) {
            const statusCode = (err as { statusCode?: number }).statusCode
            if (statusCode === 404 || statusCode === 410) {
                toPrune.push(sub.id)
            }
        }
    }

    if (toPrune.length) {
        await supabase.from('push_subscriptions').delete().in('id', toPrune)
    }

    return NextResponse.json({ candidates: candidates.length, subscriptions: subscriptions?.length ?? 0, sent, pruned: toPrune.length })
}
