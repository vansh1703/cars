"use client";

import { useState } from "react";
import { supabase, Car } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Archive,
  ArchiveRestore,
  X,
  Pencil,
} from "lucide-react";

export default function AdminCarActions({ car }: { car: Car }) {
  const [loading, setLoading] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldForm, setSoldForm] = useState({
    sold_to_name: "",
    sold_to_phone: "",
    sold_to_address: "",
    sold_to_notes: "",
  });
  const router = useRouter();

  const toggleArchive = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("cars")
      .update({ is_archived: !car.is_archived })
      .eq("id", car.id);
    setLoading(false);
    if (error) toast.error("Failed to update");
    else {
      toast.success(
        car.is_archived
          ? "Car unarchived"
          : "Car archived — hidden from buyers",
      );
      router.refresh();
    }
  };

  const handleMarkSold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soldForm.sold_to_name || !soldForm.sold_to_phone) {
      toast.error("Name and phone are required");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("cars")
      .update({
        is_sold: true,
        is_archived: false,
        sold_to_name: soldForm.sold_to_name,
        sold_to_phone: soldForm.sold_to_phone,
        sold_to_address: soldForm.sold_to_address,
        sold_to_notes: soldForm.sold_to_notes,
        sold_at: new Date().toISOString(),
      })
      .eq("id", car.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to mark as sold");
    } else {
      toast.success("Car marked as sold!");
      setShowSoldModal(false);
      router.refresh();
    }
  };

  const markAvailable = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("cars")
      .update({
        is_sold: false,
        sold_to_name: null,
        sold_to_phone: null,
        sold_to_address: null,
        sold_to_notes: null,
        sold_at: null,
      })
      .eq("id", car.id);
    setLoading(false);
    if (error) toast.error("Failed to update");
    else {
      toast.success("Marked as available");
      router.refresh();
    }
  };

  const deleteCar = async () => {
    if (!confirm("Delete this car? This cannot be undone.")) return;
    setLoading(true);
    const { error } = await supabase.from("cars").delete().eq("id", car.id);
    setLoading(false);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Car deleted");
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 shrink-0">
        {/* View on site */}
        <Link
          href={`/cars/${car.id}`}
          target="_blank"
          className="p-2 text-gray-400 hover:text-brand-navy hover:bg-gray-100 rounded-sm transition-colors"
          title="View on site"
        >
          <Eye size={16} />
        </Link>

        {/* Edit */}
        <Link
          href={`/admin/cars/edit/${car.id}`}
          className="p-2 text-gray-400 hover:text-brand-navy hover:bg-gray-100 rounded-sm transition-colors"
          title="Edit car"
        >
          <Pencil size={16} />
        </Link>

        {/* Archive / Unarchive */}
        {!car.is_sold && (
          <button
            onClick={toggleArchive}
            disabled={loading}
            className={`p-2 rounded-sm transition-colors ${car.is_archived ? "text-blue-500 hover:bg-blue-50" : "text-gray-400 hover:bg-gray-100"}`}
            title={car.is_archived ? "Unarchive" : "Archive (hide from buyers)"}
          >
            {car.is_archived ? (
              <ArchiveRestore size={16} />
            ) : (
              <Archive size={16} />
            )}
          </button>
        )}

        {/* Mark sold / available */}
        {!car.is_sold ? (
          <button
            onClick={() => setShowSoldModal(true)}
            disabled={loading}
            className="p-2 text-orange-500 hover:bg-orange-50 rounded-sm transition-colors"
            title="Mark as Sold"
          >
            <XCircle size={16} />
          </button>
        ) : (
          <button
            onClick={markAvailable}
            disabled={loading}
            className="p-2 text-green-500 hover:bg-green-50 rounded-sm transition-colors"
            title="Mark as Available"
          >
            <CheckCircle size={16} />
          </button>
        )}

        {/* Delete */}
        <button
          onClick={deleteCar}
          disabled={loading}
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Mark Sold Modal */}
      {showSoldModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-brand-navy text-lg">
                  Mark as Sold
                </h3>
                <p className="text-gray-400 text-xs mt-0.5 truncate max-w-xs">
                  {car.title}
                </p>
              </div>
              <button
                onClick={() => setShowSoldModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleMarkSold} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Buyer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Harpreet Singh"
                  value={soldForm.sold_to_name}
                  onChange={(e) =>
                    setSoldForm((p) => ({ ...p, sold_to_name: e.target.value }))
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Buyer Phone *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={soldForm.sold_to_phone}
                  onChange={(e) =>
                    setSoldForm((p) => ({
                      ...p,
                      sold_to_phone: e.target.value,
                    }))
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Buyer Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123, Sector 10, Chandigarh"
                  value={soldForm.sold_to_address}
                  onChange={(e) =>
                    setSoldForm((p) => ({
                      ...p,
                      sold_to_address: e.target.value,
                    }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Notes
                </label>
                <textarea
                  placeholder="Any extra notes about the sale..."
                  value={soldForm.sold_to_notes}
                  onChange={(e) =>
                    setSoldForm((p) => ({
                      ...p,
                      sold_to_notes: e.target.value,
                    }))
                  }
                  className="input-field resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold flex-1 justify-center py-3 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Confirm Sale"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSoldModal(false)}
                  className="btn-outline flex-1 justify-center py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
