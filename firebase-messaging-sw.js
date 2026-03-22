importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const DEFAULT_FCM_CONFIG = {
    apiKey: 'AIzaSyAWuaS0RpcxZ_gU0B_4DMmqetkYnKuvlYM',
    authDomain: 'webkas-843cb.firebaseapp.com',
    projectId: 'webkas-843cb',
    storageBucket: 'webkas-843cb.firebasestorage.app',
    messagingSenderId: '290112385940',
    appId: '1:290112385940:web:d8fee426bc5bfd4234d581',
    measurementId: 'G-2VWFPT7X1T'
};

firebase.initializeApp(DEFAULT_FCM_CONFIG);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notification = payload && payload.notification ? payload.notification : {};
    const data = payload && payload.data ? payload.data : {};
    const title = notification.title || data.title || 'Notifikasi Delta 8';
    const body = notification.body || data.body || 'Ada pembaruan baru untuk aplikasi kas.';
    const icon = notification.icon || data.icon || '/favicon.ico';
    const link = data.link || data.url || self.location.origin;

    self.registration.showNotification(title, {
        body,
        icon,
        badge: icon,
        data: { link }
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification && event.notification.data && event.notification.data.link
        ? event.notification.data.link
        : self.location.origin;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
            return undefined;
        })
    );
});
