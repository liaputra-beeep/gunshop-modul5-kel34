import { useState } from 'react'
import { ArrowLeft, Star, Send, Loader, Minus, Plus, ShoppingCart, Link2, Check, MessageCircle } from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import ReviewList from './ReviewList'
import { useReviews, useCreateReview } from '../../hooks/useReviews'
import { getUserIdentifier } from '../../services/userService'
import useCart from '../../hooks/useCart'
import { checkoutWhatsApp } from '../../utils/checkout'
import { buildShareUrl } from '../../utils/shareLink'
import { formatPrice, averageRating, resolveGunImage, handleImgError } from '../../utils/helpers'

const MAX_QTY = 10 // batas pembelian per produk

/**
 * Full-screen product detail view.
 *
 * @param {Object}   props
 * @param {Object}   props.gun       — product data
 * @param {Function} props.onBack    — return to catalog
 * @param {Function} [props.onEdit]  — navigate to edit page
 * @param {Function} [props.onDelete]— trigger delete flow
 */
export default function GunDetail({ gun, onBack, onEdit, onDelete }) {
  const imgSrc = resolveGunImage(gun)

  // Galeri: gun.images[0] adalah sampul
  const gallery = Array.isArray(gun.images) && gun.images.length > 0 ? gun.images : [imgSrc]
  const [activeIdx, setActiveIdx] = useState(0)
  const mainSrc = gallery[Math.min(activeIdx, gallery.length - 1)]
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  // Keranjang & jumlah
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [copied, setCopied] = useState(false)
  const hasStock = gun.stock === undefined || gun.stock === null || Number(gun.stock) > 0
  const maxQty = gun.stock ? Math.min(MAX_QTY, Number(gun.stock)) : MAX_QTY

  const handleAddToCart = () => {
    add(gun, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleBuyNow = () => {
    checkoutWhatsApp([{ ...gun, price: Number(price) || 0, qty }])
  }

  // Share
  const shareUrl = buildShareUrl(gun.id || gun.name)
  const enc = encodeURIComponent
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${enc(shareUrl)}&media=${enc(imgSrc)}&description=${enc(gun.name)}`,
    x: `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(gun.name)}`,
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      window.prompt('Salin link ini:', shareUrl)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMessenger = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: gun.name, url: shareUrl })
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }
    copyLink()
  }

  // Reviews
  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews(gun.id)
  const { createReview, loading: submitting } = useCreateReview()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  const avgRating = gun.average_rating || averageRating(reviews)
  const reviewCount = gun.review_count ?? reviews.length

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')

    if (rating < 1 || rating > 5) {
      setReviewError('Rating must be between 1 and 5.')
      return
    }

    const result = await createReview(gun.id, {
      user_identifier: getUserIdentifier(),
      rating,
      comment: comment.trim(),
    })

    if (result) {
      setReviewSuccess('Review submitted!')
      setComment('')
      setRating(5)
      refetchReviews()
    } else {
      setReviewError('Could not submit review. The server may be unavailable.')
    }
  }

  return (
    <div className="detail">
      {/* Back button */}
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Catalog
      </button>

      {/* Hero */}
      <div className="detail-hero">
        <div className="detail-media">
          <img
            className="detail-img"
            src={mainSrc}
            alt={gun.name}
            onError={(e) => handleImgError(e, gun)}
          />

          {gallery.length > 1 && (
            <div className="detail-thumbs" role="list">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  role="listitem"
                  className={`detail-thumb${i === activeIdx ? ' is-active' : ''}`}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Gambar ${i + 1} dari ${gallery.length}`}
                >
                  <img src={src} alt="" loading="lazy" onError={(e) => handleImgError(e, gun)} />
                </button>
              ))}
            </div>
          )}

          <div className="share-row">
            <span className="share-label">Share:</span>
            <button type="button" className="share-ico share-ico--messenger" onClick={handleMessenger} aria-label="Share via Messenger" title="Messenger">
              <MessageCircle size={14} />
            </button>
            <a className="share-ico share-ico--facebook" href={shareLinks.facebook} target="_blank" rel="noreferrer" aria-label="Share to Facebook" title="Facebook">
              f
            </a>
            <a className="share-ico share-ico--pinterest" href={shareLinks.pinterest} target="_blank" rel="noreferrer" aria-label="Share to Pinterest" title="Pinterest">
              P
            </a>
            <a className="share-ico share-ico--x" href={shareLinks.x} target="_blank" rel="noreferrer" aria-label="Share to X" title="X">
              X
            </a>
            <button type="button" className="share-ico share-ico--link" onClick={copyLink} aria-label="Copy link" title="Copy link">
              {copied ? <Check size={14} /> : <Link2 size={14} />}
            </button>
          </div>
        </div>

        <div className="detail-info">
          <div className="detail-top-actions">
            <FavoriteButton gunId={gun.id || gun.name} />
            {onEdit && (
              <button type="button" className="btn btn--outline btn--sm" onClick={() => onEdit(gun)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button type="button" className="btn btn--danger btn--sm" onClick={() => onDelete(gun)}>
                Delete
              </button>
            )}
          </div>

          <h1 className="display">{gun.name}</h1>
          <p className="type">
            {category}
            {caliber ? ` · ${caliber}` : ''}
          </p>

          {avgRating > 0 && (
            <p className="detail-rating">
              <Star size={16} fill="var(--brass)" stroke="var(--brass)" />
              {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
            </p>
          )}

          <p className="price detail-price">{formatPrice(price)}</p>

          <div className="qty-row">
            <span className="qty-label">Kuantitas</span>
            <div className="qty-stepper">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Kurangi">
                <Minus size={14} />
              </button>
              <input
                type="number"
                min="1"
                max={maxQty}
                value={qty}
                onChange={(e) => {
                  const v = Number(e.target.value) || 1
                  setQty(Math.min(maxQty, Math.max(1, v)))
                }}
                aria-label="Kuantitas"
              />
              <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="Tambah">
                <Plus size={14} />
              </button>
            </div>
            <span className={`stock-status${hasStock ? '' : ' stock-status--out'}`}>
              {hasStock ? 'TERSEDIA' : 'HABIS'}
            </span>
          </div>

          <div className="buy-row">
            <button type="button" className="btn-add-cart" onClick={handleAddToCart} disabled={!hasStock}>
              {added ? <Check size={16} /> : <ShoppingCart size={16} />}
              {added ? 'Ditambahkan!' : 'Masukkan Keranjang'}
            </button>
            <button type="button" className="btn-buy-now" onClick={handleBuyNow} disabled={!hasStock}>
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="detail-section">
        <h2>Description</h2>
        <p>{gun.description || 'No description available.'}</p>
      </section>

      {/* Specifications (from ingredients / steps if present) */}
      {gun.ingredients && gun.ingredients.length > 0 && (
        <section className="detail-section">
          <h2>Specifications</h2>
          <ul className="detail-specs">
            {gun.ingredients.map((ing, i) => (
              <li key={ing.id || i}>
                <strong>{ing.name}</strong> — {ing.quantity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {gun.steps && gun.steps.length > 0 && (
        <section className="detail-section">
          <h2>Assembly / Maintenance Steps</h2>
          <ol className="detail-steps">
            {gun.steps.map((step, i) => (
              <li key={step.id || i}>
                {step.instruction || step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Reviews Section */}
      <section className="detail-section">
        <h2>Reviews</h2>

        {/* Submit review */}
        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="star-btn"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
              >
                <Star
                  size={22}
                  fill={n <= rating ? 'var(--brass)' : 'none'}
                  stroke={n <= rating ? 'var(--brass)' : 'var(--steel)'}
                />
              </button>
            ))}
          </div>

          <textarea
            className="review-input"
            rows="3"
            placeholder="Write a short review (optional)…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />

          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting || !gun.id}
          >
            {submitting ? (
              <><Loader size={16} className="spin" /> Submitting…</>
            ) : (
              <><Send size={16} /> Submit Review</>
            )}
          </button>

          {reviewError && <p className="form-error">{reviewError}</p>}
          {reviewSuccess && <p className="form-success">{reviewSuccess}</p>}
          {!gun.id && (
            <p className="form-hint">
              Reviews require a server-generated product ID. This product is local-only.
            </p>
          )}
        </form>

        {/* Existing reviews */}
        {reviewsLoading ? (
          <p className="detail-loading">Loading reviews…</p>
        ) : reviews.length > 0 ? (
          <ReviewList reviews={reviews} onChanged={refetchReviews} />
        ) : (
          <p className="detail-empty">No reviews yet. Be the first!</p>
        )}
      </section>
    </div>
  )
}