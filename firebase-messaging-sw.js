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
const STATUSBAR_GROUP_KEY = 'delta8-statusbar';
const STATUSBAR_GROUP_TAG = 'delta8-statusbar-group';
const STATUSBAR_GROUP_TITLE = 'Delta 8';

function createNotificationId(seed = '') {
    const base = String(seed || 'notif')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48) || 'notif';
    return `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildNotificationOptions(payload) {
    const notification = payload && payload.notification ? payload.notification : {};
    const data = payload && payload.data ? payload.data : {};
    const baseTag = data.tag || 'delta8-statusbar';
    const groupKey = data.groupKey || STATUSBAR_GROUP_KEY;
    const groupTitle = data.groupTitle || STATUSBAR_GROUP_TITLE;
    const summaryTag = data.summaryTag || STATUSBAR_GROUP_TAG;
    const notificationId = data.notificationId || createNotificationId(baseTag);

    return {
        title: notification.title || data.title || 'Notifikasi Delta 8',
        options: {
            body: notification.body || data.body || 'Ada pembaruan baru untuk aplikasi kas.',
            icon: notification.icon || data.icon || DEFAULT_ICON,
            badge: notification.badge || data.badge || DEFAULT_BADGE,
            tag: `${baseTag}-${notificationId}`,
            renotify: true,
            timestamp: Date.now(),
            vibrate: [120, 60, 120],
            data: {
                link: data.link || data.url || self.location.origin,
                groupKey,
                groupTitle,
                summaryTag,
                notificationId,
                isSummary: false
            }
        }
    };
}

async function syncNotificationGroup(registration, options = {}) {
    if (!registration || !registration.getNotifications || !registration.showNotification) return;

    const groupKey = String(options.groupKey || STATUSBAR_GROUP_KEY);
    const summaryTag = String(options.summaryTag || STATUSBAR_GROUP_TAG);
    const groupTitle = String(options.groupTitle || STATUSBAR_GROUP_TITLE);
    const notifications = await registration.getNotifications();
    const summaryNotifications = notifications.filter((item) => item && item.tag === summaryTag);
    const groupedNotifications = notifications.filter((item) => {
        if (!item || item.tag === summaryTag) return false;
        const data = item.data || {};
        return String(data.groupKey || STATUSBAR_GROUP_KEY) === groupKey;
    });

    if (groupedNotifications.length < 2) {
        summaryNotifications.forEach((item) => item.close());
        return;
    }

    const latest = groupedNotifications
        .slice()
        .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0))[0];
    const link = options.link
        || (latest && latest.data && latest.data.link)
        || self.location.origin;

    await registration.showNotification(groupTitle, {
        body: `${groupedNotifications.length} notifikasi aktif`,
        icon: options.icon || DEFAULT_ICON,
        badge: options.badge || DEFAULT_BADGE,
        tag: summaryTag,
        renotify: false,
        silent: true,
        timestamp: latest && latest.timestamp ? latest.timestamp : Date.now(),
        data: {
            link,
            groupKey,
            groupTitle,
            summaryTag,
            isSummary: true
        }
    });
}

messaging.onBackgroundMessage((payload) => {
    const next = buildNotificationOptions(payload);
    return self.registration.showNotification(next.title, next.options)
        .then(() => syncNotificationGroup(self.registration, next.options.data));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const notificationData = event.notification && event.notification.data ? event.notification.data : {};

    const targetUrl = notificationData.link
        ? notificationData.link
        : self.location.origin;

    event.waitUntil(
        Promise.all([
            notificationData.isSummary ? Promise.resolve() : syncNotificationGroup(self.registration, notificationData),
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
        ])
    );
});

self.addEventListener('notificationclose', (event) => {
    const notificationData = event.notification && event.notification.data ? event.notification.data : {};
    event.waitUntil(
        notificationData.isSummary ? Promise.resolve() : syncNotificationGroup(self.registration, notificationData)
    );
});
