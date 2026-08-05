import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import dotenv from 'dotenv'

dotenv.config()

const execFileAsync = promisify(execFile)
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('[BACKUP] DATABASE_URL belum diatur di server/.env')
  process.exit(1)
}

const backupDir = path.resolve(process.env.BACKUP_DIR || './backups')
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('Z', 'Z')
const outputFile = path.join(backupDir, `absensi-${timestamp}.dump`)

try {
  await mkdir(backupDir, { recursive: true })
  await execFileAsync('pg_dump', [
    '--format=custom',
    '--no-owner',
    '--file',
    outputFile,
    databaseUrl,
  ])
  console.log(`[BACKUP] Berhasil dibuat: ${outputFile}`)
} catch (error) {
  console.error('[BACKUP] Gagal membuat backup:', error.message)
  if (error.code === 'ENOENT') console.error('[BACKUP] Pastikan pg_dump dari PostgreSQL Client sudah terpasang dan tersedia di PATH.')
  process.exit(1)
}
