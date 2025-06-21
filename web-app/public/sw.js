// Service Worker を一時的に完全無効化
console.log('Service Worker is temporarily disabled for stability');

// 何もしないService Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installed but disabled');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated but disabled');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 何もしない - 全てのリクエストをブラウザに委ねる
  return;
});

self.addEventListener('sync', (event) => {
  // 何もしない
  return;
});

self.addEventListener('push', (event) => {
  // 何もしない
  return;
});

self.addEventListener('notificationclick', (event) => {
  // 何もしない
  return;
});