export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}

export function notFound(req, res) {
  res.status(404).json({ message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan` })
}

export function errorHandler(err, req, res, _next) {
  console.error('[ERROR]', err)
  const status = err.status || 500
  const message =
    status >= 500 ? 'Terjadi kesalahan pada server' : err.message || 'Terjadi kesalahan pada server'
  res.status(status).json({ message })
}
