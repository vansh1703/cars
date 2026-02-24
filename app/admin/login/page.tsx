'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, Lock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      toast.error(data.error || 'Invalid credentials')
    } else {
      toast.success(`Welcome back, ${data.user.name}!`)
      router.replace('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="bg-brand-gold p-3 rounded-sm">
                <Car size={24} className="text-brand-navy" />
              </div>
            </div>
            <div className="font-bold text-white text-2xl">KHALSA MOTORS</div>
            <div className="text-brand-gold text-xs tracking-widest uppercase mt-1">Admin Portal</div>
          </div>
        </div>

        <div className="bg-brand-charcoal rounded-sm p-8 border border-brand-steel/30">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={16} className="text-brand-gold" />
            <h2 className="font-semibold text-white">Sign In to Dashboard</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-navy border border-brand-steel text-white placeholder-gray-500 rounded-sm pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                required
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-navy border border-brand-steel text-white placeholder-gray-500 rounded-sm pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-3 disabled:opacity-60 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-gray-600 text-xs mt-4">Restricted to authorized personnel only.</p>
      </div>
    </div>
  )
}