'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Car, MessageSquare, Mail, LayoutDashboard, LogOut, Plus, History } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setIsAdmin(true)
        } else {
          router.replace('/admin/login')
        }
        setLoading(false)
      })
  }, [pathname])

  if (pathname === '/admin/login') return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return null

 const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/admin/cars', label: 'All Cars', icon: <Car size={18} /> },
  { href: '/admin/cars/new', label: 'Add Car', icon: <Plus size={18} /> },
  { href: '/admin/enquiries', label: 'Enquiries', icon: <MessageSquare size={18} /> },
  { href: '/admin/messages', label: 'Messages', icon: <Mail size={18} /> },
  { href: '/admin/history', label: 'Sales History', icon: <History size={18} /> }, // 👈 add this
]

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-brand-cream">
      <aside className="w-56 bg-brand-navy shrink-0 flex flex-col">
        <div className="p-5 border-b border-brand-steel/30">
          <div className="flex items-center gap-2">
            <div className="bg-brand-gold p-1.5 rounded-sm">
              <Car size={16} className="text-brand-navy" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">KHALSA</div>
              <div className="text-brand-gold text-[10px] tracking-widest">ADMIN</div>
            </div>
          </div>
        </div>

        <nav className="p-4 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all ${
                pathname === item.href
                  ? 'bg-brand-gold text-brand-navy'
                  : 'text-gray-400 hover:text-white hover:bg-brand-charcoal'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-steel/30">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-red-400 text-sm w-full transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}