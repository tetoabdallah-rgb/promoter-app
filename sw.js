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
