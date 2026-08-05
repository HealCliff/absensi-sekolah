import { Router } from 'express'
import { db } from '../config/db.js'
import { asyncHandler } from '../utils/helpers.js'
import { auth, requireActiveUser } from '../middleware/auth.js'
import { getSchoolDateTime, SCHOOL_TIME_ZONE } from '../utils/time.js'

const router = Router()

router.use(auth, requireActiveUser(db))

router.get('/', asyncHandler(async (req, res) => {
  const now = new Date()
  res.json({
    data: {
      epochMs: now.getTime(),
      iso: now.toISOString(),
      timezone: SCHOOL_TIME_ZONE,
      ...getSchoolDateTime(now),
    },
  })
}))

export default router
