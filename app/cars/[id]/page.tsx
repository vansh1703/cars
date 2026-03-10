import { supabase, Car } from "@/lib/supabase";
import { notFound } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import ImageGallery from "@/components/ImageGallery";
import Link from "next/link";
import CopyLinkButton from "@/components/CopyLinkButton";
import {
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Users,
  Palette,
  MapPin,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

export const revalidate = 0;

async function getCar(id: string): Promise<Car | null> {
  const { data } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .eq("is_archived", false)
    .eq("is_sold", false)
    .is("deleted_at", null)
    .single();
  return (data as Car) || null;
}

// Helper for ordinal suffixes (1st, 2nd, 3rd...)
const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCar(id);

  if (!car) notFound();

  const whatsappMsg = encodeURIComponent(
    `Hi! I'm interested in this car at Khalsa Motors:\n\n*${car.title}*\nYear: ${car.year} | ${car.fuel_type} | ${car.transmission}\n\nPlease share more details and price.`
  );

  const shareMsg = encodeURIComponent(
    `Check out this car at Khalsa Motors!\n\n*${car.title}*\n${car.year} | ${car.fuel_type} | ${car.transmission}\n\nhttps://khalsa-motors.vercel.app/cars/${car.id}`
  );

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-gold transition-colors">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link href="/cars" className="hover:text-brand-gold transition-colors">
            Cars
          </Link>
          <ChevronRight size={14} />
          <span className="text-brand-navy font-medium truncate">{car.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <ImageGallery images={car.images || []} title={car.title} />

            {/* Title Section */}
            <div className="bg-white rounded-sm p-6 mt-5">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">
                  {car.title}
                </h1>
                <p className="text-gray-500 mt-1">
                  {car.brand} · {car.model} · {car.year}
                </p>
                {car.location && (
                  <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                    <MapPin size={14} className="text-brand-gold" />
                    {car.location}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold font-semibold text-sm px-4 py-2.5 rounded-sm w-fit">
                <MessageCircle size={15} />
                Contact us for price
              </div>
            </div>

            {/* Specs Grid */}
            <div className="bg-white rounded-sm p-6 mt-4">
              <h2 className="font-bold text-brand-navy text-lg mb-4">
                Vehicle Details
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <SpecItem
                  icon={<Calendar size={18} />}
                  label="Year"
                  value={car.year.toString()}
                />
                <SpecItem
                  icon={<Gauge size={18} />}
                  label="KM Driven"
                  value={`${car.km_driven.toLocaleString("en-IN")} km`}
                />
                <SpecItem
                  icon={<Fuel size={18} />}
                  label="Fuel Type"
                  value={car.fuel_type}
                />
                <SpecItem
                  icon={<Settings size={18} />}
                  label="Transmission"
                  value={car.transmission}
                />
                <SpecItem
                  icon={<Users size={18} />}
                  label="Ownership"
                  value={`${getOrdinal(car.ownership)} Owner`}
                />
                <SpecItem
                  icon={<Palette size={18} />}
                  label="Color"
                  value={car.color}
                />
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className="bg-white rounded-sm p-6 mt-4">
                <h2 className="font-bold text-brand-navy text-lg mb-3">
                  About This Car
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {car.description}
                </p>
              </div>
            )}

            {/* Mobile — CTA Buttons */}
            <div className="lg:hidden mt-4 flex gap-3">
              <a
                href={`https://wa.me/919818036523?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-sm text-sm transition-colors"
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>
              <CopyLinkButton carId={car.id} />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Enquiry Form */}
              <EnquiryForm carId={car.id} carTitle={car.title} />

              {/* Call + WhatsApp Sidebar */}
              <div className="bg-white rounded-sm p-4 border border-gray-100">
                <p className="text-gray-500 text-sm mb-1 text-center">Get in touch</p>
                <a
                  href="tel:+919818036523"
                  className="block text-center font-bold text-brand-navy text-xl hover:text-brand-gold transition-colors"
                >
                  +91 98180 36523
                </a>
                <p className="text-gray-400 text-xs text-center mt-0.5 mb-3">
                  Mon–Sun: 10AM – 7PM
                </p>
                <a
                  href={`https://wa.me/919818036523?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-sm text-sm transition-colors w-full"
                >
                  <MessageCircle size={16} />
                  Chat on WhatsApp
                </a>
              </div>

              {/* Share Sidebar */}
              <div className="bg-white rounded-sm p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Share This Car
                </p>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/?text=${shareMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-sm text-sm transition-colors"
                  >
                    <MessageCircle size={15} />
                    WhatsApp
                  </a>
                  <CopyLinkButton carId={car.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-brand-cream rounded-sm">
      <span className="text-brand-gold mt-0.5">{icon}</span>
      <div>
        <div className="text-xs text-gray-500 font-medium">{label}</div>
        <div className="text-brand-navy font-semibold text-sm mt-0.5">{value}</div>
      </div>
    </div>
  );
}