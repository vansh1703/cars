'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

export default function MarkReadButton({ id, table }: { id: string; table: 'enquiries' | 'messages' }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const markRead = async () => {
    setLoading(true)
    await supabase.from(table).update({ is_read: true }).eq('id', id)
    setLoading(false)
    router.refresh()
  }

  return (
    <button onClick={markRead} disabled={loading} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-600 border border-gray-200 hover:border-green-300 px-2.5 py-1.5 rounded-sm transition-all shrink-0 disabled:opacity-50">
      <Check size={13} />
      {loading ? 'Marking...' : 'Mark Read'}
    </button>
  )
}