# Setup Untuk Client

Dokumen ini digunakan ketika client memakai project Supabase miliknya sendiri.

## 1. Clone dan Install

```powershell
git clone https://github.com/HealCliff/absensi-sekolah.git
cd absensi-sekolah
npm install
cd server
npm install
```

## 2. Buat Project Supabase

1. Buat project baru di Supabase.
2. Buka menu **SQL Editor**.
3. Jalankan migration secara berurutan:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_pengaturan_absensi.sql`
   - `supabase/migrations/0003_index_performa.sql`
   - `supabase/migrations/0004_login_security.sql`

## 3. Konfigurasi Backend

Salin `server/.env.example` menjadi `server/.env`, lalu isi dengan credential project Supabase milik client:

```env
SUPABASE_URL=https://project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=isi_service_role_key
JWT_SECRET=isi_secret_acak_panjang
PORT=4000
SCHOOL_TIME_ZONE=Asia/Jakarta
```

Jangan mengunggah `server/.env` ke GitHub.

## 4. Buat Password Awal

Jalankan dari folder `server`:

```powershell
npm run setup:passwords
```

Script meminta password baru untuk akun Guru, Tata Usaha, dan Kepala Sekolah. Gunakan password minimal 8 karakter.

## 5. Jalankan Aplikasi

Dari root project:

```powershell
npm run dev:local
```

Buka `http://localhost:5174`.

## 6. Cek Kesiapan

Dengan backend dan frontend masih berjalan:

```powershell
npm run preflight
```

Semua pemeriksaan harus berstatus `PASS`.

## Catatan

- `DATABASE_URL` hanya diperlukan untuk backup/restore.
- `opencode.json`, `HANDOFF.md`, dan file TestSprite tidak diperlukan untuk menjalankan aplikasi.
- Jika port sedang digunakan, hentikan proses lama sebelum menjalankan `npm run dev:local`.
