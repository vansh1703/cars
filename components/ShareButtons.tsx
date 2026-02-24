'use client'

import { Share2, MessageCircle, Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareButtonsProps {
  carTitle: string
  carPrice: number
  carId: string
}

export default function ShareButtons({ carTitle, carPrice, carId }: ShareButtonsProps) {
  // Using a more robust way to get the URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareUrl = `${baseUrl}/cars/${carId}`

  const whatsappText = encodeURIComponent(
    `🚗 Check out this car at Khalsa Motors!\n\n*${carTitle}*\nPrice: ₹${carPrice.toLocaleString('en-IN')}\n\n${shareUrl}`
  )

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <div className="bg-white rounded-sm p-4 border border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Share2 size={13} /> Share This Car
      </p>
      
      <div className="flex gap-2">
        {/* Fixed the missing <a> opening tag below */}
        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-sm text-sm transition-colors"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>

        <button
          onClick={copyLink}
          // Note: Ensure --color-brand-cream and --color-brand-navy are in your @theme in globals.css
          className="flex-1 flex items-center justify-center gap-2 bg-brand-cream hover:opacity-90 text-brand-navy font-semibold py-2.5 rounded-sm text-sm transition-all border border-gray-200"
        >
          <LinkIcon size={16} />
          Copy Link
        </button>
      </div>
    </div>
  )
}