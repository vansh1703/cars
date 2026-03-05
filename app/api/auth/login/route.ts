import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit'

const ADMIN_USERS = [
  { email: 'admin@khalsamotors.com', password: 'gursimrankaur', name: 'Super Admin' },
]

export async function POST(request: Request) {
  // Get IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  // Check rate limit
  const { allowed, remaining, retryAfterSeconds } = checkRateLimit(ip)

  if (!allowed) {
    const minutes = Math.ceil(retryAfterSeconds / 60)
    console.warn(`🚫 Rate limited — IP: ${ip}, retry in ${retryAfterSeconds}s`)
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.` },
      { status: 429 }
    )
  }

  const body = await request.json()
  const { email, password, website } = body

  // Honeypot — bots fill hidden fields
  if (website) {
    console.warn(`🤖 Bot detected — IP: ${ip}`)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const user = ADMIN_USERS.find(
    (u) => u.email === email && u.password === password
  )

  if (!user) {
    console.warn(`❌ Failed login — IP: ${ip}, Email: ${email}, Attempts remaining: ${remaining}`)
    return NextResponse.json(
      { error: `Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
      { status: 401 }
    )
  }

  // Success — reset rate limit for this IP
  resetRateLimit(ip)
  console.log(`✅ Successful login — IP: ${ip}, Email: ${email}`)

  const cookieStore = await cookies()
  cookieStore.set('admin_session', JSON.stringify({ email: user.email, name: user.name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ success: true, user: { email: user.email, name: user.name } })
}