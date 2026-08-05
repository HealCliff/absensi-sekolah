// Mock data — struktur mengikuti PRD Sistem Absensi Guru
// users, guru, absensi, hari_libur

export const USERS = [
  { id: 1, nik: '1234567890123456', password: 'guru12345', role: 'guru', guru_id: 1, nama: 'Ahmad Fauzi, S.Pd.', isFirstLogin: false, status_aktif: true },
  { id: 2, nik: '9876543210987654', password: 'tu12345', role: 'tata_usaha', guru_id: null, nama: 'Siti Nurjanah', isFirstLogin: false, status_aktif: true },
  { id: 3, nik: '1111222233334444', password: 'kepsek12345', role: 'kepala_sekolah', guru_id: null, nama: 'Drs. H. Bambang Sutrisno, M.Pd.', isFirstLogin: false, status_aktif: true },
]

export const GURU = [
  { id: 1, nama: 'Ahmad Fauzi, S.Pd.', nip_nuptk: '198503152010011001', jenis_kelamin: 'L', kontak: '081234567801', jabatan_mapel: 'Matematika', status_aktif: true },
  { id: 2, nama: 'Bambang Sutrisno, S.Pd.', nip_nuptk: '198203012006041005', jenis_kelamin: 'L', kontak: '081234567802', jabatan_mapel: 'Bahasa Indonesia', status_aktif: true },
  { id: 3, nama: 'Citra Lestari, S.Pd.', nip_nuptk: '199001152015032002', jenis_kelamin: 'P', kontak: '081234567803', jabatan_mapel: 'IPA', status_aktif: true },
  { id: 4, nama: 'Dewi Anggraini, S.Pd.', nip_nuptk: '199203102019032004', jenis_kelamin: 'P', kontak: '081234567804', jabatan_mapel: 'IPS', status_aktif: true },
  { id: 5, nama: 'Eko Prasetyo, S.Pd.I.', nip_nuptk: '198807122011011007', jenis_kelamin: 'L', kontak: '081234567805', jabatan_mapel: 'Pendidikan Agama Islam', status_aktif: true },
  { id: 6, nama: 'Fitri Handayani, S.Pd.', nip_nuptk: '199506202020122006', jenis_kelamin: 'P', kontak: '081234567806', jabatan_mapel: 'Bahasa Inggris', status_aktif: true },
  { id: 7, nama: 'Gunawan Wibisono, S.Kom.', nip_nuptk: '199002012015031008', jenis_kelamin: 'L', kontak: '081234567807', jabatan_mapel: 'TIK', status_aktif: true },
  { id: 8, nama: 'Hesti Purnamasari, S.Pd.', nip_nuptk: '199312252019032009', jenis_kelamin: 'P', kontak: '081234567808', jabatan_mapel: 'PPKn', status_aktif: false },
  { id: 9, nama: 'Indra Saputra, S.Pd.', nip_nuptk: '198609302010011010', jenis_kelamin: 'L', kontak: '081234567809', jabatan_mapel: 'Penjaskes', status_aktif: true },
  { id: 10, nama: 'Juwita Sari, S.Pd.', nip_nuptk: '199102142018012011', jenis_kelamin: 'P', kontak: '081234567810', jabatan_mapel: 'Seni Budaya', status_aktif: true },
]

// Batas waktu absen (bisa diatur)
export const JAM_BATAS_MASUK = '07:15'
export const JAM_BATAS_PULANG = '13:00'

export const ABSENSI = [
  // --- Hari ini (pakai tanggal dinamis di generator) ---
  // { guru_id, tanggal, jam_masuk, jam_pulang, status, keterangan, dikoreksi_oleh }
]

export const HARI_LIBUR = [
  { id: 1, tanggal: '2025-01-01', keterangan: 'Tahun Baru Masehi' },
  { id: 2, tanggal: '2025-03-29', keterangan: 'Hari Raya Nyepi' },
  { id: 3, tanggalMulai: '2025-03-31', tanggalSelesai: '2025-04-07', keterangan: 'Libur Idul Fitri' },
]
