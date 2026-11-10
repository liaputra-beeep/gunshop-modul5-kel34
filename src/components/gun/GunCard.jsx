// src/components/gun/GunCard.jsx
import { ShoppingCart } from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import ShareButton from '../common/ShareButton'
import LazyImage from '../common/LazyImage'
import { formatPrice, truncate, resolveGunImage, handleImgError } from '../../utils/helpers'
import useCart from '../../hooks/useCart'
import { checkoutWhatsApp } from '../../utils/checkout'

export default function GunCard({ gun, onSelect, onEdit, onDelete }) {
  const { add } = useCart()

  const imgSrc = resolveGunImage(gun)
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  const handleAddToCart = (e) => {
    e.stopPropagation()
    add(gun)
  }

  const handleBuyNow = (e) => {
    e.stopPropagation()
    checkoutWhatsApp([{ ...gun, price: Number(price) || 0, qty: 1 }])
  }

  return (
    <li className="card">
      <button
        type="button"
        className="card-btn"
        onClick={() => onSelect(gun)}
        aria-label={`View ${gun.name}`}
      >
        <LazyImage
          className="card-img"
          wrapClassName="card-img-wrap"
          src={imgSrc}
          alt={gun.name}
          onError={(e) => handleImgError(e, gun)}
        />
        <span className="name display">{gun.name}</span>
        <span className="type">
          {category}
          {caliber ? ` · ${caliber}` : ''}
        </span>
        {gun.description && (
          <span className="card-desc">{truncate(gun.description, 72)}</span>
        )}
        <span className="price">{formatPrice(price)}</span>
      </button>

      {/* Ikon di pojok gambar */}
      <div className="card-actions">
        <FavoriteButton gunId={gun.id || gun.name} />
        <ShareButton gun={gun} />

        {onEdit && (
          <button
            type="button"
            className="card-act-btn"
            onClick={(e) => { e.stopPropagation(); onEdit(gun) }}
            aria-label={`Edit ${gun.name}`}
            title="Edit"
          >
            ✏️
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            className="card-act-btn card-act-btn--danger"
            onClick={(e) => { e.stopPropagation(); onDelete(gun) }}
            aria-label={`Delete ${gun.name}`}
            title="Delete"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Tombol beli */}
      <div className="card-buy-row">
        <button type="button" className="btn-buy" onClick={handleBuyNow}>
          Buy now
        </button>
        <button
          type="button"
          className="btn-cart"
          onClick={handleAddToCart}
          aria-label="Tambah ke keranjang"
          title="Tambah ke keranjang"
        >
          <ShoppingCart size={18} />
        </button>
      </div>
    </li>
  )
}