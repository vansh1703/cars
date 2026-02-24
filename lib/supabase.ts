import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Car {
  id: string
  created_at: string
  title: string
  brand: string
  model: string
  year: number
  price: number
  km_driven: number
  fuel_type: 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid'
  transmission: 'Manual' | 'Automatic'
  color: string
  description: string
  images: string[]
  is_sold: boolean
  is_featured: boolean
  is_archived: boolean
  ownership: number
  location: string
  sold_to_name?: string
  sold_to_phone?: string
  sold_to_address?: string
  sold_to_notes?: string
  sold_at?: string
}

export interface Enquiry {
  id: string
  created_at: string
  car_id: string
  car_title: string
  name: string
  email: string
  phone: string
  message: string
  is_read: boolean
}

export interface Message {
  id: string
  created_at: string
  name: string
  email: string
  phone: string
  message: string
  is_read: boolean
}

export interface AdminUser {
  id: string
  email: string
  password: string
  name: string
}