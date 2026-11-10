// src/hooks/useFavorites.js
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import favoriteService from '../services/favoriteService'
import { getUserIdentifier } from '../services/userService'

// ---------------------------------------------------------------------------
// Favorit disimpan di localStorage dan dibagikan ke semua komponen
// (tombol love di kartu, Header, Profile, halaman Favorites) lewat store
// sederhana, jadi semuanya langsung ikut berubah saat satu tombol diklik.
// Sinkronisasi ke server (Supabase) dilakukan di belakang layar dan hanya
// "best effort": kalau gagal, favorit tetap tersimpan lokal.
// ---------------------------------------------------------------------------

const LOCAL_KEY = 'bore_barrel_favorites'
const listeners = new Set()

const readLocal = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_KEY))
    return Array.isArray(raw) ? [...new Set(raw.map(String))] : []
  } catch {
    return []
  }
}

let snapshot = readLocal()

const write = (ids) => {
  snapshot = ids
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids))
  } catch {
    /* quota penuh: abaikan */
  }
  listeners.forEach((l) => l())
}

const subscribe = (cb) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
const getSnapshot = () => snapshot

// Hanya id berbentuk UUID atau angka yang bisa disimpan di tabel server.
const isServerId = (id) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ||
  /^\d+$/.test(id)

// ---- sinkronisasi dari server (sekali per sesi) ----
let synced = false
const syncFromServer = async () => {
  try {
    const res = await favoriteService.getFavorites(getUserIdentifier())
    if (!res?.success || !Array.isArray(res.data)) return
    const remote = res.data
      .map((f) => String(f.product_id ?? f.recipe_id ?? f.id ?? ''))
      .filter(Boolean)
    const merged = [...new Set([...snapshot, ...remote])]
    if (merged.length !== snapshot.length) write(merged)
  } catch {
    /* server tidak tersedia: pakai data lokal */
  }
}

export const toggleFavoriteId = (gunId) => {
  const id = String(gunId)
  const has = snapshot.includes(id)
  const next = has ? snapshot.filter((x) => x !== id) : [...snapshot, id]
  write(next) // UI langsung berubah

  if (isServerId(id)) {
    favoriteService
      .setFavorite(id, getUserIdentifier(), !has)
      .catch(() => {}) // gagal sinkron tidak masalah
  }
  return { is_favorited: !has }
}

// ---------------------------------------------------------------------------
// useFavorites — daftar favorit (array objek { id }).
// ---------------------------------------------------------------------------
export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, getSnapshot)

  useEffect(() => {
    if (synced) return
    synced = true
    syncFromServer()
  }, [])

  const favorites = useMemo(() => ids.map((id) => ({ id })), [ids])
  const refetch = useCallback(() => syncFromServer(), [])

  return { favorites, loading: false, error: null, isLocal: true, refetch }
}

// ---------------------------------------------------------------------------
// useToggleFavorite — dipertahankan agar import lama tetap jalan.
// ---------------------------------------------------------------------------
export function useToggleFavorite() {
  return {
    toggleFavorite: async (gunId) => toggleFavoriteId(gunId),
    loading: false,
    error: null,
  }
}

// ---------------------------------------------------------------------------
// useIsFavorited — untuk satu produk (dipakai tombol love).
// ---------------------------------------------------------------------------
export function useIsFavorited(gunId) {
  const ids = useSyncExternalStore(subscribe, getSnapshot)

  useEffect(() => {
    if (synced) return
    synced = true
    syncFromServer()
  }, [])

  const isFavorited = ids.includes(String(gunId))
  const toggleFavorite = async () => toggleFavoriteId(gunId)

  return { isFavorited, loading: false, toggleFavorite }
}

export { getUserIdentifier }