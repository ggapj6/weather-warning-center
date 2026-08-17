const CACHE_NAME = "weather-warning-center-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(APP_FILES);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );

    self.clients.claim();
});


/*
    Receive push notification
*/
self.addEventListener("push", event => {

    let data = {
        title: "Weather Warning Center",
        body: "Jauns laikapstākļu brīdinājums.",
        icon: "./icons/icon-192.png",
        badge: "./icons/icon-192.png",
        url: "./index.html"
    };

    if (event.data) {
        try {
            data = {
                ...data,
                ...event.data.json()
            };
        } catch (error) {
            console.error("Push data JSON error:", error);

            data.body = event.data.text();
        }
    }

    const notificationOptions = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag || "weather-warning",
        renotify: true,
        requireInteraction: data.requireInteraction ?? true,
        data: {
            url: data.url || "./index.html"
        }
    };

    event.waitUntil(
        self.registration.showNotification(
            data.title,
            notificationOptions
        )
    );
});


/*
    When the user clicks the notification
*/
self.addEventListener("notificationclick", event => {

    event.notification.close();

    const url = event.notification.data?.url || "./index.html";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then(clientList => {

            for (const client of clientList) {
                if ("focus" in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
