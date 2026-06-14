// Service Worker：プッシュ通知の受信と表示を担当

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()))

// アプリアイコンに未読通知件数のバッジを表示する
async function updateAppBadge() {
  if (!('setAppBadge' in navigator)) return
  const notifications = await self.registration.getNotifications()
  if (notifications.length > 0) {
    await navigator.setAppBadge(notifications.length)
  } else {
    await navigator.clearAppBadge()
  }
}

// Pushイベント：サーバーから通知を受信したときに表示
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:  data.body,
      icon:  data.icon  || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
    }).then(() => updateAppBadge())
  )
})

// 通知クリック：アプリを前面に表示
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    Promise.all([
      updateAppBadge(),
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus()
        }
        return clients.openWindow('/')
      }),
    ])
  )
})
