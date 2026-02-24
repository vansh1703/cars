'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'

export default function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (!images.length) {
    return (
      <div className="bg-gray-100 rounded-sm h-80 flex items-center justify-center text-gray-400">
        No images available
      </div>
    )
  }

  const prev = () => setActiveIdx((i) => (i - 1 + images.length) % images.length)
  const next = () => setActiveIdx((i) => (i + 1) % images.length)

  return (
    <div>
      {/* Main image */}
      <div className="relative rounded-sm overflow-hidden bg-gray-100 aspect-[16/10]">
        <Image
          src={images[activeIdx]}
          alt={`${title} - Photo ${activeIdx + 1}`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 65vw"
        />

        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-brand-navy/70 hover:bg-brand-navy text-white p-2 rounded-sm transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-navy/70 hover:bg-brand-navy text-white p-2 rounded-sm transition-colors">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="bg-brand-navy/70 text-white text-xs px-2 py-1 rounded-sm">
            {activeIdx + 1} / {images.length}
          </span>
          <button onClick={() => setLightbox(true)} className="bg-brand-navy/70 hover:bg-brand-navy text-white p-1.5 rounded-sm transition-colors">
            <Expand size={14} />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`shrink-0 relative w-20 h-14 rounded-sm overflow-hidden border-2 transition-all ${i === activeIdx ? 'border-brand-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <Image src={img} alt={`thumb ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
            <X size={28} />
          </button>
          <div className="relative w-full max-w-5xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <Image src={images[activeIdx]} alt={title} fill className="object-contain" sizes="100vw" />
            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-sm">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-sm">
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}