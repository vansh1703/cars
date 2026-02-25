"use client";

import { useState } from "react";
import { supabase, Car } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Trash2,
  Eye,
  XCircle,
  Archive,
  ArchiveRestore,
  X,
  Pencil,
} from "lucide-react";

export default function AdminCarActions({ car }: { car: Car }) {
  const [loading, setLoading] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [soldForm, setSoldForm] = useState({
    final_sell_price: "",
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
    if (
      !soldForm.sold_to_name ||
      !soldForm.sold_to_phone ||
      !soldForm.final_sell_price
    ) {
      toast.error("Name, phone and final price are required");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("cars")
      .update({
        is_sold: true,
        is_archived: false,
        final_sell_price: parseInt(soldForm.final_sell_price),
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

  // Soft delete — marks as deleted but keeps in history
  const deleteCar = async () => {
    setLoading(true);
    // Delete images from storage first
    if (car.images?.length) {
      const fileNames = car.images
        .map((url) => {
          try {
            return url.split("/car-images/")[1];
          } catch {
            return null;
          }
        })
        .filter(Boolean) as string[];
      if (fileNames.length > 0) {
        await supabase.storage.from("car-images").remove(fileNames);
      }
    }
    // Then soft-delete the car record
    const { error } = await supabase
      .from("cars")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", car.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Car and photos deleted");
      setShowDeleteConfirm(false);
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

        {/* Archive — only if not sold */}
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

        {/* Mark sold — only if not already sold */}
        {!car.is_sold && (
          <button
            onClick={() => setShowSoldModal(true)}
            disabled={loading}
            className="p-2 text-orange-500 hover:bg-orange-50 rounded-sm transition-colors"
            title="Mark as Sold"
          >
            <XCircle size={16} />
          </button>
        )}

        {/* Sold badge — no unsold option */}
        {car.is_sold && (
          <span className="text-xs bg-red-100 text-red-500 font-bold px-2 py-1 rounded-sm">
            SOLD
          </span>
        )}

        {/* Delete */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
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
          <div className="bg-white rounded-sm w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
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
                  Final Sell Price (₹) *
                </label>
                <input
                  type="number"
                  placeholder={`Listed at ₹${car.price.toLocaleString("en-IN")}`}
                  value={soldForm.final_sell_price}
                  onChange={(e) =>
                    setSoldForm((p) => ({
                      ...p,
                      final_sell_price: e.target.value,
                    }))
                  }
                  className="input-field"
                  required
                />
              </div>
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
                  placeholder="+91 98765 43210"
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
                  {loading ? "Saving..." : "Confirm Sale"}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm w-full max-w-sm shadow-xl p-6">
            <h3 className="font-bold text-brand-navy text-lg mb-2">
              Remove Car?
            </h3>
            {car.is_sold ? (
              <p className="text-gray-500 text-sm mb-5">
                This car is marked as sold. It will be{" "}
                <span className="font-semibold text-brand-navy">
                  removed from All Cars
                </span>{" "}
                but will{" "}
                <span className="font-semibold text-green-600">
                  remain in Sales History
                </span>
                .
              </p>
            ) : (
              <p className="text-gray-500 text-sm mb-5">
                This car will be removed from all listings. This cannot be
                undone.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={deleteCar}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-sm text-sm transition-colors disabled:opacity-60"
              >
                {loading ? "Removing..." : "Yes, Remove"}
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
      )}
    </>
  );
}
