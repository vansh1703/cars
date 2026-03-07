import { supabase, Car } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import AdminCarActions from '@/components/AdminCarActions'
import { Plus } from 'lucide-react'

export const revalidate = 0

async function getCars(): Promise<Car[]> {
  const { data } = await supabase
    .from('cars')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return (data as Car[]) || []
}

export default async function AdminCarsPage() {
  const cars = await getCars()

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">All Cars</h1>
          <p className="text-gray-500 text-sm mt-1">{cars.length} total listings</p>
        </div>
        <Link href="/admin/cars/new" className="btn-gold py-2 px-4 text-sm">
          <Plus size={16} /> Add New Car
        </Link>
      </div>

      <div className="bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {cars.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-lg font-bold mb-2">No cars yet</p>
              <Link href="/admin/cars/new" className="text-brand-gold text-sm hover:text-brand-gold-dark">
                + Add your first car
              </Link>
            </div>
          ) : (
            cars.map((car) => (
              <div key={car.id} className="p-4 hover:bg-gray-50 transition-colors">
                {/* Mobile layout */}
                <div className="flex gap-3">
                  {/* Image */}
                  <div className="relative w-24 h-18 rounded-sm overflow-hidden bg-gray-100 shrink-0" style={{ height: '72px', width: '96px' }}>
                    {car.images?.[0] ? (
                      <Image src={car.images[0]} alt={car.title} fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No photo</div>
                    )}
                    {car.is_sold && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">SOLD</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1.5 flex-wrap mb-1">
                      <span className="font-semibold text-brand-navy text-sm leading-tight">{car.title}</span>
                      {car.is_featured && (
                        <span className="text-[9px] bg-brand-gold text-brand-navy px-1.5 py-0.5 rounded-sm font-bold shrink-0">
                          FEATURED
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 text-xs mb-2">
                      {car.year} · {car.fuel_type} · {(car.km_driven / 1000).toFixed(0)}k km
                    </div>
                    <div className="text-brand-gold font-bold text-base">
                      ₹{car.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Actions row — full width below on mobile */}
                <div className="mt-3 flex justify-end">
                  <AdminCarActions car={car} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}