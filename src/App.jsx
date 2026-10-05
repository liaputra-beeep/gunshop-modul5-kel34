import { useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Catalog from './pages/Catalog.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Cart from './pages/Cart.jsx'
import './App.css'

function App() {
  const [tab, setTab] = useState('Catalog')
  const [cart, setCart] = useState([])

  const addToCart = (gun) => {
    setCart((prev) => {
      const found = prev.find((item) => item.gun.name === gun.name)
      if (found) {
        return prev.map((item) =>
          item.gun.name === gun.name ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { gun, qty: 1 }]
    })
  }

  const changeQty = (name, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.gun.name === name ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0) // qty 0 = otomatis dihapus
    )
  }

  const removeItem = (name) => {
    setCart((prev) => prev.filter((item) => item.gun.name !== name))
  }

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div className="shell">
      <Header tab={tab} onTab={setTab} cartCount={totalItems} />
      <main className="main">
        {tab === 'Catalog' && <Catalog onAdd={addToCart} />}
        {tab === 'About' && <About />}
        {tab === 'Contact' && <Contact />}
        {tab === 'Cart' && (
          <Cart
            cart={cart}
            onChangeQty={changeQty}
            onRemove={removeItem}
            onBrowse={() => setTab('Catalog')}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App