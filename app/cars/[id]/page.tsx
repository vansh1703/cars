import { supabase, Car } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import EnquiryForm from '@/components/EnquiryForm'
import ImageGallery from '@/components/ImageGallery'
import Link from 'next/link'
import { Calendar, Gauge, Fuel, Settings, Users, Palette, MapPin, ChevronRight } from 'lucide-react'

async function getCar(id: string): Promise<Car | null> {
  const { data } = await supabase.from('cars').select('*').eq('id', id).single()
  return (data as Car) || null
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const car = await getCar(id)
  if (!car) notFound()

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-gold transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/cars" className="hover:text-brand-gold transition-colors">Cars</Link>
          <ChevronRight size={14} />
          <span className="text-brand-navy font-medium truncate">{car.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2">
            <ImageGallery images={car.images || []} title={car.title} />

            {/* Title & Price */}
            <div className="bg-white rounded-sm p-6 mt-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">{car.title}</h1>
                <p className="text-gray-500 mt-1">{car.brand} · {car.model} · {car.year}</p>
                {car.location && (
                  <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                    <MapPin size={14} className="text-brand-gold" />
                    {car.location}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-bold text-brand-gold text-3xl">₹{car.price.toLocaleString('en-IN')}</div>
                {car.is_sold && <span className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-sm mt-1">SOLD</span>}
              </div>
            </div>

            {/* Specs */}
            <div className="bg-white rounded-sm p-6 mt-4">
              <h2 className="font-bold text-brand-navy text-lg mb-4">Vehicle Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <SpecItem icon={<Calendar size={18} />} label="Year" value={car.year.toString()} />
                <SpecItem icon={<Gauge size={18} />} label="KM Driven" value={`${car.km_driven.toLocaleString('en-IN')} km`} />
                <SpecItem icon={<Fuel size={18} />} label="Fuel Type" value={car.fuel_type} />
                <SpecItem icon={<Settings size={18} />} label="Transmission" value={car.transmission} />
                <SpecItem icon={<Users size={18} />} label="Ownership" value={`${car.ownership}${car.ownership === 1 ? 'st' : car.ownership === 2 ? 'nd' : car.ownership === 3 ? 'rd' : 'th'} Owner`} />
                <SpecItem icon={<Palette size={18} />} label="Color" value={car.color} />
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className="bg-white rounded-sm p-6 mt-4">
                <h2 className="font-bold text-brand-navy text-lg mb-3">About This Car</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{car.description}</p>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {!car.is_sold ? (
                <EnquiryForm carId={car.id} carTitle={car.title} />
              ) : (
                <div className="bg-brand-navy rounded-sm p-6 text-center">
                  <div className="text-brand-gold font-bold text-2xl mb-2">SOLD</div>
                  <p className="text-gray-400 text-sm mb-4">This car has been sold. Browse our other cars.</p>
                  <Link href="/cars" className="btn-gold w-full justify-center">View Available Cars</Link>
                </div>
              )}
              <div className="bg-white rounded-sm p-4 mt-4 border border-gray-100 text-center">
                <p className="text-gray-500 text-sm mb-2">Prefer to call directly?</p>
                <a href="tel:+919999999999" className="font-bold text-brand-navy text-lg hover:text-brand-gold transition-colors">
                  +91 99999 99999
                </a>
                <p className="text-gray-400 text-xs mt-1">Mon–Sat: 9AM – 7PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-brand-cream rounded-sm">
      <span className="text-brand-gold mt-0.5">{icon}</span>
      <div>
        <div className="text-xs text-gray-500 font-medium">{label}</div>
        <div className="text-brand-navy font-semibold text-sm mt-0.5">{value}</div>
      </div>
    </div>
  )
}