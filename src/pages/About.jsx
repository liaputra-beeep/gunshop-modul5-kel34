const STATS = [
  { value: '9', label: 'Pieces in stock' },
  { value: 'Tue–Sat', label: 'Open 10 to 6' },
  { value: '100%', label: 'Priced from the bench' },
]

const VALUES = [
  {
    title: 'Honest pricing',
    text: 'Every price is the price. No markup theatre, no hidden fees, no filler stock to pad the shelves.',
  },
  {
    title: 'Hands-on advice',
    text: 'Pick it up, feel the weight, ask anything. We talk specs and fit, never sales pressure.',
  },
  {
    title: 'Lawful, always',
    text: 'Every sale follows local law, with ID and background checks done properly and without exceptions.',
  },
]

function About() {
  return (
    <div className="page about">
      <img
        className="about-hero"
        src="/about/storefront.svg"
        alt="Bore & Barrel storefront on Range Road"
        width="640"
        height="360"
      />

      <h1 className="display">A one-room armory.</h1>
      <p className="lede">
        Bore &amp; Barrel started with one idea: a gun shop should be as straightforward as the
        tools it sells. We keep a short, curated list of pistols, rifles, and shotguns, and every
        piece earns its place on the shelf.
      </p>

      <ul className="about-stats">
        {STATS.map((s) => (
          <li key={s.label}>
            <span className="stat-value display">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </li>
        ))}
      </ul>

      <h2 className="about-sub display">What we stand for</h2>
      <div className="about-values">
        {VALUES.map((v) => (
          <article key={v.title} className="value-card">
            <h3 className="display">{v.title}</h3>
            <p>{v.text}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

export default About