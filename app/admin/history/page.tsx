"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import {
  User,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Gauge,
  Trash2,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

interface SoldCar {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km_driven: number;
  fuel_type: string;
  transmission: string;
  color: string;
  ownership: number;
  images: string[];
  sold_at: string | null;
  final_sell_price: number | null;
  purchase_price: number | null;
  sold_to_name: string | null;
  sold_to_phone: string | null;
  sold_to_address: string | null;
  sold_to_notes: string | null;
}

export default function HistoryPage() {
  const [cars, setCars] = useState<SoldCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const { data } = await supabase
      .from("cars")
      .select("*")
      .eq("is_sold", true)
      .order("sold_at", { ascending: false });
    setCars((data as SoldCar[]) || []);
    setLoading(false);
  };

  const handleDownloadExcel = () => {
    if (cars.length === 0) {
      toast.error("No sales to export");
      return;
    }

    const rows = cars.map((car) => ({
      "Car Title": car.title,
      Brand: car.brand,
      Model: car.model,
      Year: car.year,
      Color: car.color,
      "KM Driven": car.km_driven,
      "Fuel Type": car.fuel_type,
      Transmission: car.transmission,
      Ownership: `${car.ownership}${car.ownership === 1 ? "st" : car.ownership === 2 ? "nd" : car.ownership === 3 ? "rd" : "th"} Owner`,
      "Listed Price (₹)": car.price,
      "Purchase Price (₹)": car.purchase_price ?? "",
      "Final Sell Price (₹)": car.final_sell_price ?? "",
      "Profit/Loss (₹)":
        car.final_sell_price != null && car.purchase_price != null
          ? car.final_sell_price - car.purchase_price
          : "",
      "Sold Date": car.sold_at
        ? new Date(car.sold_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "",
      "Buyer Name": car.sold_to_name ?? "",
      "Buyer Phone": car.sold_to_phone ?? "",
      "Buyer Address": car.sold_to_address ?? "",
      Notes: car.sold_to_notes ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    ws["!cols"] = [
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
      { wch: 6 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Sales History");
    XLSX.writeFile(wb, `khalsa-motors-sales-${new Date().getFullYear()}.xlsx`);
    toast.success("Excel downloaded!");
  };

  // const handleDeleteAll = async () => {
  //   setDeleting(true);

  //   // Step 1 — collect all image URLs from sold cars
  //   const allImages = cars.flatMap((car) => car.images || []);
  //   if (allImages.length > 0) {
  //     const fileNames = allImages
  //       .map((url) => {
  //         try {
  //           return url.split("/car-images/")[1];
  //         } catch {
  //           return null;
  //         }
  //       })
  //       .filter(Boolean) as string[];
  //     if (fileNames.length > 0) {
  //       // Supabase storage remove has a limit per call, batch in chunks of 100
  //       const chunkSize = 100;
  //       for (let i = 0; i < fileNames.length; i += chunkSize) {
  //         const chunk = fileNames.slice(i, i + chunkSize);
  //         await supabase.storage.from("car-images").remove(chunk);
  //       }
  //     }
  //   }

  //   // Step 2 — hard delete sold cars from DB
  //   const { error } = await supabase.from("cars").delete().eq("is_sold", true);

  //   // Step 3 — wipe manual sales
  //   await supabase
  //     .from("manual_sales")
  //     .delete()
  //     .neq("id", "00000000-0000-0000-0000-000000000000");

  //   setDeleting(false);
  //   if (error) {
  //     toast.error("Failed to clear history");
  //   } else {
  //     toast.success("Sales history and all photos permanently deleted");
  //     setShowDeleteConfirm(false);
  //     setCars([]);
  //     sessionStorage.removeItem("admin_dashboard_cache");
  //   }
  // };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Sales History</h1>
          <p className="text-gray-500 text-sm mt-1">{cars.length} cars sold</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-sm text-xs transition-colors"
          >
            <Download size={14} /> Download Excel
          </button>
          {/* <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-sm text-xs transition-colors"
          >
            <Trash2 size={14} /> Clear History
          </button> */}
        </div>
      </div>

      {cars.length === 0 ? (
        <div className="bg-white rounded-sm shadow-sm p-12 text-center text-gray-400">
          <p className="text-lg font-bold mb-2">No sales yet</p>
          <p className="text-sm">Cars you mark as sold will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cars.map((car) => {
            const profitLoss =
              car.final_sell_price != null && car.purchase_price != null
                ? car.final_sell_price - car.purchase_price
                : null;

            return (
              <div
                key={car.id}
                className="bg-white rounded-sm shadow-sm overflow-hidden"
              >
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
                      <div>
                        <h3 className="font-bold text-brand-navy text-lg">
                          {car.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-gray-400 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {car.year}
                          </span>
                          <span className="flex items-center gap-1">
                            <Gauge size={12} />{" "}
                            {car.km_driven.toLocaleString("en-IN")} km
                          </span>
                          <span>
                            {car.fuel_type} · {car.transmission}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-brand-gold text-xl">
                          ₹
                          {(car.final_sell_price ?? car.price).toLocaleString(
                            "en-IN",
                          )}
                        </div>
                        {profitLoss != null && (
                          <div
                            className={`text-xs font-semibold mt-0.5 ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {profitLoss >= 0 ? "+" : ""}₹
                            {profitLoss.toLocaleString("en-IN")}
                          </div>
                        )}
                        {car.sold_at && (
                          <div className="text-gray-400 text-xs mt-1">
                            {new Date(car.sold_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Buyer Details
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {car.sold_to_name && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User
                              size={14}
                              className="text-brand-gold shrink-0"
                            />
                            {car.sold_to_name}
                          </div>
                        )}
                        {car.sold_to_phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone
                              size={14}
                              className="text-brand-gold shrink-0"
                            />
                            <a
                              href={`tel:${car.sold_to_phone}`}
                              className="hover:text-brand-gold transition-colors"
                            >
                              {car.sold_to_phone}
                            </a>
                          </div>
                        )}
                        {car.sold_to_address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
                            <MapPin
                              size={14}
                              className="text-brand-gold shrink-0"
                            />
                            {car.sold_to_address}
                          </div>
                        )}
                        {car.sold_to_notes && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 sm:col-span-2">
                            <FileText
                              size={14}
                              className="text-brand-gold shrink-0 mt-0.5"
                            />
                            {car.sold_to_notes}
                          </div>
                        )}
                        {!car.sold_to_name && !car.sold_to_phone && (
                          <p className="text-gray-400 text-sm">
                            No buyer info recorded
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      {/* {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm w-full max-w-sm shadow-xl p-6">
            <h3 className="font-bold text-brand-navy text-lg mb-2">
              Permanently Delete All History?
            </h3>
            <p className="text-gray-500 text-sm mb-5">
              This will{" "}
              <span className="font-semibold text-red-500">
                permanently delete
              </span>{" "}
              all sold cars and manual sales records from the database. Photos
              will remain in storage.
              <span className="block mt-2 font-bold text-red-500">
                ⚠️ This CANNOT be undone.
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-sm text-sm transition-colors disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, Delete All"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-outline py-2.5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
