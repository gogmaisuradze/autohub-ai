// AutoHub AI - Production Service Worker
// Handles Offline App Shell Caching, Web Push Reminders & Notification Interactions

const CACHE_NAME = 'autohub-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Non-critical cache prefetch warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache-first for static icons/assets, network-first for data/html
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Network-first for dynamic navigation & APIs
  if (event.request.mode === 'navigate' || url.pathname.includes('/webhook')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request) || caches.match('/index.html'))
    );
    return;
  }

  // Stale-while-revalidate for local assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networked;
    })
  );
});

// Push Notification Handler (Triggers even when website tab is closed)
self.addEventListener('push', (event) => {
  let data = {
    title: 'AutoHub AI — პარკირების შეხსენება',
    body: 'თქვენი პარკირების დრო იწურება!',
    icon: '/icon-192.png',
    badge: '/icon.svg',
    tag: 'parking-reminder',
    data: { url: '/#parking' }
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag || 'parking-reminder',
      renotify: true,
      requireInteraction: true,
      data: data.data || { url: '/#parking' },
      actions: [
        { action: 'open_parking', title: 'გახსნა 🚗' },
        { action: 'dismiss', title: 'დახურვა' }
      ]
    })
  );
});

// Notification Click: Focus existing window or open site
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
