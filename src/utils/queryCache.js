// src/utils/queryCache.js
// Query caching untuk hasil API:
//  - Memori (Map)        -> akses berikutnya dalam sesi instan
//  - sessionStorage      -> tetap ada setelah reload halaman
//  - inflight dedupe     -> request yang sama tidak dikirim dua kali
const store = new Map()
const inflight = new Map()
const PREFIX = 'qc:'

const readSession = (key) => {
  try {
    const raw = sessionStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const writeSession = (key, entry) => {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(entry))
  } catch {
    // kuota penuh / storage dimatikan -> cukup pakai cache memori
  }
}

export async function cachedQuery(key, fetcher, { ttl = 60_000 } = {}) {
  let hit = store.get(key)
  if (!hit) {
    hit = readSession(key)
    if (hit) store.set(key, hit)
  }
  if (hit && Date.now() - hit.time < ttl) return hit.data
  if (inflight.has(key)) return inflight.get(key)

  const p = fetcher()
    .then((data) => {
      const entry = { data, time: Date.now() }
      store.set(key, entry)
      writeSession(key, entry)
      return data
    })
    .finally(() => inflight.delete(key))

  inflight.set(key, p)
  return p
}

export function invalidateQuery(prefix = '') {
  for (const k of [...store.keys()]) {
    if (k.startsWith(prefix)) store.delete(k)
  }
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(PREFIX + prefix))
      .forEach((k) => sessionStorage.removeItem(k))
  } catch {
    // abaikan
  }
}