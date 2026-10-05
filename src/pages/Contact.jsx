const ADDRESS = 'Jl. Prof. Soedarto, Tembalang, Kec. Tembalang, Kota Semarang, Jawa Tengah 50275'
const PHONE_DISPLAY = '(024) 76480609'
const PHONE_LINK = 'tel:+622476480609'
const MAPS_LINK =
  'https://www.google.com/maps/search/?api=1&query=Jl.+Prof.+Soedarto,+Tembalang,+Semarang+50275'

const HOURS = [
  { day: 'Monday', time: 'Closed' },
  { day: 'Tuesday – Friday', time: '10:00 – 18:00' },
  { day: 'Saturday', time: '10:00 – 18:00' },
  { day: 'Sunday', time: 'Closed' },
]

function Contact() {
  return (
    <div className="page contact">
      <h1 className="display">Come by the shop.</h1>
      <p className="lede">
        Walk in, pick it up, and ask anything. Our counter staff will walk you through the
        specs, the fit, and the paperwork.
      </p>

      <div className="contact-actions">
        <a className="btn btn-primary" href={PHONE_LINK}>
          Call {PHONE_DISPLAY}
        </a>
        <a className="btn" href={MAPS_LINK} target="_blank" rel="noreferrer">
          Get directions
        </a>
      </div>

      <div className="contact-grid">
        <article className="info-card">
          <h3 className="display">Visit</h3>
          <p>{ADDRESS}</p>
        </article>

        <article className="info-card">
          <h3 className="display">Call</h3>
          <p>
            <a href={PHONE_LINK}>{PHONE_DISPLAY}</a>
          </p>
        </article>

        <article className="info-card info-wide">
          <h3 className="display">Opening hours</h3>
          <ul className="hours">
            {HOURS.map((h) => (
              <li key={h.day}>
                <span>{h.day}</span>
                <span className={h.time === 'Closed' ? 'closed' : ''}>{h.time}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  )
}

export default Contact