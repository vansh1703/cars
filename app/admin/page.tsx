import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Car, MessageSquare, Mail, TrendingUp, Plus, Eye } from 'lucide-react'

async function getStats() {
  const [cars, sold, enquiries, messages, unreadEnq, unreadMsg] = await Promise.all([
    supabase.from('cars').select('*', { count: 'exact', head: true }),
    supabase.from('cars').select('*', { count: 'exact', head: true }).eq('is_sold', true),
    supabase.from('enquiries').select('*', { count: 'exact', head: true }),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
  ])
  return {
    totalCars: cars.count || 0,
    soldCars: sold.count || 0,
    totalEnquiries: enquiries.count || 0,
    totalMessages: messages.count || 0,
    unreadEnquiries: unreadEnq.count || 0,
    unreadMessages: unreadMsg.count || 0,
  }
}

async function getRecentEnquiries() {
  const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(5)
  return data || []
}

export default async function AdminDashboard() {
  const [stats, recentEnquiries] = await Promise.all([getStats(), getRecentEnquiries()])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <Link href="/admin/cars/new" className="btn-gold py-2 px-4 text-sm">
          <Plus size={16} /> Add New Car
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-sm p-5 shadow-sm">
          <Car size={22} className="text-brand-gold mb-3" />
          <div className="text-2xl font-bold text-brand-navy">{stats.totalCars}</div>
          <div className="text-gray-500 text-sm">Total Cars</div>
          <div className="text-gray-400 text-xs mt-1">{stats.totalCars - stats.soldCars} available</div>
        </div>
        <div className="bg-white rounded-sm p-5 shadow-sm">
          <TrendingUp size={22} className="text-green-500 mb-3" />
          <div className="text-2xl font-bold text-brand-navy">{stats.soldCars}</div>
          <div className="text-gray-500 text-sm">Cars Sold</div>
        </div>
        <div className="bg-white rounded-sm p-5 shadow-sm">
          <MessageSquare size={22} className={`mb-3 ${stats.unreadEnquiries > 0 ? 'text-red-500' : 'text-brand-gold'}`} />
          <div className="text-2xl font-bold text-brand-navy">{stats.totalEnquiries}</div>
          <div className="text-gray-500 text-sm">Enquiries</div>
          {stats.unreadEnquiries > 0 && <div className="text-red-500 text-xs font-semibold mt-1">{stats.unreadEnquiries} unread</div>}
        </div>
        <div className="bg-white rounded-sm p-5 shadow-sm">
          <Mail size={22} className={`mb-3 ${stats.unreadMessages > 0 ? 'text-red-500' : 'text-brand-gold'}`} />
          <div className="text-2xl font-bold text-brand-navy">{stats.totalMessages}</div>
          <div className="text-gray-500 text-sm">Messages</div>
          {stats.unreadMessages > 0 && <div className="text-red-500 text-xs font-semibold mt-1">{stats.unreadMessages} unread</div>}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { href: '/admin/cars/new', icon: <Plus size={20} />, title: 'Add New Car', desc: 'Upload photos and car details', highlight: false },
          { href: '/admin/enquiries', icon: <MessageSquare size={20} />, title: `${stats.unreadEnquiries} New Enquiries`, desc: 'View booking enquiries from customers', highlight: stats.unreadEnquiries > 0 },
          { href: '/admin/messages', icon: <Mail size={20} />, title: `${stats.unreadMessages} New Messages`, desc: 'Direct messages from contact page', highlight: stats.unreadMessages > 0 },
        ].map((item) => (
          <Link key={item.href} href={item.href} className={`bg-white rounded-sm p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition-all group ${item.highlight ? 'border-l-4 border-l-brand-gold' : ''}`}>
            <div className={`p-2 rounded-sm ${item.highlight ? 'bg-brand-gold text-brand-navy' : 'bg-brand-cream text-brand-gold'} group-hover:bg-brand-gold group-hover:text-brand-navy transition-colors`}>
              {item.icon}
            </div>
            <div>
              <div className="font-semibold text-brand-navy text-sm">{item.title}</div>
              <div className="text-gray-400 text-xs mt-0.5">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent enquiries */}
      <div className="bg-white rounded-sm shadow-sm">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-brand-navy">Recent Enquiries</h2>
          <Link href="/admin/enquiries" className="text-brand-gold text-sm hover:text-brand-gold-dark flex items-center gap-1">
            <Eye size={14} /> View All
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentEnquiries.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No enquiries yet</div>
          ) : (
            recentEnquiries.map((enq: any) => (
              <div key={enq.id} className={`p-4 flex items-start justify-between ${!enq.is_read ? 'bg-brand-gold/5' : ''}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-brand-navy text-sm">{enq.name}</span>
                    {!enq.is_read && <span className="w-2 h-2 bg-brand-gold rounded-full" />}
                  </div>
                  <div className="text-brand-gold text-xs mt-0.5">{enq.car_title}</div>
                  <div className="text-gray-400 text-xs">{enq.phone} · {enq.email}</div>
                </div>
                <div className="text-gray-400 text-xs">
                  {new Date(enq.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}