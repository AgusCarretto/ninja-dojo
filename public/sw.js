// Service worker mínimo: sin cacheo/offline todavía, solo lo necesario para
// que el navegador permita suscripciones Web Push y mostrar notificaciones.
self.addEventListener('install', () => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
    let data = {}
    try {
        data = event.data ? event.data.json() : {}
    } catch {
        data = { title: 'Mi Camino Ninja', body: event.data ? event.data.text() : '' }
    }

    const title = data.title || 'Mi Camino Ninja'
    const options = {
        body: data.body || '',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: data.tag || 'streak-reminder',
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: data.url || '/' },
    }

    event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const url = event.notification.data?.url || '/'

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
            const existing = clientsArr.find((c) => c.url.startsWith(self.location.origin))
            if (existing) return existing.focus()
            return self.clients.openWindow(url)
        })
    )
})
