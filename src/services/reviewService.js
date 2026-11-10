import { apiClient, IS_SUPABASE } from '../config/api'

// ---------------------------------------------------------------------------
// ReviewService — product reviews & ratings.
// Supports both Supabase (public.reviews) and university API (/api/v1/recipes/:id/reviews).
// ---------------------------------------------------------------------------


// Fallback localStorage kalau bukan Supabase
const LOCAL_VOTES_KEY = 'bore_barrel_review_votes'
const readLocalVotes = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_VOTES_KEY)) || []
  } catch {
    return []
  }
}
const writeLocalVotes = (list) => {
  try {
    localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

class ReviewService {
  /**
   * Fetch all reviews for a given product.
   */
  async getReviews(gunId) {
    if (IS_SUPABASE) {
      const data = await apiClient.get(
        `/rest/v1/reviews?product_id=eq.${gunId}&select=*&order=created_at.desc`,
      )
      const list = Array.isArray(data)
        ? data.map((r) => ({
            id: r.id,
            product_id: r.product_id,
            user_id: r.user_id,
            user_identifier: r.user_id ? `Operator ${String(r.user_id).substring(0, 8)}` : 'Anonymous',
            rating: r.rating,
            comment: r.comment || '',
            created_at: r.created_at,
          }))
        : []

      return { success: true, data: list }
    }

    return apiClient.get(`/api/v1/recipes/${gunId}/reviews`)
  }

  /**
   * Submit a new review.
   * @param {string|number} gunId
   * @param {Object} reviewData  { user_identifier, rating, comment }
   */
  async createReview(gunId, reviewData) {
    if (IS_SUPABASE) {
      const payload = {
        product_id: Number(gunId),
        user_id: reviewData.user_id || reviewData.user_identifier,
        rating: Number(reviewData.rating),
        comment: reviewData.comment || '',
      }

      const res = await apiClient.post('/rest/v1/reviews', payload, {
        headers: { Prefer: 'return=representation' },
      })
      const created = Array.isArray(res) ? res[0] : res
      return { success: true, data: created }
    }

    return apiClient.post(`/api/v1/recipes/${gunId}/reviews`, reviewData)
  }

  /**
   * Edit an existing review.
   */
  async updateReview(reviewId, reviewData) {
    if (IS_SUPABASE) {
      const res = await apiClient.patch(
        `/rest/v1/reviews?id=eq.${reviewId}`,
        {
          rating: Number(reviewData.rating),
          comment: reviewData.comment,
        },
        { headers: { Prefer: 'return=representation' } },
      )
      return { success: true, data: Array.isArray(res) ? res[0] : res }
    }

    return apiClient.put(`/api/v1/reviews/${reviewId}`, reviewData)
  }

  /**
   * Delete a review.
   */
  async deleteReview(reviewId) {
    if (IS_SUPABASE) {
      await apiClient.delete(`/rest/v1/reviews?id=eq.${reviewId}`)
      return { success: true }
    }

    return apiClient.delete(`/api/v1/reviews/${reviewId}`)
  }

  // -------------------------------------------------------------------------
  // Votes (like / dislike) pada review — tabel public.review_votes
  // value: 1 = like, -1 = dislike. Satu user hanya punya satu vote per review.
  // -------------------------------------------------------------------------

  /**
   * Ambil semua vote untuk sekumpulan review.
   * @param {Array<string|number>} reviewIds
   */
  async getVotes(reviewIds = []) {
    if (!reviewIds.length) return { success: true, data: [] }

    if (IS_SUPABASE) {
      const ids = reviewIds.map((id) => encodeURIComponent(String(id))).join(',')
      const data = await apiClient.get(
        `/rest/v1/review_votes?review_id=in.(${ids})&select=review_id,user_id,value`,
      )
      return { success: true, data: Array.isArray(data) ? data : [] }
    }

    return { success: true, data: readLocalVotes().filter((v) => reviewIds.map(String).includes(String(v.review_id))) }
  }

  /**
   * Simpan (insert atau ganti) vote milik user untuk sebuah review.
   */
  async setVote(reviewId, userId, value) {
    if (IS_SUPABASE) {
      await apiClient.post(
        '/rest/v1/review_votes?on_conflict=review_id,user_id',
        { review_id: reviewId, user_id: userId, value: Number(value) },
        { headers: { Prefer: 'resolution=merge-duplicates,return=minimal' } },
      )
      return { success: true }
    }

    const rest = readLocalVotes().filter(
      (v) => !(String(v.review_id) === String(reviewId) && String(v.user_id) === String(userId)),
    )
    writeLocalVotes([...rest, { review_id: String(reviewId), user_id: userId, value: Number(value) }])
    return { success: true }
  }

  /**
   * Hapus vote milik user untuk sebuah review (klik tombol yang sama dua kali).
   */
  async clearVote(reviewId, userId) {
    if (IS_SUPABASE) {
      await apiClient.delete(
        `/rest/v1/review_votes?review_id=eq.${encodeURIComponent(String(reviewId))}&user_id=eq.${encodeURIComponent(String(userId))}`,
      )
      return { success: true }
    }

    writeLocalVotes(
      readLocalVotes().filter(
        (v) => !(String(v.review_id) === String(reviewId) && String(v.user_id) === String(userId)),
      ),
    )
    return { success: true }
  }
}

export default new ReviewService()