import { useState, useEffect, lazy, Suspense } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Catalog from './pages/Catalog.jsx'
import PWABadge from './components/PWABadge.jsx'
import ConfirmModal from './components/modals/ConfirmModal.jsx'
import SplashScreen from './components/common/SplashScreen.jsx'
import gunService from './services/gunService.js'
import { getSharedId, setUrlGun } from './utils/shareLink.js'
import useCart from './hooks/useCart.js'
import './App.css'

// Lazy load: halaman dimuat hanya saat dibuka (Catalog tetap langsung karena halaman pertama)
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const EditProfilePage = lazy(() => import('./pages/EditProfilePage.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const CreateGunPage = lazy(() => import('./pages/CreateGunPage.jsx'))
const EditGunPage = lazy(() => import('./pages/EditGunPage.jsx'))
const GunDetail = lazy(() => import('./components/gun/GunDetail.jsx'))

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [tab, setTab] = useState('Catalog')
  // 'list' | 'create' | 'edit' | 'detail' | 'editProfile'
  const [mode, setMode] = useState('list')
  const [selectedGun, setSelectedGun] = useState(null)
  const [editingGun, setEditingGun] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // ---- Cart (state bersama lewat hooks/useCart)
  const { add: addToCart, count: cartCount } = useCart()

  // ---- Buka detail otomatis kalau URL berisi ?gun=<id> (share link)
  useEffect(() => {
    const id = getSharedId()
    if (!id) return
    // sesuaikan nama method dengan yang ada di gunService.js
    gunService
      .getGunById(id)
      .then((res) => {
        const g = res?.data ?? res
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
        <Suspense fallback={<div className="state-box"><p>Memuat…</p></div>}>
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
              <Cart onBrowse={() => handleNavigate('Catalog')} />
            )}
            {tab === 'Profile' && (
              <ProfilePage
                onReplaySplash={() => setShowSplash(true)}
                onEditProfile={() => handleNavigate('EditProfile')}
                onNavigateCreate={() => handleNavigate('Create')}
                onSelectGun={(g) => handleNavigate('Detail', g)}
              />
            )}
          </>
        )}
        </Suspense>
      </main>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Archive Hardware"
        message={`Pindahkan "${deleteTarget?.name}" ke arsip? Kamu bisa memulihkannya nanti dari Profile, bagian Archive.`}
        confirmLabel="Archive"
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
            alert(err.message || 'Gagal mengarsipkan.')
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