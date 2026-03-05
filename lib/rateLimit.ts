// In-memory store — works on Vercel serverless too
const attempts = new Map<string, { count: number; resetAt: number }>()

const MAX_ATTEMPTS = 3
const WINDOW_MS = 30 * 60 * 1000 // 30 minutes

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now()
  const record = attempts.get(ip)

  // No record or window expired — reset
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterSeconds: 0 }
  }

  // Within window
  if (record.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000)
    return { allowed: false, remaining: 0, retryAfterSeconds }
  }

  record.count++
  attempts.set(ip, record)
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count, retryAfterSeconds: 0 }
}

export function resetRateLimit(ip: string) {
  attempts.delete(ip)
}