// src/services/gunService.js
import { apiClient, IS_SUPABASE } from '../config/api'
import { resolveGunImage } from '../utils/helpers'
import { cachedQuery, invalidateQuery } from '../utils/queryCache'

// ---------------------------------------------------------------------------
// Normalizer
// ---------------------------------------------------------------------------
export const normalizeProduct = (item) => {
  if (!item) return null

  let specsList = []
  if (Array.isArray(item.specs)) {
    specsList = item.specs.map((s, idx) => {
      if (typeof s === 'string') {
        const colonIndex = s.indexOf(':')
        if (colonIndex > -1) {
          return {
            id: `spec-${idx}`,
            name: s.substring(0, colonIndex).trim(),
            quantity: s.substring(colonIndex + 1).trim(),
          }
        }
        return { id: `spec-${idx}`, name: 'Specification', quantity: s.trim() }
      }
      return s
    })
  } else if (Array.isArray(item.ingredients)) {
    specsList = item.ingredients
  }

  const stepsList =
    Array.isArray(item.steps) && item.steps.length > 0
      ? item.steps
      : [
          'Verify firearm is completely unloaded and point in safe direction.',
          'Inspect receiver and mechanism for maintenance.',
        ]

  return {
    ...item,
    id: item.id,
    name: item.name || 'Hardware Piece',
    type: item.type || item.category || 'Hardware',
    category: item.type || item.category || 'Hardware',
    caliber: item.caliber || 'Standard',
    price: Number(item.price ?? item.cook_time ?? 0),
    description: item.description || '',
    image_url: resolveGunImage(item),
    image: resolveGunImage(item),
    ingredients: specsList,
    steps: stepsList,
    deleted_at: item.deleted_at ?? null,
  }
}

// ---------------------------------------------------------------------------
// GunService
// ---------------------------------------------------------------------------
class GunService {
  /**
   * Ambil daftar produk (di-cache 60 detik).
   * params.archived = true -> hanya produk yang diarsipkan
   */
  async getGuns(params = {}) {
    const key = `guns:list:${JSON.stringify(params)}`
    return cachedQuery(key, () => this._fetchGuns(params))
  }

  async _fetchGuns(params = {}) {
    if (IS_SUPABASE) {
      const queryParts = ['select=*']

      // soft delete: default hanya yang aktif
      queryParts.push(params.archived ? 'deleted_at=not.is.null' : 'deleted_at=is.null')

      if (params.search) {
        queryParts.push(`name=ilike.*${encodeURIComponent(params.search)}*`)
      }
      if (params.category && params.category !== 'All') {
        queryParts.push(`type=eq.${encodeURIComponent(params.category)}`)
      }
      if (params.sort_by) {
        const order = params.order === 'desc' ? 'desc' : 'asc'
        queryParts.push(`order=${encodeURIComponent(params.sort_by)}.${order}`)
      } else {
        queryParts.push('order=created_at.desc')
      }
      if (params.limit) {
        queryParts.push(`limit=${params.limit}`)
      }

      const data = await apiClient.get(`/rest/v1/products?${queryParts.join('&')}`)
      const list = Array.isArray(data) ? data.map(normalizeProduct) : []

      return {
        success: true,
        data: list,
        pagination: {
          total: list.length,
          page: params.page || 1,
          limit: params.limit || 50,
        },
      }
    }

    // Fallback: university REST API
    const { archived, ...rest } = params
    const clean = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== '' && v != null),
    )
    const res = await apiClient.get('/api/v1/recipes', { params: clean })
    const list = Array.isArray(res?.data) ? res.data : []
    const filtered = list.filter((g) => (archived ? g.deleted_at : !g.deleted_at))
    return { ...res, data: filtered }
  }

  /** Daftar arsip (soft-deleted). */
  async getArchivedGuns() {
    return this.getGuns({ archived: true })
  }

  /** Ambil satu produk (di-cache). */
  async getGunById(id) {
    return cachedQuery(`guns:item:${id}`, async () => {
      if (IS_SUPABASE) {
        const data = await apiClient.get(`/rest/v1/products?id=eq.${id}&select=*`)
        if (Array.isArray(data) && data.length > 0) {
          return { success: true, data: normalizeProduct(data[0]) }
        }
        throw new Error('Hardware item not found.')
      }
      return apiClient.get(`/api/v1/recipes/${id}`)
    })
  }

  /** Buat produk baru. */
  async createGun(data) {
    let result
    if (IS_SUPABASE) {
      const specsArray = Array.isArray(data.ingredients)
        ? data.ingredients.map((i) => `${i.name}: ${i.quantity}`)
        : Array.isArray(data.specs)
        ? data.specs
        : []

      const payload = {
        name: data.name,
        type: data.type || (data.category === 'minuman' ? 'Rifle' : 'Pistol'),
        caliber: data.caliber || '9mm',
        price: Number(data.price ?? data.cook_time ?? 0),
        description: data.description || '',
        specs: specsArray,
        image_url: data.image_url || null,
      }

      const res = await apiClient.post('/rest/v1/products', payload, {
        headers: { 'Prefer': 'return=representation' },
      })
      const created = Array.isArray(res) ? res[0] : res
      result = { success: true, data: normalizeProduct(created) }
    } else {
      result = await apiClient.post('/api/v1/recipes', data)
    }
    invalidateQuery('guns')
    return result
  }

  /** Update produk. */
  async updateGun(id, data) {
    let result
    if (IS_SUPABASE) {
      const specsArray = Array.isArray(data.ingredients)
        ? data.ingredients.map((i) => `${i.name}: ${i.quantity}`)
        : Array.isArray(data.specs)
        ? data.specs
        : undefined

      const payload = { updated_at: new Date().toISOString() }
      if (data.name !== undefined) payload.name = data.name
      if (data.type !== undefined) payload.type = data.type
      if (data.caliber !== undefined) payload.caliber = data.caliber
      if (data.price !== undefined || data.cook_time !== undefined) {
        payload.price = Number(data.price ?? data.cook_time ?? 0)
      }
      if (data.description !== undefined) payload.description = data.description
      if (specsArray !== undefined) payload.specs = specsArray
      if (data.image_url !== undefined) payload.image_url = data.image_url
      if (data.deleted_at !== undefined) payload.deleted_at = data.deleted_at

      const res = await apiClient.patch(`/rest/v1/products?id=eq.${id}`, payload, {
        headers: { 'Prefer': 'return=representation' },
      })
      const updated = Array.isArray(res) ? res[0] : res
      result = { success: true, data: normalizeProduct(updated) }
    } else {
      result = await apiClient.patch(`/api/v1/recipes/${id}`, data)
    }
    invalidateQuery('guns')
    invalidateQuery(`guns:item:${id}`)
    return result
  }

  /** Hapus / Soft delete produk. */
  async deleteGun(id) {
    let result
    if (IS_SUPABASE) {
      const payload = { deleted_at: new Date().toISOString() }
      const res = await apiClient.patch(`/rest/v1/products?id=eq.${id}`, payload, {
        headers: { 'Prefer': 'return=representation' },
      })
      const deleted = Array.isArray(res) ? res[0] : res
      result = { success: true, data: normalizeProduct(deleted) }
    } else {
      result = await apiClient.delete(`/api/v1/recipes/${id}`)
    }
    invalidateQuery('guns')
    invalidateQuery(`guns:item:${id}`)
    return result
  }
}

export const gunService = new GunService()
export default gunService