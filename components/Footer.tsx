import Link from 'next/link'
import { Car, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-brand-gold p-2 rounded-sm">
              <Car size={18} className="text-brand-navy" />
            </div>
            <div>
              <div className="font-bold text-white text-base leading-none">KHALSA</div>
              <div className="text-brand-gold text-xs tracking-[0.2em]">MOTORS</div>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your trusted partner for premium pre-owned vehicles. Quality, transparency, and service you can count on.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="text-gray-400 hover:text-brand-gold transition-colors">Home</Link></li>
            <li><Link href="/cars" className="text-gray-400 hover:text-brand-gold transition-colors">Browse Cars</Link></li>
            <li><Link href="/contact" className="text-gray-400 hover:text-brand-gold transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2 text-gray-400">
              <MapPin size={16} className="text-brand-gold mt-0.5 shrink-0" />
              <span>123, Motor Market, Near Highway, Your City – 000000</span>
            </li>
            <li>
              <a href="tel:+919999999999" className="flex items-center gap-2 text-gray-400 hover:text-brand-gold transition-colors">
                <Phone size={16} className="text-brand-gold" />
                +91 99999 99999
              </a>
            </li>
            <li>
              <a href="mailto:info@khalsamotors.com" className="flex items-center gap-2 text-gray-400 hover:text-brand-gold transition-colors">
                <Mail size={16} className="text-brand-gold" />
                info@khalsamotors.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-steel/30">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Khalsa Motors. All rights reserved.
        </div>
      </div>
    </footer>
  )
}