import { supabase } from '@/lib/supabase'
import MarkReadButton from '@/components/MarkReadButton'
import { MessageSquare } from 'lucide-react'

export default async function AdminEnquiriesPage() {
  const { data: enquiries } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
  const all = enquiries || []
  const unread = all.filter((e: any) => !e.is_read).length

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Enquiries</h1>
        <p className="text-gray-500 text-sm mt-1">{all.length} total · <span className={unread > 0 ? 'text-brand-gold font-semibold' : ''}>{unread} unread</span></p>
      </div>

      <div className="bg-white rounded-sm shadow-sm overflow-hidden">
        {all.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-3 text-gray-200" />
            <p>No enquiries yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {all.map((enq: any) => (
              <div key={enq.id} className={`p-5 ${!enq.is_read ? 'bg-brand-gold/5 border-l-4 border-l-brand-gold' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-brand-navy">{enq.name}</span>
                      {!enq.is_read && <span className="text-xs bg-brand-gold text-brand-navy px-2 py-0.5 rounded-sm font-bold">NEW</span>}
                      <span className="text-gray-400 text-xs">{new Date(enq.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="text-brand-gold text-sm font-medium mt-1">Re: {enq.car_title}</div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <a href={`tel:${enq.phone}`} className="hover:text-brand-gold">📞 {enq.phone}</a>
                      <a href={`mailto:${enq.email}`} className="hover:text-brand-gold">✉️ {enq.email}</a>
                    </div>
                    {enq.message && <div className="mt-2 text-gray-600 text-sm bg-gray-50 p-3 rounded-sm">"{enq.message}"</div>}
                  </div>
                  {!enq.is_read && <MarkReadButton id={enq.id} table="enquiries" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}