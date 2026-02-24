import Link from 'next/link'
import { Shield, Award, Headphones, ChevronRight, Star } from 'lucide-react'
import { supabase, Car } from '@/lib/supabase'
import CarCard from '@/components/CarCard'

async function getFeaturedCars(): Promise<Car[]> {
  const { data } = await supabase
    .from('cars')
    .select('*')
    .eq('is_featured', true)
    .eq('is_sold', false)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(6)
  return (data as Car[]) || []
}

async function getStats() {
  const { count: total } = await supabase.from('cars').select('*', { count: 'exact', head: true })
  const { count: sold } = await supabase.from('cars').select('*', { count: 'exact', head: true }).eq('is_sold', true)
  return { total: total || 0, sold: sold || 0 }
}

export default async function HomePage() {
  const [featured, stats] = await Promise.all([getFeaturedCars(), getStats()])

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-navy relative overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-brand-gold to-transparent" />
        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="gold-line" />
              <span className="text-brand-gold text-sm font-medium tracking-widest uppercase">Trusted Since 2010</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] mb-6">
              Drive Your
              <span className="block text-brand-gold">Dream Car</span>
              <span className="block text-3xl md:text-4xl font-normal text-gray-300 mt-2">at the Right Price</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Khalsa Motors offers hand-picked, quality-verified pre-owned vehicles with complete documentation and full transparency.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/cars" className="btn-gold text-base">
                Browse All Cars <ChevronRight size={18} />
              </Link>
              <Link href="/contact" className="btn-outline text-base">
                Talk to Us
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-brand-steel/40">
              <div>
                <div className="text-2xl font-bold text-brand-gold">{stats.total}+</div>
                <div className="text-gray-500 text-sm">Cars Listed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-gold">{stats.sold}+</div>
                <div className="text-gray-500 text-sm">Cars Sold</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-gold">14+</div>
                <div className="text-gray-500 text-sm">Years Trust</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-3"><div className="gold-line" /></div>
            <h2 className="section-title">Why Choose Khalsa Motors?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-gray-100 rounded-sm hover:border-brand-gold/30 transition-colors">
              <Shield size={28} className="text-brand-gold mb-4" />
              <h3 className="font-bold text-brand-navy text-lg mb-2">Quality Assured</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Every vehicle undergoes a thorough inspection before listing. What you see is what you get.</p>
            </div>
            <div className="p-6 border border-gray-100 rounded-sm hover:border-brand-gold/30 transition-colors">
              <Award size={28} className="text-brand-gold mb-4" />
              <h3 className="font-bold text-brand-navy text-lg mb-2">Clear Documentation</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Full RC, insurance, service history, and no-dues certificates provided with every car.</p>
            </div>
            <div className="p-6 border border-gray-100 rounded-sm hover:border-brand-gold/30 transition-colors">
              <Headphones size={28} className="text-brand-gold mb-4" />
              <h3 className="font-bold text-brand-navy text-lg mb-2">After-Sale Support</h3>
              <p className="text-gray-500 text-sm leading-relaxed">We're here even after you drive off the lot. Questions? Call us anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars from DB */}
      {featured.length > 0 && (
        <section className="py-16 bg-brand-cream">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="gold-line" />
                  <span className="text-brand-gold text-sm font-medium tracking-widest uppercase">Hand-Picked</span>
                </div>
                <h2 className="section-title">Featured Cars</h2>
              </div>
              <Link href="/cars" className="text-brand-gold hover:text-brand-gold-dark font-medium text-sm flex items-center gap-1 transition-colors">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* If no featured cars yet show a placeholder */}
      {featured.length === 0 && (
        <section className="py-16 bg-brand-cream">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center gap-2 justify-center mb-2">
              <div className="gold-line" />
              <span className="text-brand-gold text-sm font-medium tracking-widest uppercase">Our Inventory</span>
            </div>
            <h2 className="section-title mb-4">Featured Cars</h2>
            <p className="text-gray-500 mb-6">Check out our full inventory</p>
            <Link href="/cars" className="btn-gold">Browse All Cars</Link>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-3"><div className="gold-line" /></div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">What Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Rajiv Sharma', car: 'Honda City 2019', text: 'Most transparent car buying experience. No hidden charges, full history, car was exactly as described.' },
              { name: 'Priya Mehta', car: 'Maruti Swift 2020', text: 'Team was incredibly helpful. They even helped with loan paperwork. Highly recommend!' },
              { name: 'Arjun Singh', car: 'Hyundai Creta 2021', text: 'Fair price, clean car, honest people. My whole family buys from Khalsa Motors now.' },
            ].map((t, i) => (
              <div key={i} className="bg-brand-charcoal rounded-sm p-6 border border-brand-steel/30">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, s) => <Star key={s} size={14} className="fill-brand-gold text-brand-gold" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="font-semibold text-white text-sm">{t.name}</div>
                <div className="text-gray-500 text-xs">{t.car}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-gold">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">Ready to Find Your Car?</h2>
          <p className="text-brand-navy/70 mb-8 text-lg">Browse our full inventory or reach out directly.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/cars" className="bg-brand-navy text-white font-semibold px-8 py-3 rounded-sm hover:bg-brand-charcoal transition-colors">
              Browse Inventory
            </Link>
            <Link href="/contact" className="border-2 border-brand-navy text-brand-navy font-semibold px-8 py-3 rounded-sm hover:bg-brand-navy/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}