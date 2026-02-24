import { supabase, Car } from "@/lib/supabase";
import CarCard from "@/components/CarCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

async function getCars(searchParams: any): Promise<Car[]> {
  let query = supabase.from('cars').select('*').eq('is_archived', false)

  if (searchParams?.brand) query = query.eq('brand', searchParams.brand)
  if (searchParams?.fuel) query = query.eq('fuel_type', searchParams.fuel)
  if (searchParams?.transmission) query = query.eq('transmission', searchParams.transmission)
  if (searchParams?.search) query = query.ilike('title', `%${searchParams.search}%`)

  if (searchParams?.sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (searchParams?.sort === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data } = await query
  return (data as Car[]) || []
}
async function getBrands(): Promise<string[]> {
  const { data } = await supabase.from("cars").select("brand");
  if (!data) return [];
  return [...new Set(data.map((d: any) => d.brand))].sort();
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const [cars, brands] = await Promise.all([
    getCars(searchParams),
    getBrands(),
  ]);
  const available = cars.filter((c) => !c.is_sold);
  const sold = cars.filter((c) => c.is_sold);

  const fuel = searchParams?.fuel || "";
  const transmission = searchParams?.transmission || "";
  const brand = searchParams?.brand || "";
  const sort = searchParams?.sort || "";

  function buildUrl(updates: Record<string, string>) {
    const params = new URLSearchParams({
      brand,
      fuel,
      transmission,
      sort,
      ...updates,
    });
    // remove empty
    Array.from(params.entries()).forEach(([k, v]) => {
      if (!v) params.delete(k);
    });
    return `/cars?${params.toString()}`;
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-brand-navy py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="gold-line" />
            <span className="text-brand-gold text-sm font-medium tracking-widest uppercase">
              Our Inventory
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white">Browse All Cars</h1>
          <p className="text-gray-400 mt-2">
            {available.length} cars available
          </p>

          {/* Search bar */}
          <form
            method="GET"
            action="/cars"
            className="mt-6 flex gap-2 max-w-lg"
          >
            <input
              name="search"
              defaultValue={searchParams?.search || ""}
              placeholder="Search by brand, model, title..."
              className="flex-1 bg-brand-charcoal border border-brand-steel text-white placeholder-gray-500 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-brand-gold transition-colors"
            />
            <button type="submit" className="btn-gold py-2.5 px-5 text-sm">
              Search
            </button>
            {searchParams?.search && (
              <a href="/cars" className="btn-outline py-2.5 px-4 text-sm">
                ✕
              </a>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-sm shadow-sm p-5 sticky top-24">
            <h3 className="font-bold text-brand-navy mb-4">Filters</h3>

            {/* Brand */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Brand
              </label>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildUrl({ brand: "" })}
                  className={`text-xs px-3 py-1.5 rounded-sm border transition-all ${!brand ? "bg-brand-gold border-brand-gold text-brand-navy font-semibold" : "border-gray-200 text-gray-600 hover:border-brand-gold"}`}
                >
                  All
                </Link>
                {brands.map((b) => (
                  <Link
                    key={b}
                    href={buildUrl({ brand: b })}
                    className={`text-xs px-3 py-1.5 rounded-sm border transition-all ${brand === b ? "bg-brand-gold border-brand-gold text-brand-navy font-semibold" : "border-gray-200 text-gray-600 hover:border-brand-gold"}`}
                  >
                    {b}
                  </Link>
                ))}
              </div>
            </div>

            {/* Fuel */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Fuel Type
              </label>
              <div className="flex flex-wrap gap-2">
                {["", "Petrol", "Diesel", "CNG", "Electric"].map((f) => (
                  <Link
                    key={f}
                    href={buildUrl({ fuel: f })}
                    className={`text-xs px-3 py-1.5 rounded-sm border transition-all ${fuel === f ? "bg-brand-gold border-brand-gold text-brand-navy font-semibold" : "border-gray-200 text-gray-600 hover:border-brand-gold"}`}
                  >
                    {f || "All"}
                  </Link>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Transmission
              </label>
              <div className="flex gap-2">
                {["", "Manual", "Automatic"].map((t) => (
                  <Link
                    key={t}
                    href={buildUrl({ transmission: t })}
                    className={`text-xs px-3 py-1.5 rounded-sm border transition-all ${transmission === t ? "bg-brand-gold border-brand-gold text-brand-navy font-semibold" : "border-gray-200 text-gray-600 hover:border-brand-gold"}`}
                  >
                    {t || "All"}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Sort By
              </label>
              <div className="flex flex-col gap-2">
                {[
                  ["", "Newest First"],
                  ["price_asc", "Price: Low to High"],
                  ["price_desc", "Price: High to Low"],
                ].map(([val, label]) => (
                  <Link
                    key={val}
                    href={buildUrl({ sort: val })}
                    className={`text-xs px-3 py-1.5 rounded-sm border transition-all ${sort === val ? "bg-brand-gold border-brand-gold text-brand-navy font-semibold" : "border-gray-200 text-gray-600 hover:border-brand-gold"}`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Clear */}
            <Link
              href="/cars"
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              ✕ Clear all filters
            </Link>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {cars.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl font-bold mb-2">No cars found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {available.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
                  {available.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              )}
              {sold.length > 0 && (
                <div>
                  <h2 className="text-gray-400 font-bold mb-4 text-center">
                    — Sold Cars —
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 opacity-60">
                    {sold.map((car) => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
