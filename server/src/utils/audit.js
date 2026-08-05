import { db } from '../config/db.js'

export async function writeAuditLog(userId, activity) {
  const { error } = await db.from('audit_log').insert({ user_id: userId, aktivitas: activity })
  if (error) {
    console.error('[AUDIT_LOG] Gagal mencatat aktivitas:', { userId, activity, error: error.message })
    return false
  }
  return true
}
