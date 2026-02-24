import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'

type Params = Promise<{ id: string }>

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { id } = await params
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { data, error } = await supabase.from('enquiries').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}