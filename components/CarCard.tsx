import Link from 'next/link'
import Image from 'next/image'
import { Car } from '@/lib/supabase'
import { Fuel, Gauge, Calendar, Users } from 'lucide-react'
import CarCardMenu from './CarCardMenu'

export default function CarCard({ car }: { car: Car }) {
  const mainImage = car.images?.[0]

  return (
    <div className="card-car group relative">
      <Link href={`/cars/${car.id}`} className="block">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={car.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No Photo</div>
          )}
          {car.is_sold && (
            <div className="absolute inset-0 bg-brand-navy/70 flex items-center justify-center">
              <span className="text-white font-bold text-2xl rotate-[-15deg] border-4 border-white px-4 py-2">SOLD</span>
            </div>
          )}
          {car.is_featured && !car.is_sold && (
            <div className="absolute top-3 left-3 bg-brand-gold text-brand-navy text-xs font-bold px-2 py-1 rounded-sm">FEATURED</div>
          )}
          {car.images?.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-brand-navy/80 text-white text-xs px-2 py-1 rounded-sm">
              +{car.images.length - 1} photos
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-brand-navy text-lg leading-tight">{car.title}</h3>
              <p className="text-gray-500 text-sm">{car.brand} {car.model}</p>
            </div>
            <div className="font-bold text-brand-gold text-xl shrink-0 ml-2">
              ₹{car.price.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
            <Spec icon={<Calendar size={13} />} value={`${car.year}`} />
            <Spec icon={<Gauge size={13} />} value={`${(car.km_driven / 1000).toFixed(0)}k km`} />
            <Spec icon={<Fuel size={13} />} value={car.fuel_type} />
            <Spec icon={<Users size={13} />} value={`${car.ownership}${car.ownership === 1 ? 'st' : car.ownership === 2 ? 'nd' : car.ownership === 3 ? 'rd' : 'th'} Owner`} />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs bg-brand-cream text-brand-steel px-2 py-1 rounded-sm font-medium">{car.transmission}</span>
            <span className="text-brand-gold text-sm font-semibold">View Details →</span>
          </div>
        </div>
      </Link>

      {/* 3-dot menu — outside the Link */}
      <div className="absolute top-3 right-3 z-10">
        <CarCardMenu car={car} />
      </div>
    </div>
  )
}

function Spec({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
      <span className="text-brand-gold">{icon}</span>
      <span>{value}</span>
    </div>
  )
}