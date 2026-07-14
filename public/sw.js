const CACHE_NAME = 's2b-services-v7';
const APP_SHELL = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png'];

const scriptUrl = new URL(self.location.href);
const firebaseConfig = {
  apiKey: scriptUrl.searchParams.get('apiKey') || '',
  authDomain: scriptUrl.searchParams.get('authDomain') || '',
  projectId: scriptUrl.searchParams.get('projectId') || '',
  storageBucket: scriptUrl.searchParams.get('storageBucket') || '',
  messagingSenderId: scriptUrl.searchParams.get('messagingSenderId') || '',
  appId: scriptUrl.searchParams.get('appId') || '',
};

const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);

if (firebaseConfigured) {
  try {
    importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js');
    firebase.initializeApp(firebaseConfig);
    firebase.messaging();
  } catch (error) {
    console.warn('[S2B Services] Firebase Messaging service-worker setup failed:', error);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => undefined),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/')));
    return;
  }

  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        return networkResponse;
      });
    }),
  );
});
