# Skenario Presentasi

## Persiapan

1. Jalankan `npm run dev:local`.
2. Jalankan `npm run preflight`.
3. Siapkan browser pada `http://localhost:5174`.
4. Pastikan database Supabase client terhubung.

## Alur Demo

1. Login sebagai Guru.
2. Tunjukkan dashboard dan waktu server.
3. Buka halaman Absensi.
4. Tunjukkan status absensi hari ini.
5. Login sebagai Tata Usaha.
6. Buka **Jam Absensi** dan tunjukkan pengaturan batas waktu.
7. Buka **Rekap Absen** dan tunjukkan input manual serta koreksi.
8. Buka **Hari Libur** untuk menunjukkan pengaturan tanggal libur.
9. Buka **Laporan** dan tunjukkan pilihan tahunan/bulanan.
10. Tunjukkan export Excel dan PDF.
11. Buka **Audit Log** untuk menunjukkan aktivitas pengguna.
12. Login sebagai Kepala Sekolah dan tunjukkan akses laporan read-only.

## Validasi Yang Bisa Ditunjukkan

- Guru tidak dapat membuka menu Tata Usaha.
- Hari libur menonaktifkan absensi.
- Input alasan muncul ketika absen terlambat atau pulang lebih awal.
- Perubahan jam TU berlaku pada aturan absensi.
- Data yang dibuat atau diubah tercatat pada audit log.

## Jika Terjadi Masalah

- Jalankan ulang `npm run preflight`.
- Pastikan backend berjalan pada port `4000`.
- Pastikan frontend berjalan pada port `5174`.
- Periksa `server/.env` dan koneksi Supabase.
- Jangan menghapus data production saat demo.
