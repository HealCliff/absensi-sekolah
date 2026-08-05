-- Pengaturan jam absensi yang dapat diubah Tata Usaha
create table if not exists pengaturan_absensi (
  id smallint primary key check (id = 1),
  jam_batas_masuk time not null default '07:15',
  jam_batas_pulang time not null default '13:00',
  updated_by bigint references users(id) on delete set null,
  updated_at timestamptz not null default now(),
  check (jam_batas_masuk < jam_batas_pulang)
);

insert into pengaturan_absensi (id, jam_batas_masuk, jam_batas_pulang)
values (1, '07:15', '13:00')
on conflict (id) do nothing;
