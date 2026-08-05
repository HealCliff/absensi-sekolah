-- Index tambahan untuk mempercepat rekap absensi dan audit log
create index if not exists idx_absensi_tanggal_guru_status
  on absensi (tanggal, guru_id, status);

create index if not exists idx_audit_log_created_at
  on audit_log (created_at desc);

create index if not exists idx_audit_log_user_created_at
  on audit_log (user_id, created_at desc);
