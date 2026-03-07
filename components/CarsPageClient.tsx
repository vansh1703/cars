'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CarCard from '@/components/CarCard'
import { Car } from '@/lib/supabase'
import { SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react'

interface Props {
  cars: Car[]
  brands: string[]
  currentFilters: {
    brand: string
    fuel: string
    transmission: string
    sort: string
    search: string
  }
}

export default function CarsPageClient({ cars, brands, currentFilters }: Props) {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState(currentFilters)
  const [searchInput, setSearchInput] = useState(currentFilters.search)

  const activeFilterCount = [
    filters.brand,
    filters.fuel,
    filters.transmission,
    filters.sort,
  ].filter(Boolean).length

  function buildUrl(updates: Partial<typeof filters>) {
    const merged = { ...filters, ...updates }
    const params = new URLSearchParams()
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    return `/cars?${params.toString()}`
  }

  function applyFilters(updates: Partial<typeof filters>) {
    const merged = { ...filters, ...updates }
    setFilters(merged)
    const params = new URLSearchParams()
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    router.push(`/cars?${params.toString()}`)
  }

  function clearAll() {
    setFilters({ brand: '', fuel: '', transmission: '', sort: '', search: '' })
    setSearchInput('')
    router.push('/cars')
    setShowFilters(false)
  }

  const FilterButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`text-sm px-4 py-2 rounded-sm border transition-all ${
        active
          ? 'bg-brand-gold border-brand-gold text-brand-navy font-semibold'
          : 'border-gray-200 text-gray-600 hover:border-brand-gold'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-brand-navy py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="gold-line" />
            <span className="text-brand-gold text-sm font-medium tracking-widest uppercase">Our Inventory</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Browse All Cars</h1>
          <p className="text-gray-400 mt-2">{cars.length} cars available</p>

          {/* Search + Filter bar */}
          <div className="mt-6 flex gap-2 max-w-lg">
            <div className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyFilters({ search: searchInput })}
                  placeholder="Search by brand, model, title..."
                  className="w-full bg-brand-charcoal border border-brand-steel text-white placeholder-gray-500 rounded-sm pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
              <button
                onClick={() => applyFilters({ search: searchInput })}
                className="btn-gold py-2.5 px-5 text-sm"
              >
                Search
              </button>
            </div>

            {/* Filter button */}
            <button
              onClick={() => setShowFilters(true)}
              className="relative flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-brand-steel hover:border-brand-gold px-4 py-2.5 rounded-sm text-sm transition-all"
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-brand-navy text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.brand && (
                <span className="flex items-center gap-1.5 bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full">
                  {filters.brand}
                  <button onClick={() => applyFilters({ brand: '' })}><X size={11} /></button>
                </span>
              )}
              {filters.fuel && (
                <span className="flex items-center gap-1.5 bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full">
                  {filters.fuel}
                  <button onClick={() => applyFilters({ fuel: '' })}><X size={11} /></button>
                </span>
              )}
              {filters.transmission && (
                <span className="flex items-center gap-1.5 bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full">
                  {filters.transmission}
                  <button onClick={() => applyFilters({ transmission: '' })}><X size={11} /></button>
                </span>
              )}
              {filters.sort && (
                <span className="flex items-center gap-1.5 bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full">
                  {filters.sort === 'price_asc' ? 'Price: Low→High' : 'Price: High→Low'}
                  <button onClick={() => applyFilters({ sort: '' })}><X size={11} /></button>
                </span>
              )}
              <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cars Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {cars.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl font-bold mb-2">No cars found</p>
            <p className="text-sm mb-4">Try adjusting your filters</p>
            <button onClick={clearAll} className="btn-gold py-2 px-6 text-sm">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {cars.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />

          {/* Modal */}
          <div className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full md:w-[480px] bg-white rounded-t-xl md:rounded-sm shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-brand-gold" />
                <h3 className="font-bold text-brand-navy text-lg">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-brand-gold text-brand-navy text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">

              {/* Brand */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Brand</label>
                <div className="flex flex-wrap gap-2">
                  <FilterButton active={!filters.brand} onClick={() => setFilters(p => ({ ...p, brand: '' }))}>
                    All
                  </FilterButton>
                  {brands.map(b => (
                    <FilterButton key={b} active={filters.brand === b} onClick={() => setFilters(p => ({ ...p, brand: b }))}>
                      {b}
                    </FilterButton>
                  ))}
                </div>
              </div>

              {/* Fuel */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Fuel Type</label>
                <div className="flex flex-wrap gap-2">
                  {['', 'Petrol', 'Diesel', 'CNG', 'Electric'].map(f => (
                    <FilterButton key={f} active={filters.fuel === f} onClick={() => setFilters(p => ({ ...p, fuel: f }))}>
                      {f || 'All'}
                    </FilterButton>
                  ))}
                </div>
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Transmission</label>
                <div className="flex flex-wrap gap-2">
                  {['', 'Manual', 'Automatic'].map(t => (
                    <FilterButton key={t} active={filters.transmission === t} onClick={() => setFilters(p => ({ ...p, transmission: t }))}>
                      {t || 'All'}
                    </FilterButton>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sort By</label>
                <div className="flex flex-col gap-2">
                  {[
                    ['', 'Newest First'],
                    ['price_asc', 'Price: Low to High'],
                    ['price_desc', 'Price: High to Low'],
                  ].map(([val, label]) => (
                    <FilterButton key={val} active={filters.sort === val} onClick={() => setFilters(p => ({ ...p, sort: val }))}>
                      {label}
                    </FilterButton>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={clearAll}
                className="flex-1 btn-outline py-3 text-sm"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  applyFilters(filters)
                  setShowFilters(false)
                }}
                className="flex-1 btn-gold py-3 text-sm justify-center"
              >
                Show {cars.length} Cars
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
