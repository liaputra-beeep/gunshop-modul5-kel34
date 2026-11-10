// src/pages/EditProfilePage.jsx
import { useRef, useState } from 'react'
import { ArrowLeft, Camera, Save, Shield, Trash2 } from 'lucide-react'
import userService from '../services/userService'

const MAX_NAME = 30
const MAX_BIO = 160

/** Perkecil gambar ke 256px lalu ubah ke base64 (supaya hemat localStorage). */
const fileToAvatar = (file) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar.'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Gambar tidak valid.'))
      img.onload = () => {
        const size = 256
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        // crop tengah (persegi)
        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })

export default function EditProfilePage({ onBack, onSuccess }) {
  const fileRef = useRef(null)
  const [initial] = useState(() => userService.getUserProfile())
  const [username, setUsername] = useState(initial.username || '')
  const [bio, setBio] = useState(initial.bio || '')
  const [avatar, setAvatar] = useState(initial.avatar || null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handlePickFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    try {
      setAvatar(await fileToAvatar(file))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const name = username.trim()
    if (!name) {
      setError('Username wajib diisi.')
      return
    }
    setSaving(true)
    const res = userService.saveUserProfile({
      ...initial,
      username: name,
      bio: bio.trim(),
      avatar,
    })
    setSaving(false)
    if (!res.success) {
      setError(res.message || 'Gagal menyimpan profil.')
      return
    }
    onSuccess?.()
  }

  return (
    <div className="form-page">
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Profile
      </button>

      <div className="form-title-group" style={{ marginTop: 16 }}>
        <h1 className="display">Edit Profile</h1>
        <p className="lede">Ubah nama, bio, dan foto profil operator.</p>
      </div>

      {error && <div className="toast toast--error">{error}</div>}

      <form className="card-box entry-form" onSubmit={handleSubmit}>
        <div className="edit-img-wrap">
          <div className="avatar-wrap">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <Shield size={36} stroke="var(--brass)" />
              </div>
            )}
            <button
              type="button"
              className="avatar-upload-btn"
              onClick={() => fileRef.current?.click()}
              aria-label="Ganti foto"
              title="Ganti foto"
              style={{ border: 'none' }}
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden-file-input"
              onChange={handlePickFile}
            />
          </div>

          <div className="edit-img-controls">
            <button type="button" className="btn btn--outline btn--sm" onClick={() => fileRef.current?.click()}>
              <Camera size={14} /> Pilih foto
            </button>
            {avatar && (
              <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => setAvatar(null)}>
                <Trash2 size={14} /> Hapus foto
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="ep-username">
            Username <span className="req">*</span>
          </label>
          <input
            id="ep-username"
            className="form-input"
            value={username}
            maxLength={MAX_NAME}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Shooter"
          />
          <span className="form-hint">{username.length}/{MAX_NAME}</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="ep-bio">Bio</label>
          <textarea
            id="ep-bio"
            className="form-textarea"
            rows={4}
            value={bio}
            maxLength={MAX_BIO}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Ceritakan sedikit tentang dirimu…"
          />
          <span className="form-hint">{bio.length}/{MAX_BIO}</span>
        </div>

        <div className="form-actions-bar">
          <button type="button" className="btn btn--outline" onClick={onBack}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            <Save size={14} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}