import { supabase, Car } from '@/lib/supabase'
import Image from 'next/image'
import { User, Phone, MapPin, FileText, Calendar, Gauge } from 'lucide-react'

async function getSoldCars(): Promise<Car[]> {
  const { data } = await supabase
    .from('cars')
    .select('*')
    .eq('is_sold', true)
    .order('sold_at', { ascending: false })
  return (data as Car[]) || []
}

export default async function HistoryPage() {
  const cars = await getSoldCars()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Sales History</h1>
        <p className="text-gray-500 text-sm mt-1">{cars.length} cars sold</p>
      </div>

      {cars.length === 0 ? (
        <div className="bg-white rounded-sm shadow-sm p-12 text-center text-gray-400">
          <p className="text-lg font-bold mb-2">No sales yet</p>
          <p className="text-sm">Cars you mark as sold will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cars.map((car) => (
            <div key={car.id} className="bg-white rounded-sm shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Car photo */}
                <div className="relative w-full md:w-56 h-44 md:h-auto shrink-0 bg-gray-100">
                  {car.images?.[0] ? (
                    <Image
                      src={car.images[0]}
                      alt={car.title}
                      fill
                      className="object-cover"
                      sizes="224px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                      No photo
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-sm">
                    SOLD
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
                    {/* Car info */}
                    <div>
                      <h3 className="font-bold text-brand-navy text-lg">{car.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-gray-400 text-xs">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {car.year}</span>
                        <span className="flex items-center gap-1"><Gauge size={12} /> {car.km_driven.toLocaleString('en-IN')} km</span>
                        <span>{car.fuel_type} · {car.transmission}</span>
                      </div>
                    </div>
                    {/* Price & date */}
                    <div className="text-right shrink-0">
                      <div className="font-bold text-brand-gold text-xl">
                        ₹{car.price.toLocaleString('en-IN')}
                      </div>
                      {car.sold_at && (
                        <div className="text-gray-400 text-xs mt-1">
                          Sold on {new Date(car.sold_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Buyer Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {car.sold_to_name && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={14} className="text-brand-gold shrink-0" />
                          {car.sold_to_name}
                        </div>
                      )}
                      {car.sold_to_phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-brand-gold shrink-0" />
                          <a href={`tel:${car.sold_to_phone}`} className="hover:text-brand-gold transition-colors">
                            {car.sold_to_phone}
                          </a>
                        </div>
                      )}
                      {car.sold_to_address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
                          <MapPin size={14} className="text-brand-gold shrink-0" />
                          {car.sold_to_address}
                        </div>
                      )}
                      {car.sold_to_notes && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 sm:col-span-2">
                          <FileText size={14} className="text-brand-gold shrink-0 mt-0.5" />
                          {car.sold_to_notes}
                        </div>
                      )}
                      {!car.sold_to_name && !car.sold_to_phone && (
                        <p className="text-gray-400 text-sm">No buyer info recorded</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}