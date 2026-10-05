import { useRef, useState } from 'react'

function GunCard({ gun, onAdd }) {
  const popup = useRef(null)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    onAdd(gun)
    setAdded(true)
    setTimeout(() => setAdded(false), 1000) // umpan balik singkat "Added"
  }

  return (
    <li className="card">
      <button className="card-btn" onClick={() => popup.current.showModal()}>
        <img className="card-img" src={gun.image} alt="" width="120" height="90" />
        <span className="name display">{gun.name}</span>
        <span className="type">
          {gun.type} · {gun.caliber}
        </span>
        <span className="price">${gun.price.toLocaleString()}</span>
      </button>

      <dialog
        className="popup"
        ref={popup}
        onClick={(e) => e.target === popup.current && popup.current.close()}
      >
        <img className="popup-img" src={gun.image} alt="" width="240" height="180" />
        <h3 className="display">{gun.name}</h3>
        <p className="type">
          {gun.type} · {gun.caliber} ·{' '}
          <span className="price">${gun.price.toLocaleString()}</span>
        </p>
        <p>{gun.description}</p>

        <div className="popup-actions">
          <form method="dialog">
            <button className="popup-close">Close</button>
          </form>
          <button type="button" className="popup-add" onClick={handleAdd}>
            {added ? '✓ Added' : '+ Add to cart'}
          </button>
        </div>
      </dialog>
    </li>
  )
}

export default GunCard