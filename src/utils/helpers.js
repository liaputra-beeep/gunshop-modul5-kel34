// ---------------------------------------------------------------------------
// helpers.js — pure utility functions used across the application.
// ---------------------------------------------------------------------------

/**
 * Format a numeric price as "$1,234".
 */
export const formatPrice = (price) => {
  const num = Number(price)
  if (Number.isNaN(num)) return '$0'
  return `$${num.toLocaleString()}`
}

/**
 * Client-side text search — case-insensitive match against name and
 * description.
 */
export const matchesSearch = (item, query) => {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    (item.name || '').toLowerCase().includes(q) ||
    (item.description || '').toLowerCase().includes(q)
  )
}

/**
 * Client-side category / type filter.
 * `category` of '' or 'All' matches everything.
 */
export const matchesCategory = (item, category) => {
  if (!category || category === 'All') return true
  // Support both the local `type` field and the backend `category` field
  return (
    (item.type || '').toLowerCase() === category.toLowerCase() ||
    (item.category || '').toLowerCase() === category.toLowerCase()
  )
}

/**
 * Sort an array of items by a given key.
 * @param {'name'|'price'} key
 * @param {'asc'|'desc'}   order
 */
export const sortItems = (items, key = 'name', order = 'asc') => {
  const sorted = [...items].sort((a, b) => {
    if (key === 'price') return (Number(a.price) || 0) - (Number(b.price) || 0)
    return String(a[key] || '').localeCompare(String(b[key] || ''))
  })
  return order === 'desc' ? sorted.reverse() : sorted
}

/**
 * Truncate a string to `max` characters, adding "…" when clipped.
 */
export const truncate = (str, max = 100) => {
  if (!str || str.length <= max) return str || ''
  return str.slice(0, max).trimEnd() + '…'
}

/**
 * Extract unique category values from a list of items.
 * Returns ['All', ...categories].
 */
export const extractCategories = (items) => {
  const set = new Set()
  items.forEach((i) => {
    const cat = i.type || i.category
    if (cat) set.add(cat)
  })
  return ['All', ...Array.from(set).sort()]
}

/**
 * Compute average rating from an array of review objects that each have a
 * numeric `rating` property.  Returns 0 when empty.
 */
export const averageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

// ---------------------------------------------------------------------------
// Gun silhouettes — one SVG per model in /public/guns.
// ---------------------------------------------------------------------------
const GUN_IMAGES = {
  'glock 17': '/guns/glock-17.svg',
  'desert eagle': '/guns/desert-eagle.svg',
  'beretta 92fs': '/guns/beretta-92fs.svg',
  'ak-47': '/guns/ak-47.svg',
  'ar-15': '/guns/ar-15.svg',
  'm4a1 carbine': '/guns/m4a1-carbine.svg',
  'remington 870': '/guns/remington-870.svg',
  'mossberg 500': '/guns/mossberg-500.svg',
  'benelli m4': '/guns/benelli-m4.svg',
  'hk416': '/guns/hk416.svg',
  'steyr aug': '/guns/steyr-aug.svg',
  'remington 700': '/guns/remington-700.svg',
  'accuracy international awm': '/guns/ai-awm.svg',
  'svd dragunov': '/guns/svd-dragunov.svg',
  'barrett m82a1': '/guns/barrett-m82.svg',
  'mp5': '/guns/mp5.svg',
  'uzi': '/guns/uzi.svg',
  'm249 saw': '/guns/m249.svg',
  'pkm': '/guns/pkm.svg',
}

// Generic per-type silhouettes (fallback when a model has no dedicated SVG).
const TYPE_IMAGES = {
  pistol: '/guns/pistol.svg',
  rifle: '/guns/rifle.svg',
  shotgun: '/guns/shotgun.svg',
  'assault rifle': '/guns/rifle.svg',
  'sniper rifle': '/guns/rifle.svg',
  'auto sniper rifle': '/guns/rifle.svg',
  'submachine gun': '/guns/pistol.svg',
  'light machine gun': '/guns/rifle.svg',
}

const GENERIC_IMAGES = new Set(Object.values(TYPE_IMAGES))

/**
 * Pick the image for a product.
 *  - A custom image (uploaded file / external URL) always wins.
 *  - If the stored image is missing or only a generic type placeholder
 *    (e.g. rows already saved in Supabase), use the model-specific
 *    silhouette matched by name, then the generic one for its type.
 */
export const resolveGunImage = (gun) => {
  const stored = gun?.image_url || gun?.image || ''
  if (stored && !GENERIC_IMAGES.has(stored)) return stored

  const byName = GUN_IMAGES[String(gun?.name || '').trim().toLowerCase()]
  if (byName) return byName

  const type = String(gun?.type || gun?.category || '').toLowerCase()
  return stored || TYPE_IMAGES[type] || TYPE_IMAGES.pistol
}

// ---------------------------------------------------------------------------
// Image fallback — attach as <img onError={(e) => handleImgError(e, gun)} />.
// Tries the same file name with other extensions (png -> jpg -> jpeg -> webp),
// then falls back to the generic silhouette for the gun's type.
// ---------------------------------------------------------------------------
const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp']

export const handleImgError = (e, gun) => {
  const img = e.currentTarget
  const src = img.getAttribute('src') || ''
  const m = src.match(/^(\/guns\/[^.]+)\.(\w+)$/)
  if (m) {
    const i = IMAGE_EXTS.indexOf(m[2].toLowerCase())
    if (i >= 0 && i < IMAGE_EXTS.length - 1) {
      img.src = `${m[1]}.${IMAGE_EXTS[i + 1]}`
      return
    }
  }
  const type = String(gun?.type || gun?.category || '').toLowerCase()
  const generic = TYPE_IMAGES[type] || TYPE_IMAGES.pistol
  if (src !== generic) img.src = generic
}