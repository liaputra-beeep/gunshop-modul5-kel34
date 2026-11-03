import { resolveGunImage, handleImgError } from '../utils/helpers'

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER

function Cart({ cart, onChangeQty, onRemove, onBrowse }) {
  const total = cart.reduce((sum, item) => sum + item.gun.price * item.qty, 0)

  const handleCheckout = () => {
    if (!WA_NUMBER) {
      alert('Nomor WhatsApp belum diatur. Isi VITE_WA_NUMBER di file .env.')
      return
    }
    const lines = cart.map(
      ({ gun, qty }, i) =>
        `${i + 1}. ${gun.name} x${qty} - $${(gun.price * qty).toLocaleString()}`
    )
    const text =
      `Hi aku mau pesan:\n${lines.join('\n')}\n\n` +
      `Total: $${total.toLocaleString()}`
    window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
  }

  if (cart.length === 0) {
    return (
      <div className="page">
        <h1 className="display">Your cart is empty.</h1>
        <p className="lede">Add a piece from the catalog to get started.</p>
        <button className="cart-browse" onClick={onBrowse}>
          Browse catalog
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="display">Your cart.</h1>

      <ul className="cart-list">
        {cart.map(({ gun, qty }) => (
          <li key={gun.id ?? gun.name} className="cart-item">
            <img
              src={resolveGunImage(gun)}
              alt={gun.name}
              width="72"
              height="54"
              loading="lazy"
              onError={(e) => handleImgError(e, gun)}
            />
            <div className="cart-info">
              <span className="name display">{gun.name}</span>
              <span className="type">
                {gun.type} · ${gun.price.toLocaleString()}
              </span>
            </div>
            <div className="qty">
              <button onClick={() => onChangeQty(gun.name, -1)} aria-label="Decrease quantity">
                −
              </button>
              <span>{qty}</span>
              <button onClick={() => onChangeQty(gun.name, 1)} aria-label="Increase quantity">
                +
              </button>
            </div>
            <span className="price cart-sub">
              ${(gun.price * qty).toLocaleString()}
            </span>
            <button className="remove-btn" onClick={() => onRemove(gun.name)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-total">
        <span>Total</span>
        <span className="price">${total.toLocaleString()}</span>
      </div>

      <button
        type="button"
        className="btn btn--primary cart-checkout"
        onClick={handleCheckout}
      >
        Check-out via WhatsApp
      </button>
    </div>
  )
}

export default Cart