const CACHE_NAME = "weather-warning-center-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./admin.html",
    "./style.css",
    "./manifest.json"
];

self.addEventListener("install", event => {
    console.log("[Service Worker] Installing...");

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});


self.addEventListener("activate", event => {
    console.log("[Service Worker] Activated");

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});


self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request);
            })
    );
});


self.addEventListener("push", event => {
    console.log("[Service Worker] Push received");

    let data = {};

    try {
        data = event.data ? event.data.json() : {};
    } catch (error) {
        console.error(
            "[Service Worker] Could not read push data:",
            error
        );

        data = {
            title: "Weather Warning Center",
            body: "Jauns laikapstākļu brīdinājums."
        };
    }

    const title =
        data.title ||
        "Weather Warning Center";

    const options = {
        body:
            data.body ||
            "Jauns laikapstākļu brīdinājums.",

        icon:
            "./icons/icon-192.png",

        badge:
            "./icons/icon-192.png",

        tag:
            data.tag ||
            "weather-warning",

        renotify: true,

        data: {
            url:
                data.url ||
                "./index.html"
        }
    };

    event.waitUntil(
        self.registration.showNotification(
            title,
            options
        )
    );
});


self.addEventListener("notificationclick", event => {
    event.notification.close();

    const url =
        event.notification.data &&
        event.notification.data.url
            ? event.notification.data.url
            : "./index.html";

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
