import { access } from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import dotenv from 'dotenv'

dotenv.config()

const execFileAsync = promisify(execFile)
const databaseUrl = process.env.DATABASE_URL
const backupFile = process.env.BACKUP_FILE

if (!databaseUrl || !backupFile) {
  console.error('[RESTORE] DATABASE_URL dan BACKUP_FILE wajib diatur di server/.env')
  process.exit(1)
}

if (process.env.CONFIRM_RESTORE !== 'YES') {
  console.error('[RESTORE] Restore dibatalkan. Set CONFIRM_RESTORE=YES untuk mengizinkan proses destruktif ini.')
  process.exit(1)
}

const resolvedBackupFile = path.resolve(backupFile)

try {
  await access(resolvedBackupFile)
  await execFileAsync('pg_restore', [
    '--clean',
    '--if-exists',
    '--no-owner',
    '--exit-on-error',
    '--dbname',
    databaseUrl,
    resolvedBackupFile,
  ])
  console.log(`[RESTORE] Berhasil dipulihkan dari: ${resolvedBackupFile}`)
} catch (error) {
  console.error('[RESTORE] Gagal memulihkan backup:', error.message)
  if (error.code === 'ENOENT') console.error('[RESTORE] Pastikan pg_restore dari PostgreSQL Client sudah terpasang dan tersedia di PATH.')
  process.exit(1)
}
