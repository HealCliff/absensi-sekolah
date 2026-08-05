-- Migration: skema awal database absensi sekolah
-- Jalankan di Supabase SQL Editor atau via supabase db push

-- ========== TABEL GURU ==========
create table if not exists guru (
  id bigserial primary key,
  nama varchar(255) not null,
  nip_nuptk varchar(30) not null unique,
  jenis_kelamin varchar(1) not null check (jenis_kelamin in ('L', 'P')),
  kontak varchar(20),
  jabatan_mapel varchar(255),
  status_aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- ========== TABEL USERS (akun login, auth custom JWT) ==========
create table if not exists users (
  id bigserial primary key,
  nik varchar(16) not null unique,
  password_hash text not null,
  role varchar(20) not null check (role in ('guru', 'tata_usaha', 'kepala_sekolah')),
  guru_id bigint references guru(id) on delete set null,
  nama varchar(255) not null,
  is_first_login boolean not null default false,
  status_aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== TABEL ABSENSI ==========
create table if not exists absensi (
  id bigserial primary key,
  guru_id bigint not null references guru(id) on delete cascade,
  tanggal date not null,
  jam_masuk time,
  jam_pulang time,
  status varchar(20) not null check (status in ('hadir', 'masuk', 'pulang', 'terlambat', 'izin', 'sakit', 'dinas', 'alpa', 'belum')),
  keterangan varchar(255),
  dikoreksi_oleh bigint references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guru_id, tanggal)
);

-- ========== TABEL HARI LIBUR ==========
create table if not exists hari_libur (
  id bigserial primary key,
  tanggal date,
  tanggal_mulai date,
  tanggal_selesai date,
  keterangan varchar(255) not null,
  created_at timestamptz not null default now()
);

-- ========== TABEL AUDIT LOG ==========
create table if not exists audit_log (
  id bigserial primary key,
  user_id bigint references users(id) on delete set null,
  aktivitas text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_absensi_guru_tanggal on absensi (guru_id, tanggal);
create index if not exists idx_absensi_tanggal on absensi (tanggal);

-- ========== SEED DATA AWAL ==========
-- Guru
insert into guru (nama, nip_nuptk, jenis_kelamin, kontak, jabatan_mapel, status_aktif) values
  ('Ahmad Fauzi, S.Pd.', '198503152010011001', 'L', '081234567801', 'Matematika', true),
  ('Bambang Sutrisno, S.Pd.', '198203012006041005', 'L', '081234567802', 'Bahasa Indonesia', true),
  ('Citra Lestari, S.Pd.', '199001152015032002', 'P', '081234567803', 'IPA', true),
  ('Dewi Anggraini, S.Pd.', '199203102019032004', 'P', '081234567804', 'IPS', true),
  ('Eko Prasetyo, S.Pd.I.', '198807122011011007', 'L', '081234567805', 'Pendidikan Agama Islam', true),
  ('Fitri Handayani, S.Pd.', '199506202020122006', 'P', '081234567806', 'Bahasa Inggris', true),
  ('Gunawan Wibisono, S.Kom.', '199002012015031008', 'L', '081234567807', 'TIK', true),
  ('Hesti Purnamasari, S.Pd.', '199312252019032009', 'P', '081234567808', 'PPKn', false),
  ('Indra Saputra, S.Pd.', '198609302010011010', 'L', '081234567809', 'Penjaskes', true),
  ('Juwita Sari, S.Pd.', '199102142018012011', 'P', '081234567810', 'Seni Budaya', true)
on conflict (nip_nuptk) do nothing;

-- Users (password digenerate via endpoint /api/auth/seed-password atau di-set manual)
-- Catatan: password disimpan hashed (bcrypt). Isi manual setelah backend jalan.
-- Default password demo: guru12345 / tu12345 / kepsek12345
insert into users (nik, password_hash, role, guru_id, nama, is_first_login, status_aktif) values
  ('1234567890123456', '', 'guru', 1, 'Ahmad Fauzi, S.Pd.', false, true),
  ('9876543210987654', '', 'tata_usaha', null, 'Siti Nurjanah', false, true),
  ('1111222233334444', '', 'kepala_sekolah', null, 'Drs. H. Bambang Sutrisno, M.Pd.', false, true)
on conflict (nik) do nothing;

-- Hari libur
insert into hari_libur (tanggal, keterangan) values
  ('2025-01-01', 'Tahun Baru Masehi'),
  ('2025-03-29', 'Hari Raya Nyepi');
insert into hari_libur (tanggal_mulai, tanggal_selesai, keterangan) values
  ('2025-03-31', '2025-04-07', 'Libur Idul Fitri');
