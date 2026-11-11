// src/components/gun/MyReviewsSection.jsx
// Riwayat review/komentar yang pernah dikirim user (tampil di halaman Profile).
import { useCallback, useEffect, useState } from 'react'
import { Star, Trash2, Loader, ExternalLink } from 'lucide-react'
import reviewService from '../../services/reviewService'
import gunService from '../../services/gunService'
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

const formatDate = (iso) => {
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

export default function MyReviewsSection({ onSelectGun }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await reviewService.getReviewsByUser(getUserIdentifier())
      setItems(res?.data || [])
    } catch (err) {
      setError(err.message || 'Gagal memuat riwayat review.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const flash = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 2500)
  }

  const handleOpen = async (rev) => {
    if (!onSelectGun) return
    try {
      setBusyId(rev.id)
      const res = await gunService.getGunById(rev.product_id)
      onSelectGun(res?.data ?? res)
    } catch {
      setError('Katalog ini sudah tidak tersedia (mungkin diarsipkan atau dihapus).')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setBusyId(deleteTarget.id)
      await reviewService.deleteReview(deleteTarget.id)
      setItems((list) => list.filter((r) => r.id !== deleteTarget.id))
      flash('Review dihapus.')
      setDeleteTarget(null)
    } catch (err) {
      setError(err.message || 'Gagal menghapus review.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="profile-section" id="my-reviews">
      <h3 className="section-title">Riwayat Review</h3>

      {notice && <div className="toast toast--success">{notice}</div>}
      {error && <div className="toast toast--error">{error}</div>}

      {loading ? (
        <p className="lede">
          <Loader size={16} className="spin" /> Memuat riwayat review…
        </p>
      ) : items.length === 0 ? (
        <p className="lede">Belum ada review. Komentar yang kamu kirim di katalog akan muncul di sini.</p>
      ) : (
        <ul className="cart-list">
          {items.map((rev) => (
            <li key={rev.id} className="cart-item" style={{ alignItems: 'flex-start' }}>
              <div className="cart-info" style={{ flex: 1 }}>
                <span className="name display">{rev.product_name}</span>
                <span style={{ display: 'flex', gap: 2, margin: '4px 0' }}>
                  <Stars value={rev.rating} />
                </span>
                {rev.comment && <span className="type">{rev.comment}</span>}
                <span className="type">{formatDate(rev.created_at)}</span>
              </div>
              {onSelectGun && (
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => handleOpen(rev)}
                  disabled={busyId === rev.id}
                >
                  <ExternalLink size={14} /> Lihat
                </button>
              )}
              <button
                type="button"
                className="remove-btn"
                onClick={() => setDeleteTarget(rev)}
                disabled={busyId === rev.id}
                title="Hapus review"
                aria-label="Hapus review"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Review"
        message="Hapus review ini? Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus"
        danger
        loading={busyId === deleteTarget?.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}