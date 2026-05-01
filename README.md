# Delta_8

CI/CD project ini sekarang memakai GitHub Actions untuk 2 jalur deploy:

- `gas_fix/**` ke Google Apps Script lewat `.github/workflows/deploy-gas.yml`
- `public/**` ke Firebase Hosting lewat `.github/workflows/firebase-hosting-merge.yml` dan `.github/workflows/firebase-hosting-pull-request.yml`

Secret GitHub yang wajib diisi:

- `CLASP_CREDENTIALS_JSON_B64`: isi Base64 dari file kredensial `~/.clasprc.json` untuk `clasp`
- `GAS_SCRIPT_ID`: Script ID Google Apps Script tujuan
- `FIREBASE_SERVICE_ACCOUNT`: JSON service account Firebase Hosting untuk project `kas-delta-8`

Secret GitHub yang disarankan:

- `GAS_AUTH_TOKEN`: token admin backend untuk backup properties dan `adminSelfTest` otomatis setelah deploy GAS

Contoh file dan script bantu:

- template service account aman ada di `firebase-service-account.example.json`
- script set secret GitHub ada di `scripts/set-github-secrets.ps1`
- script panggil endpoint admin GAS ada di `scripts/invoke-gas-admin-endpoint.ps1`
- script commit lalu push ke `main` ada di `scripts/push-main.ps1`
- script watcher auto commit + auto deploy lokal ada di `scripts/start-auto-commit-deploy.ps1`

Trigger deploy:

- push ke branch `main` dengan perubahan di `Code.gs`, `admin.html`, `index.html`, atau `gas_fix/**` akan deploy Apps Script
- push ke branch `main` dengan perubahan di `index.html`, `firebase-messaging-sw.js`, `public/**`, `firebase.json`, atau `.firebaserc` akan deploy Firebase Hosting live
- pull request yang mengubah file hosting akan membuat preview channel Firebase

Catatan:

- File root `Code.gs`, `index.html`, `styles.css`, `app.js`, `admin.html`, dan `firebase-messaging-sw.js` sekarang menjadi source utama yang Anda edit
- Workflow akan otomatis menyalin source root ke folder deploy `gas_fix/` dan `public/` sebelum deploy berjalan
- Source yang benar-benar dideploy ke Firebase tetap berasal dari folder `public/`
- Source yang benar-benar dipush ke Apps Script tetap berasal dari folder `gas_fix/`
- Fitur FCM web push default sudah memakai `vapidKey` project `kas-delta-8`
- file rahasia lokal seperti `firebase-service-account.json` sudah di-ignore dari git

Cara pakai cepat:

1. Salin `firebase-service-account.example.json` menjadi `firebase-service-account.json`, lalu isi dengan JSON key asli.
2. Pastikan file `~/.clasprc.json` di komputer ini valid untuk `clasp`.
3. Jalankan:

```powershell
.\scripts\set-github-secrets.ps1
```

4. Setelah secret terpasang, jalankan:

```powershell
.\scripts\push-main.ps1
```

Mode auto commit + auto deploy lokal:

```powershell
.\scripts\start-auto-commit-deploy.ps1
```

Untuk menghentikan:

```powershell
.\scripts\stop-auto-commit-deploy.ps1
```

Catatan eksekusi:

- script `set-github-secrets.ps1` butuh GitHub CLI `gh`
- `GAS_SCRIPT_ID` otomatis dibaca dari `gas_fix/.clasp.json` jika tersedia
- jika repo target bukan repo yang sedang aktif di `gh`, pakai `-Repo owner/nama-repo`
- isi `-GasAuthToken` saat menjalankan `set-github-secrets.ps1` jika ingin backup properties dan backend self-test otomatis di workflow deploy GAS
- watcher auto commit lokal ada di `scripts/start-auto-commit-deploy.ps1` dan dapat dihentikan lewat `scripts/stop-auto-commit-deploy.ps1`

Self-check backend:

- endpoint admin `?action=adminSelfTest&authToken=API_SECRET` sekarang tersedia untuk menjalankan regression check ringan di backend Apps Script
- self-check ini memverifikasi helper payload, roundtrip row conversion, builder request FCM, dan layout builder sheet

Firestore realtime security:

- rules Firestore ada di `firestore.rules` dan saat ini hanya membuka koleksi `delta8_year_sync`
- App Check client sudah disiapkan di `index.html`, tetapi default-nya nonaktif sampai Anda mengisi `window.DELTA8_APPCHECK_CONFIG`
- contoh aktivasi sebelum script aplikasi berjalan:

```html
<script>
  window.DELTA8_APPCHECK_CONFIG = {
    enabled: true,
    provider: 'recaptcha-enterprise',
    siteKey: 'ISI_SITE_KEY_APPCHECK_DI_SINI'
  };
</script>
```

- setelah site key dipasang, aktifkan enforcement App Check untuk Cloud Firestore di Firebase Console
- untuk deploy rules:

```powershell
firebase deploy --only firestore:rules
```
