import { apiClient, IS_SUPABASE } from '../config/api'
import { normalizeProduct } from './gunService'

// ---------------------------------------------------------------------------
// FavoriteService — server-side favourites.
// Supports both Supabase (public.favorites with products foreign key join)
// and university API (/api/v1/favorites).
//
// NOTE: When server/RLS is offline or restricted, useFavorites hook falls back
// to localStorage automatically so favorites always work.
// ---------------------------------------------------------------------------

class FavoriteService {
  /**
   * Retrieve all favourited products for the given user.
   */
  async getFavorites(userIdentifier) {
    if (IS_SUPABASE) {
      const data = await apiClient.get(
        `/rest/v1/favorites?user_id=eq.${userIdentifier}&select=product_id,created_at,products(*)`,
      )
      const list = Array.isArray(data)
        ? data.map((fav) => {
            const prod = fav.products ? normalizeProduct(fav.products) : null
            return {
              ...(prod || {}),
              id: fav.product_id,
              recipe_id: fav.product_id,
              product_id: fav.product_id,
              created_at: fav.created_at,
            }
          })
        : []

      return { success: true, data: list }
    }

    return apiClient.get('/api/v1/favorites', {
      params: { user_identifier: userIdentifier },
    })
  }

  /**
   * Set a product's favourite state explicitly (add or remove).
   * Dipakai oleh useFavorites untuk sinkronisasi ke server.
   * Product id bisa UUID (string) atau angka.
   */
  async setFavorite(productId, userId, shouldFavorite) {
    const pid = encodeURIComponent(String(productId))
    const uid = encodeURIComponent(String(userId))

    if (!IS_SUPABASE) {
      return apiClient.post('/api/v1/favorites/toggle', {
        recipe_id: productId,
        user_identifier: userId,
      })
    }

    const existing = await apiClient.get(
      `/rest/v1/favorites?product_id=eq.${pid}&user_id=eq.${uid}&select=product_id`,
    )
    const exists = Array.isArray(existing) && existing.length > 0

    if (shouldFavorite && !exists) {
      await apiClient.post(
        '/rest/v1/favorites',
        { product_id: productId, user_id: userId },
        { headers: { Prefer: 'return=minimal' } },
      )
    } else if (!shouldFavorite && exists) {
      await apiClient.delete(`/rest/v1/favorites?product_id=eq.${pid}&user_id=eq.${uid}`)
    }
    return { success: true, data: { is_favorited: shouldFavorite } }
  }

  /**
   * Toggle (tetap ada untuk kompatibilitas).
   */
  async toggleFavorite(data) {
    const productId = data.recipe_id || data.gun_id
    if (!IS_SUPABASE) return apiClient.post('/api/v1/favorites/toggle', data)

    const pid = encodeURIComponent(String(productId))
    const uid = encodeURIComponent(String(data.user_identifier))
    const existing = await apiClient.get(
      `/rest/v1/favorites?product_id=eq.${pid}&user_id=eq.${uid}&select=product_id`,
    )
    const exists = Array.isArray(existing) && existing.length > 0
    await this.setFavorite(productId, data.user_identifier, !exists)
    return { success: true, data: { is_favorited: !exists } }
  }
}

export default new FavoriteService()