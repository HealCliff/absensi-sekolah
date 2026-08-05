# Sistem Absensi Guru

Aplikasi absensi guru untuk MTs SA Al-Barokah dengan frontend React/Vite dan backend Express yang menyimpan data pada Supabase PostgreSQL.

## Fitur

- Login dengan role Guru, Tata Usaha, dan Kepala Sekolah.
- Absen masuk dan pulang dengan validasi waktu server `Asia/Jakarta`.
- Alasan wajib untuk absen masuk terlambat dan pulang lebih awal.
- Pengaturan jam masuk dan pulang oleh Tata Usaha.
- Rekap harian dengan koreksi dan input absensi manual.
- Laporan tahunan dan bulanan dengan export Excel.
- Audit log aktivitas pengguna.
- Hari libur dan manajemen akun.

## Prasyarat

- Node.js 20 atau lebih baru.
- PostgreSQL Client hanya diperlukan untuk backup/restore.
- Project Supabase PostgreSQL.

## Instalasi

Install dependency frontend:

```powershell
npm install
```

Install dependency backend:

```powershell
cd server
npm install
```

Salin `server/.env.example` menjadi `server/.env`, lalu isi `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, dan `JWT_SECRET`.

## Database

Jalankan migration secara berurutan di Supabase SQL Editor:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_pengaturan_absensi.sql`
3. `supabase/migrations/0003_index_performa.sql`
4. `supabase/migrations/0004_login_security.sql`

Migration kedua membuat pengaturan jam absensi. Migration ketiga menambahkan index performa. Migration keempat menambahkan keamanan lockout login.

Setelah migration selesai, buat password akun pada Supabase client dengan menjalankan dari folder `server`:

```powershell
npm run setup:passwords
```

Script akan meminta password baru untuk tiga akun awal. Password minimal 8 karakter dan tidak disimpan di repository.

## Menjalankan Aplikasi

Untuk presentasi lokal, jalankan frontend dan backend sekaligus:

```powershell
npm run dev:local
```

Buka `http://localhost:5174`. Tekan `Ctrl+C` untuk menghentikan kedua server.

Sebelum presentasi, cek kesiapan aplikasi:

```powershell
npm run preflight
```

Preflight memeriksa frontend, backend, koneksi database, login TU, pengaturan jam, laporan, dan audit log.

Jika ingin menjalankan terpisah:

Terminal backend:

```powershell
cd server
npm run dev
```

Terminal frontend:

```powershell
npm run dev
```

Frontend memakai proxy `/api` ke backend `http://localhost:4000`.

## Akun Demo

| Role | NIK |
| --- | --- | --- |
| Guru | `1234567890123456` |
| Tata Usaha | `9876543210987654` |
| Kepala Sekolah | `1111222233334444` |

Password akun ditentukan sendiri saat menjalankan `npm run setup:passwords`.

## Testing dan Build

Test unit backend:

```powershell
cd server
npm test
```

Integration test membutuhkan backend yang sedang berjalan:

```powershell
$env:RUN_INTEGRATION_TESTS='true'
npm run test:integration
```

Lint dan build frontend:

```powershell
npm run lint
npm run build
```

## Production

Atur environment backend berikut:

```env
NODE_ENV=production
CORS_ORIGIN=https://domain-frontend.example
SCHOOL_TIME_ZONE=Asia/Jakarta
```

Gunakan HTTPS, secret acak yang panjang, dan jangan commit file `.env` atau service role key. Untuk backup/restore database, lihat `server/BACKUP.md`.

## Dokumentasi

- Setup client dan Supabase: `docs/SETUP_CLIENT.md`
- Panduan penggunaan: `docs/PANDUAN_PENGGUNA.md`
- Skenario presentasi: `docs/SKENARIO_PRESENTASI.md`
