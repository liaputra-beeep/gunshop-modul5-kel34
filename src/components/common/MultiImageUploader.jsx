// src/components/common/MultiImageUploader.jsx
// Unggah beberapa gambar sekaligus untuk galeri sebuah katalog.
import { useRef, useState } from 'react'
import { Upload, X, Loader } from 'lucide-react'
import uploadService from '../../services/uploadService'

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB per file

/**
 * @param {string[]}  images    URL gambar tambahan saat ini
 * @param {Function}  onChange  dipanggil dengan array URL baru
 * @param {number}    [max=5]   batas jumlah gambar tambahan
 */
export default function MultiImageUploader({
  images = [],
  onChange,
  max = 5,
  title = 'Additional Images',
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = '' // supaya file yang sama bisa dipilih lagi
    if (files.length === 0) return

    setError('')
    const room = max - images.length
    if (room <= 0) {
      setError(`Maksimal ${max} gambar tambahan.`)
      return
    }

    const picked = files.slice(0, room)
    const problems = []
    if (files.length > room) {
      problems.push(`Hanya ${room} gambar lagi yang bisa ditambahkan, sisanya diabaikan.`)
    }

    const urls = []
    setUploading(true)
    for (const file of picked) {
      if (!ALLOWED.includes(file.type)) {
        problems.push(`${file.name}: format harus JPG, PNG, atau WebP.`)
        continue
      }
      if (file.size > MAX_SIZE) {
        problems.push(`${file.name}: ukuran melebihi 5MB.`)
        continue
      }
      try {
        const res = await uploadService.uploadImage(file)
        if (res?.success && res.data?.url) urls.push(res.data.url)
        else problems.push(`${file.name}: upload gagal.`)
      } catch (err) {
        problems.push(`${file.name}: ${err.message || 'upload gagal.'}`)
      }
    }
    setUploading(false)

    if (urls.length > 0) onChange([...images, ...urls])
    if (problems.length > 0) setError(problems.join(' '))
  }

  const removeAt = (index) => onChange(images.filter((_, i) => i !== index))

  return (
    <div className="card-box">
      <h2 className="card-box-title">{title}</h2>
      <p className="card-box-desc">
        Pilih beberapa gambar sekaligus (maks. {max}, JPG/PNG/WebP, 5MB per file).
        Gambar ini tampil sebagai galeri di halaman detail.
      </p>

      {images.length > 0 && (
        <ul className="multi-img-grid">
          {images.map((src, i) => (
            <li key={i} className="multi-img-item">
              <img src={src} alt={`Gambar tambahan ${i + 1}`} loading="lazy" />
              <button
                type="button"
                className="multi-img-remove"
                onClick={() => removeAt(i)}
                disabled={uploading}
                aria-label={`Hapus gambar ${i + 1}`}
                title="Hapus gambar"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden-file-input"
        onChange={handleFiles}
      />
      <button
        type="button"
        className="btn btn--outline btn--sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || images.length >= max}
      >
        {uploading ? (
          <>
            <Loader size={14} className="spin" /> Uploading…
          </>
        ) : (
          <>
            <Upload size={14} /> Add images ({images.length}/{max})
          </>
        )}
      </button>

      {error && <p className="form-error">{error}</p>}
    </div>
  )
}