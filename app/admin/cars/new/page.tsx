"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { Upload, X, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function AddCarPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: "",
    purchase_price: "",
    km_driven: "",
    fuel_type: "Petrol",
    transmission: "Manual",
    color: "",
    description: "",
    ownership: 1,
    location: "",
    is_featured: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("car-images")
        .upload(fileName, file);
      if (error) {
        toast.error(`Failed: ${error.message}`);
        continue;
      }
      const { data: urlData } = supabase.storage
        .from("car-images")
        .getPublicUrl(fileName);
      uploadedUrls.push(urlData.publicUrl);
    }
    setImageUrls((prev) => [...prev, ...uploadedUrls]);
    setUploadingImages(false);
    if (uploadedUrls.length)
      toast.success(`${uploadedUrls.length} photo(s) uploaded!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.brand || !form.price) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!imageUrls.length) {
      toast.error("Please upload at least one photo");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        images: imageUrls,
        purchase_price: form.purchase_price
          ? parseInt(form.purchase_price)
          : null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error || "Failed to add car");
    } else {
      toast.success("Car added!");
      router.push("/admin/cars");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/cars"
          className="text-gray-400 hover:text-brand-navy transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Add New Car</h1>
          <p className="text-gray-500 text-sm">
            Fill in the details and upload photos
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-sm p-6 shadow-sm">
          <h2 className="font-semibold text-brand-navy mb-4">Car Photos</h2>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-sm p-8 text-center cursor-pointer hover:border-brand-gold transition-colors"
          >
            <Upload size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-medium">
              Click to upload photos
            </p>
            <p className="text-gray-400 text-xs mt-1">
              JPG, PNG, WEBP. First photo = main photo.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          {uploadingImages && (
            <div className="mt-3 text-brand-gold text-sm flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
              Uploading photos...
            </div>
          )}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {imageUrls.map((url, i) => (
                <div key={url} className="relative group">
                  <div className="relative h-24 rounded-sm overflow-hidden bg-gray-100">
                    <Image
                      src={url}
                      alt={`photo ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </div>
                  {i === 0 && (
                    <div className="absolute top-1 left-1 bg-brand-gold text-brand-navy text-xs px-1.5 py-0.5 rounded-sm font-bold">
                      MAIN
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrls((prev) => prev.filter((u) => u !== url))
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Car Details */}
        <div className="bg-white rounded-sm p-6 shadow-sm">
          <h2 className="font-semibold text-brand-navy mb-4">Car Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Listing Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Honda City ZX 2019 - Well Maintained"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Brand *
              </label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Honda"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Model *
              </label>
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. City"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                className="input-field"
                min="1990"
                max={new Date().getFullYear()}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Listing Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. 650000"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Purchase Price (₹){" "}
                <span className="text-gray-400 normal-case font-normal ml-1">
                  — private, never shown to buyers
                </span>
              </label>
              <input
                type="number"
                name="purchase_price"
                value={form.purchase_price}
                onChange={handleChange}
                className="input-field border-dashed"
                placeholder="e.g. 400000 (used for profit calculation)"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                KM Driven *
              </label>
              <input
                type="number"
                name="km_driven"
                value={form.km_driven}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. 45000"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Fuel Type
              </label>
              <select
                name="fuel_type"
                value={form.fuel_type}
                onChange={handleChange}
                className="input-field"
              >
                {["Petrol", "Diesel", "CNG", "Electric", "Hybrid"].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Transmission
              </label>
              <select
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
                className="input-field"
              >
                {["Manual", "Automatic"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Ownership
              </label>
              <select
                name="ownership"
                value={form.ownership}
                onChange={handleChange}
                className="input-field"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                    {n === 1
                      ? "st"
                      : n === 2
                        ? "nd"
                        : n === 3
                          ? "rd"
                          : "th"}{" "}
                    Owner
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Color
              </label>
              <input
                name="color"
                value={form.color}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Pearl White"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Delhi"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="input-field resize-none"
                rows={4}
                placeholder="Describe the car condition, service history..."
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_featured"
                id="is_featured"
                checked={form.is_featured}
                onChange={handleChange}
                className="w-4 h-4 accent-brand-gold"
              />
              <label htmlFor="is_featured" className="text-sm text-gray-600">
                Mark as Featured (shows on homepage)
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-gold py-3 px-8 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <Save size={16} /> Save Car
              </>
            )}
          </button>
          <Link href="/admin/cars" className="btn-outline py-3 px-8">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
