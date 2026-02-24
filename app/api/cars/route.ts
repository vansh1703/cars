import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, brand, model, year, price, km_driven, fuel_type, transmission, color, description, images, is_featured, ownership, location } = body

  if (!title || !brand || !price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase.from('cars').insert({
    title, brand, model,
    year: parseInt(year),
    price: parseInt(price),
    km_driven: parseInt(km_driven) || 0,
    fuel_type, transmission, color, description,
    images: images || [],
    is_featured: is_featured || false,
    is_sold: false,
    ownership: parseInt(ownership) || 1,
    location,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}