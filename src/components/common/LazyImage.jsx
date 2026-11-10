// src/components/common/LazyImage.jsx
import { useEffect, useRef, useState } from 'react'

/**
 * Gambar yang baru diunduh ketika hampir masuk ke layar (IntersectionObserver).
 * Sebelum itu hanya tampil kotak abu-abu (skeleton) dengan tinggi tetap,
 * jadi layout tidak loncat saat gambar selesai dimuat.
 *
 * Props:
 *  - src, alt, className (untuk <img>), wrapClassName (untuk pembungkus)
 *  - onError: handler error (mis. handleImgError)
 *  - rootMargin: jarak sebelum masuk layar saat mulai memuat (default 150px)
 */
export default function LazyImage({
  src,
  alt = '',
  className = '',
  wrapClassName = '',
  onError,
  rootMargin = '150px',
  ...rest
}) {
  const wrapRef = useRef(null)
  const [visible, setVisible] = useState(
    typeof IntersectionObserver === 'undefined',
  )
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (visible) return
    const node = wrapRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          observer.disconnect() // cukup sekali
        }
      },
      { rootMargin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [visible, rootMargin])

  return (
    <span ref={wrapRef} className={`lazy-wrap ${wrapClassName}`}>
      {!loaded && <span className="lazy-skeleton" aria-hidden="true" />}
      {visible && (
        <img
          {...rest}
          src={src}
          alt={alt}
          decoding="async"
          className={`${className} lazy-img${loaded ? ' is-loaded' : ''}`}
          onLoad={() => setLoaded(true)}
          onError={onError}
        />
      )}
    </span>
  )
}