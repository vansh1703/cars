'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, MessageCircle, Link as LinkIcon } from 'lucide-react'
import { Car } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function CarCardMenu({ car }: { car: Car }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://khalsamotors.com'}/cars/${car.id}`

  const whatsappMsg = encodeURIComponent(
    `Hi! I'm interested in this car at Khalsa Motors:\n\n*${car.title}*\nPrice: ₹${car.price.toLocaleString('en-IN')}\nYear: ${car.year} | ${car.fuel_type} | ${car.transmission}\n\n${url}\n\nPlease share more details.`
  )

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevents the card click event from firing
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    } else {
      toast.error('Clipboard not supported')
    }
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          setOpen(!open); 
        }}
        className="bg-white/90 hover:bg-white text-brand-navy p-1.5 rounded-full shadow-sm transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute top-8 right-0 bg-white rounded-sm shadow-lg border border-gray-100 w-48 z-20 overflow-hidden">
          {/* FIXED: Added the missing <a> tag here */}
          <a
            href={`https://wa.me/919818036523?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Stop click from bubbling to the card
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
          >
            <MessageCircle size={15} className="text-green-500" />
            Chat on WhatsApp
          </a>

          <button
            type="button"
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50"
          >
            <LinkIcon size={15} className="text-brand-gold" />
            Copy Link
          </button>
        </div>
      )}
    </div>
  )
}