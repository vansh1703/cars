'use client'

import { Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CopyLinkButton({ carId }: { carId: string }) {
  const copy = () => {
    const url = `${window.location.origin}/cars/${carId}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied!')
  }

  return (
    <button
      onClick={copy}
      className="flex-1 flex items-center justify-center gap-2 bg-brand-cream hover:bg-gray-100 text-brand-navy font-semibold py-2.5 rounded-sm text-sm transition-colors border border-gray-200"
    >
      <LinkIcon size={15} />
      Copy Link
    </button>
  )
}