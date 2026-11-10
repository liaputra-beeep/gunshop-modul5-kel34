// src/pages/Cart.jsx
import { Trash2, Minus, Plus } from 'lucide-react'
import useCart from '../hooks/useCart'
import { checkoutWhatsApp } from '../utils/checkout'
import { resolveGunImage, handleImgError, formatPrice } from '../utils/helpers'

export default function Cart({ onBrowse }) {
  const { items, total, setQty, remove, clear } = useCart()

  if (items.length === 0) {
    return (
      <div className="page">
        <h1 className="display">Your cart is empty.</h1>
        <p className="lede">Add a piece from the catalog to get started.</p>
        <button type="button" className="cart-browse" onClick={onBrowse}>
          Browse catalog
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="display">Your cart.</h1>

      <ul className="cart-list">
        {items.map((i) => (
          <li key={i.id} className="cart-item">
            <img
              src={resolveGunImage(i)}
              alt={i.name}
              width="72"
              height="54"
              loading="lazy"
              onError={(e) => handleImgError(e, i)}
            />

            <div className="cart-info">
              <span className="name display">{i.name}</span>
              <span className="type">
                {i.type} · {formatPrice(i.price)}
              </span>
            </div>

            <div className="qty">
              <button type="button" onClick={() => setQty(i.id, i.qty - 1)} aria-label="Decrease quantity">
                <Minus size={14} />
              </button>
              <span>{i.qty}</span>
              <button type="button" onClick={() => setQty(i.id, i.qty + 1)} aria-label="Increase quantity">
                <Plus size={14} />
              </button>
            </div>

            <span className="price cart-sub">{formatPrice(i.price * i.qty)}</span>

            <button type="button" className="remove-btn" onClick={() => remove(i.id)} aria-label="Remove">
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-total">
        <span>Total</span>
        <span className="price">{formatPrice(total)}</span>
      </div>

      <div className="cart-actions">
        <button type="button" className="btn-clear" onClick={clear}>
          Kosongkan
        </button>
        <button
          type="button"
          className="btn btn--primary cart-checkout"
          onClick={() => checkoutWhatsApp(items)}
        >
          Check-out via WhatsApp
        </button>
      </div>
    </div>
  )
}