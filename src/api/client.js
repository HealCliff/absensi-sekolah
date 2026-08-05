// API client frontend — fetch wrapper dengan injeksi token JWT
const TOKEN_KEY = 'absensi_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  let json = null
  try {
    json = await res.json()
  } catch {
    // respons tanpa body JSON
  }

  if (!res.ok) {
    const message = json?.message || `Terjadi kesalahan (${res.status})`
    const err = new Error(message)
    err.status = res.status
    err.reasonRequired = Boolean(json?.reason_required)
    if (res.status === 401) {
      setToken('')
      window.dispatchEvent(new CustomEvent('absensi:unauthorized'))
    }
    throw err
  }

  return json
}
