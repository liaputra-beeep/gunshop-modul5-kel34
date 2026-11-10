// src/utils/checkout.js
const WA_NUMBER = import.meta.env.VITE_WA_NUMBER

export function checkoutWhatsApp(items) {
  if (!items || items.length === 0) return

  if (!WA_NUMBER) {
    alert('Nomor WhatsApp belum diatur. Isi VITE_WA_NUMBER di file .env.')
    return
  }

  const lines = items.map(
    (i, idx) => `${idx + 1}. ${i.name} x${i.qty} - $${(i.price * i.qty).toLocaleString()}`,
  )
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  const text = `Hi aku mau pesan:\n${lines.join('\n')}\n\nTotal: $${total.toLocaleString()}`
  window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
}