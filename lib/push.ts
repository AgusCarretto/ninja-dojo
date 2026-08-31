import { createClient } from '@/lib/supabase'

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i)
    return outputArray
}

export function isPushSupported() {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
    if (!isPushSupported()) return null
    const registration = await navigator.serviceWorker.register('/sw.js')
    return registration.pushManager.getSubscription()
}

export async function enablePushReminders(userId: string) {
    if (!isPushSupported()) throw new Error('Este navegador no soporta notificaciones push')

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') throw new Error('Permiso de notificaciones denegado')

    const registration = await navigator.serviceWorker.register('/sw.js')
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    })

    const json = subscription.toJSON()
    const supabase = createClient()
    const { error } = await supabase.from('push_subscriptions').upsert(
        {
            user_id: userId,
            endpoint: json.endpoint!,
            p256dh: json.keys!.p256dh,
            auth: json.keys!.auth,
        },
        { onConflict: 'endpoint' }
    )
    if (error) throw error

    return subscription
}

export async function disablePushReminders() {
    const subscription = await getExistingSubscription()
    if (!subscription) return

    const endpoint = subscription.endpoint
    await subscription.unsubscribe()

    const supabase = createClient()
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
}
