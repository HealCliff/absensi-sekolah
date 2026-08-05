-- Keamanan login: batasi percobaan password gagal dan kunci sementara akun.
alter table users
  add column if not exists failed_login_attempts smallint not null default 0,
  add column if not exists locked_until timestamptz;
