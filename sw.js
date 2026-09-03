self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => caches.delete(key)));
        }).then(() => self.registration.unregister())
    );
});
// FORCE CACHE UPDATE 08/13/2026 01:07:06
// FORCE CACHE UPDATE 2 08/13/2026 01:24:34
// FORCE CACHE UPDATE 3 08/13/2026 01:48:06
// FORCE CACHE UPDATE 4 08/13/2026 01:57:04
