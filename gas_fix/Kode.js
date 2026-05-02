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
var MIDTRANS_SERVER_KEY = "midtrans_server_key";
var MIDTRANS_CLIENT_KEY = "midtrans_client_key";
var MIDTRANS_IS_PRODUCTION_KEY = "midtrans_is_production";
var DEFAULT_MIDTRANS_SERVER_KEY = "";
var DEFAULT_MIDTRANS_CLIENT_KEY = "";
var DEFAULT_MIDTRANS_IS_PRODUCTION = true;
var ACTIVE_JSONP_CALLBACK = "";
var WRITE_SESSION_TTL_SEC = 21600; // 6 hours
var BACKUP_LAST_KEY_PREFIX = "backup_last_";
var BACKUP_ARCHIVE_ID_KEY = "backup_archive_spreadsheet_id";
var BACKUP_KEEP_COUNT = 15;
var ALLOWED_EDITORS_KEY = "kas_allowed_editors";
var ALLOWED_EDITORS_SHEET_NAME = "allowed_editors";
var ALLOWED_EDITORS_CACHE_KEY = "allowed_editors_cache_v1";
var ALLOWED_EDITORS_CACHE_TTL_SEC = 300;
var DEFAULT_SPREADSHEET_ID = "10GWGUs4ILzb1Hb3tm3OFy_dcRXCQKHqSQ0zPa3YmfpY";
var DATA_TYPES = ["driver", "helper", "transaksi", "logs"];
var DEFAULT_APP_PIN = "";
var VERIFY_AUTH_RATE_LIMIT_WINDOW_SEC = 600;
var VERIFY_AUTH_MAX_ATTEMPTS = 5;
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
var MIDTRANS_SANDBOX_API_BASE = "https://api.sandbox.midtrans.com";
var MIDTRANS_PRODUCTION_API_BASE = "https://api.midtrans.com";
var MIDTRANS_SNAP_SANDBOX_BASE = "https://app.sandbox.midtrans.com";
var MIDTRANS_SNAP_PRODUCTION_BASE = "https://app.midtrans.com";

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
  "TOTAL",
  "META"
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
    if (action === "sheetInfo") return handleSheetInfo_(e);
    if (action === "sheetId") return handleSheetId_(e);
    if (action === "migrateYear") return handleMigrateYear_(e);
    if (action === "fixHeaders") return handleFixHeaders_(e);
    if (action === "backupYear") return handleBackupYear_(e);
    if (action === "verifyAuth") {
      return jsonResponse_({ ok: false, error: "Gunakan POST untuk verifyAuth." });
    }
    if (action === "adminHealth") return handleAdminHealth_(e);
    if (action === "adminSelfTest") return handleAdminSelfTest_(e);
    if (action === "backupConfig") return handleBackupConfig_(e);
    if (action === "setBackupArchive") return handleSetBackupArchive_(e);
    if (action === "installBackupTrigger") return handleInstallBackupTrigger_(e);
    if (action === "fcmConfig") return handleFcmConfig_();
    if (action === "fcmHealth") return handleFcmHealth_(e);
    if (action === "fcmSw") return handleFcmSw_();
    if (action === "saveFcmToken") {
      return jsonResponse_({ ok: false, error: "Gunakan POST untuk saveFcmToken." });
    }
    if (action === "testFcm") {
      return jsonResponse_({ ok: false, error: "Gunakan POST untuk testFcm." });
    }
    if (action === "createMidtransQris") return handleCreateMidtransQris_(e && e.parameter ? e.parameter : {}, e);
    if (action === "midtransStatus") return handleMidtransStatus_(e);
    if (action === "midtransHealth") return handleMidtransHealth_(e);
    if (action === "midtransClientKey") return handleMidtransClientKey_(e);
    if (action === "midtransDebug") return handleMidtransDebug_(e);
    if (action === "adminPendingSnapshot") return handleAdminPendingSnapshot_(e);
    if (action === "adminPendingAction") return handleAdminPendingAction_(e);
    if (action === "backupProperties") return handleBackupProperties_(e);
    if (action === "adminScriptInfo") return handleAdminScriptInfo_(e);
    if (action === "adminMovePropsToFirestore") return handleAdminMovePropsToFirestore_(e);

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
  var payload = {};
  try {
    payload = parsePostBody_(e);

    if (payload.action === "verifyAuth") {
      return maybeWrapPostMessageResponse_(handleVerifyAuthPayload_(payload, e), payload);
    }
    if (payload.action === "saveFcmToken") {
      return maybeWrapPostMessageResponse_(handleSaveFcmToken_(payload, e), payload);
    }
    if (payload.action === "testFcm") {
      return maybeWrapPostMessageResponse_(handleTestFcmPayload_(payload, e), payload);
    }
    if (isMidtransNotificationPayload_(payload)) {
      return handleMidtransNotification_(payload);
    }
    if (payload.action === "createMidtransQris") {
      return handleCreateMidtransQris_(payload, e);
    }
    if (payload.action === "toggleMemberStatus") {
      return maybeWrapPostMessageResponse_(handleToggleMemberStatus_(payload, e), payload);
    }
    if (payload.action === "submitPendingPayment") {
      return handleSubmitPendingPayment_(payload, e);
    }
    if (payload.action === "cancelMemberPending") {
      return handleCancelMemberPending_(payload, e);
    }
    if (payload.action === "adminSetScriptProperties") {
      return handleAdminSetScriptProperties_(payload, e);
    }
    validateWriteAuth_(payload, e);
    var year = getTargetYear_(payload, e);
    ensureYearData_(year);
    var beforeData = readYearData_(year);

    var normalized = normalizePayload_(payload);
    var editor = normalizeEditorName_((payload && payload.editor) || (e && e.parameter && e.parameter.editor) || "");
    if (editor) {
      normalized.logs = (normalized.logs || []).map(function (logEntry) {
        var entry = logEntry || {};
        if (!String(entry.editor || "").trim()) {
          entry.editor = editor;
        }
        return entry;
      });
    }
    assertExpectedYearRevision_(payload, beforeData, year);
    writeYearData_(year, normalized);
    maybeBroadcastFcmAfterWrite_(beforeData, normalized, payload, year);

    return maybeWrapPostMessageResponse_({
      ok: true,
      year: Number(year),
      revision: buildYearRevision_(normalized)
    }, payload);
  } catch (err) {
    if (err && err.details) {
      return maybeWrapPostMessageResponse_(err.details, payload);
    }
    return maybeWrapPostMessageResponse_({
      ok: false,
      error: err && err.message ? err.message : String(err)
    }, payload);
  }
}

function handleSubmitPendingPayment_(payload, e) {
  var year = getTargetYear_(payload, e);
  ensureYearData_(year);
  var data = readYearData_(year);
  var result = applyPendingPaymentSubmission_(data, payload, year);
  if (!result.ok) {
    return jsonResponse_(result);
  }

  writeYearData_(year, data);
  return jsonResponse_({
    ok: true,
    year: year,
    memberId: result.memberId,
    months: result.months
  });
}

function handleAdminPendingSnapshot_(e) {
  var year = getYearFromRequest_(e);
  ensureYearData_(year);
  var data = readYearData_(year);
  return jsonResponse_(buildPendingPaymentSnapshot_(data, year));
}

function handleToggleMemberStatus_(payload, e) {
  validateWriteAuth_(payload, e);
  var year = getTargetYear_(payload, e);
  ensureYearData_(year);
  var data = readYearData_(year);
  assertExpectedYearRevision_(payload, data, year);
  var result = applyToggleMemberStatus_(data, payload, year);
  if (!result.ok) {
    return jsonResponse_(result);
  }
  writeYearData_(year, data);
  return jsonResponse_({
    ok: true,
    year: Number(year),
    revision: buildYearRevision_(data),
    data: buildYearDataResponse_(year, readYearData_(year))
  });
}

function handleCancelMemberPending_(payload, e) {
  var year = getTargetYear_(payload, e);
  ensureYearData_(year);
  var data = readYearData_(year);
  var result = applyCancelMemberPending_(data, payload, year);
  if (!result.ok) {
    return jsonResponse_(result);
  }
  if (result.changed) {
    writeYearData_(year, data);
  }
  return jsonResponse_({
    ok: true,
    year: year,
    memberId: result.memberId,
    months: result.months,
    data: buildYearDataResponse_(year, readYearData_(year))
  });
}

function handleAdminPendingAction_(e) {
  var params = (e && e.parameter) || {};
  validateWriteAuth_(params, e);
  var year = getYearFromRequest_(e);
  ensureYearData_(year);
  var data = readYearData_(year);
  var result = applyAdminPendingAction_(data, params, year);
  if (!result.ok) {
    return jsonResponse_(result);
  }
  if (result.changed) {
    writeYearData_(year, data);
  }
  return jsonResponse_(buildPendingPaymentSnapshot_(result.changed ? readYearData_(year) : data, year));
}

function handleMidtransHealth_(e) {
  var config = assertMidtransConfigured_();
  var health = checkMidtransHealth_(config);
  return jsonResponse_(health);
}

function handleMidtransClientKey_(e) {
  try {
    var config = assertMidtransConfigured_();
    return jsonResponse_({
      ok: true,
      clientKey: config.clientKey,
      isProduction: config.isProduction
    });
  } catch (err) {
    return jsonResponse_({
      ok: false,
      error: (err && err.message) ? err.message : String(err)
    });
  }
}

function handleMidtransDebug_(e) {
  var serverInfo = inspectPropSource_(MIDTRANS_SERVER_KEY);
  var clientInfo = inspectPropSource_(MIDTRANS_CLIENT_KEY);
  var modeInfo = inspectPropSource_(MIDTRANS_IS_PRODUCTION_KEY);
  var config = getMidtransConfig_();
  return jsonResponse_({
    ok: true,
    environment: config && config.isProduction ? "production" : "sandbox",
    apiBase: String(config && config.apiBase || ""),
    serverKey: maskSecretForDebug_(serverInfo.value),
    clientKey: maskSecretForDebug_(clientInfo.value),
    isProductionRaw: String(modeInfo.value || ""),
    sources: {
      serverKey: serverInfo.source,
      clientKey: clientInfo.source,
      isProduction: modeInfo.source
    }
  });
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
      url: buildNotificationTargetUrl_(meta.view, meta.focusTarget, meta.openPanel)
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
    title: "ðŸ”” Aktivitas Aplikasi",
    body: ket || "Ada aktivitas baru di aplikasi.",
    tag: "delta8-activity-general",
    view: "transaksi",
    focusTarget: "table-transaksi",
    openPanel: "",
    isFromLog: !!logEntry
  };

  if (!aksi) return meta;

  if (aksi === "TAMBAH TRANSAKSI") {
    meta.title = "ðŸ’¸ Tambah Transaksi";
    meta.tag = "delta8-activity-transaksi-add";
    return meta;
  }
  if (aksi === "EDIT TRANSAKSI") {
    meta.title = "ðŸ“ Edit Transaksi";
    meta.tag = "delta8-activity-transaksi-edit";
    return meta;
  }
  if (aksi === "HAPUS TRANSAKSI") {
    meta.title = "ðŸ—‘ï¸ Hapus Transaksi";
    meta.tag = "delta8-activity-transaksi-delete";
    return meta;
  }
  if (aksi === "TAMBAH ANGGOTA") {
    meta.title = "ðŸ‘¥ Tambah Anggota";
    meta.tag = "delta8-activity-member-add";
    meta.view = "driver";
    meta.focusTarget = "grid-driver";
    return meta;
  }
  if (aksi === "EDIT ANGGOTA") {
    meta.title = "ðŸªª Edit Anggota";
    meta.tag = "delta8-activity-member-edit";
    meta.view = "driver";
    meta.focusTarget = "grid-driver";
    return meta;
  }
  if (aksi === "HAPUS ANGGOTA") {
    meta.title = "âŒ Hapus Anggota";
    meta.tag = "delta8-activity-member-delete";
    meta.view = "driver";
    meta.focusTarget = "grid-driver";
    return meta;
  }
  if (aksi === "IURAN") {
    meta.title =
      ket.indexOf("LUNAS") !== -1 ? "âœ… Iuran Lunas" : "ðŸ’° Update Iuran";
    meta.tag = "delta8-activity-iuran";
    meta.view = "driver";
    meta.focusTarget = "grid-driver";
    return meta;
  }
  if (aksi === "SYSTEM") {
    meta.title =
      ket.indexOf("BERSIHKAN") !== -1 ? "ðŸ§¹ Bersihkan Log" : "âš™ï¸ Aktivitas Sistem";
    meta.tag = "delta8-activity-system";
    meta.focusTarget = "log-list-table";
    meta.openPanel = "log-col";
    return meta;
  }

  meta.title = "ðŸ”” " + normalizeNotificationText_(aksi, 70);
  meta.tag = "delta8-activity-custom";
  return meta;
}

function buildNotificationTargetUrl_(view, focusTarget, openPanel) {
  var targetView = String(view || "").trim().toLowerCase();
  var params = [];
  if (targetView) {
    params.push("view=" + encodeURIComponent(targetView));
  }
  if (focusTarget) {
    params.push("focus=" + encodeURIComponent(String(focusTarget)));
  }
  if (openPanel) {
    params.push("panel=" + encodeURIComponent(String(openPanel)));
  }
  return DEFAULT_WEB_APP_URL + (params.length ? "?" + params.join("&") : "");
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

function backupScriptProperties_() {
  try {
    var spreadsheetId = PropertiesService.getScriptProperties().getProperty(SPREADSHEET_ID_KEY);
    if (!spreadsheetId) return false;

    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName("properties_backup");
    if (!sheet) {
      sheet = spreadsheet.insertSheet("properties_backup");
      sheet.hideSheet();
    }

    var props = PropertiesService.getScriptProperties().getProperties();
    var data = [];
    for (var key in props) {
      if (props.hasOwnProperty(key)) {
        data.push([key, props[key]]);
      }
    }

    // Clear existing data
    sheet.clear();
    // Write headers
    sheet.getRange(1, 1, 1, 2).setValues([["KEY", "VALUE"]]);
    // Write data
    if (data.length > 0) {
      sheet.getRange(2, 1, data.length, 2).setValues(data);
    }

    return true;
  } catch (err) {
    Logger.log("Failed to backup properties: " + err);
    return false;
  }
}

function restoreScriptProperties_() {
  try {
    var props = PropertiesService.getScriptProperties();
    var spreadsheetId = props.getProperty(SPREADSHEET_ID_KEY) || DEFAULT_SPREADSHEET_ID;
    if (!spreadsheetId) return false;

    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName("properties_backup");
    if (!sheet) return false;

    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return false; // No data besides header

    for (var i = 1; i < data.length; i++) { // Skip header
      var key = data[i][0];
      var value = data[i][1];
      var existing = key ? props.getProperty(key) : "";
      if (key && value !== undefined && !String(existing || "").trim()) {
        props.setProperty(key, value);
      }
    }

    return true;
  } catch (err) {
    Logger.log("Failed to restore properties: " + err);
    return false;
  }
}

function ensureBootstrapConfig_() {
  var props = PropertiesService.getScriptProperties();

  if (!props.getProperty(SPREADSHEET_ID_KEY) && DEFAULT_SPREADSHEET_ID) {
    props.setProperty(SPREADSHEET_ID_KEY, DEFAULT_SPREADSHEET_ID);
  }

  // Try to restore properties from backup first
  restoreScriptProperties_();

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
  var requests = [];
  var requestRows = [];
  for (var i = 0; i < rows.length; i++) {
    var token = rows[i] && rows[i].token ? String(rows[i].token) : "";
    if (!token) continue;
    requests.push(buildFcmSendRequest_(projectId, accessToken, token, title, body, dataObj));
    requestRows.push(rows[i]);
  }
  if (!requests.length) {
    setLastFcmSendStatus_({
      ok: false,
      reason: "no_valid_tokens",
      attempted: rows.length,
      delivered: 0,
      kept: 0,
      updatedAt: new Date().toISOString()
    });
    return;
  }

  var responses = [];
  try {
    responses = UrlFetchApp.fetchAll(requests);
  } catch (err) {
    responses = [];
    for (var j = 0; j < requests.length; j++) {
      responses.push(UrlFetchApp.fetch(requests[j].url, toUrlFetchOptions_(requests[j])));
    }
  }

  for (var k = 0; k < requestRows.length; k++) {
    var sendResult = normalizeFcmSendResponse_(responses[k]);
    var code = sendResult.code;
    var txt = sendResult.text;
    // Keep valid tokens, drop invalid/unregistered.
    if (
      code >= 200 &&
      code < 300 &&
      txt.indexOf('"name"') !== -1
    ) {
      delivered++;
      keep.push(requestRows[k]);
      results.push({ ok: true, code: code });
      continue;
    }
    if (
      txt.indexOf("UNREGISTERED") === -1 &&
      txt.indexOf("INVALID_ARGUMENT") === -1
    ) {
      keep.push(requestRows[k]);
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

function buildFcmSendRequest_(projectId, accessToken, token, title, body, dataObj) {
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

  return {
    url: url,
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + accessToken },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
}

function toUrlFetchOptions_(request) {
  return {
    method: request.method,
    contentType: request.contentType,
    headers: request.headers,
    payload: request.payload,
    muteHttpExceptions: request.muteHttpExceptions
  };
}

function normalizeFcmSendResponse_(resp) {
  if (!resp) {
    return {
      code: 0,
      text: "no_response"
    };
  }
  return {
    code: resp.getResponseCode(),
    text: resp.getContentText() || ""
  };
}

function sendFcmToToken_(projectId, accessToken, token, title, body, dataObj) {
  var request = buildFcmSendRequest_(projectId, accessToken, token, title, body, dataObj);
  var resp = UrlFetchApp.fetch(request.url, {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + accessToken },
    payload: request.payload,
    muteHttpExceptions: true
  });
  return normalizeFcmSendResponse_(resp);
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

function getFirestoreAccessToken_(clientEmail, privateKeyRaw) {
  var privateKey = String(privateKeyRaw || "").replace(/\\n/g, "\n");
  var nowSec = Math.floor(new Date().getTime() / 1000);
  var header = {
    alg: "RS256",
    typ: "JWT"
  };
  var claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/datastore",
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

function handleFcmHealth_(e) {
  validateActionAuth_(e);
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
  validateWriteAuth_(payload, e);
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
  return jsonResponse_(handleTestFcmPayload_(
    {
      authToken: (e && e.parameter && e.parameter.authToken) || "",
      token: (e && e.parameter && e.parameter.token) || "",
      editor: (e && e.parameter && e.parameter.editor) || "",
      deviceId: (e && e.parameter && e.parameter.deviceId) || "",
      title: (e && e.parameter && e.parameter.title) || "",
      body: (e && e.parameter && e.parameter.body) || ""
    },
    e
  ));
}

function handleTestFcmPayload_(payload, e) {
  validateWriteAuth_(payload, e);
  var cfg = getFirestoreConfig_();
  if (!cfg.projectId || !cfg.clientEmail || !cfg.privateKey) {
    return { ok: false, error: "Konfigurasi FCM backend belum lengkap." };
  }

  var token = String((payload && payload.token) || "").trim();
  if (token.length < 20) {
    return { ok: false, error: "Invalid FCM token." };
  }

  var title = truncateText_(String((payload && payload.title) || "Tes Notifikasi Delta 8"), 120);
  var body = truncateText_(String((payload && payload.body) || "Kalau pesan ini masuk, FCM sudah aktif di perangkat ini."), 240);
  var accessToken = getFcmAccessToken_(cfg.clientEmail, cfg.privateKey);
  if (!accessToken) {
    return { ok: false, error: "Gagal mendapatkan access token FCM." };
  }

  var result = sendFcmToToken_(cfg.projectId, accessToken, token, title, body, {
    link: DEFAULT_WEB_APP_URL,
    title: title,
    body: body
  });
  setLastFcmSendStatus_({
    ok: result && result.code >= 200 && result.code < 300,
    code: result ? result.code : 0,
    sentAt: new Date().toISOString(),
    tokenTail: token.slice(-12)
  });

  return {
    ok: !!(result && result.code >= 200 && result.code < 300),
    code: result ? result.code : 0,
    response: result ? truncateText_(result.text, 500) : ""
  };
}

function handleBackupProperties_(e) {
  validateActionAuth_(e);
  var success = backupScriptProperties_();
  return jsonResponse_({
    ok: success,
    message: success ? "Properties backed up successfully" : "Failed to backup properties"
  });
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
  return jsonResponse_(buildYearDataResponse_(year, data));
}

function handleEnsureYear_(e) {
  var year = getYearFromRequest_(e);
  ensureYearData_(year);
  setActiveYear_(year);
  return jsonResponse_(buildYearDataResponse_(year, readYearData_(year)));
}

function handleSheetInfo_(e) {
  validateActionAuth_(e);
  var info = getSpreadsheetInfo_();
  return jsonResponse_({
    ok: true,
    spreadsheetId: info.id,
    spreadsheetUrl: info.url
  });
}

function handleSheetId_(e) {
  validateActionAuth_(e);
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
  return jsonResponse_(handleVerifyAuthPayload_(
    {
      pin: (e && e.parameter && e.parameter.pin) || "",
      editor: (e && e.parameter && e.parameter.editor) || "",
      deviceId: (e && e.parameter && e.parameter.deviceId) || ""
    },
    e
  ));
}

function handleVerifyAuthPayload_(payload, e) {
  var pin = (payload && payload.pin) || "";
  var editor = normalizeEditorName_((payload && payload.editor) || "");
  var deviceId = normalizeDeviceId_((payload && payload.deviceId) || "");
  var rateLimitKey = buildVerifyAuthRateLimitKey_(editor, deviceId);

  if (isVerifyAuthRateLimited_(rateLimitKey)) {
    return {
      ok: false,
      error: "Terlalu banyak percobaan verifikasi. Tunggu beberapa menit lalu coba lagi."
    };
  }

  if (editor.length < 2) {
    noteVerifyAuthFailure_(rateLimitKey);
    return { ok: false, error: "Nama editor minimal 2 karakter." };
  }

  var expectedPin = getPropWithFirestoreFallback_(APP_PIN_KEY);
  if (!expectedPin) {
    return { ok: false, error: "PIN belum dikonfigurasi di backend." };
  }
  if (String(expectedPin) === "0000") {
    return { ok: false, error: "PIN backend masih default dan harus diganti dulu." };
  }

  if (String(pin) !== String(expectedPin)) {
    noteVerifyAuthFailure_(rateLimitKey);
    return { ok: false, error: "PIN salah." };
  }

  if (!isEditorAllowed_(editor)) {
    noteVerifyAuthFailure_(rateLimitKey);
    return {
      ok: false,
      error: "Editor tidak terdaftar di spreadsheet allowed_editors."
    };
  }

  clearVerifyAuthFailures_(rateLimitKey);
  var writeToken = issueWriteSessionToken_(editor.toUpperCase(), deviceId);
  return {
    ok: true,
    editor: editor.toUpperCase(),
    deviceId: deviceId,
    writeToken: writeToken,
    expiresInSec: WRITE_SESSION_TTL_SEC
  };
}

function handleBackupConfig_(e) {
  validateActionAuth_(e);
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

function handleAdminSelfTest_(e) {
  validateActionAuth_(e);
  return jsonResponse_(runAdminSelfTest_());
}

function handleAdminSetScriptProperties_(payload, e) {
  validateAdminPayloadAuth_(payload, e);
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
  validateAdminAuth_((e && e.parameter && e.parameter.authToken) || "");
}

function validateAdminPayloadAuth_(payload, e) {
  validateAdminAuth_(
    (payload && payload.authToken) ||
      (e && e.parameter && e.parameter.authToken) ||
      ""
  );
}

function validateWriteAuth_(payload, e) {
  var provided =
    (payload && payload.authToken) ||
    (e && e.parameter && e.parameter.authToken) ||
    "";
  var editor =
    (payload && payload.editor) ||
    (e && e.parameter && e.parameter.editor) ||
    "";
  if (!editor || normalizeEditorName_(editor).length < 2) {
    throw new Error("Unauthorized: editor harus disertakan.");
  }

  if (!isEditorAllowed_(editor)) {
    throw new Error("Unauthorized: editor tidak terdaftar.");
  }

  if (
    !isValidWriteSessionToken_(provided, {
      editor: editor,
      deviceId:
        (payload && payload.deviceId) ||
        (e && e.parameter && e.parameter.deviceId) ||
        ""
    })
  ) {
    throw new Error("Unauthorized: write session tidak valid.");
  }
}

function validateAdminAuth_(provided) {
  var secret = getApiSecret_();
  var p = String(provided || "").trim();
  if (!secret || p !== String(secret)) {
    throw new Error("Unauthorized: admin auth required.");
  }
}

function getApiSecret_() {
  var value = PropertiesService.getScriptProperties().getProperty(API_SECRET_KEY);
  if (value) return value;
  var secureProps = getSecurePropsFromFirestore_();
  return secureProps && secureProps[API_SECRET_KEY] ? String(secureProps[API_SECRET_KEY]) : "";
}

function normalizeEditorName_(value) {
  return String(value || "").trim().toUpperCase();
}

function getAllowedEditors_() {
  var cachedEditors = getAllowedEditorsFromCache_();
  if (cachedEditors.length) return cachedEditors;

  try {
    var ss = getOrCreateSpreadsheet_();
    var sheet = ensureAllowedEditorsSheet_(ss);
    var editorsFromSheet = readAllowedEditorsFromSheet_(sheet);
    if (editorsFromSheet.length) {
      cacheAllowedEditors_(editorsFromSheet);
      return editorsFromSheet;
    }
  } catch (err) {
    Logger.log("getAllowedEditors_: failed reading sheet, fallback ke script properties: " + err);
  }

  var propEditors = getAllowedEditorsFromProperties_();
  cacheAllowedEditors_(propEditors);
  return propEditors;
}

function isEditorAllowed_(editor) {
  var normalized = normalizeEditorName_(editor);
  if (!normalized) return false;
  var allowed = getAllowedEditors_();
  return allowed.indexOf(normalized) !== -1;
}

function normalizeDeviceId_(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 80);
}

function buildVerifyAuthRateLimitKey_(editor, deviceId) {
  var normalizedEditor = normalizeEditorName_(editor || "");
  var normalizedDeviceId = normalizeDeviceId_(deviceId || "");
  return "verify_auth_fail_" + (normalizedDeviceId || normalizedEditor || "anonymous");
}

function getVerifyAuthFailureCount_(key) {
  if (!key) return 0;
  var cache = CacheService.getScriptCache();
  var raw = cache.get(key);
  var count = parseInt(raw, 10);
  return count > 0 ? count : 0;
}

function isVerifyAuthRateLimited_(key) {
  return getVerifyAuthFailureCount_(key) >= VERIFY_AUTH_MAX_ATTEMPTS;
}

function noteVerifyAuthFailure_(key) {
  if (!key) return 0;
  var cache = CacheService.getScriptCache();
  var next = getVerifyAuthFailureCount_(key) + 1;
  cache.put(key, String(next), VERIFY_AUTH_RATE_LIMIT_WINDOW_SEC);
  return next;
}

function clearVerifyAuthFailures_(key) {
  if (!key) return;
  CacheService.getScriptCache().remove(key);
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
    throw new Error("Sesi otorisasi sementara tidak tersedia. Coba lagi.");
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
  var data = readYearSheet_(sheet, year);
  if (cleanupExpiredGatewayPayments_(data, year)) {
    writeYearSheet_(sheet, normalizePayload_(data), year);
  }
  return data;
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

  ensureAllowedEditorsSheet_(ss);

  return ss;
}

function ensureAllowedEditorsSheet_(ss) {
  var sheet = ss.getSheetByName(ALLOWED_EDITORS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(ALLOWED_EDITORS_SHEET_NAME);
  }

  var legacyEditors = [];
  if (sheet.getLastRow() >= 1) {
    var sample = sheet.getRange(1, 1, 1, Math.min(2, Math.max(1, sheet.getLastColumn()))).getValues()[0];
    var hasHeader =
      normalizeEditorName_(sample[0]) === "NAMA EDITOR" &&
      normalizeEditorName_(sample[1]) === "STATUS";
    if (!hasHeader) {
      legacyEditors = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues()
        .map(function (row) {
          return normalizeEditorName_(row[0]);
        })
        .filter(function (editor, index, arr) {
          return !!editor && arr.indexOf(editor) === index;
        });
    }
  }

  sheet.setFrozenRows(1);
  if (sheet.getMaxColumns() < 4) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 4 - sheet.getMaxColumns());
  }
  sheet.getRange(1, 1, 1, 4).setValues([["NAMA EDITOR", "STATUS", "TERDAFTAR PADA", "CATATAN"]]);

  var currentEditors = readAllowedEditorsFromSheet_(sheet);
  if (!currentEditors.length && legacyEditors.length) {
    writeAllowedEditorsToSheet_(sheet, legacyEditors, "Migrasi legacy");
    currentEditors = legacyEditors.slice();
  }
  if (currentEditors.length) {
    PropertiesService.getScriptProperties().setProperty(
      ALLOWED_EDITORS_KEY,
      JSON.stringify(currentEditors)
    );
    cacheAllowedEditors_(currentEditors);
    return sheet;
  }

  var seeded = getAllowedEditorsFromProperties_();
  if (!seeded.length) {
    seeded = collectEditorsFromLogs_(ss);
  }

  if (seeded.length) {
    writeAllowedEditorsToSheet_(sheet, seeded, "Seed otomatis");
    PropertiesService.getScriptProperties().setProperty(
      ALLOWED_EDITORS_KEY,
      JSON.stringify(seeded)
    );
    cacheAllowedEditors_(seeded);
  }

  return sheet;
}

function readAllowedEditorsFromSheet_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  var out = [];

  for (var i = 0; i < values.length; i++) {
    var name = normalizeEditorName_(values[i][0]);
    var status = normalizeEditorName_(values[i][1] || "AKTIF");
    if (!name) continue;
    if (!status || status === "AKTIF") out.push(name);
  }

  return out.filter(function (name, index, arr) {
    return arr.indexOf(name) === index;
  });
}

function writeAllowedEditorsToSheet_(sheet, editors, note) {
  editors = Array.isArray(editors) ? editors : [];
  var normalized = editors
    .map(function (editor) {
      return normalizeEditorName_(editor);
    })
    .filter(function (editor, index, arr) {
      return !!editor && arr.indexOf(editor) === index;
    });

  if (sheet.getMaxRows() > 1) {
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, 4).clearContent();
  }

  if (!normalized.length) return;

  var now = new Date().toISOString();
  var rows = normalized.map(function (editor) {
    return [editor, "AKTIF", now, String(note || "")];
  });
  sheet.getRange(2, 1, rows.length, 4).setValues(rows);
}

function getAllowedEditorsFromProperties_() {
  var raw = PropertiesService.getScriptProperties().getProperty(ALLOWED_EDITORS_KEY) || "[]";
  var list = [];
  try {
    list = JSON.parse(raw);
  } catch (err) {
    list = [];
  }
  if (!Array.isArray(list)) list = [];
  return list
    .map(function (value) {
      return normalizeEditorName_(value);
    })
    .filter(function (value, index, arr) {
      return !!value && arr.indexOf(value) === index;
    });
}

function getAllowedEditorsFromCache_() {
  try {
    var raw = CacheService.getScriptCache().get(ALLOWED_EDITORS_CACHE_KEY);
    if (!raw) return [];
    var list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list
      .map(function (value) {
        return normalizeEditorName_(value);
      })
      .filter(function (value, index, arr) {
        return !!value && arr.indexOf(value) === index;
      });
  } catch (err) {
    return [];
  }
}

function cacheAllowedEditors_(editors) {
  try {
    if (!Array.isArray(editors)) editors = [];
    CacheService.getScriptCache().put(
      ALLOWED_EDITORS_CACHE_KEY,
      JSON.stringify(editors),
      ALLOWED_EDITORS_CACHE_TTL_SEC
    );
  } catch (err) {}
}

function collectEditorsFromLogs_(ss) {
  var out = [];
  var sheets = ss.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var match = String(sheet.getName() || "").match(/^TAHUN_(\d{4})$/);
    if (!match) continue;

    var data = readYearSheet_(sheet, match[1]);
    var logs = (data && data.logs) || [];
    for (var j = 0; j < logs.length; j++) {
      var editor = normalizeEditorName_((logs[j] && logs[j].editor) || "");
      if (editor && out.indexOf(editor) === -1) out.push(editor);
    }
  }

  return out;
}

function setMetaSheet_(ss) {
  var first = ss.getSheets()[0];
  first.setName("_meta");
  first.clear();
  first.getRange(1, 1, 4, 2).setValues([
    ["app", "Data Uang KAS Driver Helper DELTA 8"],
    ["createdAt", new Date().toISOString()],
    ["storage", "Google Sheets"],
    ["note", "Data per tahun disimpan pada sheet driver/helper/transaksi/logs, akses editor di sheet allowed_editors"]
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
  data = normalizePayload_(data);
  var previousLastRow = Math.max(sheet.getLastRow(), 1);
  var previousLastCol = Math.max(sheet.getLastColumn(), 1);
  var layout = buildYearSheetLayout_(data, year);
  var clearRows = Math.max(previousLastRow, layout.maxRow);
  var clearCols = Math.max(previousLastCol, layout.maxCol);

  ensureSheetCapacity_(sheet, clearRows, clearCols);
  clearSheetArea_(sheet, clearRows, clearCols);

  for (var i = 0; i < layout.sections.length; i++) {
    writeSectionBlock_(sheet, layout.sections[i]);
  }

  applyYearSheetStyle_(sheet, layout.maxRow, layout.maxCol);
}

function buildYearSheetLayout_(data, year) {
  var leftCol = 1;   // A
  var rightCol = 18; // R
  var logCol = 24;   // X
  var sections = [];

  var driverSection = buildSectionBlock_(1, leftCol, "driver", data.driver, year);
  sections.push(driverSection);

  var helperSection = buildSectionBlock_(
    driverSection.endRow + 2,
    leftCol,
    "helper",
    data.helper,
    year
  );
  sections.push(helperSection);

  var transaksiSection = buildSectionBlock_(1, rightCol, "transaksi", data.transaksi, year);
  sections.push(transaksiSection);

  var logsSection = buildSectionBlock_(1, logCol, "logs", data.logs, year);
  sections.push(logsSection);

  return {
    sections: sections,
    maxRow: Math.max(helperSection.endRow, logsSection.endRow, 1),
    maxCol: Math.max(
      leftCol + DRIVER_HELPER_HEADERS.length - 1,
      rightCol + TRANSAKSI_HEADERS.length - 1,
      logCol + LOG_HEADERS.length - 1
    )
  };
}

function buildSectionBlock_(startRow, startCol, type, items, year) {
  items = Array.isArray(items) ? items : [];
  var headers = headersByType_(type);
  var matrix = [];
  matrix.push(["__SECTION__", String(type || "").toUpperCase()]);
  matrix.push(headers);

  for (var i = 0; i < items.length; i++) {
    matrix.push(toRowByType_(type, items[i], i, year));
  }

  return {
    row: startRow,
    col: startCol,
    width: headers.length,
    height: matrix.length,
    endRow: startRow + matrix.length - 1,
    matrix: matrix
  };
}

function writeSectionBlock_(sheet, section) {
  if (!section || !section.matrix || !section.matrix.length) return 0;
  var normalized = [];
  for (var i = 0; i < section.matrix.length; i++) {
    normalized.push(padRow_(section.matrix[i], section.width));
  }

  sheet
    .getRange(section.row, section.col, section.height, section.width)
    .setValues(normalized)
    .setBorder(true, true, true, true, true, true);

  return section.endRow;
}

function ensureSheetCapacity_(sheet, rows, cols) {
  rows = Math.max(1, Number(rows || 0));
  cols = Math.max(1, Number(cols || 0));
  var currentRows = sheet.getMaxRows();
  var currentCols = sheet.getMaxColumns();

  if (currentRows < rows) {
    sheet.insertRowsAfter(currentRows, rows - currentRows);
  }
  if (currentCols < cols) {
    sheet.insertColumnsAfter(currentCols, cols - currentCols);
  }
}

function clearSheetArea_(sheet, rows, cols) {
  rows = Math.max(1, Number(rows || 0));
  cols = Math.max(1, Number(cols || 0));
  sheet.getRange(1, 1, rows, cols).clear();
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
    Number(markers.transaksi.col) === 18 &&
    Number(markers.logs.col) === 24;

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

  // Right side: transaksi + logs after the hidden META column
  sheet.setColumnWidth(16, 2);   // P (META helper)
  sheet.hideColumns(16);
  sheet.setColumnWidth(18, 110); // R
  sheet.setColumnWidth(19, 120); // S
  sheet.setColumnWidth(20, 220); // T
  sheet.setColumnWidth(21, 220); // U
  sheet.setColumnWidth(22, 120); // V
  sheet.setColumnWidth(24, 140); // X
  sheet.setColumnWidth(25, 140); // Y
  sheet.setColumnWidth(26, 120); // Z
  sheet.setColumnWidth(27, 260); // AA

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
      var rawStatus = yearStatus[m];
      var isPending = rawStatus === "pending" || rawStatus === "gateway_pending";
      var isPaid = rawStatus === true;
      monthMarks.push(isPending ? "\u23F3" : (isPaid ? "\u2705" : "\u274C"));
      if (isPaid) totalPaid++;
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
      totalPaid + "/12",
      serializeMemberMeta_(item, yy)
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
    var yy = String(year || new Date().getFullYear());

    // Backward compatibility: old 3-column format (id, nama, status_json).
    if (row[0] && row[1] && row[2] && String(row[2]).trim().indexOf("{") === 0) {
      var legacyStatus = {};
      try {
        legacyStatus = row[2] ? JSON.parse(String(row[2])) : {};
      } catch (_) {
        legacyStatus = {};
      }
      var legacyMeta = parseMemberMeta_(row[15], yy);
      Object.keys((legacyMeta.gatewayPayments && legacyMeta.gatewayPayments[yy]) || {}).forEach(function(monthKey) {
        if (legacyStatus[yy] && legacyStatus[yy][monthKey] === "pending") {
          legacyStatus[yy][monthKey] = "gateway_pending";
        }
      });
      return {
        id: String(row[0] || ""),
        nama: String(row[1] || ""),
        status: legacyStatus,
        pendingProofs: legacyMeta.pendingProofs || {},
        gatewayPayments: legacyMeta.gatewayPayments || {}
      };
    }

    var status = {};
    status[yy] = {};

    for (var m = 1; m <= 12; m++) {
      status[yy][m] = parseMemberStatusMark_(row[m + 1]);
    }

    try {
      if (!status[yy]) status[yy] = {};
    } catch (_) {
      status[yy] = {};
    }

    var meta = parseMemberMeta_(row[15], yy);
    Object.keys((meta.gatewayPayments && meta.gatewayPayments[yy]) || {}).forEach(function(monthKey) {
      if (status[yy][monthKey] === "pending") {
        status[yy][monthKey] = "gateway_pending";
      }
    });
    return {
      id: makeMemberId_(yy, row[1], row[0]),
      nama: String(row[1] || ""),
      status: status,
      pendingProofs: meta.pendingProofs || {},
      gatewayPayments: meta.gatewayPayments || {}
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
    s === "âœ…" ||
    s === "âœ”" ||
    s === "âœ“"
  );
}

function parseMemberStatusMark_(v) {
  var raw = String(v || "").trim();
  if (!raw) return false;

  var s = raw.toLowerCase();
  if (
    raw === "\u23F3" ||
    raw === "\u231B" ||
    s === "pending" ||
    s === "menunggu" ||
    s === "qris_pending"
  ) {
    return "pending";
  }

  return isPaidMark_(raw);
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
  sheet.setColumnWidth(16, 2);   // META (hidden helper data)
  sheet.hideColumns(16);

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

function buildYearRevision_(data) {
  return hashText_(JSON.stringify(normalizePayload_(data)));
}

function buildYearDataResponse_(year, data, extra) {
  var normalized = normalizePayload_(data);
  var out = {
    ok: true,
    year: Number(parseInt(year, 10) || new Date().getFullYear()),
    revision: buildYearRevision_(normalized),
    driver: normalized.driver,
    helper: normalized.helper,
    transaksi: normalized.transaksi,
    logs: normalized.logs
  };
  if (extra && typeof extra === "object") {
    Object.keys(extra).forEach(function(key) {
      out[key] = extra[key];
    });
  }
  return out;
}

function assertExpectedYearRevision_(payload, currentData, year) {
  var provided = String(payload && payload.expectedRevision || "").trim();
  var currentRevision = buildYearRevision_(currentData);
  if (!provided) {
    var missingErr = new Error("Konflik data: aplikasi harus dimuat ulang sebelum menyimpan perubahan.");
    missingErr.details = {
      ok: false,
      code: "revision_required",
      error: missingErr.message,
      year: Number(parseInt(year, 10) || new Date().getFullYear()),
      currentRevision: currentRevision,
      data: buildYearDataResponse_(year, currentData)
    };
    throw missingErr;
  }
  if (provided !== currentRevision) {
    var conflictErr = new Error("Konflik data: data sudah berubah di perangkat atau admin lain. Data terbaru telah dimuat ulang.");
    conflictErr.details = {
      ok: false,
      code: "revision_conflict",
      error: conflictErr.message,
      year: Number(parseInt(year, 10) || new Date().getFullYear()),
      expectedRevision: provided,
      currentRevision: currentRevision,
      data: buildYearDataResponse_(year, currentData)
    };
    throw conflictErr;
  }
  return currentRevision;
}

function serializeMemberMeta_(item, year) {
  var yy = String(year || new Date().getFullYear());
  var pendingProofs = {};
  var gatewayPayments = {};
  var source = item && item.pendingProofs && item.pendingProofs[yy];
  if (source && typeof source === "object") {
    Object.keys(source).forEach(function(monthKey) {
      var value = source[monthKey];
      if (typeof value === "string" && value.trim()) {
        pendingProofs[String(Number(monthKey) || monthKey)] = value.trim();
      }
    });
  }
  var gatewaySource = item && item.gatewayPayments && item.gatewayPayments[yy];
  if (gatewaySource && typeof gatewaySource === "object") {
    Object.keys(gatewaySource).forEach(function(monthKey) {
      var value = gatewaySource[monthKey];
      if (!value || typeof value !== "object") return;
      if (!String(value.orderId || "").trim()) return;
      gatewayPayments[String(Number(monthKey) || monthKey)] = {
        orderId: String(value.orderId || "").trim(),
        transactionId: String(value.transactionId || "").trim(),
        transactionStatus: normalizeMidtransStatus_(value.transactionStatus || ""),
        paymentType: String(value.paymentType || "").trim(),
        grossAmount: String(value.grossAmount || "").trim(),
        qrUrl: String(value.qrUrl || "").trim(),
        qrString: String(value.qrString || "").trim(),
        expiresAt: String(value.expiresAt || "").trim(),
        snapToken: String(value.snapToken || "").trim(),
        snapRedirectUrl: String(value.snapRedirectUrl || "").trim()
      };
    });
  }
  var out = {};
  if (Object.keys(pendingProofs).length) out.pendingProofs = pendingProofs;
  if (Object.keys(gatewayPayments).length) out.gatewayPayments = gatewayPayments;
  if (!Object.keys(out).length) return "";
  return JSON.stringify(out);
}

function parseMemberMeta_(raw, year) {
  var yy = String(year || new Date().getFullYear());
  var out = { pendingProofs: {}, gatewayPayments: {} };
  var text = String(raw || "").trim();
  if (!text) return out;
  try {
    var parsed = JSON.parse(text);
    if (parsed && parsed.pendingProofs && typeof parsed.pendingProofs === "object") {
      out.pendingProofs[yy] = {};
      Object.keys(parsed.pendingProofs).forEach(function(monthKey) {
        var value = parsed.pendingProofs[monthKey];
        if (typeof value === "string" && value.trim()) {
          out.pendingProofs[yy][String(Number(monthKey) || monthKey)] = value.trim();
        }
      });
      if (!Object.keys(out.pendingProofs[yy]).length) {
        delete out.pendingProofs[yy];
      }
    }
    if (parsed && parsed.gatewayPayments && typeof parsed.gatewayPayments === "object") {
      out.gatewayPayments[yy] = {};
      Object.keys(parsed.gatewayPayments).forEach(function(monthKey) {
        var value = parsed.gatewayPayments[monthKey] || {};
        var orderId = String(value.orderId || "").trim();
        if (!orderId) return;
        out.gatewayPayments[yy][String(Number(monthKey) || monthKey)] = {
          orderId: orderId,
          transactionId: String(value.transactionId || "").trim(),
          transactionStatus: normalizeMidtransStatus_(value.transactionStatus || ""),
          paymentType: String(value.paymentType || "").trim(),
          grossAmount: String(value.grossAmount || "").trim(),
          qrUrl: String(value.qrUrl || "").trim(),
          qrString: String(value.qrString || "").trim(),
          expiresAt: String(value.expiresAt || "").trim(),
          snapToken: String(value.snapToken || "").trim(),
          snapRedirectUrl: String(value.snapRedirectUrl || "").trim()
        };
      });
      if (!Object.keys(out.gatewayPayments[yy]).length) {
        delete out.gatewayPayments[yy];
      }
    }
  } catch (err) {}
  return out;
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

function maybeWrapPostMessageResponse_(obj, payload) {
  var transport = String((payload && payload.responseTransport) || "").trim();
  if (transport !== "web_message") {
    return jsonResponse_(obj);
  }

  var messageId = String((payload && payload.messageId) || "").trim();
  var targetOrigin = sanitizePostMessageOrigin_((payload && payload.parentOrigin) || "");
  var script =
    "<!DOCTYPE html><html><body><script>(function(){" +
    "var payload=" + JSON.stringify({
      source: "delta8_apps_script",
      messageId: messageId,
      payload: obj
    }) + ";" +
    "try{if(window.parent&&window.parent!==window){window.parent.postMessage(payload," + JSON.stringify(targetOrigin || "*") + ");}}" +
    "catch(err){}" +
    "document.body.textContent='OK';" +
    "})();<\/script></body></html>";
  return HtmlService.createHtmlOutput(script)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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

function sanitizePostMessageOrigin_(origin) {
  var value = String(origin || "").trim();
  if (!/^https:\/\/[A-Za-z0-9.-]+(?::\d+)?$/.test(value)) return "";
  return value;
}

function getFirestoreConfig_() {
  var props = PropertiesService.getScriptProperties();
  return {
    projectId: props.getProperty(FCM_PROJECT_ID) || DEFAULT_FIREBASE_CONFIG.projectId || "",
    clientEmail: props.getProperty(FCM_SA_CLIENT_EMAIL_KEY) || "",
    privateKey: props.getProperty(FCM_SA_PRIVATE_KEY_KEY) || ""
  };
}

function getSecurePropsFromFirestore_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get("firestore_secure_props_v1");
  if (cached) {
    try {
      var parsed = JSON.parse(cached);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (err) {
      // ignore
    }
  }

  var config = getFirestoreConfig_();
  if (!config.projectId || !config.clientEmail || !config.privateKey) return {};
  var token = getFirestoreAccessToken_(config.clientEmail, config.privateKey);
  if (!token) return {};

  var url =
    "https://firestore.googleapis.com/v1/projects/" +
    encodeURIComponent(config.projectId) +
    "/databases/(default)/documents/secure_config/script_properties";
  var resp = UrlFetchApp.fetch(url, {
    method: "get",
    headers: { Authorization: "Bearer " + token },
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() !== 200) return {};

  var doc = {};
  try {
    doc = JSON.parse(resp.getContentText() || "{}");
  } catch (err) {
    return {};
  }

  var fields = (doc && doc.fields) || {};
  var mapFields =
    fields &&
    fields.props &&
    fields.props.mapValue &&
    fields.props.mapValue.fields
      ? fields.props.mapValue.fields
      : {};
  var out = {};
  for (var key in mapFields) {
    if (!mapFields.hasOwnProperty(key)) continue;
    var value = mapFields[key] || {};
    if (value.stringValue != null) {
      out[key] = String(value.stringValue);
    } else if (value.integerValue != null) {
      out[key] = String(value.integerValue);
    } else if (value.doubleValue != null) {
      out[key] = String(value.doubleValue);
    } else if (value.booleanValue != null) {
      out[key] = value.booleanValue ? "true" : "false";
    }
  }

  cache.put("firestore_secure_props_v1", JSON.stringify(out), 300);
  return out;
}

function writeSecurePropsToFirestore_(propsMap, movedBy) {
  var config = getFirestoreConfig_();
  if (!config.projectId || !config.clientEmail || !config.privateKey) {
    throw new Error("Firestore belum dikonfigurasi (service account / projectId).");
  }
  var token = getFirestoreAccessToken_(config.clientEmail, config.privateKey);
  if (!token) {
    throw new Error("Gagal mendapatkan access token Firestore.");
  }

  var fields = {};
  var keys = Object.keys(propsMap || {});
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    fields[key] = { stringValue: String(propsMap[key] == null ? "" : propsMap[key]) };
  }

  var payload = {
    fields: {
      props: { mapValue: { fields: fields } },
      updatedAt: { timestampValue: new Date().toISOString() },
      movedBy: { stringValue: String(movedBy || "ADMIN") }
    }
  };

  var url =
    "https://firestore.googleapis.com/v1/projects/" +
    encodeURIComponent(config.projectId) +
    "/databases/(default)/documents/secure_config/script_properties";
  var resp = UrlFetchApp.fetch(url, {
    method: "patch",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = resp.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error("Gagal simpan ke Firestore. Kode: " + code);
  }

  CacheService.getScriptCache().put(
    "firestore_secure_props_v1",
    JSON.stringify(propsMap || {}),
    300
  );

  return {
    projectId: config.projectId,
    count: keys.length
  };
}

function getPropWithFirestoreFallback_(key) {
  var scriptProps = PropertiesService.getScriptProperties();
  var userProps = PropertiesService.getUserProperties();
  var value = scriptProps.getProperty(key) || userProps.getProperty(key);
  if (value) return String(value);
  var secureProps = getSecurePropsFromFirestore_();
  return secureProps && secureProps[key] ? String(secureProps[key]) : "";
}

function inspectPropSource_(key) {
  var scriptProps = PropertiesService.getScriptProperties();
  var userProps = PropertiesService.getUserProperties();
  var scriptValue = scriptProps.getProperty(key);
  if (scriptValue) {
    return { source: "script_properties", value: String(scriptValue) };
  }
  var userValue = userProps.getProperty(key);
  if (userValue) {
    return { source: "user_properties", value: String(userValue) };
  }
  var secureProps = getSecurePropsFromFirestore_();
  if (secureProps && secureProps[key]) {
    return { source: "firestore_secure_config", value: String(secureProps[key]) };
  }
  return { source: "missing", value: "" };
}

function maskSecretForDebug_(value) {
  var raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.length <= 8) return raw;
  return raw.slice(0, 6) + "..." + raw.slice(-4);
}

function appendLog_(data, editor, aksi, ket) {
  data = data || {};
  if (!Array.isArray(data.logs)) data.logs = [];
  var tz = Session.getScriptTimeZone() || "Asia/Jakarta";
  var now = Utilities.formatDate(new Date(), tz, "dd/MM/yyyy HH.mm");
  data.logs.unshift({
    time: now,
    editor: String(editor || "").trim().toUpperCase(),
    aksi: String(aksi || "").trim().toUpperCase(),
    ket: String(ket || "")
  });
}

function applyMemberStatusUpdate_(data, info, value) {
  if (!data || !info) return false;
  var list = String(info.kat || "").toUpperCase() === "HELPER"
    ? data.helper
    : data.driver;
  if (!Array.isArray(list)) return false;
  var member = list.filter(function (item) { return String(item.id) === String(info.id); })[0];
  if (!member) return false;

  if (!member.status) member.status = {};
  if (!member.status[info.year]) member.status[info.year] = {};
  (info.months || []).forEach(function (month) {
    if (value === null || typeof value === "undefined") {
      delete member.status[info.year][month];
    } else {
      member.status[info.year][month] = value;
    }
  });
  return true;
}

function applyPendingPaymentSubmission_(data, payload, year) {
  if (!data || !payload) {
    return { ok: false, error: "Payload pembayaran tidak valid." };
  }

  var kat = String(payload.kat || "").trim().toUpperCase();
  var targetYear = String(parseInt(year, 10) || new Date().getFullYear());
  var list = kat === "HELPER" ? data.helper : data.driver;
  if (!Array.isArray(list)) {
    return { ok: false, error: "Data anggota tidak tersedia." };
  }

  var memberId = String(payload.id || "").trim();
  if (!memberId) {
    return { ok: false, error: "ID anggota tidak ditemukan." };
  }

  var member = null;
  for (var i = 0; i < list.length; i++) {
    if (String(list[i] && list[i].id || "") === memberId) {
      member = list[i];
      break;
    }
  }
  if (!member) {
    return { ok: false, error: "Anggota untuk pembayaran QRIS tidak ditemukan." };
  }

  var rawMonths = Array.isArray(payload.months) ? payload.months : [];
  var seen = {};
  var months = [];
  for (var j = 0; j < rawMonths.length; j++) {
    var month = parseInt(rawMonths[j], 10);
    if (month >= 1 && month <= 12 && !seen[month]) {
      seen[month] = true;
      months.push(month);
    }
  }
  months.sort(function(a, b) { return a - b; });
  if (!months.length) {
    return { ok: false, error: "Bulan pembayaran QRIS belum dipilih." };
  }

  if (!member.status) member.status = {};
  if (!member.status[targetYear]) member.status[targetYear] = {};
  if (!member.pendingProofs) member.pendingProofs = {};
  if (!member.pendingProofs[targetYear]) member.pendingProofs[targetYear] = {};

  var proofData = String(payload.proofData || "").trim();
  var changed = false;
  for (var k = 0; k < months.length; k++) {
    var mm = months[k];
    if (member.status[targetYear][mm] !== "pending") {
      member.status[targetYear][mm] = "pending";
      changed = true;
    }
    if (proofData) {
      if (member.pendingProofs[targetYear][mm] !== proofData) {
        member.pendingProofs[targetYear][mm] = proofData;
        changed = true;
      }
    }
  }

  if (!changed) {
    return {
      ok: true,
      year: targetYear,
      memberId: memberId,
      months: months
    };
  }

  var monthLabels = [];
  for (var x = 0; x < months.length; x++) {
    monthLabels.push(pad2_(months[x]) + "/" + targetYear);
  }
  appendLog_(
    data,
    normalizeEditorName_(member.nama || kat),
    "IURAN",
    kat + " - " + String(member.nama || "").toUpperCase() + " - " + monthLabels.join(", ") + " - [PENDING VERIFIKASI QRIS]"
  );

  return {
    ok: true,
    year: targetYear,
    memberId: memberId,
    months: months
  };
}

function applyAdminPendingAction_(data, payload, year) {
  if (!data || !payload) {
    return { ok: false, error: "Payload verifikasi pembayaran tidak valid." };
  }

  var decision = String(payload.decision || "").trim().toLowerCase();
  if (decision !== "verify" && decision !== "cancel") {
    return { ok: false, error: "Aksi verifikasi pembayaran tidak dikenali." };
  }

  var kat = String(payload.kat || "").trim().toUpperCase();
  var list = kat === "HELPER" ? data.helper : data.driver;
  if (!Array.isArray(list)) {
    return { ok: false, error: "Data anggota tidak tersedia." };
  }

  var memberId = String(payload.id || "").trim();
  var yy = String(parseInt(year, 10) || new Date().getFullYear());
  var member = null;
  for (var i = 0; i < list.length; i++) {
    if (String(list[i] && list[i].id || "") === memberId) {
      member = list[i];
      break;
    }
  }
  if (!member) {
    return { ok: false, error: "Anggota pembayaran pending tidak ditemukan." };
  }

  var months = normalizeMonthList_(payload.months);
  if (!months.length) {
    return { ok: false, error: "Bulan pembayaran pending belum dipilih." };
  }

  var availableMonths = [];
  for (var j = 0; j < months.length; j++) {
    var mm = months[j];
    var currentStatus = member.status && member.status[yy] ? member.status[yy][mm] : "";
    if (currentStatus === "pending" || currentStatus === "gateway_pending") {
      availableMonths.push(mm);
    }
  }
  if (!availableMonths.length) {
    return { ok: false, error: "Status pending untuk bulan terpilih sudah berubah." };
  }

  var statusValue = decision === "verify" ? true : null;
  var info = {
    kat: kat,
    id: memberId,
    year: yy,
    months: availableMonths
  };
  var changed = applyMemberStatusUpdate_(data, info, statusValue);

  member.pendingProofs = member.pendingProofs || {};
  member.pendingProofs[yy] = member.pendingProofs[yy] || {};
  var gatewayPayments = member.gatewayPayments && member.gatewayPayments[yy] ? member.gatewayPayments[yy] : null;
  for (var k = 0; k < availableMonths.length; k++) {
    delete member.pendingProofs[yy][availableMonths[k]];
    if (gatewayPayments && gatewayPayments[availableMonths[k]]) {
      delete gatewayPayments[availableMonths[k]];
    }
  }
  if (!Object.keys(member.pendingProofs[yy] || {}).length) delete member.pendingProofs[yy];
  if (!Object.keys(member.pendingProofs || {}).length) delete member.pendingProofs;
  if (gatewayPayments && !Object.keys(gatewayPayments).length) delete member.gatewayPayments[yy];
  if (member.gatewayPayments && !Object.keys(member.gatewayPayments).length) delete member.gatewayPayments;

  var monthLabels = availableMonths.map(function(month) {
    return pad2_(month) + "/" + yy;
  });
  appendLog_(
    data,
    normalizeEditorName_(payload.editor || "ADMIN"),
    "IURAN",
    kat + " - " + String(member.nama || "").toUpperCase() + " - " + monthLabels.join(", ") + " - [" + (decision === "verify" ? "LUNAS VERIFIKASI ADMIN" : "PEMBAYARAN QRIS DIBATALKAN") + "]"
  );

  return {
    ok: true,
    changed: changed,
    memberId: memberId,
    months: availableMonths
  };
}

function applyMidtransTransactionStateToMember_(member, year, months, info, options) {
  if (!member) return false;
  var yy = String(year || new Date().getFullYear());
  var monthList = normalizeMonthList_(months);
  if (!monthList.length) return false;
  if (!member.status) member.status = {};
  if (!member.status[yy]) member.status[yy] = {};
  member.pendingProofs = member.pendingProofs || {};
  member.pendingProofs[yy] = member.pendingProofs[yy] || {};
  var gatewayPayments = ensureMemberGatewayPaymentsYear_(member, yy);
  var transactionStatus = normalizeMidtransStatus_(info && info.transactionStatus || "");
  var paymentType = String(info && info.paymentType || "qris").trim().toLowerCase();
  var changed = false;

  for (var i = 0; i < monthList.length; i++) {
    var mm = monthList[i];
    if (isMidtransSuccessStatus_(transactionStatus)) {
      if (member.status[yy][mm] !== true) {
        member.status[yy][mm] = true;
        changed = true;
      }
      if (member.pendingProofs[yy] && member.pendingProofs[yy][mm]) {
        delete member.pendingProofs[yy][mm];
        changed = true;
      }
    } else if (isMidtransPendingStatus_(transactionStatus)) {
      if (member.status[yy][mm] !== "gateway_pending") {
        member.status[yy][mm] = "gateway_pending";
        changed = true;
      }
    } else if (isMidtransFailureStatus_(transactionStatus)) {
      if (member.status[yy][mm] === "gateway_pending" || member.status[yy][mm] === "pending") {
        delete member.status[yy][mm];
        changed = true;
      }
      if (member.pendingProofs[yy] && member.pendingProofs[yy][mm]) {
        delete member.pendingProofs[yy][mm];
        changed = true;
      }
    }

    if (isMidtransFailureStatus_(transactionStatus)) {
      if (gatewayPayments[mm]) {
        delete gatewayPayments[mm];
        changed = true;
      }
      continue;
    }

    var nextGateway = {
      orderId: String(info && info.orderId || "").trim(),
      transactionId: String(info && info.transactionId || "").trim(),
      transactionStatus: transactionStatus,
      paymentType: paymentType,
      grossAmount: String(info && info.grossAmount || "").trim(),
      qrUrl: String(info && info.qrUrl || "").trim(),
      qrString: String(info && info.qrString || "").trim(),
      expiresAt: String(info && info.expiresAt || "").trim(),
      snapToken: String(info && info.snapToken || "").trim(),
      snapRedirectUrl: String(info && info.snapRedirectUrl || "").trim()
    };
    var prevGateway = gatewayPayments[mm] || {};
    if (JSON.stringify(prevGateway) !== JSON.stringify(nextGateway)) {
      gatewayPayments[mm] = nextGateway;
      changed = true;
    }
  }

  if (!Object.keys(member.pendingProofs[yy] || {}).length) delete member.pendingProofs[yy];
  if (!Object.keys(gatewayPayments).length) delete member.gatewayPayments[yy];
  if (member.gatewayPayments && !Object.keys(member.gatewayPayments).length) delete member.gatewayPayments;
  if (member.pendingProofs && !Object.keys(member.pendingProofs).length) delete member.pendingProofs;

  if (changed && options && options.addLog) {
    appendLog_(
      options.data,
      String(options.editor || "MIDTRANS").toUpperCase(),
      "IURAN",
      String(options.logText || "")
    );
  }

  return changed;
}

function applyCancelMemberPending_(data, payload, year) {
  var yy = String(parseInt(year, 10) || new Date().getFullYear());
  var member = findMemberByKatAndId_(data, payload && payload.kat, payload && payload.id);
  if (!member) {
    return {
      ok: false,
      error: "Anggota pending tidak ditemukan."
    };
  }

  var months = normalizeMonthList_(payload && payload.months);
  if (!months.length) {
    return {
      ok: false,
      error: "Bulan pending belum dipilih."
    };
  }

  var statusMap = member.status && member.status[yy] ? member.status[yy] : null;
  if (!statusMap) {
    return {
      ok: false,
      error: "Status pembayaran anggota tidak ditemukan."
    };
  }

  member.pendingProofs = member.pendingProofs || {};
  var proofMap = member.pendingProofs[yy] || {};
  var gatewayMap = member.gatewayPayments && member.gatewayPayments[yy] ? member.gatewayPayments[yy] : {};
  var changed = false;
  var cancelledMonths = [];

  for (var i = 0; i < months.length; i++) {
    var month = months[i];
    var currentStatus = String(statusMap[month] || "").trim().toLowerCase();
    if (currentStatus !== "pending" && currentStatus !== "gateway_pending") {
      continue;
    }
    delete statusMap[month];
    if (proofMap[month]) {
      delete proofMap[month];
    }
    if (gatewayMap[month]) {
      delete gatewayMap[month];
    }
    cancelledMonths.push(month);
    changed = true;
  }

  if (!cancelledMonths.length) {
    return {
      ok: false,
      error: "Tidak ada pembayaran pending yang bisa dibatalkan."
    };
  }

  if (member.pendingProofs && member.pendingProofs[yy] && !Object.keys(member.pendingProofs[yy]).length) {
    delete member.pendingProofs[yy];
  }
  if (member.pendingProofs && !Object.keys(member.pendingProofs).length) {
    delete member.pendingProofs;
  }
  if (member.gatewayPayments && member.gatewayPayments[yy] && !Object.keys(member.gatewayPayments[yy]).length) {
    delete member.gatewayPayments[yy];
  }
  if (member.gatewayPayments && !Object.keys(member.gatewayPayments).length) {
    delete member.gatewayPayments;
  }
  if (member.status && member.status[yy] && !Object.keys(member.status[yy]).length) {
    delete member.status[yy];
  }

  appendLog_(
    data,
    "MEMBER",
    "IURAN",
    String(payload && payload.kat || "").toUpperCase() + " - " + String(member.nama || "").toUpperCase() + " - " + cancelledMonths.map(function(month) {
      return pad2_(month) + "/" + yy;
    }).join(", ") + " - [DIBATALKAN OLEH MEMBER]"
  );

  return {
    ok: true,
    changed: changed,
    memberId: String(member.id || ""),
    months: cancelledMonths
  };
}

function buildMidtransLogText_(kat, memberName, year, months, status) {
  var monthLabels = normalizeMonthList_(months).map(function(month) {
    return pad2_(month) + "/" + String(year || "");
  });
  var suffix = "[MIDTRANS " + String(status || "").toUpperCase() + "]";
  return String(kat || "").toUpperCase() + " - " + String(memberName || "").toUpperCase() + " - " + monthLabels.join(", ") + " - " + suffix;
}

function createMidtransSnapTransaction_(payload, year, options) {
  var config = assertMidtransConfigured_();
  var amount = Number(payload && payload.amount || 0);
  var months = normalizeMonthList_(payload && payload.months);
  options = options || {};
  if (amount <= 0) {
    throw new Error("Nominal pembayaran QRIS tidak valid.");
  }
  if (!months.length) {
    throw new Error("Bulan pembayaran QRIS belum dipilih.");
  }
  var orderId = buildMidtransOrderId_(payload, year, months);
  var body = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount
    },
    item_details: [{
      id: "iuran-kas",
      price: amount,
      quantity: 1,
      name: "Iuran Kas Delta 8 " + months.map(function(month) {
        return pad2_(month) + "/" + String(year);
      }).join(", ")
    }],
    customer_details: {
      first_name: String(payload && payload.nama || "ANGGOTA").trim().toUpperCase()
    },
    custom_field1: JSON.stringify({
      year: String(year),
      kat: String(payload && payload.kat || "").trim().toUpperCase(),
      id: String(payload && payload.id || "").trim(),
      months: months
    })
  };
  if (options.enabledPayments && options.enabledPayments.length) {
    body.enabled_payments = options.enabledPayments.slice();
  }

  var response = callMidtransApi_(config, "post", config.snapBase + "/snap/v1/transactions", body);
  var midtransStatusCode = parseInt(response && response.status_code, 10);
  var midtransStatusMessage = String(response && response.status_message || "").trim();
  if ((midtransStatusCode && midtransStatusCode >= 400)) {
    throw new Error(midtransStatusMessage || "Midtrans gagal membuat snap transaction.");
  }
  
  return {
    orderId: orderId,
    transactionId: getMidtransTransactionIdFromResponse_(response),
    transactionStatus: normalizeMidtransStatus_(response.transaction_status || "pending"),
    paymentType: String(response.payment_type || "qris").trim(),
    grossAmount: String(response.gross_amount || normalizeCurrencyAmountString_(amount)),
    qrUrl: getMidtransQrUrlFromResponse_(response, config.apiBase),
    qrString: String(response.qr_string || "").trim(),
    snapToken: String(response.token || "").trim(),
    snapRedirectUrl: String(response.redirect_url || "").trim(),
    expiresAt: String(response.expiry_time || "").trim(),
    rawSummary: buildMidtransResponseDebugSummary_(response),
    raw: response
  };
}

function createMidtransQrisCharge_(payload, year) {
  var config = assertMidtransConfigured_();
  var amount = Number(payload && payload.amount || 0);
  var months = normalizeMonthList_(payload && payload.months);
  if (amount <= 0) {
    throw new Error("Nominal pembayaran QRIS tidak valid.");
  }
  if (!months.length) {
    throw new Error("Bulan pembayaran QRIS belum dipilih.");
  }
  var orderId = buildMidtransOrderId_(payload, year, months);
  var body = {
    payment_type: "qris",
    transaction_details: {
      order_id: orderId,
      gross_amount: amount
    },
    item_details: [{
      id: "iuran-kas",
      price: amount,
      quantity: 1,
      name: "Iuran Kas Delta 8 " + months.map(function(month) {
        return pad2_(month) + "/" + String(year);
      }).join(", ")
    }],
    customer_details: {
      first_name: String(payload && payload.nama || "ANGGOTA").trim().toUpperCase()
    },
    qris: {
      acquirer: "gopay"
    },
    custom_field1: JSON.stringify({
      year: String(year),
      kat: String(payload && payload.kat || "").trim().toUpperCase(),
      id: String(payload && payload.id || "").trim(),
      months: months
    })
  };

  var response = callMidtransApi_(config, "post", "/v2/charge", body);
  var midtransStatusCode = parseInt(response && response.status_code, 10);
  var midtransStatusMessage = String(response && response.status_message || "").trim();
  if ((midtransStatusCode && midtransStatusCode >= 400) || !isMidtransPendingStatus_(response && response.transaction_status || "")) {
    throw new Error(midtransStatusMessage || "Midtrans gagal membuat transaksi QRIS.");
  }
  return {
    orderId: orderId,
    transactionId: getMidtransTransactionIdFromResponse_(response),
    transactionStatus: normalizeMidtransStatus_(response.transaction_status || "pending"),
    paymentType: String(response.payment_type || "qris").trim(),
    grossAmount: String(response.gross_amount || normalizeCurrencyAmountString_(amount)),
    qrUrl: getMidtransQrUrlFromResponse_(response, config.apiBase),
    qrString: String(response.qr_string || "").trim(),
    expiresAt: String(response.expiry_time || "").trim(),
    rawSummary: buildMidtransResponseDebugSummary_(response),
    raw: response
  };
}

function createMidtransQrisWithFallback_(payload, year) {
  var snapCharge = createMidtransSnapTransaction_(payload, year, {
    enabledPayments: ["gopay"]
  });
  snapCharge.rawSummary = snapCharge.rawSummary || {};
  snapCharge.rawSummary.fallbackToSnap = true;
  snapCharge.rawSummary.primaryFlow = "snap_gopay_qris";
  snapCharge.rawSummary.forcedSnapGopay = true;
  return snapCharge;
}

function checkMidtransHealth_(config) {
  var result = {
    ok: false,
    configured: !!(config && config.serverKey),
    environment: config && config.isProduction ? "production" : "sandbox",
    apiBase: String(config && config.apiBase || ""),
    hasClientKey: !!(config && config.clientKey),
    checkedAt: new Date().toISOString()
  };

  try {
    var response = callMidtransApi_(config, "get", "/v2/ping", null);
    result.ok = true;
    result.ping = response || {};
  } catch (err) {
    result.error = err && err.message ? err.message : String(err);
  }

  return result;
}

function handleCreateMidtransQris_(payload, e) {
  var year = getTargetYear_(payload, e);
  var data = ensureYearData_(year);
  var member = findMemberByKatAndId_(data, payload && payload.kat, payload && payload.id);
  if (!member) {
    throw new Error("Anggota pembayaran QRIS tidak ditemukan.");
  }
  var months = normalizeMonthList_(payload && payload.months);
  var amount = Number(payload && payload.amount || 0);
  if (!months.length) {
    throw new Error("Bulan pembayaran QRIS belum dipilih.");
  }
  if (amount <= 0) {
    throw new Error("Nominal pembayaran QRIS tidak valid.");
  }

  var charge = createMidtransQrisWithFallback_(payload, year);
  var changed = applyMidtransTransactionStateToMember_(member, year, months, charge, {
    data: data,
    addLog: true,
    editor: normalizeEditorName_(member.nama || (payload && payload.nama) || "MIDTRANS"),
    logText: buildMidtransLogText_(payload && payload.kat, member.nama, year, months, charge.transactionStatus)
  });
  if (changed) {
    writeYearData_(year, data);
  }

  return jsonResponse_({
    ok: true,
    year: year,
    orderId: charge.orderId,
    transactionId: charge.transactionId,
    transactionStatus: charge.transactionStatus,
    grossAmount: charge.grossAmount,
    qrUrl: charge.qrUrl,
    qrString: charge.qrString,
    snapToken: charge.snapToken,
    snapRedirectUrl: charge.snapRedirectUrl,
    expiresAt: charge.expiresAt,
    debug: charge.rawSummary
  });
}

function applyMidtransStatusByOrderId_(data, orderId, statusResponse, preferredYear, config) {
  var found = findMemberByMidtransOrderId_(data, orderId, preferredYear);
  if (!found || !found.member) {
    return {
      ok: false,
      error: "Order Midtrans tidak ditemukan di data anggota."
    };
  }

  var member = found.member;
  var yy = String(found.year || preferredYear || new Date().getFullYear());
  var gatewayMap = member.gatewayPayments && member.gatewayPayments[yy] ? member.gatewayPayments[yy] : {};
  var months = [];
  Object.keys(gatewayMap || {}).forEach(function(monthKey) {
    var item = gatewayMap[monthKey] || {};
    if (String(item.orderId || "") === String(orderId || "")) {
      months.push(Number(monthKey));
    }
  });
  months = normalizeMonthList_(months);
  if (!months.length) {
    return {
      ok: false,
      error: "Bulan pembayaran Midtrans tidak ditemukan."
    };
  }

  var existingGateway = months.length ? (gatewayMap[months[0]] || {}) : {};
  var info = {
    orderId: String(statusResponse.order_id || orderId || "").trim(),
    transactionId: getMidtransTransactionIdFromResponse_(statusResponse),
    transactionStatus: normalizeMidtransStatus_(statusResponse.transaction_status || ""),
    paymentType: String(statusResponse.payment_type || "qris").trim(),
    grossAmount: String(statusResponse.gross_amount || "").trim(),
    qrUrl: getMidtransQrUrlFromResponse_(statusResponse, config && config.apiBase),
    qrString: String(statusResponse.qr_string || "").trim(),
    expiresAt: String(statusResponse.expiry_time || "").trim(),
    snapToken: String(existingGateway.snapToken || "").trim(),
    snapRedirectUrl: String(existingGateway.snapRedirectUrl || "").trim()
  };

  var changed = applyMidtransTransactionStateToMember_(member, yy, months, info, {
    data: data,
    addLog: true,
    editor: normalizeEditorName_(member.nama || found.kat || "MIDTRANS"),
    logText: buildMidtransLogText_(found.kat, member.nama, yy, months, info.transactionStatus)
  });

  return {
    ok: true,
    changed: changed,
    year: yy,
    memberId: String(member.id || ""),
    months: months,
    transactionStatus: info.transactionStatus
  };
}

function handleMidtransStatus_(e) {
  var orderId = String((e && e.parameter && e.parameter.orderId) || "").trim();
  if (!orderId) {
    throw new Error("orderId Midtrans wajib diisi.");
  }
  var year = String((e && e.parameter && e.parameter.year) || parseMidtransYearFromOrderId_(orderId) || "").trim();
  var config = assertMidtransConfigured_();
  var statusResponse = callMidtransApi_(config, "get", "/v2/" + encodeURIComponent(orderId) + "/status", null);

  ensureYearData_(year || new Date().getFullYear());
  var data = readYearData_(year || new Date().getFullYear());
  var applied = applyMidtransStatusByOrderId_(data, orderId, statusResponse, year, config);
  if (applied.ok && applied.changed) {
    writeYearData_(applied.year, data);
  }
  var responseYear = applied.year || year || new Date().getFullYear();

  return jsonResponse_({
    ok: true,
    year: responseYear,
    synced: !!(applied && applied.changed),
    transactionStatus: normalizeMidtransStatus_(statusResponse.transaction_status || ""),
    orderId: String(statusResponse.order_id || orderId),
    data: applied.ok ? buildYearDataResponse_(responseYear, readYearData_(responseYear)) : null
  });
}

function verifyMidtransNotificationSignature_(payload) {
  var config = assertMidtransConfigured_();
  var raw =
    String(payload.order_id || "") +
    String(payload.status_code || "") +
    String(payload.gross_amount || "") +
    String(config.serverKey || "");
  var expected = hashSha512Text_(raw);
  return expected === String(payload.signature_key || "").toLowerCase();
}

function handleMidtransNotification_(payload) {
  if (!verifyMidtransNotificationSignature_(payload)) {
    throw new Error("Signature Midtrans tidak valid.");
  }

  var orderId = String(payload.order_id || "").trim();
  var year = parseMidtransYearFromOrderId_(orderId) || String(new Date().getFullYear());
  ensureYearData_(year);
  var data = readYearData_(year);
  var config = assertMidtransConfigured_();
  var applied = applyMidtransStatusByOrderId_(data, orderId, payload, year, config);
  if (applied.ok && applied.changed) {
    writeYearData_(applied.year, data);
  }

  try {
    var normalizedStatus = normalizeMidtransStatus_(payload.transaction_status || "");
    if (isMidtransSuccessStatus_(normalizedStatus) && applied.ok) {
      var notified = findMemberByMidtransOrderId_(data, orderId, applied.year || year);
      if (notified && notified.member) {
        sendFcmToAllDevices_(
          "Pembayaran Berhasil",
          String(notified.kat || "").toUpperCase() + " - " + String(notified.member.nama || "").toUpperCase() + " berhasil terverifikasi.",
          {
            year: String(applied.year || year),
            type: "midtrans_success",
            action: "midtrans_settlement",
            detail: String(orderId || ""),
            title: "Pembayaran Berhasil",
            body: String(notified.kat || "").toUpperCase() + " - " + String(notified.member.nama || "").toUpperCase() + " berhasil terverifikasi.",
            tag: "delta8-midtrans-success",
            icon: DEFAULT_WEB_APP_URL + "/notification-icon.svg",
            badge: DEFAULT_WEB_APP_URL + "/notification-badge.svg",
            url: buildNotificationTargetUrl_("driver", "", "")
          }
        );
      }
    }
  } catch (notifyErr) {}

  return jsonResponse_({
    ok: true,
    orderId: orderId,
    transactionStatus: normalizeMidtransStatus_(payload.transaction_status || "")
  });
}

function isMidtransNotificationPayload_(payload) {
  return !!(
    payload &&
    payload.transaction_status &&
    payload.order_id &&
    payload.status_code &&
    payload.signature_key
  );
}

function normalizeMonthList_(months) {
  var raw = Array.isArray(months)
    ? months
    : (typeof months === "string" && months ? months.split(",") : []);
  var seen = {};
  var out = [];
  for (var i = 0; i < raw.length; i++) {
    var month = parseInt(raw[i], 10);
    if (month >= 1 && month <= 12 && !seen[month]) {
      seen[month] = true;
      out.push(month);
    }
  }
  out.sort(function(a, b) { return a - b; });
  return out;
}

function normalizeMidtransStatus_(value) {
  return String(value || "").trim().toLowerCase();
}

function isMidtransSuccessStatus_(status) {
  var s = normalizeMidtransStatus_(status);
  return s === "settlement" || s === "capture";
}

function isMidtransPendingStatus_(status) {
  return normalizeMidtransStatus_(status) === "pending";
}

function isMidtransFailureStatus_(status) {
  var s = normalizeMidtransStatus_(status);
  return s === "expire" || s === "cancel" || s === "deny" || s === "failure";
}

function normalizeCurrencyAmountString_(value) {
  var amount = Number(value || 0);
  return amount.toFixed(2);
}

function hashText_(text) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text || ""));
  return digestBytesToHex_(raw);
}

function hashSha512Text_(text) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, String(text || ""));
  return digestBytesToHex_(raw);
}

function digestBytesToHex_(raw) {
  var out = [];
  for (var i = 0; i < raw.length; i++) {
    var bite = raw[i];
    if (bite < 0) bite += 256;
    var hex = bite.toString(16);
    out.push(hex.length === 1 ? "0" + hex : hex);
  }
  return out.join("");
}

function buildMidtransOrderId_(payload, year, months) {
  var kat = String(payload && payload.kat || "").trim().toUpperCase();
  var memberId = String(payload && payload.id || "").trim();
  var memberHash = hashText_(memberId).slice(0, 10).toUpperCase();
  var monthToken = months.join("");
  var stamp = new Date().getTime().toString(36).toUpperCase();
  return [
    "D8Q",
    String(year || new Date().getFullYear()),
    kat === "HELPER" ? "H" : "D",
    memberHash,
    monthToken || "0",
    stamp
  ].join("-");
}

function buildPendingPaymentSnapshot_(data, year) {
  var yy = String(parseInt(year, 10) || new Date().getFullYear());
  var items = collectPendingPaymentRows_(data, yy);
  var totalNominal = 0;
  for (var i = 0; i < items.length; i++) {
    totalNominal += Number(items[i].nominal || 0);
  }
  return {
    ok: true,
    year: Number(yy),
    count: items.length,
    totalNominal: totalNominal,
    items: items,
    updatedAt: new Date().toISOString()
  };
}

function collectPendingPaymentRows_(data, year) {
  var yy = String(year || new Date().getFullYear());
  var rows = [];
  collectPendingRowsFromList_(rows, data && data.driver, "Driver", yy);
  collectPendingRowsFromList_(rows, data && data.helper, "Helper", yy);
  rows.sort(function(a, b) {
    return String(a.nama || "").localeCompare(String(b.nama || ""));
  });
  return rows;
}

function collectPendingRowsFromList_(rows, list, kat, year) {
  if (!Array.isArray(list)) return;
  for (var i = 0; i < list.length; i++) {
    var person = list[i] || {};
    var yearStatus = person.status && person.status[year] ? person.status[year] : null;
    if (!yearStatus) continue;
    var months = [];
    var statusSource = "";
    Object.keys(yearStatus).forEach(function(monthKey) {
      var currentStatus = String(yearStatus[monthKey] || "").trim().toLowerCase();
      if (currentStatus === "pending" || currentStatus === "gateway_pending") {
        months.push(Number(monthKey));
        if (!statusSource) {
          statusSource = currentStatus;
        } else if (statusSource !== currentStatus) {
          statusSource = "mixed_pending";
        }
      }
    });
    months = normalizeMonthList_(months);
    if (!months.length) continue;
    var proofData = "";
    var proofMap = person.pendingProofs && person.pendingProofs[year] ? person.pendingProofs[year] : null;
    if (proofMap) {
      for (var j = 0; j < months.length; j++) {
        if (proofMap[months[j]]) {
          proofData = String(proofMap[months[j]] || "");
          break;
        }
      }
    }
    rows.push({
      id: String(person.id || ""),
      nama: String(person.nama || ""),
      kat: kat,
      y: Number(year),
      months: months,
      statusSource: statusSource || "pending",
      monthLabels: months.map(function(month) {
        return pad2_(month) + "/" + year;
      }),
      nominal: months.length * 25000,
      proofData: proofData
    });
  }
}

function parseMidtransYearFromOrderId_(orderId) {
  var m = String(orderId || "").match(/^D8Q-(\d{4})-/);
  return m ? String(m[1]) : "";
}

function getMidtransConfig_() {
  var serverKey = getPropWithFirestoreFallback_(MIDTRANS_SERVER_KEY);
  var clientKey = getPropWithFirestoreFallback_(MIDTRANS_CLIENT_KEY);
  var isProductionRaw = getPropWithFirestoreFallback_(MIDTRANS_IS_PRODUCTION_KEY);
  if (!serverKey && DEFAULT_MIDTRANS_SERVER_KEY) {
    serverKey = DEFAULT_MIDTRANS_SERVER_KEY;
  }
  if (!clientKey && DEFAULT_MIDTRANS_CLIENT_KEY) {
    clientKey = DEFAULT_MIDTRANS_CLIENT_KEY;
  }
  if (!isProductionRaw && (DEFAULT_MIDTRANS_IS_PRODUCTION === true || DEFAULT_MIDTRANS_IS_PRODUCTION === false)) {
    isProductionRaw = DEFAULT_MIDTRANS_IS_PRODUCTION ? "true" : "false";
  }
  var isProduction = String(isProductionRaw || "").trim().toLowerCase() === "true";
  return {
    serverKey: serverKey,
    clientKey: clientKey,
    isProduction: isProduction,
    apiBase: isProduction ? MIDTRANS_PRODUCTION_API_BASE : MIDTRANS_SANDBOX_API_BASE,
    snapBase: isProduction ? MIDTRANS_SNAP_PRODUCTION_BASE : MIDTRANS_SNAP_SANDBOX_BASE
  };
}

function assertMidtransConfigured_() {
  var config = getMidtransConfig_();
  if (!config.serverKey) {
    throw new Error("Midtrans belum dikonfigurasi. Isi Script Property midtrans_server_key.");
  }
  return config;
}

function callMidtransApi_(config, method, path, payload) {
  var username = String(config && config.serverKey || "");
  var authValue = Utilities.base64Encode(username + ":");
  var options = {
    method: String(method || "get").toLowerCase(),
    headers: {
      Accept: "application/json",
      Authorization: "Basic " + authValue
    },
    muteHttpExceptions: true
  };

  if (payload !== undefined && payload !== null) {
    options.contentType = "application/json";
    options.payload = JSON.stringify(payload);
  }

  var requestUrl = String(path || "").trim();
  if (!/^https?:\/\//i.test(requestUrl)) {
    requestUrl = String(config.apiBase || MIDTRANS_SANDBOX_API_BASE) + requestUrl;
  }
  var resp = UrlFetchApp.fetch(requestUrl, options);
  var code = resp.getResponseCode();
  var text = resp.getContentText() || "{}";
  var data = {};
  try {
    data = JSON.parse(text);
  } catch (err) {
    data = {};
  }
  if (code < 200 || code >= 300) {
    var statusMessage = String(data && data.status_message || "").trim();
    throw new Error(statusMessage ? ("Midtrans error " + code + ": " + statusMessage) : ("Midtrans error " + code));
  }
  return data;
}

function getMidtransQrUrlFromResponse_(response, apiBase) {
  var directUrl = String(
    response && (response.qr_url || response.qrUrl || response.qr_code_url || "") || ""
  ).trim();
  if (directUrl) return directUrl;

  var actions = response && response.actions && Array.isArray(response.actions) ? response.actions : [];
  for (var i = 0; i < actions.length; i++) {
    var item = actions[i] || {};
    var name = String(item.name || "").toLowerCase();
    if (name === "generate-qr-code" || name === "deeplink-redirect") {
      return String(item.url || "").trim();
    }
  }
  var transactionId = getMidtransTransactionIdFromResponse_(response);
  if (transactionId) {
    return String(apiBase || MIDTRANS_SANDBOX_API_BASE) + "/v2/qris/" + encodeURIComponent(transactionId) + "/qr-code";
  }
  return "";
}

function getMidtransTransactionIdFromResponse_(response) {
  var direct = String(response && response.transaction_id || "").trim();
  if (direct) return direct;
  var actions = response && response.actions && Array.isArray(response.actions) ? response.actions : [];
  for (var i = 0; i < actions.length; i++) {
    var item = actions[i] || {};
    var url = String(item.url || "").trim();
    var match = url.match(/\/v2\/qris\/([^\/?#]+)\/qr-code/i);
    if (match && match[1]) {
      return String(match[1]).trim();
    }
  }
  return "";
}

function buildMidtransResponseDebugSummary_(response) {
  response = response || {};
  var actions = response.actions && Array.isArray(response.actions)
    ? response.actions.map(function(item) {
        return {
          name: String(item && item.name || ""),
          method: String(item && item.method || ""),
          hasUrl: !!String(item && item.url || "").trim()
        };
      })
    : [];
  return {
    statusCode: String(response.status_code || ""),
    statusMessage: String(response.status_message || ""),
    transactionStatus: String(response.transaction_status || ""),
    paymentType: String(response.payment_type || ""),
    transactionId: getMidtransTransactionIdFromResponse_(response),
    hasQrString: !!String(response.qr_string || "").trim(),
    actionCount: actions.length,
    actions: actions
  };
}

function ensureMemberGatewayPaymentsYear_(member, year) {
  if (!member.gatewayPayments) member.gatewayPayments = {};
  if (!member.gatewayPayments[year]) member.gatewayPayments[year] = {};
  return member.gatewayPayments[year];
}

function cleanupExpiredGatewayPayments_(data, year) {
  var yy = String(year || new Date().getFullYear());
  var nowTs = Date.now();
  var changed = false;
  var lists = [Array.isArray(data && data.driver) ? data.driver : [], Array.isArray(data && data.helper) ? data.helper : []];

  for (var li = 0; li < lists.length; li++) {
    var members = lists[li];
    for (var i = 0; i < members.length; i++) {
      var member = members[i] || {};
      var statusMap = member.status && member.status[yy] ? member.status[yy] : null;
      var gatewayMap = member.gatewayPayments && member.gatewayPayments[yy] ? member.gatewayPayments[yy] : null;
      var proofMap = member.pendingProofs && member.pendingProofs[yy] ? member.pendingProofs[yy] : null;
      if (!statusMap || !gatewayMap) continue;

      Object.keys(gatewayMap).forEach(function(monthKey) {
        var gateway = gatewayMap[monthKey] || {};
        var currentStatus = String(statusMap[monthKey] || "").trim().toLowerCase();
        if (currentStatus !== "gateway_pending" && currentStatus !== "pending") return;

        var remoteStatus = normalizeMidtransStatus_(gateway.transactionStatus || "");
        var expiresAtTs = parseGatewayExpiryTime_(gateway.expiresAt);
        var isExpiredByClock = expiresAtTs > 0 && expiresAtTs <= nowTs;
        var isExpiredByStatus = isMidtransFailureStatus_(remoteStatus);
        if (!isExpiredByClock && !isExpiredByStatus) return;

        delete statusMap[monthKey];
        delete gatewayMap[monthKey];
        if (proofMap && proofMap[monthKey]) delete proofMap[monthKey];
        changed = true;
      });

      if (proofMap && !Object.keys(proofMap).length) {
        delete member.pendingProofs[yy];
      }
      if (member.pendingProofs && !Object.keys(member.pendingProofs).length) {
        delete member.pendingProofs;
      }
      if (gatewayMap && !Object.keys(gatewayMap).length) {
        delete member.gatewayPayments[yy];
      }
      if (member.gatewayPayments && !Object.keys(member.gatewayPayments).length) {
        delete member.gatewayPayments;
      }
      if (statusMap && !Object.keys(statusMap).length) {
        delete member.status[yy];
      }
    }
  }

  return changed;
}

function parseGatewayExpiryTime_(value) {
  var raw = String(value || "").trim();
  if (!raw) return 0;
  var ts = new Date(raw).getTime();
  return isNaN(ts) ? 0 : ts;
}

function findMemberByKatAndId_(data, kat, id) {
  var list = String(kat || "").trim().toUpperCase() === "HELPER" ? data.helper : data.driver;
  if (!Array.isArray(list)) return null;
  for (var i = 0; i < list.length; i++) {
    if (String(list[i] && list[i].id || "") === String(id || "")) {
      return list[i];
    }
  }
  return null;
}

function findMemberByMidtransOrderId_(data, orderId, preferredYear) {
  var years = [];
  var yearToken = String(preferredYear || parseMidtransYearFromOrderId_(orderId) || "").trim();
  if (yearToken) years.push(yearToken);
  years.push(String(new Date().getFullYear()));

  var lists = [
    { kat: "DRIVER", rows: Array.isArray(data.driver) ? data.driver : [] },
    { kat: "HELPER", rows: Array.isArray(data.helper) ? data.helper : [] }
  ];
  var seenYears = {};

  for (var li = 0; li < lists.length; li++) {
    var listInfo = lists[li];
    for (var i = 0; i < listInfo.rows.length; i++) {
      var member = listInfo.rows[i] || {};
      var gatewayPayments = member.gatewayPayments || {};
      var candidateYears = years.slice();
      Object.keys(gatewayPayments).forEach(function(yearKey) {
        if (!seenYears[yearKey]) candidateYears.push(yearKey);
      });
      for (var y = 0; y < candidateYears.length; y++) {
        var yy = String(candidateYears[y] || "").trim();
        if (!yy || seenYears[listInfo.kat + ":" + i + ":" + yy]) continue;
        seenYears[listInfo.kat + ":" + i + ":" + yy] = true;
        var yearMap = gatewayPayments[yy];
        if (!yearMap || typeof yearMap !== "object") continue;
        var monthKeys = Object.keys(yearMap);
        for (var m = 0; m < monthKeys.length; m++) {
          var entry = yearMap[monthKeys[m]] || {};
          if (String(entry.orderId || "") === String(orderId || "")) {
            return {
              kat: listInfo.kat,
              member: member,
              year: yy
            };
          }
        }
      }
    }
  }
  return null;
}

function handleAdminScriptInfo_(e) {
  validateAdminAuth_((e && e.parameter && e.parameter.authToken) || "");
  var scriptProps = PropertiesService.getScriptProperties();
  var scriptId = "";
  var webUrl = "";
  try {
    scriptId = ScriptApp.getScriptId();
    webUrl = ScriptApp.getService().getUrl() || "";
  } catch (_) {}

  return jsonResponse_({
    ok: true,
    data: {
      scriptId: scriptId,
      webAppUrl: webUrl,
      hasApiSecret: !!scriptProps.getProperty(API_SECRET_KEY),
      firestore: {
        projectId: scriptProps.getProperty(FCM_PROJECT_ID) || DEFAULT_FIREBASE_CONFIG.projectId || "",
        hasServiceAccount: !!scriptProps.getProperty(FCM_SA_CLIENT_EMAIL_KEY) &&
          !!scriptProps.getProperty(FCM_SA_PRIVATE_KEY_KEY)
      }
    }
  });
}

function handleAdminMovePropsToFirestore_(e) {
  validateAdminAuth_((e && e.parameter && e.parameter.authToken) || "");
  var scriptProps = PropertiesService.getScriptProperties();
  var allProps = scriptProps.getProperties() || {};
  var keys = Object.keys(allProps || {});
  if (!keys.length) {
    return jsonResponse_({ ok: false, error: "Script Properties kosong." });
  }

  var skipKeys = {};
  skipKeys[FCM_TOKENS_KEY] = true;
  skipKeys[FCM_LAST_SEND_KEY] = true;

  var sanitized = {};
  var skipped = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = allProps[key];
    if (skipKeys[key]) {
      skipped.push(key);
      continue;
    }
    if (String(value || "").length > 20000) {
      skipped.push(key);
      continue;
    }
    sanitized[key] = value;
  }

  var moved = writeSecurePropsToFirestore_(sanitized, "ADMIN");
  moved.skipped = skipped;
  return jsonResponse_({
    ok: true,
    data: moved
  });
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

  if (count) {
    backupScriptProperties_();
  }

  return {
    ok: true,
    updated: count
  };
}

function runAdminSelfTest_() {
  var tests = [];
  runSelfTestCase_(tests, "normalizePayload_defaults", function() {
    var out = normalizePayload_({});
    assertSelfTest_(Array.isArray(out.driver), "driver should be array");
    assertSelfTest_(Array.isArray(out.helper), "helper should be array");
    assertSelfTest_(Array.isArray(out.transaksi), "transaksi should be array");
    assertSelfTest_(Array.isArray(out.logs), "logs should be array");
  });

  runSelfTestCase_(tests, "driver_row_roundtrip", function() {
    var source = {
      id: "M-001",
      nama: "ANDI",
      status: {
        "2026": {
          1: true,
          2: false,
          3: true,
          12: true
        }
      }
    };
    var row = toRowByType_("driver", source, 0, "2026");
    var restored = fromRowByType_("driver", row, "2026");
    assertSelfTest_(restored && restored.nama === source.nama, "driver name mismatch");
    assertSelfTest_(restored.status["2026"][1] === true, "month 1 mismatch");
    assertSelfTest_(restored.status["2026"][2] === false, "month 2 mismatch");
    assertSelfTest_(restored.status["2026"][12] === true, "month 12 mismatch");
  });

  runSelfTestCase_(tests, "transaksi_row_roundtrip", function() {
    var source = {
      tp: "pemasukan",
      d: "2026-03-29",
      p: "KAS",
      k: "UJI",
      v: 25000
    };
    var row = toRowByType_("transaksi", source, 0, "2026");
    var restored = fromRowByType_("transaksi", row, "2026");
    assertSelfTest_(restored && restored.tp === source.tp, "transaksi type mismatch");
    assertSelfTest_(restored.d === source.d, "transaksi date mismatch");
    assertSelfTest_(Number(restored.v) === Number(source.v), "transaksi nominal mismatch");
  });

  runSelfTestCase_(tests, "fcm_request_builder", function() {
    var request = buildFcmSendRequest_(
      "kas-delta-8",
      "test-token",
      "device-token",
      "Judul",
      "Body",
      { tag: "uji", url: "https://example.com" }
    );
    assertSelfTest_(request.method === "post", "request method mismatch");
    assertSelfTest_(String(request.url).indexOf("/messages:send") !== -1, "request url mismatch");
    assertSelfTest_(String(request.payload).indexOf("device-token") !== -1, "request payload mismatch");
  });

  runSelfTestCase_(tests, "year_layout_builder", function() {
    var layout = buildYearSheetLayout_(
      normalizePayload_({
        driver: [{ id: "1", nama: "A", status: { "2026": { 1: true } } }],
        helper: [{ id: "2", nama: "B", status: { "2026": { 2: true } } }],
        transaksi: [{ tp: "pengeluaran", d: "2026-03-29", p: "KAS", k: "Tes", v: 1000 }],
        logs: [{ time: "29/03/2026 12.00", editor: "ADMIN", aksi: "TEST", ket: "OK" }]
      }),
      "2026"
    );
    assertSelfTest_(layout && Array.isArray(layout.sections), "layout sections missing");
    assertSelfTest_(layout.sections.length === 4, "layout sections count mismatch");
    assertSelfTest_(layout.maxRow >= 3, "layout maxRow too small");
    assertSelfTest_(layout.maxCol >= 26, "layout maxCol too small");
  });

  var passed = 0;
  var failed = 0;
  for (var i = 0; i < tests.length; i++) {
    if (tests[i].ok) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    ok: failed === 0,
    passed: passed,
    failed: failed,
    tests: tests
  };
}

function runSelfTestCase_(tests, name, fn) {
  try {
    fn();
    tests.push({ name: name, ok: true });
  } catch (err) {
    tests.push({
      name: name,
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function assertSelfTest_(condition, message) {
  if (!condition) {
    throw new Error(message || "assertion_failed");
  }
}

function adminGetHealthSummary_() {
  ensureBootstrapConfig_();
  var props = PropertiesService.getScriptProperties();
  var effectivePin = String(getPropWithFirestoreFallback_(APP_PIN_KEY) || "");
  return {
    ok: true,
    hasPin: !!effectivePin,
    pinDefault: effectivePin === "0000",
    fcmProjectId: props.getProperty(FCM_PROJECT_ID) || DEFAULT_FIREBASE_CONFIG.projectId,
    hasServiceAccountEmail: !!(props.getProperty(FCM_SA_CLIENT_EMAIL_KEY) || DEFAULT_SERVICE_ACCOUNT_EMAIL),
    hasServiceAccountPrivateKey: !!props.getProperty(FCM_SA_PRIVATE_KEY_KEY)
  };
}
