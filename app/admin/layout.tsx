'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Car, MessageSquare, Mail, LayoutDashboard, LogOut, Plus, History, Menu, X, ChevronLeft } from 'lucide-react'

// 1. Defined a proper interface for Nav Items
interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number // Optional
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [unread, setUnread] = useState({ enquiries: 0, messages: 0 })
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/admin/login') { setLoading(false); return }
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setIsAdmin(true)
          fetchUnread()
        } else {
          router.replace('/admin/login')
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        router.replace('/admin/login')
      })
  }, [pathname, router])

  const fetchUnread = async () => {
    try {
      const [enqRes, msgRes] = await Promise.all([
        fetch('/api/enquiries'),
        fetch('/api/messages'),
      ])
      const [enqData, msgData] = await Promise.all([enqRes.json(), msgRes.json()])
      
      setUnread({
        enquiries: Array.isArray(enqData) ? enqData.filter((e: any) => !e.is_read).length : 0,
        messages: Array.isArray(msgData) ? msgData.filter((m: any) => !m.is_read).length : 0,
      })
    } catch (err) {
      console.error("Failed to fetch unread counts", err)
    }
  }

  if (pathname === '/admin/login') return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return null

  const navItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/admin/cars', label: 'All Cars', icon: <Car size={18} /> },
    { href: '/admin/cars/new', label: 'Add Car', icon: <Plus size={18} /> },
    { href: '/admin/enquiries', label: 'Enquiries', icon: <MessageSquare size={18} />, badge: unread.enquiries },
    { href: '/admin/messages', label: 'Messages', icon: <Mail size={18} />, badge: unread.messages },
    { href: '/admin/history', label: 'Sales History', icon: <History size={18} /> },
  ]

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/admin/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-brand-steel/30 flex items-center justify-between">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-brand-gold p-1.5 rounded-sm shrink-0">
              <Car size={16} className="text-brand-navy" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">KHALSA</div>
              <div className="text-brand-gold text-[10px] tracking-widest">ADMIN</div>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="bg-brand-gold p-1.5 rounded-sm mx-auto">
            <Car size={16} className="text-brand-navy" />
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex text-gray-500 hover:text-white transition-colors ml-auto"
        >
          <ChevronLeft size={16} className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="p-3 flex-1 space-y-1">
        {navItems.map((item) => {
          // 2. Fixed the "undefined" issue by ensuring badge defaults to 0
          const badgeCount = item.badge || 0;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all relative ${
                pathname === item.href
                  ? 'bg-brand-gold text-brand-navy'
                  : 'text-gray-400 hover:text-white hover:bg-brand-charcoal'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <span className="relative shrink-0">
                {item.icon}
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </span>
              {!sidebarCollapsed && <span>{item.label}</span>}
              {!sidebarCollapsed && badgeCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-brand-steel/30">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-red-400 text-sm w-full transition-colors rounded-sm hover:bg-brand-charcoal ${sidebarCollapsed ? 'justify-center' : ''}`}
          title={sidebarCollapsed ? 'Sign Out' : ''}
        >
          <LogOut size={18} />
          {!sidebarCollapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-brand-cream">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-brand-navy z-50 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      <aside className={`hidden lg:flex flex-col bg-brand-navy shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
        <SidebarContent />
      </aside>

      <main className="flex-1 overflow-auto min-w-0">
        <div className="lg:hidden bg-brand-navy px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-brand-gold p-1 rounded-sm">
              <Car size={14} className="text-brand-navy" />
            </div>
            <span className="font-bold text-white text-sm">KHALSA ADMIN</span>
          </div>
          {(unread.enquiries + unread.messages) > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unread.enquiries + unread.messages} new
            </span>
          )}
        </div>
        {children}
      </main>
    </div>
  )
}