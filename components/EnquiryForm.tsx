'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Send, User, Phone, Mail, MessageSquare } from 'lucide-react'

export default function EnquiryForm({ carId, carTitle }: { carId: string; carTitle: string }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi, I'm interested in the ${carTitle}. Please get in touch with me.`,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!form.name || !form.phone || !form.email) {
    toast.error('Please fill all required fields')
    return
  }
  setLoading(true)
  const res = await fetch('/api/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      car_id: carId,
      car_title: carTitle,
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
    }),
  })
  const data = await res.json()
  setLoading(false)
  if (!res.ok) {
    toast.error('Something went wrong. Please try again.')
  } else {
    toast.success("Enquiry sent! We'll call you soon.")
    setForm({ name: '', email: '', phone: '', message: '' })
  }
}

  return (
    <div className="bg-brand-navy rounded-sm p-6 text-white">
      <h3 className="text-xl font-bold mb-1">Book Enquiry</h3>
      <p className="text-gray-400 text-sm mb-5">We'll call you back within 24 hours</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold" />
          <input
            type="text"
            name="name"
            placeholder="Your Name *"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-brand-charcoal border border-brand-steel text-white placeholder-gray-500 rounded-sm pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
            required
          />
        </div>

        <div className="relative">
          <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold" />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={handleChange}
            className="w-full bg-brand-charcoal border border-brand-steel text-white placeholder-gray-500 rounded-sm pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
            required
          />
        </div>

        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold" />
          <input
            type="email"
            name="email"
            placeholder="Email Address *"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-brand-charcoal border border-brand-steel text-white placeholder-gray-500 rounded-sm pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors"
            required
          />
        </div>

        <div className="relative">
          <MessageSquare size={15} className="absolute left-3 top-3.5 text-brand-gold" />
          <textarea
            name="message"
            placeholder="Message (optional)"
            value={form.message}
            onChange={handleChange}
            rows={3}
            className="w-full bg-brand-charcoal border border-brand-steel text-white placeholder-gray-500 rounded-sm pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-brand-navy/40 border-t-brand-navy rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            <><Send size={15} /> Send Enquiry</>
          )}
        </button>
      </form>
    </div>
  )
}