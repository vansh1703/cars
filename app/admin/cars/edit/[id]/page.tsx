'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, Car } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { Upload, X, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditCarPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '', brand: '', model: '', year: new Date().getFullYear(),
    price: '', km_driven: '', fuel_type: 'Petrol', transmission: 'Manual',
    color: '', description: '', ownership: 1, location: '', is_featured: false,
  })

  useEffect(() => {
    supabase.from('cars').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) { toast.error('Car not found'); router.push('/admin/cars'); return }
      const car = data as Car
      setForm({
        title: car.title,
        brand: car.brand,
        model: car.model,
        year: car.year,
        price: car.price.toString(),
        km_driven: car.km_driven.toString(),
        fuel_type: car.fuel_type,
        transmission: car.transmission,
        color: car.color || '',
        description: car.description || '',
        ownership: car.ownership,
        location: car.location || '',
        is_featured: car.is_featured,
      })
      setImageUrls(car.images || [])
      setFetching(false)
    })
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingImages(true)
    const uploadedUrls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('car-images').upload(fileName, file)
      if (error) { toast.error(`Failed to upload ${file.name}`); continue }
      const { data } = supabase.storage.from('car-images').getPublicUrl(fileName)
      uploadedUrls.push(data.publicUrl)
    }
    setImageUrls((prev) => [...prev, ...uploadedUrls])
    setUploadingImages(false)
    toast.success(`${uploadedUrls.length} photo(s) uploaded!`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.brand || !form.price) { toast.error('Please fill all required fields'); return }
    if (!imageUrls.length) { toast.error('Please upload at least one photo'); return }
    setLoading(true)
    const { error } = await supabase.from('cars').update({
      ...form,
      price: parseInt(form.price),
      km_driven: parseInt(form.km_driven),
      year: parseInt(form.year.toString()),
      ownership: parseInt(form.ownership.toString()),
      images: imageUrls,
    }).eq('id', id)
    setLoading(false)
    if (error) { toast.error('Failed to update: ' + error.message) }
    else { toast.success('Car updated!'); router.push('/admin/cars') }
  }

  if (fetching) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/cars" className="text-gray-400 hover:text-brand-navy transition-colors"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Edit Car</h1>
          <p className="text-gray-500 text-sm">{form.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div className="bg-white rounded-sm p-6 shadow-sm">
          <h2 className="font-semibold text-brand-navy mb-4">Car Photos</h2>
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-sm p-6 text-center cursor-pointer hover:border-brand-gold transition-colors">
            <Upload size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Click to add more photos</p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </div>
          {uploadingImages && (
            <div className="mt-3 text-brand-gold text-sm flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
              Uploading...
            </div>
          )}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {imageUrls.map((url, i) => (
                <div key={url} className="relative group">
                  <div className="relative h-24 rounded-sm overflow-hidden bg-gray-100">
                    <Image src={url} alt={`photo ${i + 1}`} fill className="object-cover" sizes="150px" />
                  </div>
                  {i === 0 && <div className="absolute top-1 left-1 bg-brand-gold text-brand-navy text-xs px-1.5 py-0.5 rounded-sm font-bold">MAIN</div>}
                  <button type="button" onClick={() => setImageUrls((prev) => prev.filter((u) => u !== url))} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white rounded-sm p-6 shadow-sm">
          <h2 className="font-semibold text-brand-navy mb-4">Car Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Listing Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Brand *</label>
              <input name="brand" value={form.brand} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Model *</label>
              <input name="model" value={form.model} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Year *</label>
              <input type="number" name="year" value={form.year} onChange={handleChange} className="input-field" min="1990" max={new Date().getFullYear()} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price (₹) *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">KM Driven</label>
              <input type="number" name="km_driven" value={form.km_driven} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Fuel Type</label>
              <select name="fuel_type" value={form.fuel_type} onChange={handleChange} className="input-field">
                {['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'].map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Transmission</label>
              <select name="transmission" value={form.transmission} onChange={handleChange} className="input-field">
                {['Manual', 'Automatic'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ownership</label>
              <select name="ownership" value={form.ownership} onChange={handleChange} className="input-field">
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}{n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'} Owner</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Color</label>
              <input name="color" value={form.color} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="input-field resize-none" rows={4} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" name="is_featured" id="is_featured" checked={form.is_featured} onChange={handleChange} className="w-4 h-4 accent-brand-gold" />
              <label htmlFor="is_featured" className="text-sm text-gray-600">Mark as Featured</label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-gold py-3 px-8 disabled:opacity-60">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" />
                Saving...
              </span>
            ) : <><Save size={16} /> Update Car</>}
          </button>
          <Link href="/admin/cars" className="btn-outline py-3 px-8">Cancel</Link>
        </div>
      </form>
    </div>
  )
}