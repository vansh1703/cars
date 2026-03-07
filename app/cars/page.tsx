import { supabase, Car } from "@/lib/supabase";
import CarCard from "@/components/CarCard";
import Link from "next/link";
import CarsPageClient from "@/components/CarsPageClient";

export const revalidate = 0;

async function getCars(sp: any): Promise<Car[]> {
  let query = supabase
    .from("cars")
    .select("*")
    .eq("is_archived", false)
    .eq("is_sold", false)
    .is('deleted_at', null);

  if (sp?.brand) query = query.eq("brand", sp.brand);
  if (sp?.fuel) query = query.eq("fuel_type", sp.fuel);
  if (sp?.transmission) query = query.eq("transmission", sp.transmission);
  if (sp?.search) query = query.ilike("title", `%${sp.search}%`);

  if (sp?.sort === "price_asc")
    query = query.order("price", { ascending: true });
  else if (sp?.sort === "price_desc")
    query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data } = await query;
  return (data as Car[]) || [];
}

async function getBrands(): Promise<string[]> {
  const { data } = await supabase
    .from("cars")
    .select("brand")
    .eq("is_archived", false)
    .eq("is_sold", false)
    .is('deleted_at', null);
  if (!data) return [];
  return [...new Set(data.map((d: any) => d.brand))].sort();
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const sp = await searchParams;
  const [cars, brands] = await Promise.all([getCars(sp), getBrands()]);

  return (
    <CarsPageClient
      cars={cars}
      brands={brands}
      currentFilters={{
        brand: sp?.brand || "",
        fuel: sp?.fuel || "",
        transmission: sp?.transmission || "",
        sort: sp?.sort || "",
        search: sp?.search || "",
      }}
    />
  );
}
