import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Catalog from './pages/Catalog.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import EditProfilePage from './pages/EditProfilePage.jsx'
import Cart from './pages/Cart.jsx'
import CreateGunPage from './pages/CreateGunPage.jsx'
import EditGunPage from './pages/EditGunPage.jsx'
import GunDetail from './components/gun/GunDetail.jsx'
import PWABadge from './components/PWABadge.jsx'
import ConfirmModal from './components/modals/ConfirmModal.jsx'
import SplashScreen from './components/common/SplashScreen.jsx'
import gunService from './services/gunService.js'
import { getSharedId, setUrlGun } from './utils/shareLink.js'
import './App.css'

const CART_KEY = 'bb_cart'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [tab, setTab] = useState('Catalog')
  // 'list' | 'create' | 'edit' | 'detail' | 'editProfile'
  const [mode, setMode] = useState('list')
  const [selectedGun, setSelectedGun] = useState(null)
  const [editingGun, setEditingGun] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // ---- Cart (disimpan di localStorage supaya tidak hilang saat refresh)
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (gun) =>
    setCart((prev) => {
      const found = prev.find((i) => i.gun.name === gun.name)
      return found
        ? prev.map((i) =>
            i.gun.name === gun.name ? { ...i, qty: i.qty + 1 } : i
          )
        : [...prev, { gun, qty: 1 }]
    })

  const changeQty = (name, delta) =>
    setCart((prev) =>
      prev
        .map((i) => (i.gun.name === name ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    )

  const removeFromCart = (name) =>
    setCart((prev) => prev.filter((i) => i.gun.name !== name))

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  // ---- Buka detail otomatis kalau URL berisi ?gun=<id> (share link)
  useEffect(() => {
    const id = getSharedId()
    if (!id) return
    // sesuaikan nama method dengan yang ada di gunService.js
    gunService
      .getGunById(id)
      .then((g) => {
        setSelectedGun(g)
        setMode('detail')
      })
      .catch(() => setUrlGun(null))
  }, [])

  const handleNavigate = (target, payload) => {
    if (target === 'Create') {
      setMode('create')
    } else if (target === 'Edit') {
      setEditingGun(payload)
      setMode('edit')
    } else if (target === 'Detail') {
      setSelectedGun(payload)
      setMode('detail')
      setUrlGun(payload?.id)
    } else if (target === 'EditProfile') {
      setMode('editProfile')
    } else {
      setTab(target)
      setMode('list')
      setSelectedGun(null)
      setEditingGun(null)
      setUrlGun(null)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToList = () => {
    setMode('list')
    setSelectedGun(null)
    setEditingGun(null)
    setUrlGun(null)
  }

  return (
    <div className="shell">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <Header
        tab={mode === 'list' ? tab : ''}
        onTab={(newTab) => handleNavigate(newTab)}
        onNavigateCreate={() => handleNavigate('Create')}
        cartCount={cartCount}
      />

      <main className="main">
        {mode === 'create' && (
          <CreateGunPage
            onBack={handleBackToList}
            onSuccess={() => {
              handleBackToList()
              setTab('Catalog')
            }}
          />
        )}

        {mode === 'edit' && (
          <EditGunPage
            gun={editingGun}
            gunId={editingGun?.id}
            onBack={handleBackToList}
            onSuccess={() => {
              handleBackToList()
              setTab('Catalog')
            }}
          />
        )}

        {mode === 'detail' && selectedGun && (
          <GunDetail
            gun={selectedGun}
            onBack={handleBackToList}
            onEdit={(g) => handleNavigate('Edit', g)}
            onDelete={(g) => setDeleteTarget(g)}
            onAddToCart={addToCart}
          />
        )}

        {mode === 'editProfile' && (
          <EditProfilePage
            onBack={() => handleNavigate('Profile')}
            onSuccess={() => handleNavigate('Profile')}
          />
        )}

        {mode === 'list' && (
          <>
            {tab === 'Catalog' && (
              <Catalog
                onNavigate={(dest, payload) => handleNavigate(dest, payload)}
                onAddToCart={addToCart}
              />
            )}
            {tab === 'Favorites' && (
              <FavoritesPage
                onSelectGun={(g) => handleNavigate('Detail', g)}
                onNavigateCatalog={() => setTab('Catalog')}
                onAddToCart={addToCart}
              />
            )}
            {tab === 'Cart' && (
              <Cart
                cart={cart}
                onChangeQty={changeQty}
                onRemove={removeFromCart}
                onBrowse={() => handleNavigate('Catalog')}
              />
            )}
            {tab === 'Profile' && (
              <ProfilePage
                onReplaySplash={() => setShowSplash(true)}
                onEditProfile={() => handleNavigate('EditProfile')}
                onSelectGun={(g) => handleNavigate('Detail', g)}
              />
            )}
          </>
        )}
      </main>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Hardware Record"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            setDeleting(true)
            await gunService.deleteGun(deleteTarget.id)
            setDeleteTarget(null)
            handleBackToList()
            setTab('Catalog')
          } catch (err) {
            alert(err.message || 'Failed to delete record.')
          } finally {
            setDeleting(false)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <PWABadge />
      <Footer />
    </div>
  )
}

export default App