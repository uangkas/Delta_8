/**
 * Panel Admin Delta 8 - Modular Script
 */

const Config = {
    ADMIN_PANEL_URL: 'index.html?mode=admin',
    CLOUD_URL: 'https://script.google.com/macros/s/AKfycbzY63DzQTu_RP106fQoI2q0joumt_vJhhesMufpJN1iTZQtBoZRYWNs7wfb88xRp2PBsg/exec',
    STORAGE_KEYS: {
        SESSION: 'delta8_admin_auth_session',
        DEVICE: 'delta8_admin_device_id'
    },
    MONTHS: ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"]
};

const State = {
    currentView: 'dashboard',
    pendingPayments: [],
    activePayment: null,
    inFlight: false,
    year: new Date().getFullYear()
};

const DOM = {
    views: {
        dashboard: document.getElementById('dashboard-view'),
        verification: document.getElementById('verification-view')
    },
    nav: {
        menuBtn: document.getElementById('admin-menu-button'),
        menuDropdown: document.getElementById('admin-menu-dropdown'),
        links: document.querySelectorAll('.admin-menu-item')
    },
    topbar: {
        title: document.getElementById('admin-topbar-title'),
        caption: document.getElementById('admin-view-caption')
    },
    verification: {
        summary: document.getElementById('admin-payment-summary-card'),
        list: document.getElementById('admin-payment-list-card')
    },
    modal: {
        el: document.getElementById('payment-detail-modal'),
        close: document.getElementById('payment-detail-close'),
        verifyBtn: document.getElementById('detail-verify-button'),
        cancelBtn: document.getElementById('detail-cancel-button'),
        fields: {
            name: document.getElementById('detail-member-name'),
            category: document.getElementById('detail-member-category'),
            period: document.getElementById('detail-member-period'),
            amount: document.getElementById('detail-member-amount'),
            img: document.getElementById('detail-proof-image'),
            empty: document.getElementById('detail-proof-empty')
        }
    },
    frame: document.getElementById('admin-frame'),
    notifyWrap: document.getElementById('admin-notify-wrap')
};

const Utils = {
    formatCurrency: (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`,
    showNotif: (msg, type = 'info') => {
        const item = document.createElement('div');
        item.className = `admin-notify-item ${type}`;
        item.textContent = msg;
        DOM.notifyWrap.appendChild(item);
        setTimeout(() => item.classList.add('show'), 10);
        setTimeout(() => {
            item.classList.remove('show');
            setTimeout(() => item.remove(), 400);
        }, 3000);
    },
    getDeviceId: () => {
        let id = localStorage.getItem(Config.STORAGE_KEYS.DEVICE);
        if (!id) {
            id = 'admin-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(Config.STORAGE_KEYS.DEVICE, id);
        }
        return id;
    }
};

const Api = {
    async request(params) {
        const callbackName = 'cb' + Date.now() + Math.floor(Math.random() * 1000);
        const query = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');
        const url = `${Config.CLOUD_URL}?${query}&callback=${callbackName}`;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            const timeout = setTimeout(() => { cleanup(); reject(new Error('Timeout backend')); }, 15000);
            window[callbackName] = (data) => { cleanup(); resolve(data); };
            const cleanup = () => { clearTimeout(timeout); script.remove(); delete window[callbackName]; };
            script.src = url;
            document.body.appendChild(script);
        });
    }
};

const Auth = {
    getSession: () => JSON.parse(localStorage.getItem(Config.STORAGE_KEYS.SESSION) || 'null'),
    async ensure() {
        let session = this.getSession();
        if (session && session.expiresAt > Date.now()) return session;

        const editor = (prompt('Nama Admin:') || '').trim().toUpperCase();
        const pin = prompt('PIN 4 Digit:');
        if (!editor || !pin) throw new Error('Auth batal');

        const res = await Api.request({ action: 'verifyAuth', editor, pin, deviceId: Utils.getDeviceId() });
        if (!res.ok) throw new Error(res.error || 'PIN Salah');

        session = { 
            editor: res.editor, 
            token: res.writeToken, 
            expiresAt: Date.now() + (res.expiresInSec * 1000) 
        };
        localStorage.setItem(Config.STORAGE_KEYS.SESSION, JSON.stringify(session));
        return session;
    }
};

const Actions = {
    async switchView(view) {
        State.currentView = view;
        Object.keys(DOM.views).forEach(k => DOM.views[k].classList.toggle('active', k === view));
        
        // Memperbaiki pemetaan ID navigasi
        const activeId = view === 'verification' ? 'payment-verification-link' : 'dashboard-link';
        DOM.nav.links.forEach(l => l.classList.toggle('active', l.id === activeId));
        
        if (view === 'verification') {
            DOM.topbar.title.innerText = 'VERIFIKASI QRIS';
            DOM.topbar.caption.innerText = 'Daftar pembayaran yang menunggu persetujuan.';
            this.loadPending();
        } else {
            DOM.topbar.title.innerText = 'PANEL ADMIN UTAMA';
            DOM.topbar.caption.innerText = 'Ceklis anggota dan rekap iuran.';
        }
        DOM.nav.menuDropdown.classList.remove('open');
    },

    async loadPending() {
        DOM.verification.list.innerHTML = '<div class="admin-payment-empty">Memuat data...</div>';
        try {
            const res = await Api.request({ action: 'adminPendingSnapshot', year: State.year });
            State.pendingPayments = res.items || [];
            this.renderPending();
        } catch (e) { Utils.showNotif(e.message, 'error'); }
    },

    renderPending() {
        if (!State.pendingPayments.length) {
            DOM.verification.list.innerHTML = '<div class="admin-payment-empty">Tidak ada pembayaran pending.</div>';
            return;
        }
        DOM.verification.list.innerHTML = State.pendingPayments.map((p, i) => `
            <div class="admin-payment-item">
                <div class="admin-payment-row">
                    <div class="admin-payment-name">${p.kat.toUpperCase()} - ${p.nama}</div>
                    <div class="admin-payment-badge">PENDING</div>
                </div>
                <div class="admin-payment-amount">${Utils.formatCurrency(p.nominal)}</div>
                <div class="admin-payment-actions">
                    <button class="admin-secondary-button" onclick="Actions.openDetail(${i})">DETAIL</button>
                    <button class="admin-ghost-button" onclick="Actions.handleDecision('verify', ${i})">LUNASKAN</button>
                </div>
            </div>
        `).join('');
    },

    openDetail(index) {
        const p = State.pendingPayments[index];
        State.activePayment = p;
        const f = DOM.modal.fields;
        f.name.innerText = p.nama;
        f.category.innerText = p.kat.toUpperCase();
        f.period.innerText = (p.monthLabels || []).join(', ');
        f.amount.innerText = Utils.formatCurrency(p.nominal);
        
        if (p.proofData) {
            f.img.src = p.proofData;
            f.img.style.display = 'block';
            f.empty.style.display = 'none';
        } else {
            f.img.style.display = 'none';
            f.empty.style.display = 'block';
        }
        DOM.modal.el.classList.add('active');
    },

    async handleDecision(type, index = null) {
        if (State.inFlight) return;
        const p = index !== null ? State.pendingPayments[index] : State.activePayment;
        if (!p) return;

        try {
            State.inFlight = true;
            const session = await Auth.ensure();
            const res = await Api.request({
                action: 'adminPendingAction',
                decision: type,
                id: p.id,
                kat: p.kat,
                months: p.months.join(','),
                year: p.y,
                editor: session.editor,
                authToken: session.token,
                deviceId: Utils.getDeviceId()
            });
            
            Utils.showNotif('Berhasil diproses', 'success');
            State.pendingPayments = res.items || [];
            this.renderPending();
            DOM.modal.el.classList.remove('active');
            this.postToFrame('refresh_data');
        } catch (e) {
            Utils.showNotif(e.message, 'error');
            if (e.message.includes('Unauthorized')) localStorage.removeItem(Config.STORAGE_KEYS.SESSION);
        } finally { State.inFlight = false; }
    },

    postToFrame(action) {
        DOM.frame.contentWindow.postMessage({ type: 'delta8-admin-action', action }, '*');
    }
};

// Event Listeners
DOM.nav.menuBtn.onclick = (e) => { e.stopPropagation(); DOM.nav.menuDropdown.classList.toggle('open'); };
document.onclick = () => DOM.nav.menuDropdown.classList.remove('open');
document.getElementById('dashboard-link').onclick = () => Actions.switchView('dashboard');
document.getElementById('payment-verification-link').onclick = () => Actions.switchView('verification');
document.getElementById('add-member-link').onclick = () => { Actions.switchView('dashboard'); Actions.postToFrame('tambah'); };
document.getElementById('add-transaction-link').onclick = () => { Actions.switchView('dashboard'); Actions.postToFrame('catat'); };
document.getElementById('refresh-payments-link').onclick = () => Actions.loadPending();
DOM.modal.close.onclick = () => DOM.modal.el.classList.remove('active');
DOM.modal.verifyBtn.onclick = () => Actions.handleDecision('verify');
DOM.modal.cancelBtn.onclick = () => Actions.handleDecision('cancel');

window.onmessage = (e) => {
    if (e.data?.type === 'delta8-admin-pending-state' && State.currentView !== 'verification') {
        State.pendingPayments = e.data.payload.items || [];
        Actions.renderPending();
    }
};