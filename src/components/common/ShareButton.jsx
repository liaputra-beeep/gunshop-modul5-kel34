// src/components/common/ShareButton.jsx
import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { buildShareUrl } from '../../utils/shareLink'
// ...
const url = buildShareUrl(gun.id)

export default function ShareButton({ gun }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/gun/${gun.id}`;

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // supaya tidak ikut memicu klik kartu

    // HP: buka menu share bawaan (WhatsApp, dll)
    if (navigator.share) {
      try {
        await navigator.share({ title: gun.name, text: `Lihat ${gun.name} di Bore & Barrel`, url });
        return;
      } catch (err) {
        if (err.name === "AbortError") return; // user menutup menu share
      }
    }

    // Desktop: salin ke clipboard
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Salin link ini:", url); // fallback terakhir
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      className="icon-btn share-btn"
      onClick={handleShare}
      title={copied ? "Link disalin!" : "Share link"}
      aria-label="Share link"
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
    </button>
  );
}