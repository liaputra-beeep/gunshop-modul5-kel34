import { Plus, ShoppingCart } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

const NAV_ITEMS = [
  { id: 'Catalog', label: 'Catalog' },
  { id: 'Favorites', label: 'Favorites', hasFavBadge: true },
  { id: 'Cart', label: 'Cart', hasCartBadge: true, icon: ShoppingCart },
  { id: 'Profile', label: 'Profile' },
]

function Header({ tab, onTab, onNavigateCreate, cartCount = 0 }) {
  const { favorites } = useFavorites()
  const favCount = favorites ? favorites.length : 0

  return (
    <header className="header">
      <div
        className="header-brand-wrap"
        onClick={() => onTab('Catalog')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <div className="header-logo-badge">
          <img src="/logo.png" alt="Bore & Barrel" />
        </div>
        <span className="brand display">Bore &amp; Barrel</span>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? 'nav-link active' : 'nav-link'}
              onClick={() => onTab(item.id)}
            >
              {Icon && <Icon size={16} style={{ marginRight: 6, verticalAlign: '-2px' }} />}
              {item.label}
              {item.hasFavBadge && favCount > 0 && (
                <span className="nav-badge">{favCount}</span>
              )}
              {item.hasCartBadge && cartCount > 0 && (
                <span className="nav-badge">{cartCount}</span>
              )}
            </button>
          )
        })}
      </nav>

      {onNavigateCreate && (
        <button
          type="button"
          className="btn btn--primary btn--sm header-cta"
          onClick={onNavigateCreate}
          title="Register new hardware"
        >
          <Plus size={15} /> Add Hardware
        </button>
      )}
    </header>
  )
}

export default Header