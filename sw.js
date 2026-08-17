const CACHE_NAME = "weather-warning-center-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./manifest.json"
];

self.addEventListener("install", event => {
    console.log("Weather Warning Center Service Worker: installing");

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    console.log("Weather Warning Center Service Worker: activated");

    event.waitUntil(
        self.clients.claim()
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});

self.addEventListener("push", event => {
    let data = {};

    try {
        data = event.data ? event.data.json() : {};
    } catch (error) {
        data = {
            title: "Weather Warning Center",
            body: event.data ? event.data.text() : "Jauns laikapstākļu brīdinājums."
        };
    }

    const title = data.title || "Weather Warning Center";

    const options = {
        body: data.body || "Jauns laikapstākļu brīdinājums.",
        icon: "./icons/icon-192.png",
        badge: "./icons/icon-192.png",
        tag: "weather-warning",
        renotify: true,
        data: {
            url: data.url || "./index.html"
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

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
