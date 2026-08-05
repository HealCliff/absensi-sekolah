# Backup dan Restore Database

Script backup membutuhkan `pg_dump` dan script restore membutuhkan `pg_restore` dari PostgreSQL Client.

## Konfigurasi

Isi `server/.env` dengan connection string PostgreSQL dari Supabase, bukan service role key:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
BACKUP_DIR=./backups
```

Jangan memasukkan `DATABASE_URL` ke repository atau membagikannya.

## Membuat Backup

Jalankan dari folder `server`:

```powershell
npm run backup:db
```

File `.dump` akan dibuat di folder `BACKUP_DIR` dengan format custom PostgreSQL.

## Restore

Restore bersifat destruktif. Hentikan backend terlebih dahulu, tentukan file backup, lalu jalankan:

```powershell
$env:BACKUP_FILE='./backups/absensi-2026-08-05T10-00-00-000Z.dump'
$env:CONFIRM_RESTORE='YES'
npm run restore:db
```

Setelah restore selesai, hapus kembali environment variable tersebut dari terminal dan verifikasi login, guru, absensi, dan laporan.

Supabase juga menyediakan backup terkelola sesuai paket yang digunakan. Script ini menjadi salinan tambahan yang dapat disimpan di lokasi terpisah.
