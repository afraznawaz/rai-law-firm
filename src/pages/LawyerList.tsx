import { useState, useEffect } from 'react'

interface Lawyer {
  id: number
  full_name: string
  city: string
  specialization: string
  experience_years: number
  bar_council: string
  bar_number: string
  bio: string
  profile_photo_url: string
  court_levels: string
  languages: string
  current_firm: string
  designation: string
  fee_range: string
  available_for_consultation: boolean
  created_at: string
}

const CITIES = ['All Cities', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Other']
const AREAS = ['All Areas', 'Tax Law', 'Criminal Law', 'Civil Litigation', 'Family Law', 'Corporate Law', 'Constitutional Law', 'Property & Revenue Law', 'Intellectual Property', 'Cybercrime & FIA', 'Environmental Law', 'Banking & Finance', 'Labour Law', 'General Practice']

export default function LawyerList({ onBack, onRegister }: { onBack: () => void; onRegister: () => void }) {
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('All Cities')
  const [areaFilter, setAreaFilter] = useState('All Areas')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Lawyer | null>(null)

  useEffect(() => {
    fetch('/api/lawyer-auth')
      .then(r => r.json())
      .then(d => { setLawyers(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = lawyers.filter(l => {
    const matchCity = cityFilter === 'All Cities' || l.city === cityFilter
    const matchArea = areaFilter === 'All Areas' || (l.specialization || '').includes(areaFilter)
    const matchSearch = !search || l.full_name.toLowerCase().includes(search.toLowerCase()) || (l.specialization || '').toLowerCase().includes(search.toLowerCase())
    return matchCity && matchArea && matchSearch
  })

  if (selected) {
    return (
      <div className="ll-detail">
        <div className="ll-detail__nav">
          <button className="ll-back" onClick={() => setSelected(null)}>← Back to Lawyers</button>
        </div>
        <div className="ll-detail__wrap">
          <div className="ll-detail__hero">
            <div className="ll-detail__avatar">
              {selected.profile_photo_url
                ? <img src={selected.profile_photo_url} alt={selected.full_name} />
                : <span>{selected.full_name.charAt(0)}</span>}
            </div>
            <div className="ll-detail__hero-info">
              <h1 className="ll-detail__name">{selected.full_name}</h1>
              <p className="ll-detail__designation">{selected.designation || 'Advocate'}</p>
              <p className="ll-detail__firm">{selected.current_firm}</p>
              <div className="ll-detail__tags">
                {(selected.specialization || '').split(',').map((s, i) => (
                  <span key={i} className="ll-detail__tag">{s.trim()}</span>
                ))}
              </div>
              {selected.available_for_consultation && (
                <div className="ll-detail__avail">✅ Available for Online Consultation</div>
              )}
            </div>
          </div>
          <div className="ll-detail__body">
            <div className="ll-detail__col">
              <div className="ll-detail__section">
                <h3>📋 Professional Details</h3>
                <div className="ll-detail__info-grid">
                  <div><span>Bar Council</span><strong>{selected.bar_council}</strong></div>
                  <div><span>Bar Reg. No.</span><strong>{selected.bar_number}</strong></div>
                  <div><span>Experience</span><strong>{selected.experience_years}+ Years</strong></div>
                  <div><span>City</span><strong>{selected.city}</strong></div>
                  {selected.court_levels && <div><span>Courts</span><strong>{selected.court_levels}</strong></div>}
                  {selected.languages && <div><span>Languages</span><strong>{selected.languages}</strong></div>}
                  {selected.fee_range && <div><span>Fee Range</span><strong>{selected.fee_range}</strong></div>}
                </div>
              </div>
              {selected.bio && (
                <div className="ll-detail__section">
                  <h3>👤 About</h3>
                  <p className="ll-detail__bio">{selected.bio}</p>
                </div>
              )}
            </div>
            <div className="ll-detail__sidebar">
              <div className="ll-detail__contact-card">
                <h3>📞 Get in Touch</h3>
                <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ll-contact-btn ll-contact-btn--wa">
                  💬 WhatsApp Consultation
                </a>
                <a href="tel:+923044840937" className="ll-contact-btn ll-contact-btn--call">
                  📞 Call Office
                </a>
                <div className="ll-detail__note">Contact via RAI & Associates office for verified lawyer connections</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ll-page">
      <div className="ll-header">
        <button className="ll-back" onClick={onBack}>← Back to Website</button>
        <div className="ll-header__text">
          <h1 className="ll-header__title">⚖️ Lawyer Directory</h1>
          <p className="ll-header__sub">Find verified legal professionals registered with RAI & Associates network</p>
        </div>
        <button className="ll-register-btn" onClick={onRegister}>+ Register as Lawyer</button>
      </div>

      {/* Filters */}
      <div className="ll-filters">
        <div className="ll-search">
          <span>🔍</span>
          <input placeholder="Search by name or practice area..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
          {CITIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}>
          {AREAS.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      <div className="ll-count">{filtered.length} lawyer{filtered.length !== 1 ? 's' : ''} found</div>

      {loading ? (
        <div className="ll-loading">
          {[1,2,3,4,5,6].map(i => <div key={i} className="ll-skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="ll-empty">
          <div className="ll-empty__icon">⚖️</div>
          <h3>No Lawyers Found</h3>
          <p>No verified lawyers match your search. Try different filters or be the first to register!</p>
          <button className="ll-register-btn" onClick={onRegister}>Register as a Lawyer</button>
        </div>
      ) : (
        <div className="ll-grid">
          {filtered.map(l => (
            <div key={l.id} className="ll-card" onClick={() => setSelected(l)}>
              <div className="ll-card__top">
                <div className="ll-card__avatar">
                  {l.profile_photo_url
                    ? <img src={l.profile_photo_url} alt={l.full_name} />
                    : <span>{l.full_name.charAt(0)}</span>}
                </div>
                <div className="ll-card__info">
                  <h3 className="ll-card__name">{l.full_name}</h3>
                  <p className="ll-card__desig">{l.designation || 'Advocate'} {l.current_firm ? `· ${l.current_firm}` : ''}</p>
                  <p className="ll-card__city">📍 {l.city}</p>
                </div>
                {l.available_for_consultation && <div className="ll-card__online" title="Available Online">🟢</div>}
              </div>
              <div className="ll-card__areas">
                {(l.specialization || '').split(',').slice(0, 3).map((s, i) => (
                  <span key={i} className="ll-card__area">{s.trim()}</span>
                ))}
              </div>
              <div className="ll-card__meta">
                <span>⚖️ {l.experience_years}+ yrs</span>
                <span>🏛️ {(l.bar_council || '').replace(' Bar Council', '').replace(' Bar Association', '')}</span>
              </div>
              <button className="ll-card__view">View Profile →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
