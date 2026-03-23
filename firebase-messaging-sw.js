importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const DEFAULT_FCM_CONFIG = {
    apiKey: 'AIzaSyAIZx9jjiW1uUdXmG-P7ZqQRloFuo4L7G8',
    authDomain: 'kas-delta-8.firebaseapp.com',
    projectId: 'kas-delta-8',
    storageBucket: 'kas-delta-8.firebasestorage.app',
    messagingSenderId: '971725893634',
    appId: '1:971725893634:web:79feba7c68d9a72098771b',
    measurementId: 'G-H5G52PERC0'
};

firebase.initializeApp(DEFAULT_FCM_CONFIG);

const messaging = firebase.messaging();
const DEFAULT_ICON = '/notification-icon.svg';
const DEFAULT_BADGE = '/notification-badge.svg';

messaging.onBackgroundMessage((payload) => {
    const notification = payload && payload.notification ? payload.notification : {};
    const data = payload && payload.data ? payload.data : {};
    const title = notification.title || data.title || 'Notifikasi Delta 8';
    const body = notification.body || data.body || 'Ada pembaruan baru untuk aplikasi kas.';
    const icon = notification.icon || data.icon || DEFAULT_ICON;
    const badge = notification.badge || data.badge || DEFAULT_BADGE;
    const link = data.link || data.url || self.location.origin;
    const tag = data.tag || 'delta8-statusbar';

    self.registration.showNotification(title, {
        body,
        icon,
        badge,
        tag,
        renotify: true,
        timestamp: Date.now(),
        vibrate: [120, 60, 120],
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
                    if (client.url !== targetUrl && 'navigate' in client) {
                        client.navigate(targetUrl);
                    }
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
