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
const STATUSBAR_BUNDLE_TAG = 'delta8-statusbar';
const STATUSBAR_BUNDLE_TITLE = 'Delta 8';
const STATUSBAR_STORE_CACHE = 'delta8-statusbar-cache-v1';
const STATUSBAR_STORE_URL = 'https://delta8.local/statusbar-store';
const STATUSBAR_MAX_ITEMS = 5;

async function readStatusBarStore() {
    try {
        const cache = await caches.open(STATUSBAR_STORE_CACHE);
        const response = await cache.match(STATUSBAR_STORE_URL);
        if (!response) return { count: 0, items: [] };
        const data = await response.json();
        return {
            count: Number(data && data.count ? data.count : 0) || 0,
            items: Array.isArray(data && data.items) ? data.items : []
        };
    } catch (err) {
        return { count: 0, items: [] };
    }
}

async function writeStatusBarStore(store) {
    const cache = await caches.open(STATUSBAR_STORE_CACHE);
    const payload = JSON.stringify({
        count: Number(store && store.count ? store.count : 0) || 0,
        items: Array.isArray(store && store.items) ? store.items : []
    });
    await cache.put(
        STATUSBAR_STORE_URL,
        new Response(payload, {
            headers: { 'Content-Type': 'application/json' }
        })
    );
}

async function clearStatusBarStore() {
    const cache = await caches.open(STATUSBAR_STORE_CACHE);
    await cache.delete(STATUSBAR_STORE_URL);
}

function normalizeStatusBarEntry(title, body, options = {}) {
    const safeTitle = String(title || 'Notifikasi Delta 8').trim() || 'Notifikasi Delta 8';
    const safeBody = String(body || '').trim();
    const text = safeBody ? `${safeTitle} - ${safeBody}` : safeTitle;

    return {
        title: safeTitle,
        body: safeBody,
        text: text.slice(0, 180),
        link: String(options.link || self.location.origin),
        timestamp: Number(options.timestamp || Date.now()) || Date.now(),
        icon: String(options.icon || DEFAULT_ICON),
        badge: String(options.badge || DEFAULT_BADGE)
    };
}

function buildBundledBody(items) {
    return items
        .slice(0, STATUSBAR_MAX_ITEMS)
        .map((item, index) => (index === 0 ? item.text : `* ${item.text}`))
        .join('\n');
}

async function updateBundledNotification(title, body, options = {}) {
    const entry = normalizeStatusBarEntry(title, body, options);
    const store = await readStatusBarStore();
    const nextItems = [entry].concat(store.items || []).slice(0, STATUSBAR_MAX_ITEMS);
    const nextCount = (Number(store.count || 0) || 0) + 1;

    await writeStatusBarStore({
        count: nextCount,
        items: nextItems
    });

    await self.registration.showNotification(`${STATUSBAR_BUNDLE_TITLE} (${nextCount})`, {
        body: buildBundledBody(nextItems),
        icon: entry.icon,
        badge: entry.badge,
        tag: STATUSBAR_BUNDLE_TAG,
        renotify: true,
        timestamp: entry.timestamp,
        vibrate: [120, 60, 120],
        data: {
            link: entry.link,
            isBundle: true
        }
    });
}

function extractPayloadData(payload) {
    const notification = payload && payload.notification ? payload.notification : {};
    const data = payload && payload.data ? payload.data : {};
    return {
        title: notification.title || data.title || 'Notifikasi Delta 8',
        body: notification.body || data.body || 'Ada pembaruan baru untuk aplikasi kas.',
        options: {
            icon: notification.icon || data.icon || DEFAULT_ICON,
            badge: notification.badge || data.badge || DEFAULT_BADGE,
            link: data.link || data.url || self.location.origin,
            timestamp: Date.now()
        }
    };
}

messaging.onBackgroundMessage((payload) => {
    const next = extractPayloadData(payload);
    return updateBundledNotification(next.title, next.body, next.options);
});

self.addEventListener('message', (event) => {
    const data = event && event.data ? event.data : {};
    if (data.type !== 'delta8-bundle-notification') return;

    const payload = data.payload || {};
    const title = payload.title || 'Notifikasi Delta 8';
    const body = payload.body || '';
    const options = {
        icon: payload.icon || DEFAULT_ICON,
        badge: payload.badge || DEFAULT_BADGE,
        link: payload.link || self.location.origin,
        timestamp: payload.timestamp || Date.now()
    };

    event.waitUntil(updateBundledNotification(title, body, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const notificationData = event.notification && event.notification.data ? event.notification.data : {};
    const targetUrl = notificationData.link ? notificationData.link : self.location.origin;

    event.waitUntil(
        Promise.all([
            clearStatusBarStore(),
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
    if (!notificationData.isBundle) return;
    event.waitUntil(clearStatusBarStore());
});
