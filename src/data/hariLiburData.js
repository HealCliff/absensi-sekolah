// Dummy data hari libur — struktur mengikuti PRD bagian 5
// Bisa berupa satu tanggal (tanggal) atau range (tanggalMulai + tanggalSelesai)

export const DUMMY_HARI_LIBUR = [
  { id: 1, tanggal: '2025-01-01', keterangan: 'Tahun Baru Masehi' },
  { id: 2, tanggal: '2025-03-29', keterangan: 'Hari Raya Nyepi' },
  { id: 3, tanggalMulai: '2025-03-31', tanggalSelesai: '2025-04-07', keterangan: 'Libur Idul Fitri' },
  { id: 4, tanggalMulai: '2025-06-26', tanggalSelesai: '2025-07-14', keterangan: 'Libur Kenaikan Kelas' },
]
