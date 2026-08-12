self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                return caches.delete(key);
            }));
        })
    );
    self.registration.unregister().then(() => {
        self.clients.matchAll().then((clients) => {
            clients.forEach(client => client.navigate(client.url));
        });
    });
});
// FORCE CACHE UPDATE 08/13/2026 01:07:06
// FORCE CACHE UPDATE 2 08/13/2026 01:24:34
