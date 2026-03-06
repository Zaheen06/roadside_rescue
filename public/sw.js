// Service Worker for Web Push Notifications
// This file must be in /public so it's served at the root URL

self.addEventListener("push", (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "Roadside Rescue";
    const options = {
        body: data.body || "You have a new notification.",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: data.tag || "roadside-rescue",
        data: { url: data.url || "/" },
        requireInteraction: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "/";
    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === url && "focus" in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
