// Velvet Hearts Service Worker for PWA Caching & Web Push Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Web Push Events (triggered when browser tab is backgrounded/closed)
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Velvet Hearts Alert',
    body: 'You have a new update on Velvet Hearts!',
    icon: '/velvet-heart-logo.png',
    badge: '/velvet-heart-logo.png',
    data: { url: '/notifications' },
  };

  if (event.data) {
    try {
      notificationData = {
        ...notificationData,
        ...event.data.json(),
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/velvet-heart-logo.png',
    badge: notificationData.badge || '/velvet-heart-logo.png',
    data: notificationData.data || { url: '/notifications' },
    vibrate: [200, 100, 200],
    tag: `vh-notif-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Open Velvet Hearts' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle Notification Clicks (Navigates or focuses Velvet Hearts app window)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetTab = event.notification.data?.tab || 'chat';
  const targetUrl = event.notification.data?.url || `/?tab=${targetTab}`;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE', tab: targetTab, url: targetUrl });
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
