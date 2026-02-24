'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Phone, Mail, MapPin, Clock, Send, User, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!form.name || !form.phone || !form.message) {
    toast.error('Please fill required fields')
    return
  }
  setLoading(true)
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, message: form.message }),
  })
  const data = await res.json()
  setLoading(false)
  if (!res.ok) {
    toast.error('Something went wrong. Please try again.')
  } else {
    toast.success("Message sent! We'll get back to you soon.")
    setForm({ name: '', email: '', phone: '', message: '' })
  }
}

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-brand-navy py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="gold-line" />
            <span className="text-brand-gold text-sm font-medium tracking-widest uppercase">Get In Touch</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Contact Us</h1>
          <p className="text-gray-400 mt-2">We're here to help. Reach out anytime.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Info */}
        <div>
          <h2 className="text-2xl font-bold text-brand-navy mb-6">Visit Our Showroom</h2>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-sm shrink-0"><MapPin className="text-brand-gold" size={20} /></div>
              <div>
                <div className="font-semibold text-brand-navy text-sm mb-0.5">Address</div>
                <div className="text-gray-500 text-sm leading-relaxed">123, Motor Market, Near Highway,<br />Your City, State – 000000</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-sm shrink-0"><Phone className="text-brand-gold" size={20} /></div>
              <div>
                <div className="font-semibold text-brand-navy text-sm mb-0.5">Phone</div>
                <a href="tel:+919999999999" className="text-gray-500 text-sm hover:text-brand-gold transition-colors">+91 99999 99999</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-sm shrink-0"><Mail className="text-brand-gold" size={20} /></div>
              <div>
                <div className="font-semibold text-brand-navy text-sm mb-0.5">Email</div>
                <a href="mailto:info@khalsamotors.com" className="text-gray-500 text-sm hover:text-brand-gold transition-colors">info@khalsamotors.com</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-sm shrink-0"><Clock className="text-brand-gold" size={20} /></div>
              <div>
                <div className="font-semibold text-brand-navy text-sm mb-0.5">Working Hours</div>
                <div className="text-gray-500 text-sm">Mon – Sat: 9:00 AM – 7:00 PM<br />Sun: 10:00 AM – 5:00 PM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-sm shadow-sm p-8">
          <h2 className="text-2xl font-bold text-brand-navy mb-2">Send a Message</h2>
          <p className="text-gray-500 text-sm mb-6">Drop us a message and we'll respond within a few hours.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="name" placeholder="Your Name *" value={form.name} onChange={handleChange} className="input-field pl-9" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="phone" placeholder="Phone *" value={form.phone} onChange={handleChange} className="input-field pl-9" required />
              </div>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="input-field pl-9" />
              </div>
            </div>
            <div className="relative">
              <MessageSquare size={15} className="absolute left-3 top-3.5 text-gray-400" />
              <textarea name="message" placeholder="Your message... *" value={form.message} onChange={handleChange} rows={5} className="input-field pl-9 resize-none" required />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-3 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" />
                  Sending...
                </span>
              ) : <><Send size={15} /> Send Message</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}