import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const { data, error } = await supabase.from('cars').insert({
    title: body.title,
    brand: body.brand,
    model: body.model,
    year: parseInt(body.year),
    price: parseInt(body.price),
    purchase_price: body.purchase_price ? parseInt(body.purchase_price) : null, // ✅ this was missing
    km_driven: parseInt(body.km_driven),
    fuel_type: body.fuel_type,
    transmission: body.transmission,
    color: body.color,
    description: body.description,
    ownership: parseInt(body.ownership),
    location: body.location,
    is_featured: body.is_featured || false,
    images: body.images || [],
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}