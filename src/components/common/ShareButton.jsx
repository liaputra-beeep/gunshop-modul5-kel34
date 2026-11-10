// src/components/common/ShareButton.jsx
import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { buildShareUrl } from '../../utils/shareLink'

export default function ShareButton({ gun }) {
  const [copied, setCopied] = useState(false)
  const url = buildShareUrl(gun.id || gun.name)

  const handleShare = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (navigator.share) {
      try {
        await navigator.share({ title: gun.name, text: `Lihat ${gun.name} di Bore & Barrel`, url })
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Salin link ini:', url)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      className="share-btn"
      onClick={handleShare}
      title={copied ? 'Link disalin!' : 'Share link'}
      aria-label="Share link"
    >
      {copied ? <Check size={18} /> : <Share2 size={18} />}
    </button>
  )
}