import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useGuruStore } from '../store/guruStore'
import { useAttendanceStore } from '../store/attendanceStore'
import { useHariLiburStore } from '../store/hariLiburStore'
import { useUsersStore } from '../store/usersStore'

export function useLoadData() {
  const { user } = useAuthStore()
  const fetchGuru = useGuruStore((s) => s.fetchGuru)
  const fetchRecords = useAttendanceStore((s) => s.fetchRecords)
  const fetchHariLibur = useHariLiburStore((s) => s.fetchHariLibur)
  const fetchUsers = useUsersStore((s) => s.fetchUsers)
  const loaded = useRef(null)

  useEffect(() => {
    if (!user) return
    const key = `${user.id}:${user.role}`
    if (loaded.current === key) return
    loaded.current = key

    fetchHariLibur()
    if (user.role === 'guru') {
      fetchRecords()
    } else {
      fetchGuru()
      fetchRecords()
      fetchUsers()
    }
  }, [user, fetchGuru, fetchRecords, fetchHariLibur, fetchUsers])
}
