# Delta_8

CI/CD project ini sekarang memakai GitHub Actions untuk 2 jalur deploy:

- `gas_fix/**` ke Google Apps Script lewat `.github/workflows/deploy-gas.yml`
- `public/**` ke Firebase Hosting lewat `.github/workflows/firebase-hosting-merge.yml` dan `.github/workflows/firebase-hosting-pull-request.yml`

Secret GitHub yang wajib diisi:

- `CLASP_CREDENTIALS_JSON_B64`: isi Base64 dari file kredensial `~/.clasprc.json` untuk `clasp`
- `GAS_SCRIPT_ID`: Script ID Google Apps Script tujuan
- `FIREBASE_SERVICE_ACCOUNT`: JSON service account Firebase Hosting untuk project `kas-delta-8`

Contoh file dan script bantu:

- template service account aman ada di `firebase-service-account.example.json`
- script set secret GitHub ada di `scripts/set-github-secrets.ps1`
- script commit lalu push ke `main` ada di `scripts/push-main.ps1`

Trigger deploy:

- push ke branch `main` dengan perubahan di `gas_fix/**` akan deploy Apps Script
- push ke branch `main` dengan perubahan di `public/**`, `firebase.json`, atau `.firebaserc` akan deploy Firebase Hosting live
- pull request yang mengubah file hosting akan membuat preview channel Firebase

Catatan:

- Source yang benar-benar dideploy ke Firebase ada di folder `public/`
- Source yang benar-benar dipush ke Apps Script ada di folder `gas_fix/`
- File root seperti `index.html` dan `Code.gs` tidak dipakai workflow deploy saat ini
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

Catatan eksekusi:

- script `set-github-secrets.ps1` butuh GitHub CLI `gh`
- `GAS_SCRIPT_ID` otomatis dibaca dari `gas_fix/.clasp.json` jika tersedia
- jika repo target bukan repo yang sedang aktif di `gh`, pakai `-Repo owner/nama-repo`
