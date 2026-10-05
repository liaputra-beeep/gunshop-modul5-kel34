function Cart({ cart, onChangeQty, onRemove, onBrowse }) {
  const total = cart.reduce((sum, item) => sum + item.gun.price * item.qty, 0)

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
          <li key={gun.name} className="cart-item">
            <img src={gun.image} alt="" width="72" height="54" />
            <div className="cart-info">
              <span className="name display">{gun.name}</span>
              <span className="type">
                {gun.type} · ${gun.price.toLocaleString()}
              </span>
            </div>
            <div className="qty">
              <button onClick={() => onChangeQty(gun.name, -1)} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button onClick={() => onChangeQty(gun.name, 1)} aria-label="Increase quantity">+</button>
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
    </div>
  )
}

export default Cart