const CLOUD_URL = 'https://script.google.com/macros/s/AKfycbzY63DzQTu_RP106fQoI2q0joumt_vJhhesMufpJN1iTZQtBoZRYWNs7wfb88xRp2PBsg/exec';
        const DEFAULT_FCM_CONFIG = {
            apiKey: 'AIzaSyAIZx9jjiW1uUdXmG-P7ZqQRloFuo4L7G8',
            authDomain: 'kas-delta-8.firebaseapp.com',
            projectId: 'kas-delta-8',
            storageBucket: 'kas-delta-8.firebasestorage.app',
            messagingSenderId: '971725893634',
            appId: '1:971725893634:web:79feba7c68d9a72098771b',
            measurementId: 'G-H5G52PERC0'
        };
        const DEFAULT_VAPID_KEY = 'BKDg4aP1oAfiuWuXXpb-oggOf2AePd7bLzr7M3skACfKwUoGIxr3ioxiC5C2XmViLdhnJWBGHIudWgFIjPRZyXc';
        const FCM_TOKEN_KEY = 'delta8_fcm_token';
        const NOTIF_PROMPT_DISMISSED_KEY = 'delta8_notif_prompt_dismissed';
        const DEVICE_ID_KEY = 'delta8_device_id';
        const AUTH_SESSION_KEY = 'delta8_auth_session';
        const YEAR_CACHE_STORAGE_PREFIX = 'delta8_year_cache_v1_';
        const AUTO_SYNC_INTERVAL_MS = 5000;
        const AUTO_SYNC_SUPPRESS_MS = 5000;
        let DB_DRIVER = [], DB_HELPER = [], DB_TRANSAKSI = [], DB_LOGS = [];
        const YEAR_CACHE = {};
        const YEAR_SIGNATURES = {};
        let loadToken = 0;
        let autoSyncTimer = null;
        let autoSyncInProgress = false;
        let syncInProgress = false;
        let syncQueued = false;
        let suppressRemoteRefreshUntil = 0;
        let fcmState = { enabled: false, config: null, vapidKey: "", messaging: null, swReg: null };
        let authInProgress = false;
        let pendingAction = null, pendingParams = null, currentContext = { type: '', id: null, idx: null };
        let pendingPaymentContext = null;
        let currentMidtransPayment = null;
        let midtransStatusPollTimer = null;
        let preparedMidtransPaymentKey = '';
        let preparedMidtransPaymentPromise = null;
        let preparedSnapInstance = null;
        let qrisPreparationToken = 0;
        let paymentOptionMode = 'default';
        const PAYMENT_MONTH_NAMES = ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"];
        const MONTHLY_IURAN_AMOUNT = 25000;
        let pendingIuranPaymentData = null;
        const QRIS_STATIC_IMAGE_URL = '/QRIS.jpg';
        const QRIS_STATIC_PAYLOAD = '';
        const ADMIN_WHATSAPP_NUMBER = '628XXXXXXXXXX';
        const PDFJS_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const JSPDF_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        const JSPDF_AUTOTABLE_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js';
        const cloneData = (v) => JSON.parse(JSON.stringify(v));
        const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
        let pdfJsLoadPromise = null;
        let jsPdfLoadPromise = null;
        let jsPdfAutoTableLoadPromise = null;

        function ensureExternalScript(scriptId, scriptUrl) {
            const existing = document.getElementById(scriptId);
            if (existing) {
                return Promise.resolve(existing);
            }
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = scriptUrl;
                script.async = true;
                script.onload = () => resolve(script);
                script.onerror = () => reject(new Error(`Gagal memuat script: ${scriptUrl}`));
                document.head.appendChild(script);
            });
        }

        async function ensurePdfJsLibrary() {
            if (window.pdfjsLib && window.pdfjsLib.getDocument) {
                if (window.pdfjsLib.GlobalWorkerOptions) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
                }
                return window.pdfjsLib;
            }
            if (!pdfJsLoadPromise) {
                pdfJsLoadPromise = ensureExternalScript('pdfjs-lib-script', PDFJS_SCRIPT_URL)
                    .then(() => {
                        if (!window.pdfjsLib || !window.pdfjsLib.getDocument) {
                            throw new Error('Library PDF preview belum siap.');
                        }
                        if (window.pdfjsLib.GlobalWorkerOptions) {
                            window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
                        }
                        return window.pdfjsLib;
                    })
                    .catch((err) => {
                        pdfJsLoadPromise = null;
                        throw err;
                    });
            }
            return pdfJsLoadPromise;
        }

        async function ensureJsPdfLibraries() {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                if (!jsPdfLoadPromise) {
                    jsPdfLoadPromise = ensureExternalScript('jspdf-lib-script', JSPDF_SCRIPT_URL)
                        .then(() => {
                            if (!window.jspdf || !window.jspdf.jsPDF) {
                                throw new Error('Library export PDF belum siap.');
                            }
                            return window.jspdf;
                        })
                        .catch((err) => {
                            jsPdfLoadPromise = null;
                            throw err;
                        });
                }
                await jsPdfLoadPromise;
            }
            if (window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API && window.jspdf.jsPDF.API.autoTable) {
                return window.jspdf;
            }
            if (!jsPdfAutoTableLoadPromise) {
                jsPdfAutoTableLoadPromise = ensureExternalScript('jspdf-autotable-script', JSPDF_AUTOTABLE_SCRIPT_URL)
                    .then(() => {
                        if (!window.jspdf || !window.jspdf.jsPDF || !window.jspdf.jsPDF.API || !window.jspdf.jsPDF.API.autoTable) {
                            throw new Error('Plugin tabel PDF belum siap.');
                        }
                        return window.jspdf;
                    })
                    .catch((err) => {
                        jsPdfAutoTableLoadPromise = null;
                        throw err;
                    });
            }
            await jsPdfAutoTableLoadPromise;
            return window.jspdf;
        }

        function showNotif(message, type = 'info') {
            const wrap = document.getElementById('notify-wrap');
            if (!wrap) return;
            const item = document.createElement('div');
            item.className = `notify-item ${type}`;
            item.innerText = message;
            wrap.appendChild(item);
            requestAnimationFrame(() => item.classList.add('show'));
            setTimeout(() => {
                item.classList.remove('show');
                setTimeout(() => item.remove(), 220);
            }, 2400);
        }

        function createStatusBarNotificationId(seed = '') {
            const base = String(seed || 'notif')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 48) || 'notif';
            return `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        }

        function buildStatusBarNotificationPayload(title, body, options = {}) {
            const baseTag = String(options.tag || 'delta8-statusbar').trim() || 'delta8-statusbar';
            const notificationId = String(options.notificationId || createStatusBarNotificationId(baseTag)).trim() || createStatusBarNotificationId(baseTag);

            return {
                body: body || 'Ada aktivitas baru di aplikasi.',
                icon: options.icon || '/notification-icon.svg',
                badge: options.badge || '/notification-badge.svg',
                tag: `${baseTag}-${notificationId}`,
                renotify: true,
                timestamp: Date.now(),
                vibrate: [120, 60, 120],
                data: {
                    link: options.link || window.location.href
                }
            };
        }

        function createDeviceId() {
            try {
                if (window.crypto && typeof window.crypto.randomUUID === 'function') {
                    return window.crypto.randomUUID().replace(/-/g, '');
                }
            } catch (err) {}
            return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
        }

        function getDeviceId() {
            let value = String(localStorage.getItem(DEVICE_ID_KEY) || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
            if (!value) {
                value = createDeviceId();
                localStorage.setItem(DEVICE_ID_KEY, value);
            }
            return value;
        }

        function getAuthSession() {
            try {
                const raw = localStorage.getItem(AUTH_SESSION_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object') {
                        return {
                            editor: String(parsed.editor || '').trim().toUpperCase(),
                            writeToken: String(parsed.writeToken || '').trim(),
                            deviceId: String(parsed.deviceId || getDeviceId()).trim(),
                            issuedAt: Number(parsed.issuedAt || 0) || 0,
                            expiresAt: Number(parsed.expiresAt || 0) || 0
                        };
                    }
                }
            } catch (err) {}

            const legacyToken = String(localStorage.getItem('delta8_write_token') || '').trim();
            const legacyEditor = String(localStorage.getItem('delta8_editor') || '').trim().toUpperCase();
            if (!legacyToken && !legacyEditor) return null;

            const migrated = {
                editor: legacyEditor,
                writeToken: legacyToken,
                deviceId: getDeviceId(),
                issuedAt: 0,
                expiresAt: 0
            };
            localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(migrated));
            return migrated;
        }

        function saveAuthSession(session, notify = false) {
            const next = {
                editor: String((session && session.editor) || '').trim().toUpperCase(),
                writeToken: String((session && session.writeToken) || '').trim(),
                deviceId: String((session && session.deviceId) || getDeviceId()).trim(),
                issuedAt: Number((session && session.issuedAt) || 0) || 0,
                expiresAt: Number((session && session.expiresAt) || 0) || 0
            };
            localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(next));
            localStorage.setItem('delta8_editor', next.editor);
            localStorage.setItem('delta8_write_token', next.writeToken);
            if (notify) {
                showNotif(next.writeToken ? 'Write token disimpan' : 'Write token dikosongkan', 'info');
            }
            return next;
        }

        function setSyncStatusText(text) {
            const status = document.getElementById('sync-status');
            if (status) status.innerText = text;
        }

        function getActiveEditor() {
            const session = getAuthSession();
            return session && session.editor ? session.editor : String(localStorage.getItem('delta8_editor') || '').trim().toUpperCase();
        }

        function getWriteToken() {
            const session = getAuthSession();
            return session && session.writeToken ? session.writeToken : (localStorage.getItem('delta8_write_token') || '');
        }

        window.setWriteToken = function(token) {
            const value = String(token || '').trim();
            const current = getAuthSession() || {};
            saveAuthSession({
                editor: current.editor || getActiveEditor(),
                writeToken: value,
                deviceId: current.deviceId || getDeviceId(),
                issuedAt: current.issuedAt || Date.now(),
                expiresAt: current.expiresAt || 0
            }, true);
        };

        function updateNotificationUI(state = {}) {
            const token = state.token !== undefined ? state.token : (localStorage.getItem(FCM_TOKEN_KEY) || '');
            const permission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
            const isActive = permission === 'granted' && !!token;
            if (isActive) localStorage.removeItem(NOTIF_PROMPT_DISMISSED_KEY);
        }

        function dismissNotificationPrompt(persist = true) {
            if (persist) localStorage.setItem(NOTIF_PROMPT_DISMISSED_KEY, '1');
            hideModalSafely('modalNotifPermission');
        }

        async function confirmNotificationPrompt() {
            dismissNotificationPrompt(false);
            await enableNotifications();
        }

        function shouldPromptNotificationActivation() {
            if (typeof window === 'undefined') return false;
            if (!window.isSecureContext || !('serviceWorker' in navigator) || !('Notification' in window)) return false;
            if (Notification.permission !== 'default') return false;
            if (String(localStorage.getItem(FCM_TOKEN_KEY) || '').trim()) return false;
            return localStorage.getItem(NOTIF_PROMPT_DISMISSED_KEY) !== '1';
        }

        function maybePromptNotificationActivation() {
            if (!shouldPromptNotificationActivation()) return;
            window.setTimeout(() => {
                if (typeof hasOpenBlockingModal === 'function' && hasOpenBlockingModal()) return;
                bootstrap.Modal.getOrCreateInstance('#modalNotifPermission').show();
            }, 700);
        }

        function jsonpRequest(url, timeoutMs = 12000) {
            return new Promise((resolve, reject) => {
                const callbackName = `delta8_jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
                const script = document.createElement('script');
                const separator = url.includes('?') ? '&' : '?';
                let settled = false;

                const cleanup = (preserveCallback = false) => {
                    settled = true;
                    if (preserveCallback) {
                        window[callbackName] = () => {};
                        setTimeout(() => {
                            try {
                                delete window[callbackName];
                            } catch (err) {}
                        }, 30000);
                    } else {
                        delete window[callbackName];
                    }
                    script.remove();
                };

                const timer = setTimeout(() => {
                    if (settled) return;
                    cleanup(true);
                    reject(new Error('Backend tidak merespons.'));
                }, timeoutMs);

                window[callbackName] = (data) => {
                    clearTimeout(timer);
                    cleanup();
                    resolve(data);
                };

                script.onerror = () => {
                    clearTimeout(timer);
                    cleanup(true);
                    reject(new Error('Gagal menghubungi backend.'));
                };

                script.src = `${url}${separator}callback=${encodeURIComponent(callbackName)}`;
                document.body.appendChild(script);
            });
        }

        async function fetchFcmConfig() {
            try {
                const data = await jsonpRequest(`${CLOUD_URL}?action=fcmConfig`, 2500);
                if (!data || !data.ok || !data.enabled) return false;
                fcmState.enabled = true;
                fcmState.config = data.config;
                fcmState.vapidKey = data.vapidKey || '';
                return true;
            } catch (err) {
                fcmState.enabled = true;
                fcmState.config = DEFAULT_FCM_CONFIG;
                fcmState.vapidKey = DEFAULT_VAPID_KEY;
                return true;
            }
        }

        async function fetchJson(url, timeoutMs = 12000) {
            const data = await jsonpRequest(url, timeoutMs);
            if (!data || data.ok === false) {
                throw new Error((data && data.error) || 'Request gagal.');
            }
            return data;
        }

        async function fetchVerifyAuth(url) {
            const timeouts = [1000, 3000, 7000];
            let lastError = null;
            for (const timeoutMs of timeouts) {
                try {
                    return await fetchJson(url, timeoutMs);
                } catch (err) {
                    lastError = err;
                    const message = String((err && err.message) || '').toLowerCase();
                    const isTransient =
                        message.includes('backend tidak merespons') ||
                        message.includes('gagal menghubungi backend');
                    if (!isTransient) throw err;
                }
            }
            throw lastError || new Error('Backend tidak merespons.');
        }

        function postToAppsScript(payload) {
            if (navigator.sendBeacon) {
                try {
                    const body = new Blob([JSON.stringify(payload)], {
                        type: 'text/plain;charset=UTF-8'
                    });
                    const queued = navigator.sendBeacon(CLOUD_URL, body);
                    if (queued) {
                        return Promise.resolve(true);
                    }
                } catch (err) {}
            }

            return new Promise((resolve, reject) => {
                const frameName = `gas_sink_${Date.now()}_${Math.random().toString(36).slice(2)}`;
                const iframe = document.createElement('iframe');
                iframe.name = frameName;
                iframe.style.display = 'none';
                document.body.appendChild(iframe);

                const form = document.createElement('form');
                form.method = 'POST';
                form.action = CLOUD_URL;
                form.target = frameName;
                form.style.display = 'none';

                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'payload';
                input.value = JSON.stringify(payload);
                form.appendChild(input);
                document.body.appendChild(form);

                const cleanup = () => {
                    setTimeout(() => {
                        iframe.remove();
                        form.remove();
                    }, 1500);
                };

                iframe.addEventListener('load', () => {
                    cleanup();
                    resolve(true);
                }, { once: true });

                setTimeout(() => {
                    cleanup();
                    resolve(true);
                }, 4000);

                try {
                    form.submit();
                } catch (err) {
                    cleanup();
                    reject(err);
                }
            });
        }

        async function initFcm() {
            if (!('serviceWorker' in navigator) || !('Notification' in window)) return false;
            if (!window.firebase || !firebase.messaging) return false;
            if (fcmState.messaging) return true;

            const ok = await fetchFcmConfig();
            if (!ok) return false;

            if (!firebase.apps.length) firebase.initializeApp(fcmState.config);
            fcmState.messaging = firebase.messaging();
                fcmState.swReg = await navigator.serviceWorker.register('./firebase-messaging-sw.js');

            fcmState.messaging.onMessage((payload) => {
                const notification = payload && payload.notification ? payload.notification : {};
                const data = payload && payload.data ? payload.data : {};
                const title = notification.title || data.title || 'Notifikasi Baru';
                const body = notification.body || data.body || '';
                const link = data.link || data.url || window.location.href;
                const icon = notification.icon || data.icon || '/notification-icon.svg';
                const badge = notification.badge || data.badge || '/notification-badge.svg';
                const tag = data.tag || 'delta8-statusbar';
                const notificationId = data.notificationId || '';
                showNotif(body ? `${title} - ${body}` : title, 'info');
                showStatusBarNotification(title, body, {
                    link,
                    icon,
                    badge,
                    tag,
                    notificationId
                });
            });

            return true;
        }

        async function showStatusBarNotification(title, body, options = {}) {
            try {
                if (Notification.permission !== 'granted') return;
                const registration = fcmState.swReg || await navigator.serviceWorker.getRegistration('./firebase-messaging-sw.js') || await navigator.serviceWorker.ready;
                if (!registration || !registration.showNotification) return;
                await registration.showNotification(
                    title || 'Notifikasi Delta 8',
                    buildStatusBarNotificationPayload(title, body, options)
                );
            } catch (err) {}
        }

        function activateTabByName(name) {
            const normalized = String(name || '').trim().toLowerCase();
            if (!normalized) return;
            const button = document.getElementById(`${normalized}-tab`);
            if (!button) return;
            bootstrap.Tab.getOrCreateInstance(button).show();
        }

        function ensureLaunchPanelOpen(panelId) {
            const id = String(panelId || '').trim();
            if (!id) return;
            const panel = document.getElementById(id);
            if (!panel || panel.classList.contains('show')) return;
            panel.classList.add('show');
            const icon = document.getElementById(`${id.split('-')[0]}-icon`);
            if (icon) icon.innerText = 'â–²';
        }

        function focusLaunchTarget(targetId) {
            const id = String(targetId || '').trim();
            if (!id) return;
            const target = document.getElementById(id);
            if (!target) return;

            const focusable = target.matches('input, button, select, textarea, a, [tabindex]')
                ? target
                : (target.closest('table') || target);

            if (!focusable.hasAttribute('tabindex')) {
                focusable.setAttribute('tabindex', '-1');
            }

            focusable.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                try {
                    focusable.focus({ preventScroll: true });
                } catch (err) {
                    focusable.focus();
                }
            }, 180);
        }

        function applyLaunchContext() {
            try {
                const params = new URLSearchParams(window.location.search);
                const view = params.get('view');
                const focusTarget = params.get('focus');
                const panelId = params.get('panel');
                if (view) {
                    activateTabByName(view);
                }
                if (panelId) ensureLaunchPanelOpen(panelId);
                if (focusTarget) {
                    setTimeout(() => focusLaunchTarget(focusTarget), 220);
                }
                if (view || focusTarget || panelId) {
                    params.delete('view');
                    params.delete('focus');
                    params.delete('panel');
                    const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`;
                    window.history.replaceState({}, '', next);
                }
            } catch (err) {}
        }

        function isAdminMode() {
            try {
                const params = new URLSearchParams(window.location.search);
                return params.get('mode') === 'admin';
            } catch (err) {
                return false;
            }
        }

        function applyAdminMode() {
            if (!isAdminMode()) return;

            document.body.classList.add('admin-mode');

            const title = document.querySelector('.judul-utama');
            if (title) title.innerText = 'PANEL ADMIN DELTA 8';
            const status = document.getElementById('sync-status');
            if (status) status.innerText = 'ADMIN CONTROL PANEL';

            const hideSelectors = [
                '#member-toolbar',
                '.footer-app',
                '.theme-container',
                '#btn-enable-notif'
            ];
            hideSelectors.forEach((selector) => {
                document.querySelectorAll(selector).forEach((el) => {
                    el.style.display = 'none';
                });
            });

            const systemArea = document.getElementById('system-area');
            if (systemArea) systemArea.style.display = '';

            const logCol = document.getElementById('log-col');
            if (logCol) logCol.classList.remove('show');
            const exportCol = document.getElementById('export-col');
            if (exportCol) exportCol.classList.remove('show');

            const logIcon = document.getElementById('log-icon');
            if (logIcon) logIcon.innerText = 'â–¼';
            const exportIcon = document.getElementById('export-icon');
            if (exportIcon) exportIcon.innerText = 'â–¼';
        }

        window.addEventListener('message', async (event) => {
            try {
                const data = event && event.data ? event.data : null;
                if (!data || data.type !== 'delta8-admin-action') return;

                const action = String(data.action || '').trim().toLowerCase();
                if (action === 'tambah') {
                    askAuth('tambah');
                    return;
                }
                if (action === 'catat') {
                    askAuth('catat');
                    return;
                }
                if (action === 'request_pending_snapshot' || action === 'refresh_pending_snapshot') {
                    const requestedYear = normalizeYearValue(data.payload && data.payload.year);
                    const shouldRefresh = action === 'refresh_pending_snapshot' || !!(data.payload && data.payload.forceRefresh);

                    if (requestedYear === CURRENT_YEAR) {
                        if (shouldRefresh) {
                            await loadFromCloudSmart(requestedYear, { silent: true });
                        }
                        postPendingPaymentsToParent(requestedYear);
                    } else {
                        const snapshotData = shouldRefresh
                            ? await fetchYearDataSnapshot(requestedYear)
                            : getYearDataSnapshot(requestedYear);
                        postPendingPaymentsToParent(requestedYear, snapshotData);
                    }
                    return;
                }
                if ((action === 'verify_pending' || action === 'cancel_pending') && data.payload) {
                    const authAction = action === 'verify_pending' ? 'admin_verify_pending' : 'admin_cancel_pending';
                    const payload = normalizeAdminPendingPayload(data.payload);
                    await ensureAdminActionYear(payload.y);
                    askAuth(authAction, payload);
                }
            } catch (err) {
                console.error('admin message error:', err);
            }
        });

        async function saveFcmToken(token) {
            const session = getAuthSession();
            const writeToken = session && session.writeToken ? session.writeToken : '';
            const editor = session && session.editor ? session.editor : (getActiveEditor() || 'PERANGKAT');
            const deviceId = session && session.deviceId ? session.deviceId : getDeviceId();
            if (!writeToken) {
                return {
                    saved: false,
                    authRequired: true,
                    error: 'Verifikasi editor diperlukan untuk menyimpan token perangkat.'
                };
            }
            const payload = {
                action: 'saveFcmToken',
                authToken: writeToken,
                token: token,
                editor: editor,
                deviceId: deviceId,
                userAgent: navigator.userAgent || ''
            };

            try {
                const url = `${CLOUD_URL}?action=saveFcmToken&authToken=${encodeURIComponent(writeToken)}&token=${encodeURIComponent(token)}&editor=${encodeURIComponent(editor)}&deviceId=${encodeURIComponent(deviceId)}`;
                const data = await fetchJson(url);
                return { saved: !!(data && data.saved), data };
            } catch (err) {
                const message = String((err && err.message) || '');
                if (/unauthorized/i.test(message)) {
                    return {
                        saved: false,
                        authRequired: true,
                        error: 'Verifikasi editor diperlukan untuk menyimpan token perangkat.'
                    };
                }
                await postToAppsScript(payload);
                return { saved: true, fallback: true };
            }
        }

        async function syncStoredFcmTokenAfterAuth() {
            const token = String(localStorage.getItem(FCM_TOKEN_KEY) || '').trim();
            if (!token) return null;
            return await saveFcmToken(token);
        }

        async function sendFcmTest(token) {
            const session = getAuthSession();
            const writeToken = session && session.writeToken ? session.writeToken : '';
            if (!writeToken) {
                throw new Error('Write token belum ada.');
            }

            const deviceId = session && session.deviceId ? session.deviceId : getDeviceId();
            const editor = session && session.editor ? session.editor : getActiveEditor();
            const url = `${CLOUD_URL}?action=testFcm&authToken=${encodeURIComponent(writeToken)}&token=${encodeURIComponent(token)}&editor=${encodeURIComponent(editor)}&deviceId=${encodeURIComponent(deviceId)}&title=${encodeURIComponent('Tes Notifikasi Delta 8')}&body=${encodeURIComponent('Kalau pesan ini masuk, FCM sudah aktif di perangkat ini.')}`;
            try {
                return await fetchJson(url);
            } catch (err) {
                return { ok: false, skipped: true, error: err && err.message ? err.message : 'fetch_failed' };
            }
        }

        async function enableNotifications() {
            try {
                if (!window.isSecureContext) {
                    showNotif('Push notification butuh HTTPS.', 'error');
                    return;
                }

                const ok = await initFcm();
                if (!ok) {
                    showNotif('Konfigurasi Firebase Messaging belum siap.', 'error');
                    return;
                }

                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    showNotif('Izin notifikasi ditolak.', 'error');
                    return;
                }

                const token = await fcmState.messaging.getToken({
                    vapidKey: fcmState.vapidKey,
                    serviceWorkerRegistration: fcmState.swReg
                });

                if (!token) {
                    showNotif('Token perangkat gagal dibuat.', 'error');
                    updateNotificationUI({ message: 'TOKEN PERANGKAT GAGAL DIBUAT', color: '#ef4444', token: '' });
                    return;
                }

                localStorage.setItem(FCM_TOKEN_KEY, token);
                updateNotificationUI({ token, message: 'TOKEN PERANGKAT BERHASIL DIBUAT', color: '#10b981' });

                const saveResult = await saveFcmToken(token);
                if (saveResult && saveResult.saved) {
                    const activeSession = getAuthSession();
                    const activeWriteToken = activeSession && activeSession.writeToken ? activeSession.writeToken : '';
                    if (activeWriteToken) {
                        const test = await sendFcmTest(token);
                        if (test && test.ok) {
                            showNotif('Push notification aktif dan tes kirim berhasil.', 'success');
                            updateNotificationUI({ token, message: 'FCM AKTIF DAN TES KIRIM BERHASIL', color: '#10b981' });
                        } else if (test && test.error) {
                            showNotif(`Token tersimpan, tapi backend belum bisa kirim popup: ${test.error}`, 'info');
                            updateNotificationUI({ token, message: 'TOKEN TERSIMPAN, BACKEND BELUM BISA KIRIM POPUP', color: '#f59e0b' });
                        } else {
                            showNotif('Push notification aktif di perangkat ini.', 'success');
                            updateNotificationUI({ token, message: 'FCM AKTIF DI PERANGKAT INI', color: '#10b981' });
                        }
                    } else {
                        showNotif('Push notification aktif di perangkat ini.', 'success');
                        updateNotificationUI({ token, message: 'FCM AKTIF DI PERANGKAT INI', color: '#10b981' });
                    }
                } else if (saveResult && saveResult.authRequired) {
                    showNotif('Notifikasi aktif di perangkat ini. Verifikasi editor dulu agar token tersimpan di backend.', 'info');
                    updateNotificationUI({ token, message: 'FCM AKTIF, VERIFIKASI EDITOR UNTUK SIMPAN TOKEN', color: '#f59e0b' });
                } else {
                    showNotif('Notifikasi aktif, tapi backend belum mengonfirmasi penyimpanan token.', 'info');
                    updateNotificationUI({ token, message: 'FCM AKTIF, MENUNGGU BACKEND', color: '#f59e0b' });
                }
            } catch (err) {
                showNotif(`Gagal notifikasi: ${err && err.message ? err.message : 'unknown error'}`, 'error');
                updateNotificationUI({ message: 'GAGAL MENGAKTIFKAN NOTIFIKASI', color: '#ef4444' });
            }
        }

        window.enableNotifications = enableNotifications;
        window.confirmNotificationPrompt = confirmNotificationPrompt;
        window.dismissNotificationPrompt = dismissNotificationPrompt;

        async function restoreNotificationState() {
            updateNotificationUI();
            if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
            try {
                const ok = await initFcm();
                if (!ok) {
                    updateNotificationUI({ message: 'KONFIGURASI FCM BELUM SIAP', color: '#ef4444' });
                    return;
                }
                const token = await fcmState.messaging.getToken({
                    vapidKey: fcmState.vapidKey,
                    serviceWorkerRegistration: fcmState.swReg
                });
                if (token) {
                    localStorage.setItem(FCM_TOKEN_KEY, token);
                    updateNotificationUI({ token, message: 'FCM SIAP DIGUNAKAN', color: '#10b981' });
                    try {
                        await saveFcmToken(token);
                    } catch (syncErr) {}
                }
            } catch (err) {
                updateNotificationUI({ message: 'STATUS FCM BELUM BISA DICEK', color: '#f59e0b' });
            }
        }

        // Pull to Refresh Logic
        let touchStart = 0, touchDiff = 0, isRefreshing = false;
        const ptrIndicator = document.getElementById('ptr-indicator');
        const ptrIcon = document.getElementById('ptr-icon');

        window.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) touchStart = e.touches[0].pageY;
        }, {passive: true});

        window.addEventListener('touchmove', (e) => {
            if (isRefreshing || window.scrollY > 0) return;
            touchDiff = e.touches[0].pageY - touchStart;
            if (touchDiff > 0 && touchDiff < 150) {
                ptrIndicator.style.transform = `translateY(${touchDiff / 2}px)`;
                ptrIcon.innerText = touchDiff > 100 ? 'ðŸ†™' : 'â¬‡ï¸';
            }
        }, {passive: true});

        window.addEventListener('touchend', async () => {
            if (isRefreshing) return;
            if (touchDiff > 100) {
                isRefreshing = true;
                ptrIndicator.style.transform = `translateY(70px)`;
                ptrIcon.innerText = 'â³';
                ptrIcon.classList.add('ptr-loading');
                await loadFromCloudSmart(CURRENT_YEAR, { forceRender: true });
                setTimeout(() => {
                    ptrIcon.classList.remove('ptr-loading');
                    ptrIndicator.style.transform = `translateY(0px)`;
                    isRefreshing = false;
                }, 500);
            } else {
                ptrIndicator.style.transform = `translateY(0px)`;
            }
            touchDiff = 0;
        });

        function setTheme(t) { document.body.setAttribute('data-theme', t); localStorage.setItem('delta8_theme', t); document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active')); if (document.getElementById('dot-' + t)) document.getElementById('dot-' + t).classList.add('active'); }
        function toggleCol(id) { const el = document.getElementById(id); el.classList.toggle('show'); document.getElementById(id.split('-')[0] + '-icon').innerText = el.classList.contains('show') ? 'â–²' : 'â–¼'; }

        window.onclick = function(e) {
            const menu = document.getElementById('actionMenu');
            const btn = e.target.closest('.btn-aksi-trigger');
            if (btn) {
                const rect = btn.getBoundingClientRect();
                currentContext = { type: btn.dataset.type, id: btn.dataset.id || null, idx: btn.dataset.idx || null };
                menu.style.display = 'block'; menu.style.top = (rect.bottom + window.scrollY) + 'px'; menu.style.left = (rect.left + window.scrollX - 80) + 'px';
                return;
            }
            if (!e.target.closest('#actionMenu')) menu.style.display = 'none';
        };

        function doEdit() { document.getElementById('actionMenu').style.display = 'none'; askAuth('edit_trigger'); }
        function doDelete() { document.getElementById('actionMenu').style.display = 'none'; new bootstrap.Modal('#modalKonfirmasiHapus').show(); }
        function eksekusiHapus() { bootstrap.Modal.getInstance('#modalKonfirmasiHapus').hide(); askAuth('delete_trigger'); }

        function focusPinInput() {
            const pinInput = document.getElementById('inputPIN');
            if (!pinInput) return;
            requestAnimationFrame(() => {
                pinInput.focus();
                pinInput.select();
            });
        }

        function focusPinAfterEditorCheck() {
            const editorInput = document.getElementById('inputEditorName');
            const editor = String(editorInput && editorInput.value ? editorInput.value : '').trim();
            if (editor.length >= 2) {
                focusPinInput();
                return true;
            }
            showNotif('Nama editor minimal 2 karakter.', 'error');
            if (editorInput) editorInput.focus();
            return false;
        }

        function askAuth(type, params = null) {
            pendingAction = type; pendingParams = params;
            const pinInput = document.getElementById('inputPIN');
            const editorInput = document.getElementById('inputEditorName');
            const savedEditor = getActiveEditor() || "";
            if (pinInput) pinInput.value = "";
            if (editorInput) editorInput.value = savedEditor;
            bootstrap.Modal.getOrCreateInstance('#modalVerifyAuth').show();
            requestAnimationFrame(() => {
                if (savedEditor.trim().length >= 2) {
                    focusPinInput();
                } else if (editorInput) {
                    editorInput.focus();
                    editorInput.select();
                }
            });
        }

        function handleEditorNameInput(input) {
            if (!input) return;
            const value = String(input.value || '').replace(/\s+/g, ' ');
            if (input.value !== value) input.value = value;
        }

        function hideAuthModal() {
            const modalEl = document.getElementById('modalVerifyAuth');
            const modal = bootstrap.Modal.getInstance('#modalVerifyAuth') || bootstrap.Modal.getOrCreateInstance('#modalVerifyAuth');
            return new Promise((resolve) => {
                if (!modalEl || !modal || !modalEl.classList.contains('show')) {
                    resolve();
                    return;
                }

                const done = () => {
                    modalEl.removeEventListener('hidden.bs.modal', done);
                    resolve();
                };

                modalEl.addEventListener('hidden.bs.modal', done, { once: true });
                modal.hide();
            });
        }

        function reopenAuthModal() {
            const pinInput = document.getElementById('inputPIN');
            if (pinInput) pinInput.value = '';
            bootstrap.Modal.getOrCreateInstance('#modalVerifyAuth').show();
        }

        function resetAuthPinFocus(shouldFocus = true) {
            const pinInput = document.getElementById('inputPIN');
            if (pinInput) {
                pinInput.value = '';
                if (shouldFocus) focusPinInput();
            }
        }

        function handlePinInput(input) {
            const value = String(input && input.value ? input.value : '').replace(/\D/g, '').slice(0, 4);
            if (input.value !== value) input.value = value;
            const editor = document.getElementById('inputEditorName').value.trim();
            if (editor.length < 2) return;
            if (value.length === 4) submitAuth();
        }

        const authModalEl = document.getElementById('modalVerifyAuth');
        if (authModalEl) {
            authModalEl.addEventListener('shown.bs.modal', () => {
                const editor = (document.getElementById('inputEditorName').value || '').trim();
                if (editor.length >= 2) {
                    focusPinInput();
                } else {
                    const editorInput = document.getElementById('inputEditorName');
                    if (editorInput) editorInput.focus();
                }
            });
        }

        async function submitAuth() {
            if (authInProgress) return;
            const pin = document.getElementById('inputPIN').value.trim();
            const editor = document.getElementById('inputEditorName').value.trim();
            const action = pendingAction;
            const params = pendingParams ? { ...pendingParams } : null;
            if (editor.length < 2) {
                showNotif('Nama editor minimal 2 karakter.', 'error');
                return;
            }
            if (pin.length !== 4) {
                showNotif('PIN harus 4 digit.', 'error');
                return;
            }

            authInProgress = true;
            let optimisticToggle = null;
            let hidePromise = null;
            let optimisticActionOpened = false;
            try {
                if (action === 'toggle') {
                    hidePromise = hideAuthModal();
                    optimisticToggle = executeAction(action, params, { sync: false, log: false });
                } else {
                    hidePromise = hideAuthModal();
                }

                if (action === 'catat') {
                    hidePromise.then(() => {
                        if (optimisticActionOpened) executeAction(action, params);
                    });
                    optimisticActionOpened = true;
                }

                if (hidePromise) {
                    await hidePromise;
                }

                const deviceId = getDeviceId();
                const url = `${CLOUD_URL}?action=verifyAuth&pin=${encodeURIComponent(pin)}&editor=${encodeURIComponent(editor)}&deviceId=${encodeURIComponent(deviceId)}`;
                const data = await fetchVerifyAuth(url);
                if (!data || !data.ok || !data.writeToken) {
                    if (optimisticToggle) {
                        executeAction(action, params, { sync: false, log: false, nextValue: optimisticToggle.previousValue });
                    }
                    if (optimisticActionOpened && action === 'catat') {
                        optimisticActionOpened = false;
                        bootstrap.Modal.getOrCreateInstance('#modalCatat').hide();
                    }
                    reopenAuthModal();
                    resetAuthPinFocus();
                    showNotif((data && data.error) ? data.error : 'PIN salah', 'error');
                    return;
                }

                saveAuthSession({
                    editor: data.editor || editor.toUpperCase(),
                    writeToken: data.writeToken,
                    deviceId: data.deviceId || deviceId,
                    issuedAt: Date.now(),
                    expiresAt: Date.now() + ((Number(data.expiresInSec || 0) || 0) * 1000)
                });
                syncStoredFcmTokenAfterAuth().catch(() => {});

                if (action === 'toggle') {
                    if (optimisticToggle) {
                        const mm = params.m.toString().padStart(2, '0');
                        addLog("Iuran", `${params.kat.toUpperCase()} - ${optimisticToggle.person.nama} - ${mm}/${params.y} - [${optimisticToggle.isLunas ? "âœ… - LUNAS" : "âŒ - BATAL"}]`);
                        syncAll();
                    } else {
                        executeAction(action, params);
                    }
                } else {
                    executeAction(action, params);
                }
            } catch (err) {
                if (optimisticToggle) {
                    executeAction(action, params, { sync: false, log: false, nextValue: optimisticToggle.previousValue });
                }
                if (optimisticActionOpened && action === 'catat') {
                    optimisticActionOpened = false;
                    bootstrap.Modal.getOrCreateInstance('#modalCatat').hide();
                }
                reopenAuthModal();
                resetAuthPinFocus();
                showNotif((err && err.message) ? err.message : 'Tidak bisa verifikasi ke backend', 'error');
            } finally {
                authInProgress = false;
            }
        }
        window.handlePinInput = handlePinInput;
        window.submitAuth = submitAuth;
        window.checkAuth = submitAuth;

        function executeAction(action = pendingAction, params = pendingParams, options = {}) {
            if (action === 'tambah') { 
                document.getElementById('fAdd').reset(); 
                document.getElementById('editMemberId').value = ""; 
                bootstrap.Modal.getOrCreateInstance('#modalTambah').show(); 
            } else if (action === 'catat') { 
                document.getElementById('fTrans').reset(); 
                document.getElementById('editTransIdx').value = ""; 
                document.getElementById('trans_date').valueAsDate = new Date(); 
                pendingIuranPaymentData = null;
                const nominalInput = document.getElementById('trans_val');
                if (nominalInput) nominalInput.readOnly = false;
                bootstrap.Modal.getOrCreateInstance('#modalCatat').show(); 
            } else if (action === 'bayar_member') {
                const selectedYear = Number(params && params.y) || CURRENT_YEAR;
                const selectedMonths = Array.isArray(params && params.selectedMonths)
                    ? params.selectedMonths.map(Number).filter(m => m >= 1 && m <= 12).sort((a, b) => a - b)
                    : [Number(params && params.selectedMonth) || Number(params && params.m) || 0].filter(m => m >= 1 && m <= 12);
                const paymentMethod = String(params && params.method ? params.method : 'CASH').toUpperCase();
                const selectedMonth = selectedMonths[0] || 0;
                const now = new Date();
                const defaultMonth = selectedMonth >= 1 && selectedMonth <= 12
                    ? selectedMonth
                    : (selectedYear === now.getFullYear() ? now.getMonth() + 1 : 1);
                const defaultDay = (selectedYear === now.getFullYear() && defaultMonth === (now.getMonth() + 1))
                    ? now.getDate()
                    : 1;
                const defaultDate = `${selectedYear}-${String(defaultMonth).padStart(2, '0')}-${String(defaultDay).padStart(2, '0')}`;

                document.getElementById('fTrans').reset();
                document.getElementById('editTransIdx').value = "";
                document.getElementById('trans_type').value = 'Pemasukan';
                document.getElementById('trans_date').value = defaultDate;
                document.getElementById('trans_source').value = (params && params.nama ? params.nama : '').toUpperCase();
                const monthLabel = selectedMonths.map(month => PAYMENT_MONTH_NAMES[month - 1]).filter(Boolean).join(', ');
                document.getElementById('trans_ket').value = `BAYAR IURAN ${params && params.kat ? String(params.kat).toUpperCase() : 'ANGGOTA'} ${monthLabel} VIA ${paymentMethod}`.trim();
                const nominalInput = document.getElementById('trans_val');
                if (nominalInput) {
                    nominalInput.value = selectedMonths.length * MONTHLY_IURAN_AMOUNT;
                    nominalInput.readOnly = true;
                }
                pendingIuranPaymentData = {
                    id: params && params.id,
                    nama: params && params.nama,
                    kat: params && params.kat,
                    y: selectedYear,
                    months: selectedMonths,
                    method: paymentMethod
                };
                bootstrap.Modal.getOrCreateInstance('#modalCatat').show();
                setTimeout(() => {
                    if (nominalInput) nominalInput.focus();
                }, 150);
            } else if (action === 'download') {
                downloadFinancialPDF();
            } else if (action === 'edit_trigger') {
                if (currentContext.type === 'member') {
                    const p = [...DB_DRIVER, ...DB_HELPER].find(x => x.id == currentContext.id);
                    document.getElementById('editMemberId').value = p.id; 
                    document.getElementById('n').value = p.nama;
                    document.getElementById('k').value = DB_DRIVER.find(x => x.id == currentContext.id) ? 'Driver' : 'Helper';
                    bootstrap.Modal.getOrCreateInstance('#modalTambah').show();
                } else {
                    const t = DB_TRANSAKSI[currentContext.idx];
                    document.getElementById('editTransIdx').value = currentContext.idx;
                    document.getElementById('trans_type').value = t.tp; 
                    document.getElementById('trans_date').value = t.d;
                    document.getElementById('trans_source').value = t.p; 
                    document.getElementById('trans_ket').value = t.k;
                    const nominalInput = document.getElementById('trans_val');
                    if (nominalInput) {
                        nominalInput.value = t.v;
                        nominalInput.readOnly = false;
                    }
                    bootstrap.Modal.getOrCreateInstance('#modalCatat').show();
                }
            } else if (action === 'delete_trigger') {
                if (currentContext.type === 'member') {
                    const isDriver = DB_DRIVER.some(x => x.id == currentContext.id);
                    const kat = isDriver ? 'DRIVER' : 'HELPER';
                    const p = [...DB_DRIVER, ...DB_HELPER].find(x => x.id == currentContext.id);
                    addLog("Hapus anggota", `${kat} - ${p.nama}`);
                    DB_DRIVER = DB_DRIVER.filter(x => x.id != currentContext.id); 
                    DB_HELPER = DB_HELPER.filter(x => x.id != currentContext.id);
                } else {
                    const t = DB_TRANSAKSI[currentContext.idx];
                    addLog("Hapus transaksi", `${t.tp.toUpperCase()} - ${t.p} - ${t.k || '-'} - ${formatLogCurrency(t.v)}`);
                    DB_TRANSAKSI.splice(currentContext.idx, 1);
                }
                syncAll();
            } else if (action === 'toggle') {
                let p = (params.kat === 'Driver' ? DB_DRIVER : DB_HELPER).find(x => x.id == params.id);
                if (!p) return null;
                if (!p.status) p.status = {};
                if (!p.status[params.y]) p.status[params.y] = {};
                const previousValue = p.status[params.y][params.m] === true;
                const nextValue = Object.prototype.hasOwnProperty.call(options, 'nextValue') ? !!options.nextValue : !previousValue;
                p.status[params.y][params.m] = nextValue;
                const result = { person: p, previousValue, isLunas: nextValue };
                const shouldLog = options.log !== false;
                const shouldSync = options.sync !== false;
                if (shouldLog) {
                    const mm = params.m.toString().padStart(2, '0');
                    addLog("Iuran", `${params.kat.toUpperCase()} - ${p.nama} - ${mm}/${params.y} - [${nextValue ? "âœ… - LUNAS" : "âŒ - BATAL"}]`);
                }
                if (shouldSync) {
                    syncAll();
                } else {
                    render();
                }
                return result;
            } else if (action === 'admin_verify_pending' || action === 'admin_cancel_pending') {
                const statusValue = action === 'admin_verify_pending' ? true : null;
                const targetList = params.kat === 'Driver' ? DB_DRIVER : DB_HELPER;
                const person = targetList.find(x => x.id == params.id);
                if (!person) return null;
                const pendingMonths = Array.isArray(params.months)
                    ? params.months.map(Number).filter(month => month >= 1 && month <= 12 && person.status?.[params.y]?.[month] === 'pending')
                    : [];
                if (!pendingMonths.length) return null;
                const updatedPerson = setMemberPaymentStatusLocal({ ...params, months: pendingMonths }, statusValue);
                if (!updatedPerson) return null;
                const monthText = pendingMonths.map(month => `${String(month).padStart(2, '0')}/${params.y}`).join(', ');
                addLog(
                    "Iuran",
                    `${String(params.kat || '').toUpperCase()} - ${updatedPerson.nama} - ${monthText} - [${statusValue === true ? "âœ… - LUNAS VERIFIKASI ADMIN" : "âŒ - PEMBAYARAN QRIS DIBATALKAN"}]`
                );
                syncAll();
                return { person: updatedPerson, statusValue };
            }
        }

        function normalizeYearValue(year, fallback = CURRENT_YEAR) {
            const parsed = Number(year);
            if (Number.isFinite(parsed) && parsed >= 2000 && parsed <= 2100) {
                return parsed;
            }
            const fallbackParsed = Number(fallback);
            if (Number.isFinite(fallbackParsed) && fallbackParsed >= 2000 && fallbackParsed <= 2100) {
                return fallbackParsed;
            }
            return new Date().getFullYear();
        }

        function cloneYearDataShape(data = {}) {
            return {
                driver: cloneData(data.driver || []),
                helper: cloneData(data.helper || []),
                transaksi: cloneData(data.transaksi || []),
                logs: cloneData(data.logs || [])
            };
        }

        function getLiveYearDataSnapshot() {
            return cloneYearDataShape({
                driver: DB_DRIVER,
                helper: DB_HELPER,
                transaksi: DB_TRANSAKSI,
                logs: DB_LOGS
            });
        }

        function getYearDataSnapshot(year) {
            const normalizedYear = normalizeYearValue(year);
            if (normalizedYear === Number(CURRENT_YEAR)) {
                return getLiveYearDataSnapshot();
            }
            if (YEAR_CACHE[normalizedYear]) {
                return cloneYearDataShape(YEAR_CACHE[normalizedYear]);
            }
            const hydrated = loadYearCacheFromStorage(normalizedYear);
            if (hydrated && hydrated.data) {
                const snapshot = cloneYearDataShape(hydrated.data);
                YEAR_CACHE[normalizedYear] = snapshot;
                YEAR_SIGNATURES[normalizedYear] = buildYearSignature(snapshot);
                return cloneYearDataShape(snapshot);
            }
            return cloneYearDataShape();
        }

        async function fetchYearDataSnapshot(year) {
            const normalizedYear = normalizeYearValue(year);
            const data = await fetchJson(`${CLOUD_URL}?action=read&year=${normalizedYear}`);
            const snapshot = cloneYearDataShape({
                driver: data.driver || [],
                helper: data.helper || [],
                transaksi: data.transaksi || [],
                logs: data.logs || []
            });
            YEAR_CACHE[normalizedYear] = cloneYearDataShape(snapshot);
            YEAR_SIGNATURES[normalizedYear] = buildYearSignature(snapshot);
            saveYearCacheToStorage(normalizedYear, snapshot);
            return cloneYearDataShape(snapshot);
        }

        function applyYearContext(year, data) {
            const normalizedYear = normalizeYearValue(year);
            const snapshot = cloneYearDataShape(data);
            CURRENT_YEAR = normalizedYear;
            syncYearDropdowns(normalizedYear);
            DB_DRIVER = cloneData(snapshot.driver);
            DB_HELPER = cloneData(snapshot.helper);
            DB_TRANSAKSI = cloneData(snapshot.transaksi);
            DB_LOGS = cloneData(snapshot.logs);
            YEAR_CACHE[normalizedYear] = cloneYearDataShape(snapshot);
            YEAR_SIGNATURES[normalizedYear] = buildYearSignature(snapshot);
            saveYearCacheToStorage(normalizedYear, snapshot);
            render();
            return snapshot;
        }

        async function ensureAdminActionYear(year) {
            const normalizedYear = normalizeYearValue(year);
            if (normalizedYear === Number(CURRENT_YEAR)) return normalizedYear;
            const snapshot = await fetchYearDataSnapshot(normalizedYear);
            applyYearContext(normalizedYear, snapshot);
            return normalizedYear;
        }

        function normalizeAdminPendingPayload(payload) {
            const data = payload && typeof payload === 'object' ? payload : {};
            return {
                ...data,
                y: normalizeYearValue(data.y),
                months: Array.isArray(data.months)
                    ? Array.from(new Set(data.months.map(Number).filter(month => month >= 1 && month <= 12))).sort((a, b) => a - b)
                    : []
            };
        }

        function normalizePendingPaymentRequest(params, proofBase64 = null) {
            const year = normalizeYearValue(params && params.y);
            const months = Array.isArray(params && params.selectedMonths)
                ? Array.from(new Set(params.selectedMonths.map(Number).filter(month => month >= 1 && month <= 12))).sort((a, b) => a - b)
                : [];
            if (!months.length) {
                throw new Error('Pilih bulan pembayaran terlebih dahulu.');
            }

            return {
                year,
                id: params && params.id,
                nama: params && params.nama,
                kat: params && params.kat,
                months,
                proofData: proofBase64 || ''
            };
        }

        async function waitForPendingPaymentRemoteState(request, options = {}) {
            const timeoutMs = Number(options.timeoutMs || 15000);
            const intervalMs = Number(options.intervalMs || 400);
            const startedAt = Date.now();
            let lastData = null;
            let lastError = null;
            const targetYear = normalizeYearValue(request && request.year);
            const targetKat = String(request && request.kat || '').toUpperCase();
            const targetId = String(request && request.id || '');
            const targetMonths = Array.isArray(request && request.months) ? request.months.map(Number) : [];
            const expectedProof = String(request && request.proofData || '').trim();

            while ((Date.now() - startedAt) < timeoutMs) {
                try {
                    const data = await fetchJson(`${CLOUD_URL}?action=read&year=${targetYear}`);
                    lastData = {
                        driver: data.driver || [],
                        helper: data.helper || [],
                        transaksi: data.transaksi || [],
                        logs: data.logs || []
                    };
                    lastError = null;

                    const targetList = targetKat === 'HELPER' ? lastData.helper : lastData.driver;
                    const person = (targetList || []).find(item => String(item.id) === targetId);
                    const yearStatus = person && person.status ? person.status[targetYear] : null;
                    const proofMap = person && person.pendingProofs ? person.pendingProofs[targetYear] : null;
                    const allMonthsPending = targetMonths.length > 0 && targetMonths.every(month => yearStatus && yearStatus[month] === 'pending');
                    const proofReady = !expectedProof || targetMonths.every(month => proofMap && proofMap[month]);

                    if (allMonthsPending && proofReady) {
                        return {
                            ok: true,
                            data: lastData,
                            elapsedMs: Date.now() - startedAt
                        };
                    }
                } catch (err) {
                    lastError = err;
                }

                await new Promise(resolve => setTimeout(resolve, intervalMs));
            }

            return {
                ok: false,
                data: lastData,
                elapsedMs: Date.now() - startedAt,
                error: lastError && lastError.message ? lastError.message : ''
            };
        }

        async function submitPendingPaymentToBackend(params, proofBase64 = null) {
            const request = normalizePendingPaymentRequest(params, proofBase64);
            const payload = {
                action: 'submitPendingPayment',
                year: request.year,
                id: request.id,
                nama: request.nama,
                kat: request.kat,
                months: request.months,
                proofData: request.proofData
            };

            await postToAppsScript(payload);
            const verification = await waitForPendingPaymentRemoteState(request, {
                timeoutMs: 15000,
                intervalMs: 400
            });
            if (!verification.ok) {
                throw new Error(verification.error || 'Backend belum mengonfirmasi pembayaran QRIS.');
            }

            if (verification.data) {
                YEAR_CACHE[request.year] = cloneYearDataShape(verification.data);
                YEAR_SIGNATURES[request.year] = buildYearSignature(verification.data);
                saveYearCacheToStorage(request.year, verification.data);

                if (request.year === Number(CURRENT_YEAR)) {
                    applyYearData(request.year, verification.data);
                }
            }

            return verification.data || null;
        }

        function setMemberPaymentStatusLocal(params, statusValue) {
            const kat = String((params && params.kat) || '').toUpperCase();
            const source = kat === 'HELPER' ? DB_HELPER : DB_DRIVER;
            const person = source.find(item => String(item.id) === String(params && params.id));
            if (!person) return null;
            const targetYear = String(normalizeYearValue(params && params.y));
            if (!person.status) person.status = {};
            if (!person.status[targetYear]) person.status[targetYear] = {};
            person.pendingProofs = person.pendingProofs || {};
            person.pendingProofs[targetYear] = person.pendingProofs[targetYear] || {};
            const months = Array.isArray(params && params.months) ? params.months : [];
            let changed = false;
            months.forEach(month => {
                const monthKey = Number(month);
                const currentStatus = person.status[targetYear][monthKey];
                if (statusValue === null) {
                    if (currentStatus === 'pending') {
                        delete person.status[targetYear][monthKey];
                        delete person.pendingProofs[targetYear][monthKey];
                        changed = true;
                    }
                } else if (statusValue === true) {
                    if (currentStatus === 'pending') {
                        person.status[targetYear][monthKey] = true;
                        delete person.pendingProofs[targetYear][monthKey];
                        changed = true;
                    }
                } else {
                    if (currentStatus !== statusValue) {
                        person.status[targetYear][monthKey] = statusValue;
                        changed = true;
                    }
                }
            });
            return changed ? person : null;
        }

        function getPendingPaymentRows(year = CURRENT_YEAR, sourceData = null) {
            const targetYear = String(normalizeYearValue(year));
            const dataset = sourceData && typeof sourceData === 'object' ? sourceData : null;
            const driverList = Array.isArray(dataset && dataset.driver) ? dataset.driver : DB_DRIVER;
            const helperList = Array.isArray(dataset && dataset.helper) ? dataset.helper : DB_HELPER;
            const rows = [];
            const collect = (list, kat) => {
                list.forEach(person => {
                    const yearStatus = person && person.status ? person.status[targetYear] : null;
                    if (!yearStatus) return;
                    const months = Object.keys(yearStatus)
                        .map(Number)
                        .filter(month => yearStatus[month] === 'pending' || yearStatus[month] === 'gateway_pending')
                        .sort((a, b) => a - b);
                    if (!months.length) return;
                    let statusSource = '';
                    for (const month of months) {
                        const currentStatus = String(yearStatus[month] || '').toLowerCase();
                        if (!statusSource) {
                            statusSource = currentStatus;
                        } else if (statusSource !== currentStatus) {
                            statusSource = 'mixed_pending';
                            break;
                        }
                    }
                    let proofData = null;
                    if (person.pendingProofs && person.pendingProofs[targetYear]) {
                        for (const month of months) {
                            if (person.pendingProofs[targetYear][month]) {
                                proofData = person.pendingProofs[targetYear][month];
                                break;
                            }
                        }
                    }
                    rows.push({
                        id: person.id,
                        nama: person.nama,
                        kat,
                        y: Number(targetYear),
                        months,
                        statusSource: statusSource || 'pending',
                        nominal: months.length * MONTHLY_IURAN_AMOUNT,
                        proofData
                    });
                });
            };
            collect(driverList, 'Driver');
            collect(helperList, 'Helper');
            return rows.sort((a, b) => String(a.nama || '').localeCompare(String(b.nama || '')));
        }

        function renderAdminPaymentPanel() {
            const summaryEl = document.getElementById('admin-payment-summary');
            const listEl = document.getElementById('admin-payment-list');
            if (!summaryEl || !listEl) return;

            const pendingRows = getPendingPaymentRows();
            if (!pendingRows.length) {
                summaryEl.innerText = 'Belum ada pembayaran QRIS yang menunggu verifikasi.';
                listEl.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">Tidak ada data pending.</td></tr>';
                return;
            }

            const totalNominal = pendingRows.reduce((sum, item) => sum + Number(item.nominal || 0), 0);
            summaryEl.innerText = `${pendingRows.length} anggota menunggu verifikasi QRIS. Total nominal Rp ${totalNominal.toLocaleString('id-ID')}.`;

            listEl.innerHTML = pendingRows.map(item => {
                const monthLabel = item.months.map(month => PAYMENT_MONTH_NAMES[month - 1]).join(', ');
                const safePayload = encodeURIComponent(JSON.stringify(item));
                return `<tr>
                    <td>${String(item.kat || '').toUpperCase()} - ${item.nama}</td>
                    <td>${monthLabel}</td>
                    <td class="fw-bold text-end">Rp ${item.nominal.toLocaleString('id-ID')}</td>
                    <td><span class="badge bg-warning text-dark">PENDING</span></td>
                    <td class="text-nowrap">
                        <button type="button" class="btn btn-sm btn-info" onclick="openVerificationModal('${safePayload}')">DETAIL</button>
                    </td>
                    <td class="text-nowrap">
                        <button type="button" class="btn btn-sm btn-success" onclick="triggerAdminPendingAction('admin_verify_pending', '${safePayload}')">LUNASKAN</button>
                        <button type="button" class="btn btn-sm btn-outline-danger ms-1" onclick="triggerAdminPendingAction('admin_cancel_pending', '${safePayload}')">BATALKAN</button>
                    </td>
                </tr>`;
            }).join('');
        }

        function postPendingPaymentsToParent(year = CURRENT_YEAR, sourceData = null) {
            if (window.parent === window) return;
            try {
                const targetYear = normalizeYearValue(year);
                const pendingRows = getPendingPaymentRows(targetYear, sourceData).map(item => ({
                    ...item,
                    monthLabels: (item.months || []).map(month => PAYMENT_MONTH_NAMES[month - 1]).filter(Boolean)
                }));
                const totalNominal = pendingRows.reduce((sum, item) => sum + Number(item.nominal || 0), 0);
                window.parent.postMessage({
                    type: 'delta8-admin-pending-state',
                    payload: {
                        year: targetYear,
                        count: pendingRows.length,
                        totalNominal,
                        items: pendingRows,
                        updatedAt: new Date().toISOString()
                    }
                }, '*');
            } catch (err) {}
        }

        function triggerAdminPendingAction(action, encodedPayload) {
            try {
                const params = JSON.parse(decodeURIComponent(String(encodedPayload || '')));
                askAuth(action, params);
            } catch (err) {
                showNotif('Data pembayaran pending tidak valid.', 'error');
            }
        }

        let currentVerificationParams = null;

        function openVerificationModal(encodedPayload) {
            try {
                const params = JSON.parse(decodeURIComponent(String(encodedPayload || '')));
                currentVerificationParams = params;

                // Fill modal details
                document.getElementById('verify-member-name').innerText = params.nama || '-';
                document.getElementById('verify-member-kat').innerText = String(params.kat || '').toUpperCase();
                const monthLabel = params.months.map(month => PAYMENT_MONTH_NAMES[month - 1]).join(', ');
                document.getElementById('verify-months').innerText = monthLabel;
                document.getElementById('verify-amount').innerText = `Rp ${(params.months.length * MONTHLY_IURAN_AMOUNT).toLocaleString('id-ID')}`;

                const proofData = params.proofData || getPendingProofData(params);
                if (proofData) {
                    document.getElementById('verify-proof-image').classList.remove('d-none');
                    document.getElementById('verify-proof-placeholder').classList.add('d-none');
                    document.getElementById('proof-image').src = proofData;
                } else {
                    document.getElementById('verify-proof-placeholder').classList.remove('d-none');
                    document.getElementById('verify-proof-image').classList.add('d-none');
                    document.getElementById('proof-image').src = '';
                }

                bootstrap.Modal.getOrCreateInstance('#modalVerifikasiPembayaran').show();
            } catch (err) {
                showNotif('Gagal membuka detail verifikasi.', 'error');
            }
        }

        function getPendingProofData(params) {
            if (!params) return null;
            const targetList = params.kat === 'Driver' ? DB_DRIVER : DB_HELPER;
            const person = targetList.find(x => String(x.id) === String(params.id));
            if (!person || !person.pendingProofs || !person.pendingProofs[params.y]) return null;
            for (const month of params.months) {
                const proof = person.pendingProofs[params.y][month];
                if (proof) return proof;
            }
            return null;
        }

        function verifyPendingPayment() {
            if (!currentVerificationParams) return;
            triggerAdminPendingAction('admin_verify_pending', encodeURIComponent(JSON.stringify(currentVerificationParams)));
            bootstrap.Modal.getInstance('#modalVerifikasiPembayaran').hide();
        }

        function cancelPendingPayment() {
            if (!currentVerificationParams) return;
            triggerAdminPendingAction('admin_cancel_pending', encodeURIComponent(JSON.stringify(currentVerificationParams)));
            bootstrap.Modal.getInstance('#modalVerifikasiPembayaran').hide();
        }

        function openPaymentOptions(params) {
            pendingPaymentContext = params ? { ...params, selectedMonths: [] } : null;
            paymentOptionMode = getMemberPendingContext(params) ? 'pending' : 'default';
            syncPaymentOptionAvailability();
            bootstrap.Modal.getOrCreateInstance('#modalPilihPembayaran').show();
        }

        function getMemberPendingContext(params) {
            if (!params) return null;
            const year = normalizeYearValue(params.y);
            const targetList = String(params.kat || '').toUpperCase() === 'HELPER' ? DB_HELPER : DB_DRIVER;
            const person = targetList.find(item => String(item.id) === String(params.id));
            const yearStatus = person && person.status ? person.status[year] : null;
            if (!yearStatus) return null;
            const months = Object.keys(yearStatus)
                .map(Number)
                .filter(month => yearStatus[month] === 'pending' || yearStatus[month] === 'gateway_pending')
                .sort((a, b) => a - b);
            if (!months.length) return null;
            let statusSource = '';
            months.forEach((month) => {
                const currentStatus = String(yearStatus[month] || '').toLowerCase();
                if (!statusSource) statusSource = currentStatus;
                else if (statusSource !== currentStatus) statusSource = 'mixed_pending';
            });
            return {
                ...params,
                y: year,
                selectedMonths: months,
                statusSource: statusSource || 'pending'
            };
        }

        function syncPaymentOptionAvailability() {
            const cashButton = document.getElementById('payment-option-cash');
            const qrisButton = document.getElementById('payment-option-qris');
            const continueButton = document.getElementById('payment-option-continue');
            const cancelButton = document.getElementById('payment-option-cancel');
            const noteEl = document.getElementById('payment-option-note');
            const titleEl = document.getElementById('payment-option-title');
            const adminMode = isAdminMode();
            const pendingContext = getMemberPendingContext(pendingPaymentContext);
            const pendingMode = paymentOptionMode === 'pending' && !!pendingContext;

            if (cashButton) {
                cashButton.classList.toggle('d-none', pendingMode || !adminMode);
            }
            if (qrisButton) {
                qrisButton.classList.toggle('d-none', pendingMode);
                qrisButton.classList.toggle('w-100', !adminMode && !pendingMode);
            }
            if (continueButton) {
                continueButton.classList.toggle('d-none', !pendingMode);
            }
            if (cancelButton) {
                cancelButton.classList.toggle('d-none', !pendingMode);
            }
            if (titleEl) {
                titleEl.textContent = pendingMode ? 'PEMBAYARAN PENDING' : 'PILIH PEMBAYARAN';
            }
            if (noteEl) {
                if (pendingMode) {
                    const monthText = pendingContext.selectedMonths.map(month => PAYMENT_MONTH_NAMES[month - 1]).join(', ');
                    noteEl.textContent = `Status pembayaran masih pending untuk bulan ${monthText}. Anda bisa melanjutkan atau membatalkannya.`;
                } else {
                    noteEl.textContent = adminMode
                        ? 'Admin bisa memproses pembayaran cash maupun QRIS dari panel ini.'
                        : 'Pembayaran cash hanya bisa diproses dari halaman admin.';
                }
            }
        }

        async function cancelMemberPendingPayment() {
            const pendingContext = getMemberPendingContext(pendingPaymentContext);
            if (!pendingContext) {
                showNotif('Tidak ada pembayaran pending yang bisa dibatalkan.', 'info');
                return;
            }
            try {
                const response = await postToAppsScript({
                    action: 'cancelMemberPending',
                    year: pendingContext.y,
                    id: pendingContext.id,
                    nama: pendingContext.nama,
                    kat: pendingContext.kat,
                    months: pendingContext.selectedMonths
                });
                if (response && response.data) {
                    YEAR_CACHE[pendingContext.y] = cloneYearDataShape(response.data);
                    YEAR_SIGNATURES[pendingContext.y] = buildYearSignature(response.data);
                    saveYearCacheToStorage(pendingContext.y, response.data);
                    if (pendingContext.y === Number(CURRENT_YEAR)) {
                        applyYearData(pendingContext.y, response.data);
                    }
                } else {
                    await loadFromCloudSmart(pendingContext.y, { silent: true, forceRender: true });
                }
                hideModalSafely('modalPilihPembayaran');
                pendingPaymentContext = null;
                paymentOptionMode = 'default';
                showNotif('Pembayaran pending berhasil dibatalkan.', 'success');
            } catch (err) {
                showNotif((err && err.message) ? err.message : 'Pembatalan pembayaran pending gagal.', 'error');
            }
        }

        function continuePendingMemberPayment() {
            const pendingContext = getMemberPendingContext(pendingPaymentContext);
            if (!pendingContext) {
                showNotif('Tidak ada pembayaran pending yang bisa dilanjutkan.', 'info');
                return;
            }
            hideModalSafely('modalPilihPembayaran');
            if (pendingContext.statusSource === 'pending') {
                showNotif('Pembayaran ini sedang menunggu verifikasi admin. Jika ingin ulang bayar, batalkan dulu status pending-nya.', 'info');
                return;
            }
            if (pendingContext.statusSource === 'mixed_pending') {
                showNotif('Ada campuran status pending. Batalkan dulu jika ingin merapikan status pembayaran.', 'info');
                return;
            }
            pendingPaymentContext = {
                ...pendingContext,
                method: 'QRIS',
                selectedMonths: pendingContext.selectedMonths.slice()
            };
            openQrisPaymentModal(pendingPaymentContext);
        }

        function updatePaymentMonthSummary() {
            const totalEl = document.getElementById('payment-month-total');
            const labelEl = document.getElementById('payment-month-selection-label');
            const continueBtn = document.getElementById('payment-month-continue');
            const selectedMonths = Array.isArray(pendingPaymentContext && pendingPaymentContext.selectedMonths)
                ? pendingPaymentContext.selectedMonths.slice().sort((a, b) => a - b)
                : [];
            const total = selectedMonths.length * MONTHLY_IURAN_AMOUNT;

            if (labelEl) {
                labelEl.innerText = selectedMonths.length
                    ? `Bulan dipilih: ${selectedMonths.map(month => PAYMENT_MONTH_NAMES[month - 1]).join(', ')}`
                    : 'Belum ada bulan dipilih';
            }
            if (totalEl) totalEl.innerText = `Rp ${total.toLocaleString('id-ID')}`;
            if (continueBtn) {
                const method = String(pendingPaymentContext && pendingPaymentContext.method ? pendingPaymentContext.method : '').toUpperCase();
                continueBtn.disabled = selectedMonths.length === 0;
                continueBtn.innerText = method === 'CASH' ? 'LANJUT KE VERIFIKASI' : `LANJUT PEMBAYARAN ${method || ''}`.trim();
            }
        }

        function getQrisImageUrl() {
            const runtimeConfig = window.DELTA8_QRIS_CONFIG || {};
            const configuredImage = String(runtimeConfig.imageUrl || QRIS_STATIC_IMAGE_URL || '').trim();
            if (configuredImage) return configuredImage;

            const payload = String(runtimeConfig.payload || QRIS_STATIC_PAYLOAD || '').trim();
            if (!payload) return '';

            return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(payload)}`;
        }

        function buildQrisImageFromPayload(qrString) {
            const payload = String(qrString || '').trim();
            if (!payload) return '';
            return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(payload)}`;
        }

        function isProtectedMidtransQrUrl(url) {
            const normalized = String(url || '').trim();
            return /https:\/\/api(?:\.sandbox)?\.midtrans\.com\/v2\/qris\/.+\/qr-code/i.test(normalized);
        }

        function renderQrisCode(customUrl, qrString) {
            const wrap = document.getElementById('qris-code-wrap');
            if (!wrap) return;
            const fallbackQrUrl = buildQrisImageFromPayload(qrString);
            let imageUrl = String(customUrl || '').trim();
            if (!imageUrl || isProtectedMidtransQrUrl(imageUrl)) {
                imageUrl = fallbackQrUrl || imageUrl;
            }
            if (imageUrl) {
                wrap.innerHTML = `<img src="${imageUrl}" alt="Kode QRIS" class="qris-code-image">`;
                const imageEl = wrap.querySelector('img');
                if (imageEl) {
                    imageEl.addEventListener('error', () => {
                        if (fallbackQrUrl && imageEl.getAttribute('src') !== fallbackQrUrl) {
                            imageEl.src = fallbackQrUrl;
                            return;
                        }
                        wrap.innerHTML = `<div class="qris-empty-state">QRIS dinamis belum bisa ditampilkan. Muat ulang transaksi atau cek kembali beberapa detik lagi.</div>`;
                    }, { once: true });
                }
            } else {
                wrap.innerHTML = `<div class="qris-empty-state">Halaman pembayaran Midtrans belum tersedia. Coba beberapa detik lagi atau ulangi transaksi.</div>`;
            }
        }

        function renderQrisPlaceholder(message) {
            const wrap = document.getElementById('qris-code-wrap');
            if (!wrap) return;
            const safeClass = /popup pembayaran|midtrans/i.test(String(message || '')) ? ' qris-snap-state' : '';
            wrap.innerHTML = `<div class="qris-empty-state${safeClass}">${message || 'Menyiapkan pembayaran Midtrans...'}</div>`;
        }

        function hasRenderableQrisCode(payment) {
            return !!(payment && (String(payment.qrUrl || '').trim() || String(payment.qrString || '').trim()));
        }

        function hasSnapRedirectFlow(payment) {
            return !!(payment && (String(payment.snapToken || '').trim() || String(payment.snapRedirectUrl || '').trim()));
        }

        function updateQrisActionButton(payment) {
            const button = document.getElementById('qris-open-btn');
            if (!button) return;
            if (hasRenderableQrisCode(payment)) {
                button.textContent = 'CEK STATUS';
                button.disabled = false;
                return;
            }
            if (hasSnapRedirectFlow(payment)) {
                button.textContent = 'BUKA QRIS MIDTRANS';
                button.disabled = false;
                return;
            }
            button.textContent = 'MENUNGGU QRIS';
            button.disabled = true;
        }

        function setQrisStatusCopy(message) {
            const statusEl = document.getElementById('qris-status-copy');
            if (statusEl) statusEl.textContent = message || '';
        }

        function blurActiveElement() {
            const activeEl = document.activeElement;
            if (activeEl && typeof activeEl.blur === 'function') {
                activeEl.blur();
            }
        }

        function hideModalSafely(target) {
            const modalEl = typeof target === 'string' ? document.getElementById(target) : target;
            if (!modalEl) return;
            if (modalEl.contains(document.activeElement)) {
                blurActiveElement();
            }
            const modal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.hide();
        }

        function stopMidtransStatusPolling() {
            if (midtransStatusPollTimer) {
                clearInterval(midtransStatusPollTimer);
                midtransStatusPollTimer = null;
            }
        }

        let midtransSnapJsPromise = null;
        let midtransClientConfigPromise = null;

        async function getMidtransClientConfig(forceRefresh = false) {
            if (!forceRefresh && midtransClientConfigPromise) {
                return midtransClientConfigPromise;
            }
            midtransClientConfigPromise = fetchJson(`${CLOUD_URL}?action=midtransClientKey`, 20000)
                .then((config) => {
                    const clientKey = String(config && config.clientKey || '').trim();
                    if (!clientKey) {
                        throw new Error('Client key Midtrans belum tersedia.');
                    }
                    return {
                        clientKey,
                        isProduction: !!(config && config.isProduction)
                    };
                })
                .catch((err) => {
                    midtransClientConfigPromise = null;
                    throw err;
                });
            return midtransClientConfigPromise;
        }

        async function ensureMidtransSnapJs() {
            if (window.snap && typeof window.snap.pay === 'function') {
                return window.snap;
            }
            if (midtransSnapJsPromise) {
                return midtransSnapJsPromise;
            }
            midtransSnapJsPromise = (async () => {
                const config = await getMidtransClientConfig();
                const clientKey = config.clientKey;
                const snapBase = config && config.isProduction
                    ? 'https://app.midtrans.com'
                    : 'https://app.sandbox.midtrans.com';
                await new Promise((resolve, reject) => {
                    const existing = document.getElementById('midtrans-snap-js');
                    if (existing) {
                        existing.addEventListener('load', () => resolve(), { once: true });
                        existing.addEventListener('error', () => reject(new Error('Snap.js Midtrans gagal dimuat.')), { once: true });
                        return;
                    }
                    const script = document.createElement('script');
                    script.id = 'midtrans-snap-js';
                    script.src = `${snapBase}/snap/snap.js`;
                    script.setAttribute('data-client-key', clientKey);
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Snap.js Midtrans gagal dimuat.'));
                    document.head.appendChild(script);
                });
                if (!window.snap || typeof window.snap.pay !== 'function') {
                    throw new Error('Snap.js Midtrans tidak siap digunakan.');
                }
                return window.snap;
            })().catch((err) => {
                midtransSnapJsPromise = null;
                throw err;
            });
            return midtransSnapJsPromise;
        }

        function prewarmMidtransPaymentFlow() {
            getMidtransClientConfig().catch((err) => {
                console.warn('Midtrans client config prewarm failed:', err);
            });
            ensureMidtransSnapJs().catch((err) => {
                console.warn('Midtrans Snap.js prewarm failed:', err);
            });
        }

        function buildMidtransPaymentContextKey(params) {
            if (!params) return '';
            const year = normalizeYearValue(params.y);
            const months = Array.isArray(params.selectedMonths)
                ? Array.from(new Set(params.selectedMonths.map(Number).filter(month => month >= 1 && month <= 12))).sort((a, b) => a - b)
                : [];
            return [
                year,
                String(params.kat || '').trim().toUpperCase(),
                String(params.id || '').trim(),
                months.join(',')
            ].join('|');
        }

        function mapCreatedMidtransPayment(created, params) {
            return {
                orderId: created.orderId,
                transactionId: created.transactionId,
                transactionStatus: created.transactionStatus,
                qrUrl: created.qrUrl,
                qrString: created.qrString || '',
                snapToken: created.snapToken || '',
                snapPrimaryFlow: created.debug && created.debug.primaryFlow ? created.debug.primaryFlow : '',
                expiresAt: created.expiresAt,
                year: normalizeYearValue(created.year || params.y),
                months: params.selectedMonths || []
            };
        }

        function resetPreparedMidtransPayment() {
            preparedMidtransPaymentKey = '';
            preparedMidtransPaymentPromise = null;
            preparedSnapInstance = null;
            qrisPreparationToken += 1;
        }

        function warmMidtransPayment(params) {
            const payment = getMemberGatewayPayment(params);
            if (payment && (payment.qrUrl || payment.qrString || payment.snapToken)) {
                preparedMidtransPaymentKey = buildMidtransPaymentContextKey(params);
                preparedMidtransPaymentPromise = Promise.resolve(payment);
                return preparedMidtransPaymentPromise;
            }

            const contextKey = buildMidtransPaymentContextKey(params);
            if (!contextKey) {
                return Promise.reject(new Error('Konteks pembayaran QRIS tidak valid.'));
            }
            if (preparedMidtransPaymentPromise && preparedMidtransPaymentKey === contextKey) {
                return preparedMidtransPaymentPromise;
            }

            preparedMidtransPaymentKey = contextKey;
            preparedMidtransPaymentPromise = createMidtransQrisTransaction(params)
                .then((created) => {
                    const mappedPayment = mapCreatedMidtransPayment(created, params);
                    loadFromCloudSmart(mappedPayment.year, { silent: true, forceRender: true }).catch((refreshErr) => {
                        console.warn('Background refresh after Midtrans create failed:', refreshErr);
                    });
                    return mappedPayment;
                })
                .catch((err) => {
                    if (preparedMidtransPaymentKey === contextKey) {
                        resetPreparedMidtransPayment();
                    }
                    throw err;
                });

            return preparedMidtransPaymentPromise;
        }

        function buildMidtransSnapOptions(payment) {
            const options = {
                onSuccess: () => {
                    syncMidtransPaymentStatus({ silent: true }).catch((err) => {
                        console.error('midtrans success sync error:', err);
                    });
                },
                onPending: () => {
                    setQrisStatusCopy('Snap Midtrans sudah dibuka. Di desktop, QRIS akan langsung ditampilkan.');
                },
                onError: (result) => {
                    const message = String(result && (result.status_message || result.message) || 'Snap Midtrans gagal dibuka.');
                    setQrisStatusCopy(message);
                    showNotif(message, 'error');
                },
                onClose: () => {
                    setQrisStatusCopy('Snap Midtrans ditutup. Anda bisa buka lagi selama transaksi belum kedaluwarsa.');
                }
            };
            if (String(payment.snapPrimaryFlow || '') === 'snap_gopay_qris') {
                options.uiMode = 'qr';
            }
            return options;
        }

        function triggerMidtransSnapPay(snap, payment) {
            if (!snap || typeof snap.pay !== 'function') {
                throw new Error('Snap Midtrans tidak siap digunakan.');
            }
            if (!payment || !payment.snapToken) {
                throw new Error('Token Snap Midtrans belum tersedia.');
            }
            const options = buildMidtransSnapOptions(payment);
            snap.pay(payment.snapToken, options);
        }

        async function openMidtransSnapQris(payment) {
            const snap = await ensureMidtransSnapJs();
            triggerMidtransSnapPay(snap, payment);
        }

        async function openCurrentSnapPayment() {
            if (!currentMidtransPayment || !currentMidtransPayment.orderId) {
                showNotif('Transaksi QRIS belum siap.', 'error');
                return;
            }
            try {
                if (!hasRenderableQrisCode(currentMidtransPayment) && hasSnapRedirectFlow(currentMidtransPayment)) {
                    setQrisStatusCopy('Membuka QRIS Midtrans...');
                    try {
                        await openMidtransSnapQris(currentMidtransPayment);
                        return;
                    } catch (snapErr) {
                        const redirectUrl = String(currentMidtransPayment.snapRedirectUrl || '').trim();
                        if (redirectUrl) {
                            window.open(redirectUrl, '_blank', 'noopener,noreferrer');
                            setQrisStatusCopy('QRIS Midtrans dibuka di tab baru. Selesaikan pembayaran lalu kembali ke halaman ini.');
                            return;
                        }
                        throw snapErr;
                    }
                }
                setQrisStatusCopy('Memeriksa status pembayaran QRIS...');
                await syncMidtransPaymentStatus({ silent: false });
            } catch (err) {
                const message = (err && err.message) ? err.message : 'Status pembayaran gagal diperiksa.';
                setQrisStatusCopy(message);
                showNotif(message, 'error');
            }
        }

        function updateQrisContinueButtonState(options = {}) {
            const continueBtn = document.getElementById('qris-continue-btn');
            if (!continueBtn) return;
            continueBtn.disabled = !!options.disabled;
            continueBtn.innerText = options.label || 'SAYA SUDAH BAYAR';
        }

        function updateQrisTransactionInfo(payment) {
            const infoEl = document.getElementById('qris-transaction-info');
            if (!infoEl) return;
            if (!payment) {
                infoEl.textContent = 'Menunggu transaksi dibuat';
                updateQrisActionButton(null);
                return;
            }
            const orderId = String(payment.orderId || '').trim();
            const transactionId = String(payment.transactionId || '').trim();
            infoEl.textContent = transactionId || orderId || 'Transaksi sedang disiapkan';
            updateQrisActionButton(payment);
        }

        function downloadCurrentQrisImage() {
            const imageEl = document.querySelector('#qris-code-wrap img');
            const imageUrl = imageEl ? String(imageEl.getAttribute('src') || '').trim() : '';
            if (!imageUrl) {
                if (!hasRenderableQrisCode(currentMidtransPayment) && hasSnapRedirectFlow(currentMidtransPayment)) {
                    showNotif('QRIS dibuka lewat Midtrans. Gunakan tombol BUKA QRIS MIDTRANS.', 'info');
                    return;
                }
                showNotif('Kode QR belum siap untuk diunduh.', 'info');
                return;
            }
            const payment = currentMidtransPayment || null;
            const filenameSeed = String((payment && (payment.transactionId || payment.orderId)) || 'DELTA8-QRIS')
                .replace(/[^A-Z0-9_-]/gi, '-');
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `QRIS-${filenameSeed}.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        }

        function warmMidtransPaymentForModal(params) {
            const token = ++qrisPreparationToken;
            updateQrisContinueButtonState({
                disabled: true,
                label: 'MENYIAPKAN...'
            });
            preparedSnapInstance = null;
            setQrisStatusCopy('Menghubungkan Midtrans dan menyiapkan QRIS pembayaran...');

            return Promise.resolve(warmMidtransPayment(params))
                .then((payment) => {
                    if (token !== qrisPreparationToken) return payment;
                    currentMidtransPayment = payment || null;
                    startMidtransStatusPolling();
                    updateQrisTransactionInfo(payment);
                    if (hasRenderableQrisCode(payment)) {
                        renderQrisCode(payment && payment.qrUrl, payment && payment.qrString);
                    } else if (hasSnapRedirectFlow(payment)) {
                        renderQrisPlaceholder('QRIS akan dibuka dari Midtrans. Tekan BUKA QRIS MIDTRANS untuk menampilkan kode pembayaran.');
                    } else {
                        renderQrisPlaceholder('Midtrans belum mengirimkan kode QRIS untuk transaksi ini.');
                    }
                    if (payment && (payment.qrUrl || payment.qrString || payment.snapToken || payment.snapRedirectUrl)) {
                        const statusMessage = hasRenderableQrisCode(payment)
                            ? 'QRIS siap. Scan kode di atas, lalu tekan SAYA SUDAH BAYAR untuk cek status.'
                            : 'QRIS tersedia lewat Midtrans. Tekan BUKA QRIS MIDTRANS, selesaikan pembayaran, lalu kembali ke halaman ini.';
                        setQrisStatusCopy(statusMessage);
                        updateQrisContinueButtonState({
                            disabled: false,
                            label: 'SAYA SUDAH BAYAR'
                        });
                        return payment;
                    }
                    throw new Error('Midtrans belum mengembalikan data pembayaran yang bisa digunakan.');
                })
                .catch((err) => {
                    if (token !== qrisPreparationToken) throw err;
                    preparedSnapInstance = null;
                    currentMidtransPayment = null;
                    stopMidtransStatusPolling();
                    updateQrisTransactionInfo(null);
                    renderQrisPlaceholder('Persiapan QRIS belum berhasil. Silakan coba lagi.');
                    updateQrisActionButton(null);
                    updateQrisContinueButtonState({
                        disabled: false,
                        label: 'COBA LAGI'
                    });
                    setQrisStatusCopy((err && err.message) ? err.message : 'Persiapan QRIS belum berhasil. Silakan coba lagi.');
                    throw err;
                });
        }

        function getMemberGatewayPayment(params) {
            if (!params) return null;
            const year = normalizeYearValue(params.y);
            const months = Array.isArray(params.selectedMonths) ? params.selectedMonths.map(Number) : [];
            const targetList = params.kat === 'Driver' ? DB_DRIVER : DB_HELPER;
            const person = targetList.find(x => String(x.id) === String(params.id));
            if (!person || !person.gatewayPayments || !person.gatewayPayments[year]) return null;
            const matches = months.map(month => person.gatewayPayments[year][month]).filter(Boolean);
            if (!matches.length) return null;
            const first = matches[0];
            const sameOrder = matches.every(item => String(item.orderId || '') === String(first.orderId || ''));
            return sameOrder ? { ...first, year, months } : null;
        }

        async function createMidtransQrisTransaction(params) {
            const year = normalizeYearValue(params && params.y);
            const months = Array.isArray(params && params.selectedMonths)
                ? Array.from(new Set(params.selectedMonths.map(Number).filter(month => month >= 1 && month <= 12))).sort((a, b) => a - b)
                : [];
            if (!months.length) {
                throw new Error('Bulan pembayaran QRIS belum dipilih.');
            }
            const amount = months.length * MONTHLY_IURAN_AMOUNT;
            return await fetchJson(
                `${CLOUD_URL}?action=createMidtransQris&year=${year}&id=${encodeURIComponent(params.id)}&nama=${encodeURIComponent(params.nama || '')}&kat=${encodeURIComponent(params.kat || '')}&months=${encodeURIComponent(months.join(','))}&amount=${encodeURIComponent(amount)}`,
                20000
            );
        }

        async function launchQrisSnapPayment(params) {
            let payment = getMemberGatewayPayment(params);
            if (!payment || (!payment.qrUrl && !payment.qrString && !payment.snapToken)) {
                payment = await warmMidtransPayment(params);
            }

            if (!payment.snapToken && !payment.qrUrl && !payment.qrString) {
                throw new Error('Midtrans belum mengembalikan token Snap atau kode QRIS untuk transaksi ini.');
            }

            currentMidtransPayment = payment;
            startMidtransStatusPolling();

            if (hasRenderableQrisCode(payment)) {
                setQrisStatusCopy('Kode QRIS siap digunakan. Scan sekarang lalu tekan SAYA SUDAH BAYAR untuk cek status.');
                renderQrisCode(payment.qrUrl, payment.qrString);
                updateQrisTransactionInfo(payment);
                updateQrisContinueButtonState({
                    disabled: false,
                    label: 'SAYA SUDAH BAYAR'
                });
                return;
            }

            if (hasSnapRedirectFlow(payment)) {
                updateQrisTransactionInfo(payment);
                renderQrisPlaceholder('QRIS akan dibuka dari Midtrans. Tekan BUKA QRIS MIDTRANS untuk menampilkan kode pembayaran.');
                setQrisStatusCopy('QRIS tersedia lewat Midtrans. Tekan BUKA QRIS MIDTRANS lalu kembali ke halaman ini setelah bayar.');
                updateQrisContinueButtonState({
                    disabled: false,
                    label: 'SAYA SUDAH BAYAR'
                });
                return;
            }

            throw new Error('Transaksi ini tidak memiliki kode QRIS yang bisa digunakan.');
        }

        async function syncMidtransPaymentStatus(options = {}) {
            if (!currentMidtransPayment || !currentMidtransPayment.orderId) return null;
            const silent = !!options.silent;
            const statusData = await fetchJson(
                `${CLOUD_URL}?action=midtransStatus&year=${encodeURIComponent(currentMidtransPayment.year)}&orderId=${encodeURIComponent(currentMidtransPayment.orderId)}`,
                20000
            );

            const remoteStatus = String(statusData && statusData.transactionStatus || '').toLowerCase();
            if (statusData && statusData.data) {
                applyYearData(currentMidtransPayment.year, statusData.data);
            } else {
                await loadFromCloudSmart(currentMidtransPayment.year, { silent: true, forceRender: true });
            }

            if (remoteStatus === 'settlement' || remoteStatus === 'capture') {
                stopMidtransStatusPolling();
                setQrisStatusCopy('Pembayaran berhasil terverifikasi otomatis.');
                hideModalSafely('modalQrisPayment');
                showNotif('Pembayaran Midtrans berhasil diverifikasi otomatis.', 'success');
                currentMidtransPayment = null;
            } else if (remoteStatus === 'expire' || remoteStatus === 'cancel' || remoteStatus === 'deny' || remoteStatus === 'failure') {
                stopMidtransStatusPolling();
                setQrisStatusCopy(`Transaksi Midtrans berstatus ${remoteStatus.toUpperCase()}.`);
                if (!silent) showNotif(`Transaksi Midtrans berstatus ${remoteStatus.toUpperCase()}.`, 'error');
                currentMidtransPayment = null;
            } else if (remoteStatus === 'pending') {
                setQrisStatusCopy('Menunggu pembayaran di Midtrans. Status akan diperbarui otomatis.');
                if (!silent) showNotif('Pembayaran masih menunggu konfirmasi Midtrans.', 'info');
            }

            return statusData;
        }

        function startMidtransStatusPolling() {
            stopMidtransStatusPolling();
            if (!currentMidtransPayment || !currentMidtransPayment.orderId) return;
            midtransStatusPollTimer = window.setInterval(() => {
                syncMidtransPaymentStatus({ silent: true }).catch((err) => {
                    console.error('midtrans polling error:', err);
                });
            }, 7000);
        }

        async function openQrisPaymentModal(params) {
            const amount = Array.isArray(params && params.selectedMonths)
                ? params.selectedMonths.length * MONTHLY_IURAN_AMOUNT
                : 0;
            const memberInfo = document.getElementById('qris-member-info');
            const monthInfo = document.getElementById('qris-month-info');
            const amountInfo = document.getElementById('qris-amount-value');

            if (memberInfo) memberInfo.innerText = `${String(params && params.kat || '').toUpperCase()} - ${String(params && params.nama || '').toUpperCase()}`;
            if (monthInfo) monthInfo.innerText = (params && Array.isArray(params.selectedMonths) && params.selectedMonths.length)
                ? `Bulan: ${params.selectedMonths.map(month => PAYMENT_MONTH_NAMES[month - 1]).join(', ')}`
                : 'Bulan belum dipilih';
            if (amountInfo) amountInfo.innerText = `Rp ${amount.toLocaleString('id-ID')}`;
            updateQrisTransactionInfo(null);
            renderQrisPlaceholder('Menyiapkan kode QRIS pembayaran...');
            updateQrisContinueButtonState({
                disabled: true,
                label: 'MENYIAPKAN...'
            });

            pendingPaymentContext = params || null;
            setQrisStatusCopy('Menghubungkan Midtrans dan menyiapkan QRIS pembayaran...');
            warmMidtransPaymentForModal(params).catch((err) => {
                console.warn('Midtrans payment prewarm failed:', err);
            });
            const modal = bootstrap.Modal.getOrCreateInstance('#modalQrisPayment');
            modal.show();
        }

        function cancelQrisPaymentFlow() {
            pendingPaymentContext = null;
            resetPreparedMidtransPayment();
            stopMidtransStatusPolling();
            currentMidtransPayment = null;
            hideModalSafely('modalQrisPayment');
        }

        function chooseMemberPayment(method) {
            if (!pendingPaymentContext) return;
            const normalizedMethod = String(method || '').toUpperCase();
            if (normalizedMethod === 'CASH' && !isAdminMode()) {
                showNotif('Pembayaran cash hanya tersedia di halaman admin.', 'info');
                return;
            }
            hideModalSafely('modalPilihPembayaran');
            pendingPaymentContext = { ...pendingPaymentContext, method: normalizedMethod, selectedMonths: [] };
            const monthGrid = document.getElementById('payment-month-grid');
            if (!monthGrid) return;

            const selectedYear = Number(pendingPaymentContext.y) || CURRENT_YEAR;
            const personList = pendingPaymentContext.kat === 'Driver' ? DB_DRIVER : DB_HELPER;
            const person = personList.find(x => x.id == pendingPaymentContext.id);
            const statusMap = (person && person.status && person.status[selectedYear]) ? person.status[selectedYear] : {};

            monthGrid.innerHTML = PAYMENT_MONTH_NAMES.map((monthName, idx) => {
                const month = idx + 1;
                const paid = statusMap[month] === true || statusMap[month] === 'pending' || statusMap[month] === 'gateway_pending';
                return `<button type="button" id="payment-month-${month}" class="month-option-btn" ${paid ? 'disabled' : ''} onclick="togglePaymentMonthSelection(${month})">${monthName}</button>`;
            }).join('');

            const paidCount = Object.values(statusMap).filter(v => v === true || v === 'pending' || v === 'gateway_pending').length;
            if (paidCount >= 12) {
                showNotif('Semua bulan untuk anggota ini sudah dibayar.', 'error');
                pendingPaymentContext = null;
                return;
            }

            updatePaymentMonthSummary();
            bootstrap.Modal.getOrCreateInstance('#modalPilihBulanBayar').show();
        }

        function togglePaymentMonthSelection(month) {
            if (!pendingPaymentContext) return;
            const normalizedMonth = Number(month);
            if (!Array.isArray(pendingPaymentContext.selectedMonths)) pendingPaymentContext.selectedMonths = [];
            const selectedMonths = pendingPaymentContext.selectedMonths;
            const existingIndex = selectedMonths.indexOf(normalizedMonth);
            if (existingIndex >= 0) selectedMonths.splice(existingIndex, 1);
            else selectedMonths.push(normalizedMonth);
            const button = document.getElementById(`payment-month-${normalizedMonth}`);
            if (button) button.classList.toggle('active', existingIndex < 0);
            updatePaymentMonthSummary();
        }

        async function continueMemberPayment() {
            if (!pendingPaymentContext || !Array.isArray(pendingPaymentContext.selectedMonths) || pendingPaymentContext.selectedMonths.length === 0) return;
            hideModalSafely('modalPilihBulanBayar');
            const params = {
                ...pendingPaymentContext,
                selectedMonths: pendingPaymentContext.selectedMonths
                    .map(Number)
                    .filter(month => month >= 1 && month <= 12)
                    .sort((a, b) => a - b)
            };
            pendingPaymentContext = null;
            if (String(params.method || '').toUpperCase() === 'CASH' && !isAdminMode()) {
                showNotif('Pembayaran cash hanya tersedia di halaman admin.', 'info');
                return;
            }
            if (String(params.method || '').toUpperCase() === 'QRIS') {
                pendingPaymentContext = params;
                await openQrisPaymentModal(params);
                return;
            }
            askAuth('bayar_member', params);
        }

        function submitQrisPaymentDirect(proofBase64 = null) {
            console.log('submitQrisPaymentDirect called, pendingPaymentContext:', pendingPaymentContext);
            if (!pendingPaymentContext) {
                console.error('pendingPaymentContext is null');
                showNotif('Data pembayaran tidak ditemukan. Silakan mulai lagi.', 'error');
                return;
            }
            const params = { ...pendingPaymentContext };
            const targetList = params.kat === 'Driver' ? DB_DRIVER : DB_HELPER;
            const person = targetList.find(x => x.id == params.id);
            if (!person) {
                showNotif('Data anggota tidak ditemukan.', 'error');
                return;
            }
            if (!person.status) person.status = {};
            if (!person.status[params.y]) person.status[params.y] = {};
            const months = Array.isArray(params.selectedMonths)
                ? Array.from(new Set(params.selectedMonths.map(Number).filter(month => month >= 1 && month <= 12))).sort((a, b) => a - b)
                : [];
            if (!months.length) {
                showNotif('Pilih bulan pembayaran terlebih dahulu.', 'error');
                return;
            }
            months.forEach(month => {
                person.status[params.y][month] = 'pending';
            });

            if (proofBase64) {
                person.pendingProofs = person.pendingProofs || {};
                person.pendingProofs[params.y] = person.pendingProofs[params.y] || {};
                months.forEach(month => {
                    person.pendingProofs[params.y][month] = proofBase64;
                });
            }
            const monthText = months.map(month => `${String(month).padStart(2, '0')}/${params.y}`).join(', ');
            addLog(
                "Iuran",
                `${String(params.kat || '').toUpperCase()} - ${String(params.nama || '').toUpperCase()} - ${monthText} - [â³ - PENDING VERIFIKASI QRIS]`
            );
            hideModalSafely('modalQrisPayment');
            syncAll();
            showNotif('Pembayaran QRIS berhasil masuk verifikasi. Admin akan segera memproses.', 'success');
            pendingPaymentContext = null;
        }

        async function continueQrisToAuth() {
            try {
                if (!pendingPaymentContext) {
                    showNotif('Data pembayaran tidak ditemukan. Silakan mulai lagi.', 'error');
                    return;
                }
                const continueBtn = document.getElementById('qris-continue-btn');
                if (continueBtn) {
                    continueBtn.disabled = true;
                    continueBtn.innerText = 'MEMERIKSA...';
                }
                if (!currentMidtransPayment || !currentMidtransPayment.orderId) {
                    await launchQrisSnapPayment(pendingPaymentContext);
                }
                setQrisStatusCopy('Memeriksa status pembayaran QRIS...');
                await syncMidtransPaymentStatus({ silent: false });
            } catch (err) {
                console.error('Error in continueQrisToAuth:', err);
                showNotif((err && err.message) ? err.message : 'Status pembayaran belum bisa diperiksa sekarang.', 'error');
            } finally {
                const continueBtn = document.getElementById('qris-continue-btn');
                if (continueBtn) {
                    continueBtn.disabled = false;
                    continueBtn.innerText = 'SAYA SUDAH BAYAR';
                }
            }
        }

        async function submitQrisPaymentDirect(proofBase64 = null) {
            console.log('submitQrisPaymentDirect called, pendingPaymentContext:', pendingPaymentContext);
            if (!pendingPaymentContext) {
                console.error('pendingPaymentContext is null');
                showNotif('Data pembayaran tidak ditemukan. Silakan mulai lagi.', 'error');
                return;
            }
            const params = { ...pendingPaymentContext };
            const targetList = params.kat === 'Driver' ? DB_DRIVER : DB_HELPER;
            const person = targetList.find(x => x.id == params.id);
            if (!person) {
                showNotif('Data anggota tidak ditemukan.', 'error');
                return;
            }

            const months = Array.isArray(params.selectedMonths)
                ? Array.from(new Set(params.selectedMonths.map(Number).filter(month => month >= 1 && month <= 12))).sort((a, b) => a - b)
                : [];
            if (!months.length) {
                showNotif('Pilih bulan pembayaran terlebih dahulu.', 'error');
                return;
            }

            const continueBtn = document.getElementById('qris-continue-btn');
            try {
                if (continueBtn) {
                    continueBtn.disabled = true;
                    continueBtn.innerText = 'MENGIRIM...';
                }
                await submitPendingPaymentToBackend({
                    ...params,
                    selectedMonths: months
                }, proofBase64);
                hideModalSafely('modalQrisPayment');
                showNotif('Pembayaran QRIS berhasil masuk verifikasi. Admin akan segera memproses.', 'success');
                pendingPaymentContext = null;
            } catch (err) {
                console.error('submitQrisPaymentDirect error:', err);
                showNotif((err && err.message) ? err.message : 'Pembayaran QRIS gagal dikirim ke backend.', 'error');
            } finally {
                if (continueBtn) {
                    continueBtn.disabled = false;
                    continueBtn.innerText = 'SAYA SUDAH BAYAR';
                }
            }
        }

        let uploadedImageFile = null;
        let currentUploadProofBase64 = null;
        let selectedUploadMethod = 'web';

        function getUploadModalElements() {
            return {
                modalEl: document.getElementById('modalUploadBukti'),
                memberNameEl: document.getElementById('upload-member-name'),
                memberKatEl: document.getElementById('upload-member-kat'),
                monthsEl: document.getElementById('upload-months'),
                amountEl: document.getElementById('upload-amount'),
                adminWhatsappEl: document.getElementById('admin-whatsapp-number'),
                whatsappLinkEl: document.getElementById('whatsapp-link'),
                submitBtn: document.getElementById('upload-submit-btn'),
                uploadLaterBtn: document.getElementById('upload-later-btn'),
                methodWebBtn: document.getElementById('method-web'),
                methodWhatsappBtn: document.getElementById('method-whatsapp'),
                uploadWebSection: document.getElementById('upload-web-section'),
                uploadWhatsappSection: document.getElementById('upload-whatsapp-section'),
                uploadPlaceholder: document.getElementById('upload-placeholder'),
                uploadPreview: document.getElementById('upload-preview')
            };
        }

        function getConfiguredAdminWhatsappNumber() {
            return String(ADMIN_WHATSAPP_NUMBER || '').replace(/[^\d]/g, '');
        }

        function compressProofImage(file) {
            return new Promise((resolve, reject) => {
                if (!file) {
                    reject(new Error('File bukti pembayaran tidak ditemukan.'));
                    return;
                }

                const reader = new FileReader();
                reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
                reader.onload = () => {
                    const img = new Image();
                    img.onerror = () => reject(new Error('File gambar tidak bisa diproses.'));
                    img.onload = () => {
                        const maxWidth = 720;
                        const maxHeight = 1280;
                        let { width, height } = img;
                        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
                        width = Math.max(1, Math.round(width * ratio));
                        height = Math.max(1, Math.round(height * ratio));

                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const context = canvas.getContext('2d');
                        if (!context) {
                            reject(new Error('Browser tidak mendukung kompresi gambar.'));
                            return;
                        }

                        context.fillStyle = '#ffffff';
                        context.fillRect(0, 0, width, height);
                        context.drawImage(img, 0, 0, width, height);

                        let quality = 0.82;
                        let output = canvas.toDataURL('image/jpeg', quality);
                        while (output.length > 45000 && quality > 0.3) {
                            quality -= 0.08;
                            output = canvas.toDataURL('image/jpeg', quality);
                        }

                        if (output.length > 45000) {
                            reject(new Error('Bukti pembayaran terlalu besar. Coba foto yang lebih ringan atau crop dulu.'));
                            return;
                        }

                        resolve(output);
                    };
                    img.src = reader.result;
                };
                reader.readAsDataURL(file);
            });
        }

        async function handleSelectedUploadFile(file) {
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                showNotif('File harus berupa gambar (JPG, PNG, dll).', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showNotif('Ukuran file maksimal 5MB.', 'error');
                return;
            }

            try {
                const compressedProof = await compressProofImage(file);
                uploadedImageFile = file;
                currentUploadProofBase64 = compressedProof;
                uploadImagePreview.src = compressedProof;
                document.getElementById('upload-placeholder').classList.add('d-none');
                document.getElementById('upload-preview').classList.remove('d-none');
                document.getElementById('upload-submit-btn').disabled = false;
            } catch (err) {
                uploadedImageFile = null;
                currentUploadProofBase64 = null;
                document.getElementById('upload-placeholder').classList.remove('d-none');
                document.getElementById('upload-preview').classList.add('d-none');
                document.getElementById('upload-submit-btn').disabled = true;
                showNotif((err && err.message) ? err.message : 'Bukti pembayaran gagal diproses.', 'error');
            }
        }

        function selectUploadMethod(method) {
            selectedUploadMethod = method;
            const {
                methodWebBtn,
                methodWhatsappBtn,
                uploadWebSection,
                uploadWhatsappSection,
                submitBtn,
                uploadLaterBtn
            } = getUploadModalElements();

            if (methodWebBtn) methodWebBtn.classList.toggle('active', method === 'web');
            if (methodWhatsappBtn) methodWhatsappBtn.classList.toggle('active', method === 'whatsapp');
            if (uploadWebSection) uploadWebSection.classList.toggle('d-none', method !== 'web');
            if (uploadWhatsappSection) uploadWhatsappSection.classList.toggle('d-none', method !== 'whatsapp');
            if (uploadLaterBtn) uploadLaterBtn.classList.toggle('d-none', method === 'whatsapp');
            if (!submitBtn) return;
            if (method === 'web') {
                submitBtn.disabled = !uploadedImageFile;
                submitBtn.textContent = 'KIRIM PEMBAYARAN';
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = 'LANJUT KE WHATSAPP';
            }
        }

        function showUploadBuktiModal() {
            if (!pendingPaymentContext) {
                showNotif('Data pembayaran tidak ditemukan.', 'error');
                return;
            }

            const {
                modalEl,
                memberNameEl,
                memberKatEl,
                monthsEl,
                amountEl,
                adminWhatsappEl,
                whatsappLinkEl
            } = getUploadModalElements();

            if (!modalEl) {
                showNotif('Popup upload bukti belum tersedia.', 'error');
                return;
            }

            const months = Array.isArray(pendingPaymentContext.selectedMonths) 
                ? pendingPaymentContext.selectedMonths.map(m => PAYMENT_MONTH_NAMES[m-1]).join(', ')
                : '-';
            const total = (pendingPaymentContext.selectedMonths?.length || 0) * MONTHLY_IURAN_AMOUNT;
            const adminWhatsappNumber = getConfiguredAdminWhatsappNumber();

            if (memberNameEl) memberNameEl.textContent = pendingPaymentContext.nama || '-';
            if (memberKatEl) memberKatEl.textContent = pendingPaymentContext.kat || '-';
            if (monthsEl) monthsEl.textContent = months;
            if (amountEl) amountEl.textContent = formatCurrency(total);
            if (adminWhatsappEl) adminWhatsappEl.textContent = adminWhatsappNumber ? `+${adminWhatsappNumber}` : '-';

            const whatsappMessage = encodeURIComponent(
                `Halo Admin, saya sudah transfer pembayaran iuran:\n\n` +
                `Nama: ${pendingPaymentContext.nama}\n` +
                `Kategori: ${pendingPaymentContext.kat}\n` +
                `Bulan: ${months}\n` +
                `Nominal: ${formatCurrency(total)}\n\n` +
                `Mohon verifikasi pembayaran saya.`
            );
            if (whatsappLinkEl) {
                whatsappLinkEl.href = adminWhatsappNumber
                    ? `https://wa.me/${adminWhatsappNumber}?text=${whatsappMessage}`
                    : '#';
                whatsappLinkEl.classList.toggle('disabled', !adminWhatsappNumber);
                whatsappLinkEl.setAttribute('aria-disabled', adminWhatsappNumber ? 'false' : 'true');
            }

            uploadedImageFile = null;
            currentUploadProofBase64 = null;
            selectedUploadMethod = 'web';
            removeUploadImage();
            selectUploadMethod('web');

            hideModalSafely('modalQrisPayment');

            const uploadModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            window.setTimeout(() => uploadModal.show(), 180);
        }

        function removeUploadImage() {
            const { uploadPlaceholder, uploadPreview, submitBtn } = getUploadModalElements();
            uploadedImageFile = null;
            currentUploadProofBase64 = null;
            if (uploadFileInput) uploadFileInput.value = '';
            if (uploadPlaceholder) uploadPlaceholder.classList.remove('d-none');
            if (uploadPreview) uploadPreview.classList.add('d-none');
            if (submitBtn) submitBtn.disabled = true;
        }

        function submitPaymentWithProof() {
            if (selectedUploadMethod === 'web') {
                if (!uploadedImageFile) {
                    showNotif('Silakan upload bukti pembayaran terlebih dahulu.', 'error');
                    return;
                }
                submitPaymentWithImageProof(uploadedImageFile);
            } else {
                // WhatsApp method - just submit payment and redirect to WhatsApp
                submitPaymentWithWhatsAppProof();
            }
        }

        function submitPaymentWithoutProof() {
            hideModalSafely('modalUploadBukti');

            submitQrisPaymentDirect();
            showNotif('Pembayaran QRIS dikirim tanpa bukti. Bukti bisa diupload nanti jika diperlukan.', 'info');
        }

        function submitPaymentWithImageProof(imageFile) {
            // Close upload modal
            hideModalSafely('modalUploadBukti');
            hideModalSafely('modalQrisPayment');

            // Submit payment with proof
            submitQrisPaymentDirect(currentUploadProofBase64);

            // Show success message
            showNotif('Pembayaran QRIS dengan bukti berhasil dikirim. Admin akan segera memproses.', 'success');
        }

        function submitPaymentWithWhatsAppProof() {
            const { whatsappLinkEl } = getUploadModalElements();
            const whatsappLink = whatsappLinkEl ? String(whatsappLinkEl.href || '').trim() : '';
            if (!whatsappLink || whatsappLink === '#') {
                showNotif('Nomor WhatsApp admin belum dikonfigurasi.', 'error');
                return;
            }

            // Close upload modal
            hideModalSafely('modalUploadBukti');
            hideModalSafely('modalQrisPayment');

            // Submit payment
            submitQrisPaymentDirect();

            // Show WhatsApp redirect message
            showNotif('Pembayaran dikirim. Silakan kirim bukti via WhatsApp untuk verifikasi.', 'info');
            
            // Open WhatsApp after a short delay
            setTimeout(() => {
                window.open(whatsappLink, '_blank');
            }, 1000);
        }

        window.openPaymentOptions = openPaymentOptions;
        window.togglePaymentMonthSelection = togglePaymentMonthSelection;
        window.continueMemberPayment = continueMemberPayment;
        window.continueQrisToAuth = continueQrisToAuth;
        window.submitQrisPaymentDirect = submitQrisPaymentDirect;
        window.chooseMemberPayment = chooseMemberPayment;
        window.continuePendingMemberPayment = continuePendingMemberPayment;
        window.cancelMemberPendingPayment = cancelMemberPendingPayment;
        window.triggerAdminPendingAction = triggerAdminPendingAction;
        window.showUploadBuktiModal = showUploadBuktiModal;
        window.removeUploadImage = removeUploadImage;
        window.submitPaymentWithProof = submitPaymentWithProof;
        window.submitPaymentWithoutProof = submitPaymentWithoutProof;
        window.selectUploadMethod = selectUploadMethod;

        // Upload bukti pembayaran event listeners
        const uploadArea = document.getElementById('upload-area');
        const uploadFileInput = document.getElementById('upload-file-input');
        const uploadImagePreview = document.getElementById('upload-image-preview');

        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                uploadFileInput.click();
            });

            // Drag and drop functionality
            uploadArea.addEventListener('dragover', (event) => {
                event.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', (event) => {
                event.preventDefault();
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (event) => {
                event.preventDefault();
                uploadArea.classList.remove('dragover');

                const files = event.dataTransfer.files;
                if (files.length > 0) {
                    handleSelectedUploadFile(files[0]);
                }
            });
        }

        if (uploadFileInput) {
            uploadFileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) handleSelectedUploadFile(file);
            });
        }

        async function loadFromCloud(year = CURRENT_YEAR, options = {}) {

    const token = ++loadToken;
    setSyncStatusText("â³ MEMUAT DATA...");

    try {

        const data = await fetchJson(`${CLOUD_URL}?action=read&year=${year}`);

        // Abaikan response lama jika user sudah pindah tahun lagi
        if (token !== loadToken) return;

        DB_DRIVER = data.driver || [];
        DB_HELPER = data.helper || [];
        DB_TRANSAKSI = data.transaksi || [];
        DB_LOGS = data.logs || [];

        YEAR_CACHE[year] = {
            driver: cloneData(DB_DRIVER),
            helper: cloneData(DB_HELPER),
            transaksi: cloneData(DB_TRANSAKSI),
            logs: cloneData(DB_LOGS)
        };
        YEAR_SIGNATURES[year] = buildYearSignature(YEAR_CACHE[year]);

        render();

        setSyncStatusText("â˜ï¸ TERHUBUNG");

    } catch (e) {

        if (token !== loadToken) return;
        setSyncStatusText("â˜ï¸ TERPUTUS");
        render();

    }

}

        function buildYearSignature(data) {
            return JSON.stringify({
                driver: data.driver || [],
                helper: data.helper || [],
                transaksi: data.transaksi || [],
                logs: data.logs || []
            });
        }

        function getYearCacheStorageKey(year) {
            return `${YEAR_CACHE_STORAGE_PREFIX}${Number(year) || 0}`;
        }

        function saveYearCacheToStorage(year, data) {
            try {
                localStorage.setItem(getYearCacheStorageKey(year), JSON.stringify({
                    savedAt: Date.now(),
                    data: {
                        driver: cloneData(data.driver || []),
                        helper: cloneData(data.helper || []),
                        transaksi: cloneData(data.transaksi || []),
                        logs: cloneData(data.logs || [])
                    }
                }));
            } catch (err) {}
        }

        function loadYearCacheFromStorage(year) {
            try {
                const raw = localStorage.getItem(getYearCacheStorageKey(year));
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (!parsed || typeof parsed !== 'object' || !parsed.data) return null;
                return {
                    savedAt: Number(parsed.savedAt || 0) || 0,
                    data: {
                        driver: Array.isArray(parsed.data.driver) ? parsed.data.driver : [],
                        helper: Array.isArray(parsed.data.helper) ? parsed.data.helper : [],
                        transaksi: Array.isArray(parsed.data.transaksi) ? parsed.data.transaksi : [],
                        logs: Array.isArray(parsed.data.logs) ? parsed.data.logs : []
                    }
                };
            } catch (err) {
                return null;
            }
        }

        function hydrateYearCache(year, options = {}) {
            const renderIfCurrent = options.renderIfCurrent !== false;
            const stored = loadYearCacheFromStorage(year);
            if (!stored || !stored.data) return false;

            const normalized = {
                driver: cloneData(stored.data.driver || []),
                helper: cloneData(stored.data.helper || []),
                transaksi: cloneData(stored.data.transaksi || []),
                logs: cloneData(stored.data.logs || [])
            };

            YEAR_CACHE[year] = normalized;
            YEAR_SIGNATURES[year] = buildYearSignature(normalized);

            if (renderIfCurrent && Number(year) === Number(CURRENT_YEAR)) {
                DB_DRIVER = cloneData(normalized.driver);
                DB_HELPER = cloneData(normalized.helper);
                DB_TRANSAKSI = cloneData(normalized.transaksi);
                DB_LOGS = cloneData(normalized.logs);
                render();
            }

            return true;
        }

        function applyYearData(year, data) {
            const normalized = {
                driver: cloneData(data.driver || []),
                helper: cloneData(data.helper || []),
                transaksi: cloneData(data.transaksi || []),
                logs: cloneData(data.logs || [])
            };

            YEAR_CACHE[year] = normalized;
            YEAR_SIGNATURES[year] = buildYearSignature(normalized);
            saveYearCacheToStorage(year, normalized);

            if (Number(year) === Number(CURRENT_YEAR)) {
                DB_DRIVER = cloneData(normalized.driver);
                DB_HELPER = cloneData(normalized.helper);
                DB_TRANSAKSI = cloneData(normalized.transaksi);
                DB_LOGS = cloneData(normalized.logs);
                render();
            }

            return normalized;
        }

        function hasOpenBlockingModal() {
            return !!document.querySelector('.modal.show');
        }

        function shouldAutoSyncCurrentYear() {
            if (document.hidden) return false;
            if (authInProgress) return false;
            if (syncInProgress) return false;
            if (Date.now() < suppressRemoteRefreshUntil) return false;
            if (hasOpenBlockingModal()) return false;
            return true;
        }

        async function loadFromCloudSmart(year = CURRENT_YEAR, options = {}) {
            const token = ++loadToken;
            const silent = !!options.silent;
            const forceRender = !!options.forceRender;
            const status = document.getElementById('sync-status');
            if (!silent && status) status.innerText = "MEMUAT DATA...";

            try {
                const data = await fetchJson(`${CLOUD_URL}?action=read&year=${year}`);
                if (token !== loadToken) return { changed: false, ignored: true };

                const normalized = {
                    driver: data.driver || [],
                    helper: data.helper || [],
                    transaksi: data.transaksi || [],
                    logs: data.logs || []
                };
                const nextSignature = buildYearSignature(normalized);
                const changed = YEAR_SIGNATURES[year] !== nextSignature;

                if (changed || !silent || forceRender || !YEAR_CACHE[year]) {
                    applyYearData(year, normalized);
                }

                if (status) status.innerText = "TERHUBUNG";
                return { changed, ignored: false };
            } catch (e) {
                if (token !== loadToken) return { changed: false, ignored: true };
                if (status) status.innerText = "TERPUTUS";
                if (!silent && Number(year) === Number(CURRENT_YEAR)) render();
                return { changed: false, ignored: false, error: e };
            }
        }

        async function waitForRemoteYearSignature(year, expectedSignature, options = {}) {
            const timeoutMs = Number(options.timeoutMs || 15000);
            const intervalMs = Number(options.intervalMs || 400);
            const startedAt = Date.now();
            let lastData = null;
            let lastError = null;

            while ((Date.now() - startedAt) < timeoutMs) {
                try {
                    const data = await fetchJson(`${CLOUD_URL}?action=read&year=${year}`);
                    lastData = {
                        driver: data.driver || [],
                        helper: data.helper || [],
                        transaksi: data.transaksi || [],
                        logs: data.logs || []
                    };
                    lastError = null;

                    if (buildYearSignature(lastData) === expectedSignature) {
                        return {
                            ok: true,
                            data: lastData,
                            elapsedMs: Date.now() - startedAt
                        };
                    }
                } catch (err) {
                    lastError = err;
                }

                await new Promise(resolve => setTimeout(resolve, intervalMs));
            }

            return {
                ok: false,
                data: lastData,
                elapsedMs: Date.now() - startedAt,
                error: lastError && lastError.message ? lastError.message : ''
            };
        }

        async function refreshCurrentYearInBackground(reason = 'interval') {
            if (autoSyncInProgress) return false;
            if (!shouldAutoSyncCurrentYear()) return false;

            autoSyncInProgress = true;
            try {
                const result = await loadFromCloudSmart(CURRENT_YEAR, { silent: true });
                return !!(result && result.changed);
            } finally {
                autoSyncInProgress = false;
            }
        }

        function startAutoSync() {
            if (autoSyncTimer) clearInterval(autoSyncTimer);
            autoSyncTimer = setInterval(() => {
                refreshCurrentYearInBackground('interval').catch(err => console.error('auto sync error:', err));
            }, AUTO_SYNC_INTERVAL_MS);

            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    refreshCurrentYearInBackground('visible').catch(err => console.error('auto sync error:', err));
                }
            });

            window.addEventListener('focus', () => {
                refreshCurrentYearInBackground('focus').catch(err => console.error('auto sync error:', err));
            });
        }

async function syncAll() {
    if (syncInProgress) {
        syncQueued = true;
        return;
    }
    syncQueued = false;
    syncInProgress = true;

    // render dulu data lokal
    render();
    YEAR_CACHE[CURRENT_YEAR] = {
        driver: cloneData(DB_DRIVER),
        helper: cloneData(DB_HELPER),
        transaksi: cloneData(DB_TRANSAKSI),
        logs: cloneData(DB_LOGS)
    };
    YEAR_SIGNATURES[CURRENT_YEAR] = buildYearSignature(YEAR_CACHE[CURRENT_YEAR]);
    saveYearCacheToStorage(CURRENT_YEAR, YEAR_CACHE[CURRENT_YEAR]);

        const status = document.getElementById('sync-status');
        setSyncStatusText("â³ MENYIMPAN...");

    try {
        const writeToken = getWriteToken();
        if (!writeToken) {
            showNotif('Write token belum tersedia. Verifikasi ulang dulu.', 'error');
            setSyncStatusText("âš ï¸ GAGAL SINKRON");
            const shouldRerun = syncQueued;
            syncInProgress = false;
            syncQueued = false;
            if (shouldRerun) setTimeout(() => syncAll(), 0);
            return;
        }

        // data yang dikirim ke GAS
        const payload = {
            authToken: writeToken,
            editor: getActiveEditor(),
            deviceId: getDeviceId(),
            year: CURRENT_YEAR,
            driver: DB_DRIVER,
            helper: DB_HELPER,
            transaksi: DB_TRANSAKSI,
            logs: DB_LOGS
        };

        // kirim ke Google Apps Script
        await postToAppsScript(payload);
        setSyncStatusText("â³ MEMVERIFIKASI...");
        const verification = await waitForRemoteYearSignature(CURRENT_YEAR, YEAR_SIGNATURES[CURRENT_YEAR], {
            timeoutMs: 15000,
            intervalMs: 400
        });
        if (!verification.ok) {
            throw new Error(verification.error || 'Spreadsheet belum mengonfirmasi data terbaru.');
        }
        if (verification.data) {
            applyYearData(CURRENT_YEAR, verification.data);
        }
        const shouldRerun = syncQueued;
        syncInProgress = false;
        syncQueued = false;
        if (shouldRerun) setTimeout(() => syncAll(), 0);
        suppressRemoteRefreshUntil = Date.now() + AUTO_SYNC_SUPPRESS_MS;

        setSyncStatusText("â˜ï¸ TERHUBUNG");

    } catch (err) {

        console.error("SYNC ERROR:", err);
        syncInProgress = false;
        const shouldRerun = syncQueued;
        syncQueued = false;
        if (shouldRerun) setTimeout(() => syncAll(), 0);

        setSyncStatusText("âš ï¸ GAGAL SINKRON");

    }
}

        function addLog(aksi, ket) {
            const d = new Date(), pad = (n) => n.toString().padStart(2, '0');
            const time = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}.${pad(d.getMinutes())}`;
            DB_LOGS.unshift({ time, editor: getActiveEditor(), aksi: aksi.toUpperCase(), ket: ket });
        }

        function formatLogCurrency(value) {
            return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
        }

        function clearLogs() { new bootstrap.Modal('#modalKonfirmasiLog').show(); }
        function eksekusiHapusLog() { bootstrap.Modal.getInstance('#modalKonfirmasiLog').hide(); addLog("SYSTEM", "BERSIHKAN SEMUA LOG"); DB_LOGS = []; syncAll(); }

        function render() {
    const gd = document.getElementById('grid-driver');
    const gh = document.getElementById('grid-helper');
    const hi = document.getElementById('hist');
    const lg = document.getElementById('log-list');

    const m = parseInt(document.getElementById('selMonth').value) || 0;
    const y = getSelectedYear();

    let cIuran = 0;
    let cOut = 0;
    let cLainnya = 0;

    const sAwal = (m === 0)
        ? calculateOpeningBalanceYear(y)
        : calculatePastBalance(m, y);

    [...DB_DRIVER, ...DB_HELPER].forEach(p => {
        const yStatus = p?.status?.[y];
        if (!yStatus) return;

            Object.keys(yStatus).forEach(mm => {
                if (yStatus[mm] === true && (m === 0 || parseInt(mm, 10) === m)) cIuran += 25000;
            });
    });

    const drawRows = (list, kat) => {
        const rows = [];
        const sorted = [...list].sort((a, b) => a.nama.localeCompare(b.nama));
        const adminMode = isAdminMode();

        sorted.forEach((p, idx) => {
            if (!p.status) p.status = {};
            let count = 0;
            const cellParts = [];
            const safeName = String(p.nama || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

            for (let i = 1; i <= 12; i++) {
                const rawStatus = p.status[y]?.[i];
                const isPaid = rawStatus === true;
                const isPending = rawStatus === 'pending' || rawStatus === 'gateway_pending';
                if (isPaid) count++;
                const allowAdminCancel = adminMode && isPaid;
                const cellAction = allowAdminCancel
                    ? `onclick="askAuth('toggle', {id: '${p.id}', kat: '${kat}', y: ${y}, m: ${i}})"`
                    : '';
                const cellStyle = allowAdminCancel ? 'cursor: pointer;' : '';
                cellParts.push(
                    `<td class="status-toggle ${isPaid ? 'text-success' : (isPending ? 'text-warning' : 'text-danger')}" data-id="${p.id}" data-kat="${kat}" data-y="${y}" data-m="${i}" style="${cellStyle}" ${cellAction}>${isPaid ? '&#9989;' : (isPending ? '&#9203;' : '&#10060;')}</td>`
                );
            }

            rows.push(
                `<tr><td class="no-col">${idx + 1}</td><td class="name-col">${p.nama}</td>${cellParts.join('')}<td class="text-center-force">${count}/12</td>${adminMode ? `<td class="col-aksi-center"><div class="btn-aksi-trigger" data-type="member" data-id="${p.id}">&#8942;</div></td>` : ''}<td class="col-bayar"><button type="button" class="btn-bayar-mini" onclick="openPaymentOptions({ id: '${p.id}', nama: '${safeName}', kat: '${kat}', y: ${y}, m: ${m} })">BAYAR</button></td></tr>`
            );
        });

        return rows.join('');
    };

    gd.innerHTML = drawRows(DB_DRIVER, 'Driver');
    gh.innerHTML = drawRows(DB_HELPER, 'Helper');

    const transaksiRows = [];
    const adminMode = isAdminMode();
    for (let idx = 0; idx < DB_TRANSAKSI.length; idx++) {
        const x = DB_TRANSAKSI[idx];
        const yy = parseInt((x.d || '').slice(0, 4), 10);
        const mm = parseInt((x.d || '').slice(5, 7), 10);
        const sameYear = yy === y;
        const sameMonth = (m === 0) || (mm === m);

        if (!sameYear || !sameMonth) continue;

        if (x.tp === 'Pemasukan') cLainnya += x.v;
        else cOut += x.v;

        transaksiRows.push(
            `<tr><td class="text-center">${x.d.split('-').reverse().join('/')}</td><td class="fw-bold ${x.tp === 'Pemasukan' ? 'text-success' : 'text-danger'} text-center">${x.tp.toUpperCase()}</td><td>${x.p}</td><td>${x.k || '-'}</td><td class="fw-bold text-end">Rp ${x.v.toLocaleString()}</td>${adminMode ? `<td class="col-aksi-center"><div class="btn-aksi-trigger" data-type="trans" data-idx="${idx}">&#8942;</div></td>` : ''}</tr>`
        );
    }
    hi.innerHTML = transaksiRows.join('');

    const memberActionHeaders = document.querySelectorAll('#driver thead th:nth-child(16), #helper thead th:nth-child(16)');
    memberActionHeaders.forEach((th) => {
        th.style.display = adminMode ? '' : 'none';
    });

    const transaksiActionHeader = document.querySelector('#table-transaksi thead th.col-aks');
    if (transaksiActionHeader) transaksiActionHeader.style.display = adminMode ? '' : 'none';
    document.querySelectorAll('#hist tr').forEach((row) => {
        const actionCell = row.lastElementChild;
        if (actionCell && actionCell.querySelector('.btn-aksi-trigger')) {
            actionCell.style.display = adminMode ? '' : 'none';
        }
    });

    const logRows = [];
    for (let i = 0; i < Math.min(50, DB_LOGS.length); i++) {
        const l = DB_LOGS[i];
        logRows.push(
            `<tr><td>${l.time}</td><td>${l.editor}</td><td><small class="badge bg-dark">${l.aksi}</small></td><td>${l.ket}</td></tr>`
        );
    }
    lg.innerHTML = logRows.join('');
    renderAdminPaymentPanel();
    postPendingPaymentsToParent();

    document.getElementById('s-awal').innerText = "Rp " + sAwal.toLocaleString();
    document.getElementById('in').innerText = "Rp " + cIuran.toLocaleString();
    document.getElementById('out').innerText = "Rp " + cOut.toLocaleString();
    document.getElementById('bal').innerText = "Rp " + cLainnya.toLocaleString();
    document.getElementById('s-akhir').innerText = "Rp " + (sAwal + cIuran + cLainnya - cOut).toLocaleString();

    const labelSaldoAwal = document.querySelector('#s-awal').closest('.card-saldo').querySelector('.label');
    const banner = document.querySelector('.banner-bar');

    if (m === 0) {
        labelSaldoAwal.innerText = `Saldo Awal (${y - 1})`;
        banner.innerText = `REKAP KEUANGAN TAHUN ${y}`;
    } else {
        labelSaldoAwal.innerText = 'Saldo Awal';
        banner.innerText = 'LAPORAN KEUANGAN BULANAN';
    }

}
        
        function calculateOpeningBalanceYear(y) {
    let saldo = 0;

    // IURAN sebelum tahun y
    [...DB_DRIVER, ...DB_HELPER].forEach(p => {
        if (!p.status) return;

        Object.keys(p.status).forEach(yy => {
            if (parseInt(yy) < y) {
                Object.keys(p.status[yy]).forEach(mm => {
                    if (p.status[yy][mm] === true) {
                        saldo += 25000;
                    }
                });
            }
        });
    });

    // TRANSAKSI sebelum tahun y
    DB_TRANSAKSI.forEach(t => {
        const yy = parseInt((t.d || '').slice(0, 4), 10);
        if (yy < y) saldo += (t.tp === 'Pemasukan' ? t.v : -t.v);
    });

    return saldo;
}

        function calculatePastBalance(m, y) {
            let tIn = 0, tOut = 0;
            [...DB_DRIVER, ...DB_HELPER].forEach(p => {
                if (!p.status) return;
                Object.keys(p.status).forEach(sy => {
                    Object.keys(p.status[sy]).forEach(sm => {
                        if ((parseInt(sy, 10) < y || (parseInt(sy, 10) === y && parseInt(sm, 10) < m)) && p.status[sy][sm] === true) tIn += 25000;
                    });
                });
            });

            DB_TRANSAKSI.forEach(x => {
                const yy = parseInt((x.d || '').slice(0, 4), 10);
                const mm = parseInt((x.d || '').slice(5, 7), 10);
                if (yy < y || (yy === y && mm < m)) {
                    if (x.tp === 'Pemasukan') tIn += x.v;
                    else tOut += x.v;
                }
            });
            return tIn - tOut;
        }

        document.getElementById('fAdd').onsubmit = (e) => {
            e.preventDefault(); const id = document.getElementById('editMemberId').value, kat = document.getElementById('k').value.toUpperCase(), n = document.getElementById('n').value.toUpperCase();
            if (id) { 
                let p = [...DB_DRIVER, ...DB_HELPER].find(x => x.id == id);
                const lama = p.nama;
                p.nama = n; 
                addLog("Edit anggota", `${kat} - ${lama} => ${n}`);
            } else { 
                n.split('\n').filter(x => x.trim()).forEach(nm => { 
                    let p = { id: "ID-"+Date.now()+Math.random().toString(36).substr(2,3), nama: nm.trim(), status: {} }; 
                    if (kat === 'DRIVER') DB_DRIVER.push(p); else DB_HELPER.push(p); 
                    addLog("Tambah anggota", `${kat} - ${nm.trim()}`); 
                });
            }
            syncAll(); bootstrap.Modal.getInstance('#modalTambah').hide();
        };

        document.getElementById('fTrans').onsubmit = (e) => {
    e.preventDefault();

    const f = new FormData(e.target);
    const idx = document.getElementById('editTransIdx').value;

    const d = {
        tp: f.get('tp'),
        d: f.get('d'),
        p: (f.get('p') || '').toUpperCase(),
        k: (f.get('k') || '').toUpperCase(),
        v: parseInt(f.get('v')) || 0
    };

    if (idx !== "") {
        const old = DB_TRANSAKSI[idx];
        if (!old) return;

        let change = "";
        if (old.tp !== d.tp) change += `Tipe: ${old.tp}=>${d.tp}, `;
        if (old.p !== d.p) change += `Sumber: ${old.p}=>${d.p}, `;
        if (old.v !== d.v) change += `Nominal: ${formatLogCurrency(old.v)}=>${formatLogCurrency(d.v)}, `;

        DB_TRANSAKSI[idx] = d;

        addLog("Edit transaksi",
            `${d.tp.toUpperCase()} - ${d.p} - ${formatLogCurrency(d.v)} - ${change || 'Update Data'}`
        );
    } else {
        DB_TRANSAKSI.push(d);
        addLog("Tambah transaksi",
            `${d.tp.toUpperCase()} - ${d.p} - ${d.k || '-'} - ${formatLogCurrency(d.v)}`
        );

        if (pendingIuranPaymentData && Array.isArray(pendingIuranPaymentData.months) && pendingIuranPaymentData.months.length) {
            const targetList = pendingIuranPaymentData.kat === 'Driver' ? DB_DRIVER : DB_HELPER;
            const person = targetList.find(x => x.id == pendingIuranPaymentData.id);
            if (person) {
                if (!person.status) person.status = {};
                if (!person.status[pendingIuranPaymentData.y]) person.status[pendingIuranPaymentData.y] = {};
                const isQris = pendingIuranPaymentData.method === 'QRIS';
                pendingIuranPaymentData.months.forEach(month => {
                    person.status[pendingIuranPaymentData.y][month] = isQris ? 'pending' : true;
                });
                addLog(
                    "Iuran",
                    `${String(pendingIuranPaymentData.kat || '').toUpperCase()} - ${String(pendingIuranPaymentData.nama || '').toUpperCase()} - ${pendingIuranPaymentData.months.map(month => `${String(month).padStart(2, '0')}/${pendingIuranPaymentData.y}`).join(', ')} - [${isQris ? "â³ - PENDING VERIFIKASI QRIS" : "âœ… - LUNAS VIA " + pendingIuranPaymentData.method}]`
                );
            }
        }
        }

    pendingIuranPaymentData = null;
    syncAll();
    bootstrap.Modal.getInstance('#modalCatat').hide();
};

        let currentPdfPreviewUrl = '';
        let currentPdfPreviewName = '';
        let currentPdfPreviewBlob = null;
        let pdfPreviewRenderToken = 0;

        function revokePdfPreviewUrl() {
            if (!currentPdfPreviewUrl) return;
            URL.revokeObjectURL(currentPdfPreviewUrl);
            currentPdfPreviewUrl = '';
        }

        async function renderPdfPreview(blob) {
            const empty = document.getElementById('pdf-preview-empty');
            const pages = document.getElementById('pdf-preview-pages');
            if (!empty || !pages || !blob) return;

            const renderToken = ++pdfPreviewRenderToken;
            pages.innerHTML = '';
            empty.innerText = 'Menyiapkan preview PDF...';
            empty.style.display = 'block';

            try {
                const pdfjsLib = await ensurePdfJsLibrary();

                const buffer = await blob.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
                if (renderToken !== pdfPreviewRenderToken) return;

                empty.style.display = 'none';

                for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
                    const page = await pdf.getPage(pageNumber);
                    if (renderToken !== pdfPreviewRenderToken) return;

                    const baseViewport = page.getViewport({ scale: 1 });
                    const maxWidth = Math.min((pages.clientWidth || 900), 900);
                    const scale = Math.max(1, maxWidth / baseViewport.width);
                    const viewport = page.getViewport({ scale });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    const deviceScale = window.devicePixelRatio || 1;
                    canvas.width = Math.floor(viewport.width * deviceScale);
                    canvas.height = Math.floor(viewport.height * deviceScale);
                    canvas.style.width = `${viewport.width}px`;
                    canvas.style.height = `${viewport.height}px`;
                    canvas.style.maxWidth = '100%';
                    canvas.style.background = '#fff';
                    canvas.style.borderRadius = '8px';
                    canvas.style.boxShadow = '0 10px 30px rgba(0,0,0,.35)';

                    context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
                    await page.render({
                        canvasContext: context,
                        viewport
                    }).promise;

                    const pageWrap = document.createElement('div');
                    pageWrap.className = 'w-100 d-flex flex-column align-items-center gap-2';

                    const pageLabel = document.createElement('div');
                    pageLabel.className = 'small text-light';
                    pageLabel.innerText = `Halaman ${pageNumber} / ${pdf.numPages}`;

                    pageWrap.appendChild(pageLabel);
                    pageWrap.appendChild(canvas);
                    pages.appendChild(pageWrap);
                }
            } catch (err) {
                pages.innerHTML = '';
                empty.style.display = 'block';
                empty.innerText = (err && err.message) ? err.message : 'Preview PDF gagal dimuat.';
            }
        }

        function showPdfPreview(blob, fileName) {
            if (!blob) return;

            revokePdfPreviewUrl();
            currentPdfPreviewBlob = blob;
            currentPdfPreviewUrl = URL.createObjectURL(blob);
            currentPdfPreviewName = fileName || 'laporan.pdf';
            bootstrap.Modal.getOrCreateInstance('#modalPdfPreview').show();
            renderPdfPreview(blob);
        }

        function downloadPreviewPdf() {
            if (!currentPdfPreviewUrl) return;
            const link = document.createElement('a');
            link.href = currentPdfPreviewUrl;
            link.download = currentPdfPreviewName || 'laporan.pdf';
            document.body.appendChild(link);
            link.click();
            link.remove();
        }

        function openPreviewPdfInNewTab() {
            if (!currentPdfPreviewUrl) return;
            window.open(currentPdfPreviewUrl, '_blank', 'noopener,noreferrer');
        }

        const pdfPreviewModalEl = document.getElementById('modalPdfPreview');
        if (pdfPreviewModalEl) {
            pdfPreviewModalEl.addEventListener('hidden.bs.modal', () => {
                const empty = document.getElementById('pdf-preview-empty');
                const pages = document.getElementById('pdf-preview-pages');
                pdfPreviewRenderToken += 1;
                if (pages) pages.innerHTML = '';
                if (empty) {
                    empty.style.display = 'block';
                    empty.innerText = 'Menyiapkan preview PDF...';
                }
                revokePdfPreviewUrl();
                currentPdfPreviewName = '';
                currentPdfPreviewBlob = null;
            });
        }

        async function downloadFinancialPDF() {
            await ensureJsPdfLibraries();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            const mText = document.getElementById('selMonth').options[document.getElementById('selMonth').selectedIndex].text.toUpperCase();
            const yText = document.getElementById('selYear').value;
            const editorName = getActiveEditor() || "SUPER ADMIN KAS";

            const blackBg = [15, 15, 15]; 
            const goldAccent = [212, 175, 55]; 
            const whiteText = [255, 255, 255];
            const borderColor = [0, 0, 0]; 
            const pureBlack = [0, 0, 0]; 
            const stampRed = [180, 0, 0]; 

            doc.setFillColor(blackBg[0], blackBg[1], blackBg[2]);
            doc.rect(0, 0, 210, 45, 'F');
            doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
            doc.setLineWidth(1);
            doc.line(15, 33, 195, 33);

            doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
            doc.setFont("times", "bold"); doc.setFontSize(24);
            doc.text("DATA RINCIAN UANG KAS", 105, 20, { align: "center" });
            doc.setTextColor(whiteText[0], whiteText[1], whiteText[2]);
            doc.setFontSize(12); doc.setFont("times", "normal");
            doc.text("DRIVER HELPER DELTA8 & LOGISTICS", 105, 28, { align: "center" });
            doc.setFontSize(11); doc.setFont("times", "italic");
            doc.text(`Periode: ${mText} ${yText}`, 105, 40, { align: "center" });

            const sAwal = document.getElementById('s-awal').innerText;
            const sAkhir = document.getElementById('s-akhir').innerText;
            const iuran = document.getElementById('in').innerText;
            const keluar = document.getElementById('out').innerText;
            const lainnya = document.getElementById('bal').innerText;

            const drawCard = (x, y, w, h, title, value, bgColor, txtColor = [0,0,0]) => {
                doc.setDrawColor(0); doc.setLineWidth(0.5);
                doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
                doc.roundedRect(x, y, w, h, 3, 3, 'FD'); 
                doc.setTextColor(txtColor[0], txtColor[1], txtColor[2]);
                doc.setFontSize(16); doc.setFont("times", "bold");
                doc.text(title, x + (w / 2), y + 9, { align: "center" });
                doc.setFontSize(20); doc.setFont("times", "bold");
                doc.text(value, x + (w / 2), y + 21, { align: "center" });
            };

            drawCard(15, 60, 88, 30, "Saldo Awal", sAwal, [255, 220, 100]); 
            drawCard(107, 60, 88, 30, "Total Iuran Anggota (+)", iuran, [180, 230, 180]); 
            drawCard(15, 95, 88, 30, "Pemasukan Lainnya (+)", lainnya, [180, 230, 180]); 
            drawCard(107, 95, 88, 30, "Total Pengeluaran (-)", keluar, [255, 180, 180]); 
            drawCard(15, 130, 180, 35, "SALDO AKHIR (TOTAL BALANCE)", sAkhir, [30, 60, 120], [255, 255, 255]); 
            
            doc.setTextColor(pureBlack[0], pureBlack[1], pureBlack[2]);
            doc.setFontSize(14); doc.setFont("times", "bold");
            doc.text("RIWAYAT TRANSAKSI", 105, 172, { align: "center" }); 

            const transData = [];
            document.querySelectorAll('#hist tr').forEach(row => {
                const cols = row.querySelectorAll('td');
                if(cols.length > 0) {
                    transData.push([cols[0].innerText, cols[1].innerText, cols[2].innerText, cols[3].innerText, cols[4].innerText]);
                }
            });

            doc.autoTable({
                startY: 177,
                margin: { left: 15, right: 15 }, 
                head: [['TANGGAL', 'TIPE', 'SUMBER/PENERIMA', 'KETERANGAN', 'JUMLAH']],
                body: transData,
                theme: 'grid',
                headStyles: { fillColor: blackBg, textColor: whiteText, fontStyle: 'bold', halign: 'center', lineWidth: 0.2, lineColor: borderColor, fontSize: 10, minCellHeight: 6 },
                styles: { font: 'times', fontSize: 9, textColor: pureBlack, cellPadding: 0.8, minCellHeight: 4, valign: 'middle', lineWidth: 0.1, lineColor: borderColor },
                columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' }, 4: { halign: 'right', fontStyle: 'bold' } },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });

            const finalY = doc.lastAutoTable.finalY + 15;
            const rightPos = 195; 

            if (finalY < 250) {
                doc.setTextColor(pureBlack[0], pureBlack[1], pureBlack[2]);
                doc.setFont("times", "normal"); doc.setFontSize(12);
                doc.text("Diterbitkan Oleh,", rightPos - 25, finalY + 20, { align: "center" });
                
                const sX = rightPos - 45; 
                const sY = finalY + 30;
                doc.setDrawColor(stampRed[0], stampRed[1], stampRed[2]);
                doc.setLineWidth(0.8);
                doc.circle(sX, sY, 13, 'S'); 
                doc.setLineWidth(0.3);
                doc.circle(sX, sY, 11, 'S'); 
                doc.line(sX - 9, sY - 2, sX + 9, sY - 2); 
                doc.line(sX - 9, sY + 2.5, sX + 9, sY + 2.5); 
                
                doc.setTextColor(stampRed[0], stampRed[1], stampRed[2]);
                doc.setFontSize(5); doc.setFont("helvetica", "bold");
                doc.text("PENGURUS  KAS", sX, sY - 4.0, { align: "center" });
                doc.setFontSize(8);
                doc.text("SNJ DELTA 8", sX, sY + 1, { align: "center" });
                doc.setFontSize(5);
                doc.text("DRIVER HELPER", sX, sY + 5.5, { align: "center" });

                doc.setFont("courier", "bolditalic"); doc.setFontSize(14);
                doc.setTextColor(20, 40, 100); 
                doc.text(editorName, rightPos - 25, finalY + 30, { align: "center" });

                doc.setTextColor(pureBlack[0], pureBlack[1], pureBlack[2]);
                doc.setFont("times", "bold"); doc.setFontSize(11);
                doc.text("(       Pengurus Uang KAS       )", rightPos, finalY + 40, { align: "right" }); 
                doc.text("__________________________", rightPos, finalY + 41, { align: "right" }); 
            }

            const pageCount = doc.internal.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(9); doc.setTextColor(100);
                doc.text(`Official Document Driver Helper Delta 8 | Dicetak: ${new Date().toLocaleString()} | Halaman ${i} dari ${pageCount}`, 105, 285, { align: "center" } );
                doc.setFontSize(8); doc.setTextColor(120);
                doc.text(`--<{SUPPORTED BY : MANCUNG_168}>--`, 105, 290, { align: "center" } );
            }

            const fileName = `LAPKAS_${editorName}_${mText}.pdf`;
            const pdfBlob = doc.output('blob');
            showPdfPreview(pdfBlob, fileName);
        }
        window.onload = () => {
    setTheme(localStorage.getItem('delta8_theme') || 'luxury');
    applyAdminMode();
    syncPaymentOptionAvailability();
    initTahun();

    const sm = document.getElementById('selMonth');
    const sy = document.getElementById('selYear');
    const now = new Date();

    const nm = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    // OPSI SEMUA BULAN
    sm.innerHTML = `<option value="0">SEMUA BULAN</option>`;

    for (let i = 1; i <= 12; i++) {
        sm.innerHTML += `<option value="${i}" ${
            i === (now.getMonth() + 1) ? 'selected' : ''
        }>${nm[i]}</option>`;
    }

    for (let i = 2025; i <= 2050; i++) {
        sy.innerHTML += `<option value="${i}" ${
            i === now.getFullYear() ? 'selected' : ''
        }>${i}</option>`;
    }

    // Samakan tahun toolbar anggota dan transaksi
    syncYearDropdowns(CURRENT_YEAR);
    if (hydrateYearCache(CURRENT_YEAR)) {
        const status = document.getElementById('sync-status');
        if (status) status.innerText = "MEMUAT CACHE...";
    }

    // ðŸ”¥ INI YANG BIKIN SALDO LANGSUNG UPDATE
    sm.addEventListener('change', render);
    sy.addEventListener('change', () => gantiTahun(sy.value));

    updateNotificationUI();
    loadFromCloudSmart(CURRENT_YEAR, { forceRender: true });
    startAutoSync();
    restoreNotificationState();
    applyLaunchContext();
    maybePromptNotificationActivation();

};
       let currentSearch = '';

function filterMember(keyword) {
    currentSearch = keyword.toLowerCase().trim();

    const gd = document.getElementById('grid-driver');
    const gh = document.getElementById('grid-helper');

    if (gd) {
        gd.querySelectorAll('tr').forEach(tr => {
            const nama = tr.querySelector('.name-col')?.innerText.toLowerCase() || '';
            tr.style.display = nama.includes(currentSearch) ? '' : 'none';
        });
    }
    if (gh) {
        gh.querySelectorAll('tr').forEach(tr => {
            const nama = tr.querySelector('.name-col')?.innerText.toLowerCase() || '';
            tr.style.display = nama.includes(currentSearch) ? '' : 'none';
        });
    }
}

document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', () => {
        const input = document.getElementById('search-member');
        if (input && currentSearch) {
            input.value = currentSearch;
            filterMember(currentSearch);
        }
    });
});

document.addEventListener('shown.bs.tab', function (e) {
    const target = e.target.getAttribute('data-bs-target');

    // reset dulu
    document.body.classList.remove('tab-driver','tab-helper','tab-transaksi');

    if (target === '#driver') {
        document.body.classList.add('tab-driver');
    } else if (target === '#helper') {
        document.body.classList.add('tab-helper');
    } else if (target === '#transaksi') {
        document.body.classList.add('tab-transaksi');
    }
});

let CURRENT_YEAR = new Date().getFullYear();

function getSelectedYear(){
    const memberYear = Number(document.getElementById("tahun-select")?.value);
    return memberYear || CURRENT_YEAR;
}

function syncYearDropdowns(year){
    const memberYearSelect = document.getElementById("tahun-select");
    const transaksiYearSelect = document.getElementById("selYear");

    if (memberYearSelect) memberYearSelect.value = String(year);
    if (transaksiYearSelect) transaksiYearSelect.value = String(year);
}

function initTahun(){

    const select = document.getElementById("tahun-select");
    const now = new Date().getFullYear();
    const startYear = 2025;
    const endYear = 2050;

    select.innerHTML = "";

    for(let y = startYear; y <= endYear; y++){

        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;

        if(y === now) opt.selected = true;

        select.appendChild(opt);

    }

}

async function gantiTahun(tahun){

    CURRENT_YEAR = Number(tahun);
    syncYearDropdowns(CURRENT_YEAR);
    setSyncStatusText("â³ MEMUAT DATA...");

    // Tampilkan cepat dari cache jika sudah pernah dibuka
    if (YEAR_CACHE[CURRENT_YEAR]) {
        DB_DRIVER = cloneData(YEAR_CACHE[CURRENT_YEAR].driver || []);
        DB_HELPER = cloneData(YEAR_CACHE[CURRENT_YEAR].helper || []);
        DB_TRANSAKSI = cloneData(YEAR_CACHE[CURRENT_YEAR].transaksi || []);
        DB_LOGS = cloneData(YEAR_CACHE[CURRENT_YEAR].logs || []);
        render();
    } else if (hydrateYearCache(CURRENT_YEAR)) {
        setSyncStatusText("MEMUAT CACHE...");
    }

    // Muat data langsung agar tidak terasa delay
    loadFromCloudSmart(CURRENT_YEAR, { forceRender: true });

    // ensureYear tetap dijalankan tanpa memblokir UI
    fetchJson(`${CLOUD_URL}?action=ensureYear&year=${CURRENT_YEAR}`)
        .catch(err => console.error("ensureYear error:", err));

}

