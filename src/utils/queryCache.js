// src/utils/queryCache.js
const store = new Map()
const inflight = new Map()

export async function cachedQuery(key, fetcher, { ttl = 60_000 } = {}) {
  const hit = store.get(key)
  if (hit && Date.now() - hit.time < ttl) return hit.data
  if (inflight.has(key)) return inflight.get(key)

  const p = fetcher()
    .then((data) => {
      store.set(key, { data, time: Date.now() })
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
}