const NAV = ['Catalog', 'About', 'Contact']

function Header({ tab, onTab, cartCount }) {
  return (
    <header className="header">
      <span className="brand display">Bore &amp; Barrel</span>
      <nav className="nav">
        {NAV.map((item) => (
          <button
            key={item}
            type="button"
            className={tab === item ? 'nav-link active' : 'nav-link'}
            onClick={() => onTab(item)}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          className={tab === 'Cart' ? 'nav-link active' : 'nav-link'}
          onClick={() => onTab('Cart')}
        >
          Cart
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </button>
      </nav>
    </header>
  )
}

export default Header