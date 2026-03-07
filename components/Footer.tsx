import Link from 'next/link'
import { Car, Phone, Mail, MapPin } from 'lucide-react'

const MAPS_URL = 'https://www.google.com/maps/place/Khalsa+Motors/@28.6733755,77.4428101,17z/data=!3m1!4b1!4m6!3m5!1s0x390cf1bc19ad207d:0xceb62af6b62d0af9!8m2!3d28.6733755!4d77.4428101!16s%2Fg%2F1pv5y2jp9'

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
            <li>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-2 text-gray-400 hover:text-brand-gold transition-colors group">
                <MapPin size={16} className="text-brand-gold mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Shop no - 31, Ground Floor, Konark Building, RDC, Block 1, P & T Colony, Raj Nagar, Ghaziabad, Uttar Pradesh 201002</span>
              </a>
            </li>
            <li>
              <a href="tel:+919818036523" className="flex items-center gap-2 text-gray-400 hover:text-brand-gold transition-colors">
                <Phone size={16} className="text-brand-gold" />
                +91 98180 36523
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
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center gap-2">
          <div className="text-xs text-gray-500">
            © {new Date().getFullYear()} Khalsa Motors. All rights reserved.
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            Created by<span className="font-semibold text-gray-300">Vansh Varun</span>
          </div>
        </div>
      </div>
    </footer>
  )
}