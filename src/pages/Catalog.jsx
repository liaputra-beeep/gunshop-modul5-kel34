import { useState, useMemo } from 'react'
import GUNS from '../data/guns.js'
import GunCard from '../components/GunCard.jsx'

function Catalog({ onAdd }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [filterType, setFilterType] = useState('All')

  const types = useMemo(
    () => ['All', ...new Set(GUNS.map((gun) => gun.type))],
    []
  )

  const visibleGuns = useMemo(() => {
    let result = GUNS.filter((gun) =>
      gun.name.toLowerCase().includes(search.toLowerCase())
    )

    if (filterType !== 'All') {
      result = result.filter((gun) => gun.type === filterType)
    }

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name-asc') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [search, sortBy, filterType])

  return (
    <>
      <section className="masthead">
        <h1 className="display">Hardware, by the spec sheet.</h1>
        <p className="lede">
          A small armory of pistols, rifles, and shotguns. Every piece listed with its
          type, caliber, and price — nothing else.
        </p>
      </section>

      <section className="controls">
        <input
          type="text"
          placeholder="Search guns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          aria-label="Filter by type"
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort"
        >
          <option value="default">Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A–Z</option>
        </select>
      </section>

      <section>
        <div className="list-head">
          <h2>Current stock</h2>
          <span className="count">{visibleGuns.length} pieces</span>
        </div>

        {visibleGuns.length === 0 ? (
          <p className="no-match">no guns match</p>
        ) : (
          <ul className="stock">
            {visibleGuns.map((gun) => (
              <GunCard key={gun.name} gun={gun} onAdd={onAdd} />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default Catalog