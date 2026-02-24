import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Add as many admins as you want here
const ADMIN_USERS = [
  { email: 'admin@khalsamotors.com', password: 'gursimrankaur', name: 'Super Admin' },
]

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const user = ADMIN_USERS.find(
    (u) => u.email === email && u.password === password
  )

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', JSON.stringify({ email: user.email, name: user.name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return NextResponse.json({ success: true, user: { email: user.email, name: user.name } })
}