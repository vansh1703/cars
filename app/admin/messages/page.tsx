import { supabase } from '@/lib/supabase'
import MarkReadButton from '@/components/MarkReadButton'
import { Mail } from 'lucide-react'

export default async function AdminMessagesPage() {
  const { data: messages } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
  const all = messages || []
  const unread = all.filter((m: any) => !m.is_read).length

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Messages</h1>
        <p className="text-gray-500 text-sm mt-1">{all.length} total · <span className={unread > 0 ? 'text-brand-gold font-semibold' : ''}>{unread} unread</span></p>
      </div>

      <div className="bg-white rounded-sm shadow-sm overflow-hidden">
        {all.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Mail size={40} className="mx-auto mb-3 text-gray-200" />
            <p>No messages yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {all.map((msg: any) => (
              <div key={msg.id} className={`p-5 ${!msg.is_read ? 'bg-brand-gold/5 border-l-4 border-l-brand-gold' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-brand-navy">{msg.name}</span>
                      {!msg.is_read && <span className="text-xs bg-brand-gold text-brand-navy px-2 py-0.5 rounded-sm font-bold">NEW</span>}
                      <span className="text-gray-400 text-xs">{new Date(msg.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <a href={`tel:${msg.phone}`} className="hover:text-brand-gold">📞 {msg.phone}</a>
                      {msg.email && <a href={`mailto:${msg.email}`} className="hover:text-brand-gold">✉️ {msg.email}</a>}
                    </div>
                    <div className="mt-2 text-gray-600 text-sm bg-gray-50 p-3 rounded-sm">"{msg.message}"</div>
                  </div>
                  {!msg.is_read && <MarkReadButton id={msg.id} table="messages" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}