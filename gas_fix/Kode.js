var SPREADSHEET_ID_KEY = "kas_spreadsheet_id";
var YEAR_PROP_KEY = "active_year";
var API_SECRET_KEY = "kas_api_secret";
var APP_PIN_KEY = "kas_app_pin";
var FCM_TOKENS_KEY = "fcm_tokens_json";
var FCM_API_KEY = "fcm_api_key";
var FCM_AUTH_DOMAIN = "fcm_auth_domain";
var FCM_PROJECT_ID = "fcm_project_id";
var FCM_STORAGE_BUCKET = "fcm_storage_bucket";
var FCM_MESSAGING_SENDER_ID = "fcm_messaging_sender_id";
var FCM_APP_ID = "fcm_app_id";
var FCM_MEASUREMENT_ID = "fcm_measurement_id";
var FCM_VAPID_KEY = "fcm_vapid_key";
var FCM_SA_CLIENT_EMAIL_KEY = "fcm_sa_client_email";
var FCM_SA_PRIVATE_KEY_KEY = "fcm_sa_private_key";
var FCM_LAST_SEND_KEY = "fcm_last_send_json";
var ACTIVE_JSONP_CALLBACK = "";
var WRITE_SESSION_TTL_SEC = 21600; // 6 hours
var BACKUP_LAST_KEY_PREFIX = "backup_last_";
var BACKUP_ARCHIVE_ID_KEY = "backup_archive_spreadsheet_id";
var BACKUP_KEEP_COUNT = 15;
var DEFAULT_SPREADSHEET_ID = "10GWGUs4ILzb1Hb3tm3OFy_dcRXCQKHqSQ0zPa3YmfpY";
var DATA_TYPES = ["driver", "helper", "transaksi", "logs"];
var DEFAULT_APP_PIN = "0000";
var DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAIZx9jjiW1uUdXmG-P7ZqQRloFuo4L7G8",
  authDomain: "kas-delta-8.firebaseapp.com",
  projectId: "kas-delta-8",
  storageBucket: "kas-delta-8.firebasestorage.app",
  messagingSenderId: "971725893634",
  appId: "1:971725893634:web:79feba7c68d9a72098771b",
  measurementId: "G-H5G52PERC0",
  vapidKey: "BKDg4aP1oAfiuWuXXpb-oggOf2AePd7bLzr7M3skACfKwUoGIxr3ioxiC5C2XmViLdhnJWBGHIudWgFIjPRZyXc"
};
var DEFAULT_WEB_APP_URL = "https://kas-delta-8.web.app";
var DEFAULT_SERVICE_ACCOUNT_EMAIL = "firebase-adminsdk-fbsvc@kas-delta-8.iam.gserviceaccount.com";

var DRIVER_HELPER_HEADERS = [
  "NO",
  "NAMA ANGGOTA",
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MEI",
  "JUN",
  "JUL",
  "AGU",
  "SEP",
  "OKT",
  "NOV",
  "DES",
  "TOTAL"
];
var TRANSAKSI_HEADERS = [
  "TANGGAL",
  "TIPE",
  "PENERIMA/SUMBER",
  "KETERANGAN",
  "NOMINAL"
];
var LOG_HEADERS = ["WAKTU", "EDITOR", "AKSI", "KETERANGAN"];

function authorizeFcm() {
  return adminAuthorizeFcm_();
}

function doGet(e) {
  ensureBootstrapConfig_();
  ACTIVE_JSONP_CALLBACK = getJsonpCallback_(e);
  try {
    e = e || {};
    var action = (e.parameter && e.parameter.action) || "";

    if (action === "read") return handleRead_(e);
    if (action === "ensureYear") return handleEnsureYear_(e);
    if (action === "sheetInfo") return handleSheetInfo_();
    if (action === "sheetId") return handleSheetId_();
    if (action === "migrateYear") return handleMigrateYear_(e);
    if (action === "fixHeaders") return handleFixHeaders_(e);
    if (action === "backupYear") return handleBackupYear_(e);
    if (action === "verifyAuth") return handleVerifyAuth_(e);
    if (action === "adminHealth") return handleAdminHealth_(e);
    if (action === "backupConfig") return handleBackupConfig_();
    if (action === "setBackupArchive") return handleSetBackupArchive_(e);
    if (action === "installBackupTrigger") return handleInstallBackupTrigger_(e);
    if (action === "fcmConfig") return handleFcmConfig_();
    if (action === "fcmHealth") return handleFcmHealth_();
    if (action === "fcmSw") return handleFcmSw_();
    if (action === "saveFcmToken") return handleSaveFcmTokenFromGet_(e);
    if (action === "testFcm") return handleTestFcm_(e);

    // Serve index.html for browser UI.
    return HtmlService.createHtmlOutputFromFile("index")
      .setTitle("Data Uang KAS Driver Helper DELTA 8")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return jsonResponse_({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  } finally {
    ACTIVE_JSONP_CALLBACK = "";
  }
}

function doPost(e) {
  ensureBootstrapConfig_();
  ACTIVE_JSONP_CALLBACK = "";
  try {
    var payload = parsePostBody_(e);

    if (payload.action === "saveFcmToken") {
      return handleSaveFcmToken_(payload, e);
    }
    if (payload.action === "adminSetScriptProperties") {
      return handleAdminSetScriptProperties_(payload, e);
    }

    validateWriteAuth_(payload, e);
    var year = getTargetYear_(payload, e);
    ensureYearData_(year);
    var beforeData = readYearData_(year);

    var normalized = normalizePayload_(payload);
    writeYearData_(year, normalized);
    maybeBroadcastFcmAfterWrite_(beforeData, normalized, payload, year);

    return jsonResponse_({ ok: true, year: year });
  } catch (err) {
    return jsonResponse_({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function maybeBroadcastFcmAfterWrite_(beforeData, afterData, payload, year) {
  try {
    var latestLog = getLatestLogEntry_(beforeData, afterData);
    var meta = buildActivityNotificationMeta_(latestLog);
    var title = meta.title;
    var body = meta.body;
    var editor = String((payload && payload.editor) || "").trim().toUpperCase();

    if (latestLog) {
      if (!editor && latestLog.editor) {
        editor = String(latestLog.editor || "").trim().toUpperCase();
      }
    } else if (didClearLogs_(beforeData, afterData) && !meta.isFromLog) {
      meta = buildActivityNotificationMeta_({
        aksi: "SYSTEM",
        ket: "BERSIHKAN SEMUA LOG"
      });
      title = meta.title;
      body = meta.body;
    }

    if (editor) body += " Oleh " + editor + ".";

    sendFcmToAllDevices_(title, body, {
      year: String(year || ""),
      type: "activity_log",
      action: latestLog && latestLog.aksi ? String(latestLog.aksi) : "",
      detail: latestLog && latestLog.ket ? String(latestLog.ket) : body,
      title: title,
      body: body,
      tag: meta.tag,
      icon: DEFAULT_WEB_APP_URL + "/notification-icon.svg",
      badge: DEFAULT_WEB_APP_URL + "/notification-badge.svg",
      url: buildNotificationTargetUrl_(meta.view)
    });
  } catch (err) {}
}

function getLatestLogEntry_(beforeData, afterData) {
  var afterLogs = (afterData && afterData.logs) || [];
  var beforeLogs = (beforeData && beforeData.logs) || [];

  if (!afterLogs.length) return null;
  if (!beforeLogs.length) return afterLogs[0];

  var latest = afterLogs[0] || {};
  var previous = beforeLogs[0] || {};
  var changed =
    String(latest.time || "") !== String(previous.time || "") ||
    String(latest.editor || "") !== String(previous.editor || "") ||
    String(latest.aksi || "") !== String(previous.aksi || "") ||
    String(latest.ket || "") !== String(previous.ket || "");

  return changed ? latest : null;
}

function didClearLogs_(beforeData, afterData) {
  var beforeLogs = (beforeData && beforeData.logs) || [];
  var afterLogs = (afterData && afterData.logs) || [];
  return !!beforeLogs.length && !afterLogs.length;
}

function normalizeNotificationText_(value, maxLen) {
  var text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, Math.max(0, maxLen - 3)).trim() + "...";
}

function buildActivityNotificationMeta_(logEntry) {
  var aksi = String((logEntry && logEntry.aksi) || "").trim().toUpperCase();
  var ket = normalizeNotificationText_(
    (logEntry && logEntry.ket) || "Ada aktivitas baru di aplikasi.",
    180
  );

  var meta = {
    title: "🔔 Aktivitas Aplikasi",
    body: ket || "Ada aktivitas baru di aplikasi.",
    tag: "delta8-activity-general",
    view: "transaksi",
    isFromLog: !!logEntry
  };

  if (!aksi) return meta;

  if (aksi === "TAMBAH TRANSAKSI") {
    meta.title = "💸 Tambah Transaksi";
    meta.tag = "delta8-activity-transaksi-add";
    return meta;
  }
  if (aksi === "EDIT TRANSAKSI") {
    meta.title = "📝 Edit Transaksi";
    meta.tag = "delta8-activity-transaksi-edit";
    return meta;
  }
  if (aksi === "HAPUS TRANSAKSI") {
    meta.title = "🗑️ Hapus Transaksi";
    meta.tag = "delta8-activity-transaksi-delete";
    return meta;
  }
  if (aksi === "TAMBAH ANGGOTA") {
    meta.title = "👥 Tambah Anggota";
    meta.tag = "delta8-activity-member-add";
    meta.view = "driver";
    return meta;
  }
  if (aksi === "EDIT ANGGOTA") {
    meta.title = "🪪 Edit Anggota";
    meta.tag = "delta8-activity-member-edit";
    meta.view = "driver";
    return meta;
  }
  if (aksi === "HAPUS ANGGOTA") {
    meta.title = "❌ Hapus Anggota";
    meta.tag = "delta8-activity-member-delete";
    meta.view = "driver";
    return meta;
  }
  if (aksi === "IURAN") {
    meta.title =
      ket.indexOf("LUNAS") !== -1 ? "✅ Iuran Lunas" : "💰 Update Iuran";
    meta.tag = "delta8-activity-iuran";
    return meta;
  }
  if (aksi === "SYSTEM") {
    meta.title =
      ket.indexOf("BERSIHKAN") !== -1 ? "🧹 Bersihkan Log" : "⚙️ Aktivitas Sistem";
    meta.tag = "delta8-activity-system";
    return meta;
  }

  meta.title = "🔔 " + normalizeNotificationText_(aksi, 70);
  meta.tag = "delta8-activity-custom";
  return meta;
}

function buildNotificationTargetUrl_(view) {
  var targetView = String(view || "").trim().toLowerCase();
  if (!targetView) return DEFAULT_WEB_APP_URL;
  return DEFAULT_WEB_APP_URL + "?view=" + encodeURIComponent(targetView);
}

function buildNotificationId_(title, body, dataObj) {
  var seedParts = [
    (dataObj && dataObj.type) || "",
    (dataObj && dataObj.action) || "",
    (dataObj && dataObj.year) || "",
    title || "",
    body || "",
    new Date().getTime()
  ];
  var raw = seedParts.join("-").toLowerCase();
  var normalized = raw.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized ? normalized.slice(0, 120) : "delta8-notif-" + new Date().getTime();
}

function ensureBootstrapConfig_() {
  var props = PropertiesService.getScriptProperties();

  if (!props.getProperty(SPREADSHEET_ID_KEY) && DEFAULT_SPREADSHEET_ID) {
    props.setProperty(SPREADSHEET_ID_KEY, DEFAULT_SPREADSHEET_ID);
  }

  if (!props.getProperty(APP_PIN_KEY) && DEFAULT_APP_PIN) {
    props.setProperty(APP_PIN_KEY, DEFAULT_APP_PIN);
  }

  if (!props.getProperty(FCM_API_KEY) && DEFAULT_FIREBASE_CONFIG.apiKey) {
    props.setProperty(FCM_API_KEY, DEFAULT_FIREBASE_CONFIG.apiKey);
  }
  if (!props.getProperty(FCM_AUTH_DOMAIN) && DEFAULT_FIREBASE_CONFIG.authDomain) {
    props.setProperty(FCM_AUTH_DOMAIN, DEFAULT_FIREBASE_CONFIG.authDomain);
  }
  if (!props.getProperty(FCM_PROJECT_ID) && DEFAULT_FIREBASE_CONFIG.projectId) {
    props.setProperty(FCM_PROJECT_ID, DEFAULT_FIREBASE_CONFIG.projectId);
  }
  if (!props.getProperty(FCM_STORAGE_BUCKET) && DEFAULT_FIREBASE_CONFIG.storageBucket) {
    props.setProperty(FCM_STORAGE_BUCKET, DEFAULT_FIREBASE_CONFIG.storageBucket);
  }
  if (!props.getProperty(FCM_MESSAGING_SENDER_ID) && DEFAULT_FIREBASE_CONFIG.messagingSenderId) {
    props.setProperty(FCM_MESSAGING_SENDER_ID, DEFAULT_FIREBASE_CONFIG.messagingSenderId);
  }
  if (!props.getProperty(FCM_APP_ID) && DEFAULT_FIREBASE_CONFIG.appId) {
    props.setProperty(FCM_APP_ID, DEFAULT_FIREBASE_CONFIG.appId);
  }
  if (!props.getProperty(FCM_MEASUREMENT_ID) && DEFAULT_FIREBASE_CONFIG.measurementId) {
    props.setProperty(FCM_MEASUREMENT_ID, DEFAULT_FIREBASE_CONFIG.measurementId);
  }
  if (!props.getProperty(FCM_VAPID_KEY) && DEFAULT_FIREBASE_CONFIG.vapidKey) {
    props.setProperty(FCM_VAPID_KEY, DEFAULT_FIREBASE_CONFIG.vapidKey);
  }
  if (!props.getProperty(FCM_SA_CLIENT_EMAIL_KEY) && DEFAULT_SERVICE_ACCOUNT_EMAIL) {
    props.setProperty(FCM_SA_CLIENT_EMAIL_KEY, DEFAULT_SERVICE_ACCOUNT_EMAIL);
  }
}

function sendFcmToAllDevices_(title, body, dataObj) {
  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty(FCM_TOKENS_KEY) || "[]";
  var rows = [];
  try {
    rows = JSON.parse(raw);
    if (!Array.isArray(rows)) rows = [];
  } catch (err) {
    rows = [];
  }
  if (!rows.length) {
    setLastFcmSendStatus_({
      ok: false,
      reason: "no_tokens",
      attempted: 0,
      delivered: 0,
      updatedAt: new Date().toISOString()
    });
    return;
  }

  var projectId = props.getProperty(FCM_PROJECT_ID) || DEFAULT_FIREBASE_CONFIG.projectId;
  var saEmail = props.getProperty(FCM_SA_CLIENT_EMAIL_KEY) || DEFAULT_SERVICE_ACCOUNT_EMAIL;
  var saPrivateKey = props.getProperty(FCM_SA_PRIVATE_KEY_KEY) || "";
  if (!projectId || !saEmail || !saPrivateKey) {
    setLastFcmSendStatus_({
      ok: false,
      reason: "missing_service_account",
      attempted: rows.length,
      delivered: 0,
      hasProjectId: !!projectId,
      hasClientEmail: !!saEmail,
      hasPrivateKey: !!saPrivateKey,
      updatedAt: new Date().toISOString()
    });
    return;
  }

  var accessToken = getFcmAccessToken_(saEmail, saPrivateKey);
  if (!accessToken) {
    setLastFcmSendStatus_({
      ok: false,
      reason: "access_token_failed",
      attempted: rows.length,
      delivered: 0,
      updatedAt: new Date().toISOString()
    });
    return;
  }

  var keep = [];
  var delivered = 0;
  var results = [];
  for (var i = 0; i < rows.length; i++) {
    var token = rows[i] && rows[i].token ? String(rows[i].token) : "";
    if (!token) continue;
    var sendResult = sendFcmToToken_(projectId, accessToken, token, title, body, dataObj);
    var code = sendResult.code;
    var txt = sendResult.text;
    // Keep valid tokens, drop invalid/unregistered.
    if (
      code >= 200 &&
      code < 300 &&
      txt.indexOf('"name"') !== -1
    ) {
      delivered++;
      keep.push(rows[i]);
      results.push({ ok: true, code: code });
      continue;
    }
    if (
      txt.indexOf("UNREGISTERED") === -1 &&
      txt.indexOf("INVALID_ARGUMENT") === -1
    ) {
      keep.push(rows[i]);
    }
    results.push({
      ok: false,
      code: code,
      error: truncateText_(txt, 220)
    });
  }

  props.setProperty(FCM_TOKENS_KEY, JSON.stringify(keep.slice(0, 300)));
  setLastFcmSendStatus_({
    ok: delivered > 0,
    attempted: rows.length,
    delivered: delivered,
    kept: keep.length,
    updatedAt: new Date().toISOString(),
    results: results.slice(0, 5)
  });
}

function sendFcmToToken_(projectId, accessToken, token, title, body, dataObj) {
  var url =
    "https://fcm.googleapis.com/v1/projects/" +
    encodeURIComponent(projectId) +
    "/messages:send";
  var cleanData = toStringMap_(dataObj || {});
  cleanData.title = String(title || "Notifikasi");
  cleanData.body = String(body || "");
  cleanData.icon = String(cleanData.icon || DEFAULT_WEB_APP_URL + "/favicon.ico");
  cleanData.badge = String(cleanData.badge || cleanData.icon);
  cleanData.tag = String(cleanData.tag || cleanData.type || "delta8-notif");
  cleanData.groupKey = String(cleanData.groupKey || "delta8-statusbar");
  cleanData.groupTitle = String(cleanData.groupTitle || "Delta 8");
  cleanData.summaryTag = String(cleanData.summaryTag || cleanData.groupKey + "-group");
  cleanData.notificationId = String(
    cleanData.notificationId || buildNotificationId_(title, body, cleanData)
  );
  cleanData.link = String(
    cleanData.link || cleanData.url || DEFAULT_WEB_APP_URL
  );
  var payload = {
    message: {
      token: token,
      data: cleanData,
      webpush: {
        fcm_options: {
          link: String(cleanData.link || DEFAULT_WEB_APP_URL)
        }
      }
    }
  };

  var resp = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + accessToken },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  return {
    code: resp.getResponseCode(),
    text: resp.getContentText() || ""
  };
}

function getFcmAccessToken_(clientEmail, privateKeyRaw) {
  var privateKey = String(privateKeyRaw || "").replace(/\\n/g, "\n");
  var nowSec = Math.floor(new Date().getTime() / 1000);
  var header = {
    alg: "RS256",
    typ: "JWT"
  };
  var claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: nowSec,
    exp: nowSec + 3600
  };

  var encHeader = base64UrlEncode_(JSON.stringify(header));
  var encClaim = base64UrlEncode_(JSON.stringify(claim));
  var toSign = encHeader + "." + encClaim;
  var signatureBytes = Utilities.computeRsaSha256Signature(toSign, privateKey);
  var signature = base64UrlEncodeBytes_(signatureBytes);
  var jwt = toSign + "." + signature;

  var resp = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", {
    method: "post",
    payload: {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    },
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() < 200 || resp.getResponseCode() >= 300) return "";

  try {
    var obj = JSON.parse(resp.getContentText());
    return obj && obj.access_token ? String(obj.access_token) : "";
  } catch (err) {
    return "";
  }
}

function base64UrlEncode_(text) {
  var bytes = Utilities.newBlob(text).getBytes();
  return base64UrlEncodeBytes_(bytes);
}

function base64UrlEncodeBytes_(bytes) {
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/g, "");
}

function toStringMap_(obj) {
  var out = {};
  for (var k in obj) {
    if (!obj.hasOwnProperty(k)) continue;
    out[k] = String(obj[k]);
  }
  return out;
}

function handleFcmConfig_() {
  var props = PropertiesService.getScriptProperties();
  var cfg = {
    apiKey: props.getProperty(FCM_API_KEY) || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain:
      props.getProperty(FCM_AUTH_DOMAIN) || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId:
      props.getProperty(FCM_PROJECT_ID) || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket:
      props.getProperty(FCM_STORAGE_BUCKET) ||
      DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId:
      props.getProperty(FCM_MESSAGING_SENDER_ID) ||
      DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: props.getProperty(FCM_APP_ID) || DEFAULT_FIREBASE_CONFIG.appId,
    measurementId:
      props.getProperty(FCM_MEASUREMENT_ID) ||
      DEFAULT_FIREBASE_CONFIG.measurementId
  };
  var vapidKey = props.getProperty(FCM_VAPID_KEY) || DEFAULT_FIREBASE_CONFIG.vapidKey;
  var enabled =
    !!cfg.apiKey &&
    !!cfg.projectId &&
    !!cfg.messagingSenderId &&
    !!cfg.appId &&
    !!vapidKey;

  return jsonResponse_({
    ok: true,
    enabled: enabled,
    config: cfg,
    vapidKey: vapidKey
  });
}

function handleFcmHealth_() {
  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty(FCM_TOKENS_KEY) || "[]";
  var rows = [];
  var lastSend = {};
  try {
    rows = JSON.parse(raw);
    if (!Array.isArray(rows)) rows = [];
  } catch (err) {
    rows = [];
  }
  try {
    lastSend = JSON.parse(props.getProperty(FCM_LAST_SEND_KEY) || "{}");
  } catch (err2) {
    lastSend = {};
  }

  return jsonResponse_({
    ok: true,
    tokenCount: rows.length,
    hasServiceAccount:
      !!(props.getProperty(FCM_SA_CLIENT_EMAIL_KEY) || DEFAULT_SERVICE_ACCOUNT_EMAIL) &&
      !!props.getProperty(FCM_SA_PRIVATE_KEY_KEY),
    hasProjectId: !!(props.getProperty(FCM_PROJECT_ID) || DEFAULT_FIREBASE_CONFIG.projectId),
    enabledConfig: !!(
      (props.getProperty(FCM_API_KEY) || DEFAULT_FIREBASE_CONFIG.apiKey) &&
      (props.getProperty(FCM_PROJECT_ID) || DEFAULT_FIREBASE_CONFIG.projectId) &&
      (props.getProperty(FCM_MESSAGING_SENDER_ID) || DEFAULT_FIREBASE_CONFIG.messagingSenderId) &&
      (props.getProperty(FCM_APP_ID) || DEFAULT_FIREBASE_CONFIG.appId) &&
      (props.getProperty(FCM_VAPID_KEY) || DEFAULT_FIREBASE_CONFIG.vapidKey)
    ),
    tokens: rows.slice(0, 10).map(function(row) {
      var token = String((row && row.token) || "");
      return {
        editor: String((row && row.editor) || ""),
        updatedAt: String((row && row.updatedAt) || (row && row.createdAt) || ""),
        tokenTail: token ? token.slice(-12) : ""
      };
    }),
    lastSend: lastSend
  });
}

function handleFcmSw_() {
  var props = PropertiesService.getScriptProperties();
  var cfg = {
    apiKey: props.getProperty(FCM_API_KEY) || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain:
      props.getProperty(FCM_AUTH_DOMAIN) || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId:
      props.getProperty(FCM_PROJECT_ID) || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket:
      props.getProperty(FCM_STORAGE_BUCKET) ||
      DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId:
      props.getProperty(FCM_MESSAGING_SENDER_ID) ||
      DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: props.getProperty(FCM_APP_ID) || DEFAULT_FIREBASE_CONFIG.appId
  };

  var script =
    "importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');\n" +
    "importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');\n" +
    "if (!firebase.apps.length) firebase.initializeApp(" + JSON.stringify(cfg) + ");\n" +
    "const messaging = firebase.messaging();\n" +
    "messaging.onBackgroundMessage(function(payload){\n" +
    "  const n = (payload && payload.notification) || {};\n" +
    "  self.registration.showNotification(n.title || 'Notifikasi Baru', {\n" +
    "    body: n.body || '',\n" +
    "    icon: '/favicon.ico'\n" +
    "  });\n" +
    "});\n";

  return ContentService.createTextOutput(script).setMimeType(
    ContentService.MimeType.JAVASCRIPT
  );
}

function handleSaveFcmToken_(payload, e) {
  var token = String(payload.token || "").trim();
  var editor = String(payload.editor || "").trim();
  var deviceId = normalizeDeviceId_(payload.deviceId || "");
  var userAgent = truncateText_(String(payload.userAgent || ""), 180);
  if (token.length < 20) {
    throw new Error("Invalid FCM token.");
  }
  if (!editor) {
    editor = "PERANGKAT";
  }

  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty(FCM_TOKENS_KEY) || "[]";
  var rows = [];
  try {
    rows = JSON.parse(raw);
    if (!Array.isArray(rows)) rows = [];
  } catch (err) {
    rows = [];
  }

  rows = upsertFcmTokenRows_(rows, token, editor, deviceId, {
    userAgent: userAgent
  });
  props.setProperty(FCM_TOKENS_KEY, JSON.stringify(rows));

  return jsonResponse_({ ok: true, saved: true, total: rows.length });
}

function handleSaveFcmTokenFromGet_(e) {
  var payload = {
    authToken: (e && e.parameter && e.parameter.authToken) || "",
    token: (e && e.parameter && e.parameter.token) || "",
    editor: (e && e.parameter && e.parameter.editor) || "",
    deviceId: (e && e.parameter && e.parameter.deviceId) || ""
  };
  return handleSaveFcmToken_(payload, e);
}

function handleTestFcm_(e) {
  validateActionAuth_(e);
  var props = PropertiesService.getScriptProperties();
  var token = String((e && e.parameter && e.parameter.token) || "").trim();
  var title = String((e && e.parameter && e.parameter.title) || "Tes Notifikasi").trim();
  var body = String((e && e.parameter && e.parameter.body) || "Push notification Delta 8 aktif di perangkat ini.").trim();
  var projectId = props.getProperty(FCM_PROJECT_ID) || DEFAULT_FIREBASE_CONFIG.projectId;
  var saEmail = props.getProperty(FCM_SA_CLIENT_EMAIL_KEY) || DEFAULT_SERVICE_ACCOUNT_EMAIL;
  var saPrivateKey = props.getProperty(FCM_SA_PRIVATE_KEY_KEY) || "";

  if (!projectId || !saEmail || !saPrivateKey) {
    return jsonResponse_({
      ok: false,
      error: "FCM service account belum dikonfigurasi di Script Properties.",
      hasProjectId: !!projectId,
      hasClientEmail: !!saEmail,
      hasPrivateKey: !!saPrivateKey
    });
  }

  var accessToken = getFcmAccessToken_(saEmail, saPrivateKey);
  if (!accessToken) {
    return jsonResponse_({ ok: false, error: "Gagal membuat access token FCM." });
  }

  if (token) {
    var single = sendFcmToToken_(projectId, accessToken, token, title, body, {
      type: "test_ping",
      url: DEFAULT_WEB_APP_URL
    });
    return jsonResponse_({
      ok: single.code >= 200 && single.code < 300,
      code: single.code,
      response: truncateText_(single.text, 220)
    });
  }

  sendFcmToAllDevices_(title, body, {
    type: "test_broadcast",
    url: DEFAULT_WEB_APP_URL
  });
  return handleFcmHealth_();
}

function adminAuthorizeFcm_() {
  var resp = UrlFetchApp.fetch("https://www.googleapis.com/generate_204", {
    method: "get",
    muteHttpExceptions: true
  });
  return {
    ok: resp.getResponseCode() >= 200 && resp.getResponseCode() < 400,
    code: resp.getResponseCode()
  };
}

function upsertFcmTokenRows_(rows, token, editor, deviceId, extra) {
  var now = new Date().toISOString();
  var cleanEditor = normalizeEditorName_(editor);
  var cleanDeviceId = normalizeDeviceId_(deviceId);
  var cleanUserAgent = truncateText_(String((extra && extra.userAgent) || ""), 180);
  var found = false;
  for (var i = 0; i < rows.length; i++) {
    if (
      rows[i] &&
      (rows[i].token === token ||
        (cleanDeviceId && normalizeDeviceId_(rows[i].deviceId || "") === cleanDeviceId))
    ) {
      rows[i].token = token;
      rows[i].updatedAt = now;
      if (cleanEditor) rows[i].editor = cleanEditor;
      if (cleanDeviceId) rows[i].deviceId = cleanDeviceId;
      if (cleanUserAgent) rows[i].userAgent = cleanUserAgent;
      found = true;
      break;
    }
  }
  if (!found) {
    rows.unshift({
      token: token,
      editor: cleanEditor,
      deviceId: cleanDeviceId,
      userAgent: cleanUserAgent,
      createdAt: now,
      updatedAt: now
    });
  }
  return rows.filter(function(row, index, arr) {
    if (!row || !row.token) return false;
    return arr.findIndex(function(other) {
      if (!other || !other.token) return false;
      if (other.token === row.token) return true;
      if (cleanDeviceId && normalizeDeviceId_(other.deviceId || "") === normalizeDeviceId_(row.deviceId || "")) {
        return true;
      }
      return false;
    }) === index;
  }).slice(0, 300);
}

function setLastFcmSendStatus_(status) {
  PropertiesService.getScriptProperties().setProperty(
    FCM_LAST_SEND_KEY,
    JSON.stringify(status || {})
  );
}

function truncateText_(text, maxLen) {
  var value = String(text || "");
  var limit = Number(maxLen || 0) || 0;
  if (!limit || value.length <= limit) return value;
  return value.slice(0, limit) + "...";
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function handleRead_(e) {
  var year = getYearFromRequest_(e);
  var data = readYearData_(year);
  setActiveYear_(year);
  return jsonResponse_(data);
}

function handleEnsureYear_(e) {
  var year = getYearFromRequest_(e);
  ensureYearData_(year);
  setActiveYear_(year);
  var info = getSpreadsheetInfo_();
  return jsonResponse_({
    ok: true,
    year: year,
    spreadsheetId: info.id,
    spreadsheetUrl: info.url
  });
}

function handleSheetInfo_() {
  var info = getSpreadsheetInfo_();
  return jsonResponse_({
    ok: true,
    spreadsheetId: info.id,
    spreadsheetUrl: info.url
  });
}

function handleSheetId_() {
  var info = getSpreadsheetInfo_();
  return ContentService.createTextOutput(info.id).setMimeType(
    ContentService.MimeType.TEXT
  );
}

function handleMigrateYear_(e) {
  validateActionAuth_(e);
  var year = getYearFromRequest_(e);
  var ss = getOrCreateSpreadsheet_();
  var sheet = ensureYearSheet_(ss, year);
  var data = readYearSheet_(sheet, year);
  writeYearSheet_(sheet, data, year);

  return jsonResponse_({
    ok: true,
    year: year,
    message: "Layout migrated: transaksi@Q, logs@W"
  });
}

function handleFixHeaders_(e) {
  validateActionAuth_(e);
  var year = getYearFromRequest_(e);
  var ss = getOrCreateSpreadsheet_();
  var sheet = ensureYearSheet_(ss, year);

  // Force rewrite full layout first.
  var data = readYearSheet_(sheet, year);
  writeYearSheet_(sheet, data, year);

  // Then force section headers in place to avoid stale labels.
  var values = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var markers = findSectionMarkers_(values);
  forceSectionHeader_(sheet, markers.driver, "driver");
  forceSectionHeader_(sheet, markers.helper, "helper");
  forceSectionHeader_(sheet, markers.transaksi, "transaksi");
  forceSectionHeader_(sheet, markers.logs, "logs");

  var out = {
    ok: true,
    year: year,
    expected: {
      driver: DRIVER_HELPER_HEADERS,
      helper: DRIVER_HELPER_HEADERS,
      transaksi: TRANSAKSI_HEADERS,
      logs: LOG_HEADERS
    },
    actual: {
      driver: readSectionHeader_(sheet, markers.driver, "driver"),
      helper: readSectionHeader_(sheet, markers.helper, "helper"),
      transaksi: readSectionHeader_(sheet, markers.transaksi, "transaksi"),
      logs: readSectionHeader_(sheet, markers.logs, "logs")
    }
  };
  return jsonResponse_(out);
}

function handleBackupYear_(e) {
  validateActionAuth_(e);
  var year = getYearFromRequest_(e);
  var ss = getOrCreateSpreadsheet_();
  var yearSheet = ensureYearSheet_(ss, year);
  var backupName = createBackupFromSheet_(ss, yearSheet, year, "manual");
  cleanupOldBackups_(ss, year, BACKUP_KEEP_COUNT);

  return jsonResponse_({
    ok: true,
    year: year,
    backupSheet: backupName
  });
}

function handleVerifyAuth_(e) {
  var pin = (e && e.parameter && e.parameter.pin) || "";
  var editor = (e && e.parameter && e.parameter.editor) || "";
  var deviceId = normalizeDeviceId_((e && e.parameter && e.parameter.deviceId) || "");
  editor = String(editor || "").trim();

  if (editor.length < 2) {
    return jsonResponse_({ ok: false, error: "Nama editor minimal 2 karakter." });
  }

  var expectedPin = PropertiesService.getScriptProperties().getProperty(APP_PIN_KEY);
  if (!expectedPin) {
    return jsonResponse_({ ok: false, error: "PIN belum dikonfigurasi di backend." });
  }

  if (String(pin) !== String(expectedPin)) {
    return jsonResponse_({ ok: false, error: "PIN salah." });
  }

  var writeToken = issueWriteSessionToken_(editor.toUpperCase(), deviceId);
  return jsonResponse_({
    ok: true,
    editor: editor.toUpperCase(),
    deviceId: deviceId,
    writeToken: writeToken,
    expiresInSec: WRITE_SESSION_TTL_SEC
  });
}

function handleBackupConfig_() {
  var props = PropertiesService.getScriptProperties();
  return jsonResponse_({
    ok: true,
    archiveSpreadsheetId: props.getProperty(BACKUP_ARCHIVE_ID_KEY) || "",
    keepCount: BACKUP_KEEP_COUNT,
    triggerInstalled: isBackupTriggerInstalled_()
  });
}

function handleAdminHealth_(e) {
  validateActionAuth_(e);
  return jsonResponse_(adminGetHealthSummary_());
}

function handleAdminSetScriptProperties_(payload, e) {
  validateWriteAuth_(payload, e);
  return jsonResponse_(adminSetScriptProperties_(payload && payload.entries));
}

function handleSetBackupArchive_(e) {
  validateActionAuth_(e);
  var id = (e && e.parameter && e.parameter.spreadsheetId) || "";
  id = String(id).trim();
  var props = PropertiesService.getScriptProperties();

  if (!id) {
    props.deleteProperty(BACKUP_ARCHIVE_ID_KEY);
    return jsonResponse_({ ok: true, archiveSpreadsheetId: "" });
  }

  // Validate ID is accessible.
  SpreadsheetApp.openById(id);
  props.setProperty(BACKUP_ARCHIVE_ID_KEY, id);
  return jsonResponse_({ ok: true, archiveSpreadsheetId: id });
}

function handleInstallBackupTrigger_(e) {
  validateActionAuth_(e);
  installDailyBackupTrigger_();
  return jsonResponse_({ ok: true, triggerInstalled: true });
}

function validateActionAuth_(e) {
  var provided = (e && e.parameter && e.parameter.authToken) || "";
  validateAuthToken_(provided, {
    editor: (e && e.parameter && e.parameter.editor) || "",
    deviceId: (e && e.parameter && e.parameter.deviceId) || ""
  });
}

function validateWriteAuth_(payload, e) {
  var provided =
    (payload && payload.authToken) ||
    (e && e.parameter && e.parameter.authToken) ||
    "";
  validateAuthToken_(provided, {
    editor:
      (payload && payload.editor) ||
      (e && e.parameter && e.parameter.editor) ||
      "",
    deviceId:
      (payload && payload.deviceId) ||
      (e && e.parameter && e.parameter.deviceId) ||
      ""
  });
}

function validateAuthToken_(provided, context) {
  var secret = getApiSecret_();
  var p = String(provided || "").trim();
  if (secret && p === String(secret)) {
    return;
  }
  if (isValidWriteSessionToken_(p, context)) {
    return;
  }
  throw new Error("Unauthorized: invalid auth token.");
}

function getApiSecret_() {
  return PropertiesService.getScriptProperties().getProperty(API_SECRET_KEY);
}

function normalizeEditorName_(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeDeviceId_(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 80);
}

function issueWriteSessionToken_(editor, deviceId) {
  try {
    var token =
      Utilities.getUuid().replace(/-/g, "") +
      Utilities.getUuid().replace(/-/g, "");
    var cache = CacheService.getScriptCache();
    cache.put(
      "wt_" + token,
      JSON.stringify({
        editor: normalizeEditorName_(editor || "OK"),
        deviceId: normalizeDeviceId_(deviceId || ""),
        issuedAt: new Date().toISOString()
      }),
      WRITE_SESSION_TTL_SEC
    );
    return token;
  } catch (err) {
    // Fallback to static API secret if cache service is unavailable.
    return getApiSecret_() || "";
  }
}

function isValidWriteSessionToken_(token, context) {
  token = String(token || "").trim();
  if (!token) return false;
  var cache = CacheService.getScriptCache();
  var raw = cache.get("wt_" + token);
  if (!raw) return false;

  var meta = null;
  try {
    meta = JSON.parse(raw);
  } catch (err) {
    meta = {
      editor: normalizeEditorName_(raw),
      deviceId: ""
    };
  }

  var expectedEditor = normalizeEditorName_((meta && meta.editor) || "");
  var expectedDeviceId = normalizeDeviceId_((meta && meta.deviceId) || "");
  var providedEditor = normalizeEditorName_(context && context.editor);
  var providedDeviceId = normalizeDeviceId_(context && context.deviceId);

  if (expectedEditor && providedEditor && expectedEditor !== providedEditor) {
    return false;
  }
  if (expectedDeviceId && providedDeviceId && expectedDeviceId !== providedDeviceId) {
    return false;
  }
  if (expectedDeviceId && !providedDeviceId) {
    return false;
  }
  return true;
}

function getYearFromRequest_(e) {
  var rawYear = e && e.parameter ? e.parameter.year : "";
  var year = parseInt(rawYear, 10);
  if (!year || year < 2000 || year > 2100) {
    year = new Date().getFullYear();
  }
  return String(year);
}

function getTargetYear_(payload, e) {
  var yearFromQuery = e && e.parameter ? e.parameter.year : "";
  var yearFromBody = payload && payload.year ? payload.year : "";
  var year =
    parseInt(yearFromQuery, 10) ||
    parseInt(yearFromBody, 10) ||
    parseInt(getActiveYear_(), 10) ||
    new Date().getFullYear();

  if (year < 2000 || year > 2100) year = new Date().getFullYear();
  setActiveYear_(String(year));
  return String(year);
}

function getActiveYear_() {
  return PropertiesService.getUserProperties().getProperty(YEAR_PROP_KEY);
}

function setActiveYear_(year) {
  PropertiesService.getUserProperties().setProperty(YEAR_PROP_KEY, String(year));
}

function ensureYearData_(year) {
  var ss = getOrCreateSpreadsheet_();
  var sheet = ensureYearSheet_(ss, year);
  migrateYearSheetLayoutIfNeeded_(sheet, year);
  return readYearData_(year);
}

function writeYearData_(year, data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getOrCreateSpreadsheet_();
    var sheet = ensureYearSheet_(ss, year);
    maybeAutoBackup_(ss, sheet, year);
    writeYearSheet_(sheet, normalizePayload_(data), year);
  } finally {
    lock.releaseLock();
  }
}

function readYearData_(year) {
  var ss = getOrCreateSpreadsheet_();
  var sheet = ensureYearSheet_(ss, year);
  migrateYearSheetLayoutIfNeeded_(sheet, year);
  return readYearSheet_(sheet, year);
}

function getSpreadsheetInfo_() {
  var ss = getOrCreateSpreadsheet_();
  return { id: ss.getId(), url: ss.getUrl() };
}

function getOrCreateSpreadsheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(SPREADSHEET_ID_KEY);
  var ss = null;

  if (!id && DEFAULT_SPREADSHEET_ID) {
    try {
      ss = SpreadsheetApp.openById(DEFAULT_SPREADSHEET_ID);
      id = DEFAULT_SPREADSHEET_ID;
      props.setProperty(SPREADSHEET_ID_KEY, id);
    } catch (_) {
      ss = null;
    }
  }

  if (id) {
    try {
      ss = SpreadsheetApp.openById(id);
    } catch (_) {
      ss = null;
    }
  }

  if (!ss) {
    ss = SpreadsheetApp.create("KAS Driver Helper DELTA 8 - Data");
    props.setProperty(SPREADSHEET_ID_KEY, ss.getId());
    setMetaSheet_(ss);
  }

  return ss;
}

function setMetaSheet_(ss) {
  var first = ss.getSheets()[0];
  first.setName("_meta");
  first.clear();
  first.getRange(1, 1, 4, 2).setValues([
    ["app", "Data Uang KAS Driver Helper DELTA 8"],
    ["createdAt", new Date().toISOString()],
    ["storage", "Google Sheets"],
    ["note", "Data per tahun disimpan pada sheet driver/helper/transaksi/logs"]
  ]);
}

function ensureYearSheet_(ss, year) {
  var name = getYearSheetName_(year);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function getYearSheetName_(year) {
  return "TAHUN_" + year;
}

function getBackupSheetPrefix_(year) {
  return "BACKUP_" + year + "_";
}

function maybeAutoBackup_(ss, yearSheet, year) {
  var props = PropertiesService.getScriptProperties();
  var key = BACKUP_LAST_KEY_PREFIX + year;
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd");
  var last = props.getProperty(key);
  if (last === today) return;

  createBackupFromSheet_(ss, yearSheet, year, "auto");
  cleanupOldBackups_(ss, year, BACKUP_KEEP_COUNT);
  props.setProperty(key, today);
}

function createBackupFromSheet_(ss, sourceSheet, year, mode) {
  if (!sourceSheet) return "";
  if (sourceSheet.getLastRow() === 0 && sourceSheet.getLastColumn() === 0) return "";

  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
  var name = getBackupSheetPrefix_(year) + stamp + "_" + String(mode || "auto");
  if (name.length > 99) name = name.substring(0, 99);

  var copied = sourceSheet.copyTo(ss).setName(name);
  ss.setActiveSheet(copied);
  ss.moveActiveSheet(ss.getSheets().length);
  copied.hideSheet();

  copyBackupToArchiveIfConfigured_(copied, name);
  return name;
}

function cleanupOldBackups_(ss, year, keepCount) {
  var prefix = getBackupSheetPrefix_(year);
  var backups = ss
    .getSheets()
    .map(function (s) { return s.getName(); })
    .filter(function (n) { return n.indexOf(prefix) === 0; })
    .sort();

  var removeCount = Math.max(0, backups.length - Math.max(1, keepCount || BACKUP_KEEP_COUNT));
  for (var i = 0; i < removeCount; i++) {
    var sh = ss.getSheetByName(backups[i]);
    if (sh) ss.deleteSheet(sh);
  }
}

function copyBackupToArchiveIfConfigured_(backupSheet, backupName) {
  var archiveId = PropertiesService.getScriptProperties().getProperty(BACKUP_ARCHIVE_ID_KEY);
  if (!archiveId) return;

  try {
    var archive = SpreadsheetApp.openById(archiveId);
    var targetName = getUniqueSheetName_(archive, backupName);
    var copied = backupSheet.copyTo(archive).setName(targetName);
    copied.hideSheet();
  } catch (_) {
    // Ignore archive-copy errors so primary backup flow never fails.
  }
}

function getUniqueSheetName_(ss, desired) {
  var name = String(desired || "BACKUP");
  if (!ss.getSheetByName(name)) return name;
  for (var i = 1; i <= 999; i++) {
    var next = name.substring(0, 90) + "_" + i;
    if (!ss.getSheetByName(next)) return next;
  }
  return name.substring(0, 80) + "_" + new Date().getTime();
}

function installDailyBackupTrigger_() {
  var fn = "scheduledDailyBackup";
  var all = ScriptApp.getProjectTriggers();
  for (var i = 0; i < all.length; i++) {
    var t = all[i];
    if (t.getHandlerFunction && t.getHandlerFunction() === fn) return;
  }

  ScriptApp.newTrigger(fn)
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();
}

function isBackupTriggerInstalled_() {
  var all = ScriptApp.getProjectTriggers();
  for (var i = 0; i < all.length; i++) {
    if (all[i].getHandlerFunction && all[i].getHandlerFunction() === "scheduledDailyBackup") {
      return true;
    }
  }
  return false;
}

function scheduledDailyBackup() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getOrCreateSpreadsheet_();
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      var m = String(sheets[i].getName()).match(/^TAHUN_(\d{4})$/);
      if (!m) continue;
      var year = m[1];
      maybeAutoBackup_(ss, sheets[i], year);
    }
  } finally {
    lock.releaseLock();
  }
}

function headersByType_(type) {
  if (type === "driver" || type === "helper") return DRIVER_HELPER_HEADERS;
  if (type === "transaksi") return TRANSAKSI_HEADERS;
  return LOG_HEADERS;
}

function writeYearSheet_(sheet, data, year) {
  sheet.clear();
  data = normalizePayload_(data);

  var leftCol = 1;   // A
  var rightCol = 17; // Q
  var logCol = 23;   // W

  var driverEnd = writeSectionBlock_(sheet, "driver", data.driver, year, 1, leftCol);
  var helperStart = driverEnd + 2;
  var helperEnd = writeSectionBlock_(sheet, "helper", data.helper, year, helperStart, leftCol);

  var transaksiEnd = writeSectionBlock_(sheet, "transaksi", data.transaksi, year, 1, rightCol);
  var logsEnd = writeSectionBlock_(sheet, "logs", data.logs, year, 1, logCol);

  var maxRow = Math.max(helperEnd, logsEnd, 1);
  var maxCol = Math.max(
    leftCol + DRIVER_HELPER_HEADERS.length - 1,
    rightCol + TRANSAKSI_HEADERS.length - 1,
    logCol + LOG_HEADERS.length - 1
  );

  applyYearSheetStyle_(sheet, maxRow, maxCol);
}

function writeSectionBlock_(sheet, type, items, year, startRow, startCol) {
  items = Array.isArray(items) ? items : [];
  var headers = headersByType_(type);
  var colCount = headers.length;

  sheet
    .getRange(startRow, startCol, 1, 2)
    .setValues([["__SECTION__", String(type || "").toUpperCase()]]);
  sheet.getRange(startRow + 1, startCol, 1, colCount).setValues([headers]);

  if (items.length > 0) {
    var out = [];
    for (var i = 0; i < items.length; i++) {
      out.push(toRowByType_(type, items[i], i, year));
    }
    sheet.getRange(startRow + 2, startCol, out.length, colCount).setValues(out);
  }

  var endRow = startRow + 1 + items.length;
  sheet
    .getRange(startRow, startCol, endRow - startRow + 1, colCount)
    .setBorder(true, true, true, true, true, true);

  return endRow;
}

function readYearSheet_(sheet, year) {
  var out = {
    driver: [],
    helper: [],
    transaksi: [],
    logs: []
  };

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return out;

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var markers = findSectionMarkers_(values);

  if (markers.driver) out.driver = readSectionBlock_(values, markers.driver, "driver", year);
  if (markers.helper) out.helper = readSectionBlock_(values, markers.helper, "helper", year);
  if (markers.transaksi) {
    out.transaksi = readSectionBlock_(values, markers.transaksi, "transaksi", year);
  }
  if (markers.logs) out.logs = readSectionBlock_(values, markers.logs, "logs", year);

  return out;
}

function findSectionMarkers_(values) {
  var markers = {};
  for (var r = 0; r < values.length; r++) {
    for (var c = 0; c < values[r].length; c++) {
      if (String(values[r][c] || "").trim() !== "__SECTION__") continue;
      var type = String(values[r][c + 1] || "").trim().toLowerCase();
      if (!type || markers[type]) continue;
      markers[type] = { row: r + 1, col: c + 1 };
    }
  }
  return markers;
}

function readSectionBlock_(values, marker, type, year) {
  var out = [];
  var cols = headersByType_(type).length;
  var startRow = marker.row + 2;
  var startCol = marker.col;

  for (var r = startRow; r <= values.length; r++) {
    var rowAll = values[r - 1];
    var firstCell = String(rowAll[startCol - 1] || "").trim();
    if (firstCell === "__SECTION__") break;

    var rowSlice = rowAll.slice(startCol - 1, startCol - 1 + cols);
    if (isEmptyRow_(rowSlice)) continue;

    var item = fromRowByType_(type, rowSlice, year);
    if (item) out.push(item);
  }

  return out;
}

function forceSectionHeader_(sheet, marker, type) {
  if (!marker) return;
  var headers = headersByType_(type);
  sheet.getRange(marker.row + 1, marker.col, 1, headers.length).setValues([headers]);
}

function readSectionHeader_(sheet, marker, type) {
  if (!marker) return [];
  var len = headersByType_(type).length;
  return sheet.getRange(marker.row + 1, marker.col, 1, len).getValues()[0];
}

function migrateYearSheetLayoutIfNeeded_(sheet, year) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return;

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var markers = findSectionMarkers_(values);
  if (!markers.transaksi || !markers.logs) return;

  var alreadyNew =
    Number(markers.transaksi.col) === 17 &&
    Number(markers.logs.col) === 23;

  if (alreadyNew) return;

  // Read old layout safely, then rewrite with the new layout engine.
  var data = readYearSheet_(sheet, year);
  writeYearSheet_(sheet, data, year);
}

function padRow_(row, maxCols) {
  var out = [];
  row = Array.isArray(row) ? row : [];
  for (var i = 0; i < maxCols; i++) out.push(i < row.length ? row[i] : "");
  return out;
}

function isEmptyRow_(row) {
  for (var i = 0; i < row.length; i++) {
    if (String(row[i] || "").trim() !== "") return false;
  }
  return true;
}

function applyYearSheetStyle_(sheet, lastRow, lastCol) {
  sheet.setFrozenRows(0);

  // Left side: member tables
  sheet.setColumnWidth(1, 85);   // A
  sheet.setColumnWidth(2, 240);  // B
  for (var c = 3; c <= 14; c++) sheet.setColumnWidth(c, 55); // C-N
  sheet.setColumnWidth(15, 90);  // O

  // Right side: transaksi + logs at Q
  sheet.setColumnWidth(17, 110); // Q
  sheet.setColumnWidth(18, 120); // R
  sheet.setColumnWidth(19, 220); // S
  sheet.setColumnWidth(20, 220); // T
  sheet.setColumnWidth(21, 120); // U
  sheet.setColumnWidth(23, 140); // W
  sheet.setColumnWidth(24, 140); // X
  sheet.setColumnWidth(25, 120); // Y
  sheet.setColumnWidth(26, 260); // Z

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  for (var r = 0; r < values.length; r++) {
    for (var c2 = 0; c2 < values[r].length; c2++) {
      if (String(values[r][c2] || "").trim() !== "__SECTION__") continue;

      var type = String(values[r][c2 + 1] || "").trim().toLowerCase();
      var width = headersByType_(type).length;
      var sr = r + 1;
      var sc = c2 + 1;

      sheet.getRange(sr, sc, 1, width).setFontWeight("bold").setBackground("#d9ead3");
      if (sr + 1 <= lastRow) {
        sheet
          .getRange(sr + 1, sc, 1, width)
          .setFontWeight("bold")
          .setHorizontalAlignment("center")
          .setBackground("#f1f3f4");
      }
    }
  }

}
function writeHeaders_(sheet, type) {
  var headers = headersByType_(type);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function ensureHeaders_(sheet, type) {
  var headers = headersByType_(type);
  var current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var mismatch = false;

  for (var i = 0; i < headers.length; i++) {
    if (String(current[i] || "") !== headers[i]) {
      mismatch = true;
      break;
    }
  }

  if (mismatch) writeHeaders_(sheet, type);
}

function writeTypedRows_(sheet, type, rows) {
  rows = Array.isArray(rows) ? rows : [];
  var normalizedRows = [];
  var year = extractYearFromSheetName_(sheet.getName());

  for (var i = 0; i < rows.length; i++) {
    normalizedRows.push(toRowByType_(type, rows[i], i, year));
  }

  var maxRows = sheet.getMaxRows();
  var maxCols = sheet.getMaxColumns();
  var headerCols = headersByType_(type).length;

  if (maxRows > 1) {
    sheet.getRange(2, 1, maxRows - 1, Math.max(maxCols, headerCols)).clearContent();
  }

  if (normalizedRows.length > 0) {
    sheet.getRange(2, 1, normalizedRows.length, headerCols).setValues(normalizedRows);
  }

  if (type === "driver" || type === "helper") {
    applyMemberSheetStyle_(sheet, normalizedRows.length);
  }
}

function readTypedRows_(sheet, type) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var cols = headersByType_(type).length;
  var values = sheet.getRange(2, 1, lastRow - 1, cols).getValues();
  var out = [];
  var year = extractYearFromSheetName_(sheet.getName());

  for (var i = 0; i < values.length; i++) {
    var item = fromRowByType_(type, values[i], year);
    if (item) out.push(item);
  }
  return out;
}

function toRowByType_(type, item, idx, year) {
  item = item || {};

  if (type === "driver" || type === "helper") {
    var yy = String(parseInt(year, 10) || new Date().getFullYear());
    var yearStatus = item.status && item.status[yy] ? item.status[yy] : {};
    var monthMarks = [];
    var totalPaid = 0;

    for (var m = 1; m <= 12; m++) {
      var paid = !!yearStatus[m];
      monthMarks.push(paid ? "\u2705" : "\u274C");
      if (paid) totalPaid++;
    }

    return [
      Number(idx + 1),
      String(item.nama || ""),
      monthMarks[0],
      monthMarks[1],
      monthMarks[2],
      monthMarks[3],
      monthMarks[4],
      monthMarks[5],
      monthMarks[6],
      monthMarks[7],
      monthMarks[8],
      monthMarks[9],
      monthMarks[10],
      monthMarks[11],
      totalPaid + "/12"
    ];
  }

  if (type === "transaksi") {
    return [
      String(item.tp || ""),
      normalizeDateToYmd_(item.d),
      String(item.p || ""),
      String(item.k || ""),
      Number(item.v || 0)
    ];
  }

  return [
    String(item.time || ""),
    String(item.editor || ""),
    String(item.aksi || ""),
    String(item.ket || "")
  ];
}

function fromRowByType_(type, row, year) {
  if (type === "driver" || type === "helper") {
    if (!row[1] && !row[2]) return null;

    // Backward compatibility: old 3-column format (id, nama, status_json).
    if (row[0] && row[1] && row[2] && String(row[2]).trim().indexOf("{") === 0) {
      var legacyStatus = {};
      try {
        legacyStatus = row[2] ? JSON.parse(String(row[2])) : {};
      } catch (_) {
        legacyStatus = {};
      }
      return {
        id: String(row[0] || ""),
        nama: String(row[1] || ""),
        status: legacyStatus
      };
    }

    var yy = String(year || new Date().getFullYear());
    var status = {};
    status[yy] = {};

    for (var m = 1; m <= 12; m++) {
      status[yy][m] = isPaidMark_(row[m + 1]);
    }

    try {
      if (!status[yy]) status[yy] = {};
    } catch (_) {
      status[yy] = {};
    }

    return {
      id: makeMemberId_(yy, row[1], row[0]),
      nama: String(row[1] || ""),
      status: status
    };
  }

  if (type === "transaksi") {
    if (!row[0] && !row[1] && !row[2] && !row[3] && !row[4]) return null;
    return {
      tp: String(row[0] || ""),
      d: normalizeDateToYmd_(row[1]),
      p: String(row[2] || ""),
      k: String(row[3] || ""),
      v: Number(row[4] || 0)
    };
  }

  if (!row[0] && !row[1] && !row[2] && !row[3]) return null;
  return {
    time: String(row[0] || ""),
    editor: String(row[1] || ""),
    aksi: String(row[2] || ""),
    ket: String(row[3] || "")
  };
}

function isPaidMark_(v) {
  var raw = String(v || "").trim();
  if (!raw) return false;

  var s = raw.toLowerCase();
  return (
    raw === "\u2705" ||
    raw === "\u2611" ||
    raw === "\u2714" ||
    raw === "\u2713" ||
    raw === "V" ||
    raw === "v" ||
    s === "true" ||
    s === "1" ||
    s === "ya" ||
    s === "yes" ||
    s === "lunas" ||
    s === "paid" ||
    s === "✅" ||
    s === "✔" ||
    s === "✓"
  );
}

function extractYearFromSheetName_(name) {
  var m = String(name || "").match(/_(\d{4})$/);
  if (!m) return new Date().getFullYear();
  return parseInt(m[1], 10);
}

function applyMemberSheetStyle_(sheet, rowCount) {
  var lastRow = Math.max(1, rowCount + 1);
  var lastCol = DRIVER_HELPER_HEADERS.length;

  var header = sheet.getRange(1, 1, 1, lastCol);
  header.setFontWeight("bold");
  header.setHorizontalAlignment("center");
  header.setBackground("#f1f3f4");

  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 55);   // NO
  sheet.setColumnWidth(2, 240);  // NAMA
  for (var c = 3; c <= 14; c++) sheet.setColumnWidth(c, 55); // JAN-DES
  sheet.setColumnWidth(15, 80);  // TOTAL

  if (rowCount > 0) {
    sheet.getRange(2, 1, rowCount, 1).setHorizontalAlignment("center");
    sheet.getRange(2, 2, rowCount, 1).setHorizontalAlignment("left");
    sheet.getRange(2, 3, rowCount, 12).setHorizontalAlignment("center");
    sheet.getRange(2, 15, rowCount, 1).setHorizontalAlignment("center");
  }

  sheet.getRange(1, 1, lastRow, lastCol).setBorder(
    true,
    true,
    true,
    true,
    true,
    true
  );
}

function makeMemberId_(year, nama, rowNo) {
  var safeName = String(nama || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return "ID-" + String(year || "") + "-" + String(Number(rowNo || 0)) + "-" + safeName;
}

function normalizeDateToYmd_(value) {
  if (value === null || value === undefined || value === "") return "";

  // Sheets can return Date objects for date-formatted cells.
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }

  var s = String(value).trim();
  if (!s) return "";

  // Already normalized.
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // Common slash format: dd/mm/yyyy or yyyy/mm/dd.
  var m = s.match(/^(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})$/);
  if (m) {
    var a = Number(m[1]), b = Number(m[2]), c = Number(m[3]);
    var y, mo, d;
    if (a > 31) {
      y = a; mo = b; d = c; // yyyy-mm-dd
    } else {
      y = c; mo = b; d = a; // dd-mm-yyyy
    }
    return [y, pad2_(mo), pad2_(d)].join("-");
  }

  // Fallback for long textual dates.
  var dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    return Utilities.formatDate(dt, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }

  return s;
}

function pad2_(n) {
  n = Number(n || 0);
  return n < 10 ? "0" + n : String(n);
}

function parsePostBody_(e) {
  var formPayload = e && e.parameter ? (e.parameter.payload || e.parameter.json || "") : "";
  if (formPayload) {
    var parsedForm = JSON.parse(formPayload);
    if (!parsedForm || typeof parsedForm !== "object") {
      throw new Error("Invalid form payload.");
    }
    return parsedForm;
  }

  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Empty request body.");
  }

  var text = e.postData.contents;
  var parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON payload.");
  }
  return parsed;
}

function normalizePayload_(payload) {
  payload = payload || {};
  return {
    driver: Array.isArray(payload.driver) ? payload.driver : [],
    helper: Array.isArray(payload.helper) ? payload.helper : [],
    transaksi: Array.isArray(payload.transaksi) ? payload.transaksi : [],
    logs: Array.isArray(payload.logs) ? payload.logs : []
  };
}

function jsonResponse_(obj) {
  var callback = sanitizeJsonpCallback_(ACTIVE_JSONP_CALLBACK);
  if (callback) {
    return ContentService.createTextOutput(
      callback + "(" + JSON.stringify(obj) + ");"
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getJsonpCallback_(e) {
  return (e && e.parameter && e.parameter.callback) || "";
}

function sanitizeJsonpCallback_(callback) {
  var value = String(callback || "").trim();
  if (!value) return "";
  if (!/^[A-Za-z_$][0-9A-Za-z_$.]{0,127}$/.test(value)) return "";
  return value;
}

function adminSetScriptProperties_(entries) {
  var list = Array.isArray(entries) ? entries : [];
  var props = PropertiesService.getScriptProperties();
  var count = 0;

  for (var i = 0; i < list.length; i++) {
    var item = list[i] || {};
    var key = String(item.key || "").trim();
    if (!key) continue;
    props.setProperty(key, String(item.value == null ? "" : item.value));
    count++;
  }

  return {
    ok: true,
    updated: count
  };
}

function adminGetHealthSummary_() {
  ensureBootstrapConfig_();
  var props = PropertiesService.getScriptProperties();
  return {
    ok: true,
    hasPin: !!props.getProperty(APP_PIN_KEY),
    pinValue: props.getProperty(APP_PIN_KEY) || "",
    fcmProjectId: props.getProperty(FCM_PROJECT_ID) || DEFAULT_FIREBASE_CONFIG.projectId,
    hasServiceAccountEmail: !!(props.getProperty(FCM_SA_CLIENT_EMAIL_KEY) || DEFAULT_SERVICE_ACCOUNT_EMAIL),
    hasServiceAccountPrivateKey: !!props.getProperty(FCM_SA_PRIVATE_KEY_KEY)
  };
}
