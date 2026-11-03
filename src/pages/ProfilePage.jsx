import { useState } from 'react'
import { Shield, Copy, Check, Heart, FileText, Play, Pencil, Trash2 } from 'lucide-react'
import userService from '../services/userService'
import { useFavorites } from '../hooks/useFavorites'
import About from './About.jsx'
import Contact from './Contact.jsx'

const DRAFT_PREFIXES = ['bore_barrel_draft_', 'recipe_draft_']

/** Ambil semua draft dari localStorage */
const loadDrafts = () => {
  const drafts = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !DRAFT_PREFIXES.some((p) => key.startsWith(p))) continue
      let data = {}
      try {
        data = JSON.parse(localStorage.getItem(key)) || {}
      } catch {
        /* isi bukan JSON, abaikan */
      }
      // sesuaikan field ini dengan bentuk draft di draftStorage.js
      const src = data.form || data.values || data
      drafts.push({
        key,
        name: src.name || 'Untitled draft',
        type: src.type || '',
      })
    }
  } catch {
    /* localStorage tidak tersedia */
  }
  return drafts
}

export default function ProfilePage({ onReplaySplash, onEditProfile, onNavigateCreate }) {
  const [profile] = useState(() => userService.getUserProfile())
  const [copied, setCopied] = useState(false)
  const [drafts, setDrafts] = useState(loadDrafts)
  const { favorites } = useFavorites()

  const handleCopyId = () => {
    if (!profile.userId) return
    navigator.clipboard.writeText(profile.userId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const removeDraft = (key) => {
    localStorage.removeItem(key)
    setDrafts(loadDrafts())
  }

  return (
    <div className="profile-page">
      <section
        className="masthead"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}
      >
        <div>
          <h1 className="display">Operator Profile</h1>
          <p className="lede">
            Operator credentials, procurement statistics, and armorer details.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {onReplaySplash && (
            <button type="button" className="btn btn--outline btn--sm" onClick={onReplaySplash}>
              <Play size={14} /> Replay Intro
            </button>
          )}
          <button type="button" className="btn btn--primary btn--sm" onClick={onEditProfile}>
            <Pencil size={14} /> Edit Profile
          </button>
        </div>
      </section>

      {/* Operator card */}
      <div className="profile-card">
        <div className="profile-card-top">
          <div className="avatar-wrap">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <Shield size={36} stroke="var(--brass)" />
              </div>
            )}
          </div>

          <div className="profile-identity">
            <h2 className="display">{profile.username || 'Shooter'}</h2>
            {profile.bio && <p className="lede">{profile.bio}</p>}
            <div className="profile-id-row">
              <span className="mono-badge">{profile.userId}</span>
              <button type="button" className="icon-btn" onClick={handleCopyId} title="Copy User ID">
                {copied ? <Check size={14} color="var(--brass)" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <Heart size={20} className="stat-icon" stroke="var(--brass)" />
            <div className="stat-val">{favorites.length}</div>
            <div className="stat-label">Procurement Favorites</div>
          </div>
          <div className="stat-item">
            <FileText size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{drafts.length}</div>
            <div className="stat-label">Saved Offline Drafts</div>
          </div>
        </div>
      </div>

      {/* Draft */}
      <section className="profile-section" id="draft">
        <h3 className="section-title">Draft</h3>
        {drafts.length === 0 ? (
          <p className="lede">Belum ada katalog yang di-draft.</p>
        ) : (
          <ul className="cart-list">
            {drafts.map((d) => (
              <li key={d.key} className="cart-item">
                <div className="cart-info">
                  <span className="name display">{d.name}</span>
                  {d.type && <span className="type">{d.type}</span>}
                </div>
                {onNavigateCreate && (
                  <button className="btn btn--outline btn--sm" onClick={onNavigateCreate}>
                    Lanjutkan
                  </button>
                )}
                <button className="remove-btn" onClick={() => removeDraft(d.key)} title="Hapus draft">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* About */}
      <section className="profile-section" id="about">
        <About />
      </section>

      {/* Contact */}
      <section className="profile-section" id="contact">
        <Contact />
      </section>
    </div>
  )
}