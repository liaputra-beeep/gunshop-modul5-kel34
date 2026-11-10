// src/components/gun/ArchiveSection.jsx
import { useCallback, useEffect, useState } from 'react'
import { RotateCcw, Trash2, Loader } from 'lucide-react'
import gunService from '../../services/gunService'
import ConfirmModal from '../modals/ConfirmModal'
import { resolveGunImage, handleImgError } from '../../utils/helpers'

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString()
}

export default function ArchiveSection() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await gunService.getArchivedGuns()
      setItems(res?.data || [])
    } catch (err) {
      setError(err.message || 'Gagal memuat arsip.')
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

  const handleRestore = async (gun) => {
    try {
      setBusyId(gun.id)
      await gunService.restoreGun(gun.id)
      setItems((list) => list.filter((g) => g.id !== gun.id))
      flash(`"${gun.name}" dipulihkan ke katalog.`)
    } catch (err) {
      setError(err.message || 'Gagal memulihkan.')
    } finally {
      setBusyId(null)
    }
  }

  const handleDeleteForever = async () => {
    if (!deleteTarget) return
    try {
      setBusyId(deleteTarget.id)
      await gunService.deleteGunPermanent(deleteTarget.id)
      setItems((list) => list.filter((g) => g.id !== deleteTarget.id))
      flash(`"${deleteTarget.name}" dihapus permanen.`)
      setDeleteTarget(null)
    } catch (err) {
      setError(err.message || 'Gagal menghapus permanen.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="profile-section" id="archive">
      <h3 className="section-title">Archive</h3>

      {notice && <div className="toast toast--success">{notice}</div>}
      {error && <div className="toast toast--error">{error}</div>}

      {loading ? (
        <p className="lede">
          <Loader size={16} className="spin" /> Memuat arsip…
        </p>
      ) : items.length === 0 ? (
        <p className="lede">Arsip kosong. Katalog yang kamu arsipkan akan muncul di sini.</p>
      ) : (
        <ul className="cart-list">
          {items.map((gun) => (
            <li key={gun.id} className="cart-item">
              <img
                src={resolveGunImage(gun)}
                alt={gun.name}
                width="72"
                height="54"
                loading="lazy"
                onError={(e) => handleImgError(e, gun)}
              />
              <div className="cart-info">
                <span className="name display">{gun.name}</span>
                <span className="type">
                  {[gun.type, gun.caliber].filter(Boolean).join(' · ')}
                  {gun.deleted_at ? ` · diarsipkan ${formatDate(gun.deleted_at)}` : ''}
                </span>
              </div>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => handleRestore(gun)}
                disabled={busyId === gun.id}
              >
                <RotateCcw size={14} /> Restore
              </button>
              <button
                type="button"
                className="btn btn--danger-ghost btn--sm"
                onClick={() => setDeleteTarget(gun)}
                disabled={busyId === gun.id}
              >
                <Trash2 size={14} /> Hapus permanen
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Permanen"
        message={`Hapus permanen "${deleteTarget?.name}"? Data ini tidak bisa dipulihkan lagi.`}
        confirmLabel="Hapus permanen"
        danger
        loading={busyId === deleteTarget?.id}
        onConfirm={handleDeleteForever}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}