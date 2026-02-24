'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Car, Phone } from 'lucide-react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-brand-navy border-b border-brand-steel sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-brand-charcoal border-b border-brand-steel/30">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center text-xs text-gray-400">
          <span>Mon–Sat: 9AM – 7PM | Sun: 10AM – 5PM</span>
          <a href="tel:+919999999999" className="flex items-center gap-1 text-brand-gold hover:text-brand-gold-light transition-colors">
            <Phone size={12} />
            +91 99999 99999
          </a>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-brand-gold p-2 rounded-sm group-hover:bg-brand-gold-light transition-colors">
            <Car size={20} className="text-brand-navy" />
          </div>
          <div>
            <div className="font-bold text-white text-lg leading-none tracking-wide">KHALSA</div>
            <div className="text-brand-gold text-xs tracking-[0.2em] font-medium">MOTORS</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/cars">Our Cars</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/admin/login" className="text-gray-400 hover:text-brand-gold text-sm transition-colors">
            Admin
          </Link>
          <Link href="/cars" className="btn-gold text-sm py-2 px-4">
            View Cars
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white p-1" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-charcoal border-t border-brand-steel/30 px-4 pb-4">
          <div className="flex flex-col gap-4 pt-4">
            <MobileLink href="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
            <MobileLink href="/cars" onClick={() => setMobileOpen(false)}>Our Cars</MobileLink>
            <MobileLink href="/contact" onClick={() => setMobileOpen(false)}>Contact</MobileLink>
            <MobileLink href="/admin/login" onClick={() => setMobileOpen(false)}>Admin Login</MobileLink>
          </div>
        </div>
      )}
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-gray-300 hover:text-brand-gold transition-colors text-sm font-medium">
      {children}
    </Link>
  )
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="text-gray-300 hover:text-brand-gold transition-colors text-base font-medium">
      {children}
    </Link>
  )
}