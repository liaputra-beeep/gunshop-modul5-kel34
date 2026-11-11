// src/components/gun/ReviewList.jsx
// Daftar review: edit/hapus review sendiri + like/dislike review orang lain.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Star, Pencil, Trash2, ThumbsUp, ThumbsDown, Loader } from 'lucide-react'
import reviewService from '../../services/reviewService'
import { getUserIdentifier } from '../../services/userService'
import ConfirmModal from '../modals/ConfirmModal'

const Stars = ({ value, size = 14 }) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={size}
      fill={i < value ? 'var(--brass)' : 'none'}
      stroke={i < value ? 'var(--brass)' : 'var(--line)'}
    />
  ))

/** Format tanggal + jam pengiriman review, mis. "12 Nov 2026, 14.30". */
const formatDateTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ReviewList({ reviews, onChanged }) {
  const me = getUserIdentifier()

  const [votes, setVotes] = useState([])
  const [error, setError] = useState('')

  // edit
  const [editingId, setEditingId] = useState(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')
  const [saving, setSaving] = useState(false)

  // delete
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const idsKey = reviews.map((r) => r.id).join(',')

  const loadVotes = useCallback(async () => {
    try {
      const res = await reviewService.getVotes(idsKey ? idsKey.split(',') : [])
      setVotes(res.data || [])
    } catch {
      setVotes([])
    }
  }, [idsKey])

  useEffect(() => {
    loadVotes()
  }, [loadVotes])

  // hitung like/dislike dan vote milik user ini per review
  const tally = useMemo(() => {
    const map = {}
    for (const v of votes) {
      const key = String(v.review_id)
      const t = (map[key] ||= { up: 0, down: 0, mine: 0 })
      if (v.value === 1) t.up += 1
      else if (v.value === -1) t.down += 1
      if (String(v.user_id) === String(me)) t.mine = v.value
    }
    return map
  }, [votes, me])

  const handleVote = async (rev, value) => {
    setError('')
    const key = String(rev.id)
    const current = tally[key]?.mine || 0
    const snapshot = votes

    // optimistic update
    const rest = votes.filter(
      (v) => !(String(v.review_id) === key && String(v.user_id) === String(me)),
    )
    setVotes(
      current === value ? rest : [...rest, { review_id: key, user_id: me, value }],
    )

    try {
      if (current === value) await reviewService.clearVote(rev.id, me)
      else await reviewService.setVote(rev.id, me, value)
    } catch (err) {
      setVotes(snapshot)
      setError(err.message || 'Gagal menyimpan vote.')
    }
  }

  const startEdit = (rev) => {
    setError('')
    setEditingId(rev.id)
    setEditRating(rev.rating)
    setEditComment(rev.comment || '')
  }

  const saveEdit = async (rev) => {
    if (editRating < 1 || editRating > 5) {
      setError('Rating harus 1 sampai 5.')
      return
    }
    try {
      setSaving(true)
      setError('')
      await reviewService.updateReview(rev.id, {
        rating: editRating,
        comment: editComment.trim(),
      })
      setEditingId(null)
      onChanged?.()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan perubahan review.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      setError('')
      await reviewService.deleteReview(deleteTarget.id)
      setDeleteTarget(null)
      onChanged?.()
    } catch (err) {
      setError(err.message || 'Gagal menghapus review.')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {error && <p className="form-error">{error}</p>}

      <ul className="review-list">
        {reviews.map((rev) => {
          const own = rev.user_id && String(rev.user_id) === String(me)
          const t = tally[String(rev.id)] || { up: 0, down: 0, mine: 0 }
          const isEditing = editingId === rev.id

          return (
            <li key={rev.id} className="review-item">
              <div className="review-head">
                <span className="review-user">
                  {own ? 'Kamu' : rev.user_identifier || 'Anonymous'}
                  {own && <span className="review-own-badge">review kamu</span>}
                </span>
                {!isEditing && (
                  <span className="review-stars-display">
                    <Stars value={rev.rating} />
                  </span>
                )}
              </div>

              {isEditing ? (
                <div className="review-edit">
                  <div className="review-stars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className="star-btn"
                        onClick={() => setEditRating(n)}
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      >
                        <Star
                          size={22}
                          fill={n <= editRating ? 'var(--brass)' : 'none'}
                          stroke={n <= editRating ? 'var(--brass)' : 'var(--steel)'}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="review-input"
                    rows="3"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    maxLength={500}
                  />
                  <div className="review-actions">
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() => saveEdit(rev)}
                      disabled={saving}
                    >
                      {saving ? <Loader size={14} className="spin" /> : null} Simpan
                    </button>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={() => setEditingId(null)}
                      disabled={saving}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {rev.comment && <p className="review-comment">{rev.comment}</p>}
                  {rev.created_at && (
                    <time className="review-time" dateTime={rev.created_at}>
                      {formatDateTime(rev.created_at)}
                    </time>
                  )}

                  <div className="review-actions">
                    {own ? (
                      <>
                        <span className="vote-count" title="Like">
                          <ThumbsUp size={14} /> {t.up}
                        </span>
                        <span className="vote-count" title="Dislike">
                          <ThumbsDown size={14} /> {t.down}
                        </span>
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => startEdit(rev)}
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger-ghost btn--sm"
                          onClick={() => setDeleteTarget(rev)}
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={`vote-btn${t.mine === 1 ? ' is-active' : ''}`}
                          onClick={() => handleVote(rev, 1)}
                          aria-pressed={t.mine === 1}
                          aria-label="Like review"
                        >
                          <ThumbsUp size={14} /> {t.up}
                        </button>
                        <button
                          type="button"
                          className={`vote-btn${t.mine === -1 ? ' is-active is-down' : ''}`}
                          onClick={() => handleVote(rev, -1)}
                          aria-pressed={t.mine === -1}
                          aria-label="Dislike review"
                        >
                          <ThumbsDown size={14} /> {t.down}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </li>
          )
        })}
      </ul>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Review"
        message="Hapus review ini? Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}