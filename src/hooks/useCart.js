// src/hooks/useCart.js
import { useSyncExternalStore } from 'react'

const KEY = 'bb_cart'
export const MAX_QTY = 10 // batas pembelian per produk
const listeners = new Set()

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

let snapshot = read()

const write = (items) => {
  snapshot = items
  localStorage.setItem(KEY, JSON.stringify(items))
  listeners.forEach((l) => l())
}

const subscribe = (cb) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export default function useCart() {
  const items = useSyncExternalStore(subscribe, () => snapshot)

  return {
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    total: items.reduce((sum, i) => sum + i.price * i.qty, 0),

    // add(gun) menambah 1, add(gun, 3) menambah 3
    add: (gun, amount = 1) => {
      const id = gun.id || gun.name
      const found = items.find((i) => i.id === id)
      write(
        found
          ? items.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, i.qty + amount) } : i))
          : [
              ...items,
              {
                id,
                name: gun.name,
                type: gun.type,
                caliber: gun.caliber,
                price: Number(gun.price ?? gun.cook_time) || 0,
                image: gun.image || gun.image_url,
                image_url: gun.image_url || gun.image,
                qty: Math.min(MAX_QTY, amount),
              },
            ],
      )
    },

    setQty: (id, qty) =>
      write(
        qty < 1
          ? items.filter((i) => i.id !== id)
          : items.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)),
      ),

    remove: (id) => write(items.filter((i) => i.id !== id)),
    clear: () => write([]),
  }
}