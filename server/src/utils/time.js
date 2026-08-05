import dotenv from 'dotenv'

dotenv.config()

const SCHOOL_TIME_ZONE = process.env.SCHOOL_TIME_ZONE || 'Asia/Jakarta'
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SCHOOL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

export function getSchoolDateTime(date = new Date()) {
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value])
  )

  return {
    tanggal: `${parts.year}-${parts.month}-${parts.day}`,
    jam: `${parts.hour}:${parts.minute}`,
    jamDetik: `${parts.hour}:${parts.minute}:${parts.second}`,
  }
}

export { SCHOOL_TIME_ZONE }
